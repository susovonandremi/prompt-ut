'use server'
'use server'

// Ensure this path matches where you created the file in step 2
import { prisma } from "../lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

// Save a generated UI to the Hub
export async function saveToHub(prompt: string, dsl: any, style: string) {
  const { userId } = await auth(); // Ensure auth is awaited if using recent Clerk versions
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
  const posts = await prisma.post.findMany({
    orderBy: { createdAt: 'desc' },
    take: 50,
    include: {
      user: true,
      _count: {
        select: { votes: true }
      }
    }
  });
  return posts;
}

export async function toggleVote(postId: string, direction: "UP" | "DOWN") {
  const { userId } = await auth();
  if (!userId) return;

  const user = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!user) return;

  // Placeholder for vote logic
  console.log("Voting:", direction, "on", postId);

  revalidatePath('/');
}