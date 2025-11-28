'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser, UserButton, SignInButton } from "@clerk/nextjs"; // ✅ Real Auth
import { RenderNode } from '../../components/RenderNode';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ArrowBigUp, ArrowBigDown, Eye, Upload, Stars, Loader2, Search, Sparkles } from 'lucide-react';
import { toast } from "sonner"; // Recommended for alerts

import { generateUI } from "../../lib/ai-service"; // We will call action wrapper instead
import { saveToHub, toggleVote } from "../actions"; // ✅ Real Backend Actions
import type { UIDSL } from '../../lib/ui-schema';
import { animations } from '../../lib/design-tokens';

// Types match your Prisma schema + frontend needs
export type HubPost = {
  id: string;
  user: { handle: string; avatarUrl?: string | null };
  prompt: string;
  dsl: UIDSL;
  createdAt: string;
  upvotes: number;
  downvotes: number;
  hasVoted?: "UP" | "DOWN"; // Optional: track if current user voted
};

interface ClientPageProps {
  initialPosts: HubPost[];
}

export default function ClientPage({ initialPosts }: ClientPageProps) {
  const { user, isLoaded } = useUser();
  const [tab, setTab] = useState<'generate' | 'hub'>('generate');
  const [prompt, setPrompt] = useState('create a modern SaaS landing page with hero section');
  const [style, setStyle] = useState<"apple-min" | "market" | "minimal">("apple-min");
  
  // ✅ Real Data State
  const [posts, setPosts] = useState<HubPost[]>(initialPosts);
  const [loading, setLoading] = useState(false);
  const [generatedVariant, setGeneratedVariant] = useState<UIDSL | null>(null);
  const [preview, setPreview] = useState<{ dsl: UIDSL; title: string } | null>(null);
  const [searchQ, setSearchQ] = useState('');

  const bgClass = tab === 'generate' ? 'lovable-gradient' : 'hub-clean';

  // Client-side search filtering
  const filteredPosts = useMemo(() => {
    const q = searchQ.toLowerCase();
    if (!q) return posts;
    return posts.filter(
      p => p.prompt.toLowerCase().includes(q) || p.user.handle.toLowerCase().includes(q)
    );
  }, [posts, searchQ]);

  async function onGenerate() {
    if (!prompt.trim()) return;
    setLoading(true);

    try {
      // ⚠️ Note: We usually wrap AI calls in a Server Action too, 
      // but for now we can fetch the API route OR use a direct action.
      // Let's use the API route for generation to keep it simple, 
      // BUT we must fix the API route first.
      const res = await fetch("/api/generate/variants", {
        method: "POST",
        body: JSON.stringify({ prompt, style }),
      });

      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      
      // Support both array and single object return
      const result = data.variants ? data.variants[0] : data;
      setGeneratedVariant(result);
      setTab("generate");
    } catch (e: any) {
      console.error(e);
      alert("Generation failed. Check console.");
    } finally {
      setLoading(false);
    }
  }

  async function onShare() {
    if (!generatedVariant || !user) return;
    
    try {
        // ✅ Call Server Action
        await saveToHub(prompt, generatedVariant, style);
        alert("Published to Hub!");
        setTab("hub");
        // In a real app, we'd optimistically update 'posts' or re-fetch
    } catch (error) {
        alert("Failed to share");
    }
  }

  async function onVote(postId: string, type: "UP" | "DOWN") {
      // Optimistic update
      setPosts(current => current.map(p => {
          if (p.id !== postId) return p;
          const isUp = type === 'UP';
          return {
              ...p,
              upvotes: isUp ? p.upvotes + 1 : p.upvotes,
              downvotes: !isUp ? p.downvotes + 1 : p.downvotes
          };
      }));

      // Fire and forget server action
      await toggleVote(postId, type);
  }

  return (
    <div className={`min-h-screen w-full ${bgClass} token-page`}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        
        {/* Header */}
        <motion.header {...animations.fadeIn} className="flex items-center justify-between rounded-2xl bg-white/80 backdrop-blur-lg border border-white/60 shadow-lg px-6 py-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500">
              <Stars className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight token-text">AI UI Generator</h1>
              <p className="text-xs token-muted">Powered by Gemini 2.0 Flash</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {isLoaded && user ? (
                <div className="flex items-center gap-3">
                    <div className="text-right hidden sm:block">
                        <div className="text-sm font-medium">{user.fullName || user.username}</div>
                        <div className="text-xs text-muted-foreground">Pro Plan</div>
                    </div>
                    <UserButton afterSignOutUrl="/"/>
                </div>
            ) : (
                <SignInButton mode="modal">
                <Button>Sign In</Button>
                </SignInButton> // Clerk will handle this
            )}
          </div>
        </motion.header>

        <Tabs value={tab} onValueChange={(v: any) => setTab(v)} className="w-full">
            {/* ... (Keep your TabsList code exactly as is) ... */}
            <TabsList className="mb-6 inline-flex h-11 rounded-full bg-white/70 p-1">
                <TabsTrigger value="generate" className="rounded-full px-6">Generate</TabsTrigger>
                <TabsTrigger value="hub" className="rounded-full px-6">Community Hub</TabsTrigger>
            </TabsList>

            {/* GENERATE TAB */}
            <TabsContent value="generate" className="space-y-6">
                <Card className="premium-card">
                    <CardHeader>
                        <CardTitle className="flex gap-2"><Sparkles className="text-purple-500"/> Describe UI</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Textarea 
                            value={prompt} 
                            onChange={e => setPrompt(e.target.value)} 
                            placeholder="Describe your UI..."
                            className="resize-none"
                            rows={4}
                        />
                        <div className="flex gap-4">
                            <select 
                                value={style} 
                                onChange={e => setStyle(e.target.value as any)}
                                className="border rounded-md px-3"
                            >
                                <option value="apple-min">Apple Minimal</option>
                                <option value="market">Marketplace</option>
                            </select>
                            <Button onClick={onGenerate} disabled={loading} className="w-full">
                                {loading ? <Loader2 className="animate-spin mr-2"/> : <Stars className="mr-2"/>}
                                Generate
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Result Display */}
                <AnimatePresence>
                    {generatedVariant && (
                        <motion.div {...animations.slideUp}>
                            <Card className="premium-card overflow-hidden">
                                <CardHeader className="flex flex-row justify-between items-center">
                                    <CardTitle>Generated Result</CardTitle>
                                    <div className="flex gap-2">
                                        <Button variant="outline" onClick={() => setPreview({ dsl: generatedVariant, title: "Preview" })}>
                                            <Eye className="w-4 h-4 mr-2"/> Fullscreen
                                        </Button>
                                        <Button onClick={onShare}>
                                            <Upload className="w-4 h-4 mr-2"/> Share to Hub
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent className="min-h-[400px] bg-gray-50/50 p-6 overflow-auto border-t">
                                    <div className="pointer-events-none select-none"> 
                                        {/* pointer-events-none prevents interaction during preview if desired */}
                                        <RenderNode node={generatedVariant} />
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    )}
                </AnimatePresence>
            </TabsContent>

            {/* HUB TAB */}
            <TabsContent value="hub">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredPosts.map(post => (
                        <motion.div key={post.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                            <Card className="h-full hover:shadow-md transition-shadow">
                                <CardHeader className="pb-2">
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-center gap-2">
                                            {/* Using Clerk Avatar if available, else fallback */}
                                            {post.user.avatarUrl ? (
                                                <img src={post.user.avatarUrl} className="w-6 h-6 rounded-full" />
                                            ) : (
                                                <div className="w-6 h-6 rounded-full bg-blue-500"/>
                                            )}
                                            <span className="text-sm font-medium">{post.user.handle}</span>
                                        </div>
                                        <Badge variant="outline" className="text-[10px]">
                                            {new Date(post.createdAt).toLocaleDateString()}
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <p className="text-sm text-muted-foreground line-clamp-3">"{post.prompt}"</p>
                                    <div className="aspect-video bg-gray-100 rounded-md overflow-hidden relative group">
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <span className="text-xs text-gray-400">Preview</span>
                                        </div>
                                        {/* Mini Render? Or just click to view */}
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer" onClick={() => setPreview({ dsl: post.dsl, title: post.prompt })}>
                                            <Eye className="text-black/70"/>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex gap-1">
                                            <Button variant="ghost" size="sm" onClick={() => onVote(post.id, 'UP')}>
                                                <ArrowBigUp className={post.hasVoted === 'UP' ? "text-green-500" : ""}/> 
                                                {post.upvotes}
                                            </Button>
                                            <Button variant="ghost" size="sm" onClick={() => onVote(post.id, 'DOWN')}>
                                                <ArrowBigDown className={post.hasVoted === 'DOWN' ? "text-red-500" : ""}/> 
                                                {post.downvotes}
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            </TabsContent>
        </Tabs>

        {/* Fullscreen Preview */}
        <Dialog open={!!preview} onOpenChange={() => setPreview(null)}>
            <DialogContent className="max-w-[90vw] h-[90vh] overflow-auto">
                <DialogHeader>
                    <DialogTitle>{preview?.title}</DialogTitle>
                </DialogHeader>
                {preview && <RenderNode node={preview.dsl} />}
            </DialogContent>
        </Dialog>

      </div>
    </div>
  );
}