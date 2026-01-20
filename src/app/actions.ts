'use server'

import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

// Save a generated UI to the Hub
export async function saveToHub(prompt: string, dsl: any, style: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  // Sync Clerk user to local DB if not exists
  const user = await prisma.user.upsert({
    where: { clerkId: userId },
    create: {
      clerkId: userId,
      handle: "user_" + userId.slice(-4),
      email: "pending@example.com"
    },
    update: {},
  });

  const post = await prisma.post.create({
    data: {
      prompt,
      dsl: dsl as any, // Cast to any for JSONB compatibility if needed
      style,
      userId: user.id
    }
  });

  revalidatePath('/');
  return post;
}

export async function getHubPosts() {
  console.log("Fetching Hub Posts...");
  try {
    const { userId } = await auth();

    const posts = await prisma.post.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: {
        user: true,
        votes: userId ? {
          where: { userId }
        } : false
      }
    });

    console.log(`Found ${posts.length} posts`);

    // Transform to include hasVoted status for the current user
    return posts.map(post => ({
      ...post,
      hasVoted: userId && post.votes?.length ? post.votes[0].type : null
    }));
  } catch (error) {
    console.error("Error fetching Hub posts:", error);
    return [];
  }
}

export async function toggleVote(postId: string, direction: "UP" | "DOWN") {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  // Check existing vote
  const existingVote = await prisma.vote.findUnique({
    where: {
      userId_postId: {
        userId,
        postId
      }
    }
  });

  if (existingVote) {
    if (existingVote.type === direction) {
      // Remove vote (toggle off)
      await prisma.$transaction([
        prisma.vote.delete({
          where: { userId_postId: { userId, postId } }
        }),
        prisma.post.update({
          where: { id: postId },
          data: {
            [direction === "UP" ? "upvoteCount" : "downvoteCount"]: { decrement: 1 }
          }
        })
      ]);
    } else {
      // Change vote direction
      await prisma.$transaction([
        prisma.vote.update({
          where: { userId_postId: { userId, postId } },
          data: { type: direction }
        }),
        prisma.post.update({
          where: { id: postId },
          data: {
            [direction === "UP" ? "upvoteCount" : "downvoteCount"]: { increment: 1 },
            [direction === "UP" ? "downvoteCount" : "upvoteCount"]: { decrement: 1 }
          }
        })
      ]);
    }
  } else {
    // New vote
    await prisma.$transaction([
      prisma.vote.create({
        data: {
          userId,
          postId,
          type: direction
        }
      }),
      prisma.post.update({
        where: { id: postId },
        data: {
          [direction === "UP" ? "upvoteCount" : "downvoteCount"]: { increment: 1 }
        }
      })
    ]);
  }

  revalidatePath('/');
}