// app/page.tsx (Enhanced with design system)
'use client';

import { RenderNode } from '../../components/RenderNode';
import React, { useMemo, useState } from 'react';
import { useLocalStorage } from 'usehooks-ts';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ArrowBigUp, ArrowBigDown, Eye, Upload, Stars, Loader2, Search, Sparkles } from 'lucide-react';
import type { UIDSL } from '../.././lib/ui-schema';
import { animations } from './../../lib/design-tokens';

/* ==================== TYPES ==================== */

export type HubPost = {
  id: string;
  user: { handle: string };
  prompt: string;
  dsl: UIDSL;
  createdAt: string;
  upvotes: number;
  downvotes: number;
};

/* ==================== UTILITIES ==================== */

function uid(prefix = 'id'): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`;
}

function initials(handle: string): string {
  return handle
    .replace(/[@_.-]+/g, ' ')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(s => s[0]?.toUpperCase())
    .join('') || 'U';
}

function dslToThumbText(dsl: UIDSL): string {
  const counts: Record<string, number> = {};
  const walk = (n: UIDSL) => {
    counts[n.type] = (counts[n.type] ?? 0) + 1;
    if ('children' in n && n.children) {
      n.children.forEach(walk);
    }
  };
  walk(dsl);
  return Object.entries(counts)
    .map(([k, v]) => `${v} ${k}`)
    .join(' · ');
}

/* ==================== MAIN COMPONENT ==================== */

export default function Page() {
  const [tab, setTab] = useState<'generate' | 'hub'>('generate');
  const [prompt, setPrompt] = useState('create a modern SaaS landing page with hero section, features grid, and pricing cards');
  const [handle, setHandle] = useState('@demo_user');
  const [posts, setPosts] = useLocalStorage<HubPost[]>('aiui.posts', []);
  const [loading, setLoading] = useState(false);
  const [variants, setVariants] = useState<UIDSL[]>([]);
  const [preview, setPreview] = useState<{ dsl: UIDSL; title: string } | null>(null);
  const [searchQ, setSearchQ] = useState('');
  const [style, setStyle] = useState<"apple-min" | "market" | "minimal">("apple-min");

  const bgClass = tab === 'generate' ? 'lovable-gradient' : 'hub-clean';

  const filtered = useMemo(() => {
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
      const res = await fetch("/api/generate/variants", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ prompt, style }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || "Generation failed");
      }

      const data = await res.json();
      const first = data.variants?.[0];
      
      if (!first) {
        throw new Error("No variants returned");
      }

      setVariants([first]);
      setTab("generate");
    } catch (e: any) {
      console.error("Generation error:", e);
      alert(`Generation failed: ${e.message}`);
    } finally {
      setLoading(false);
    }
  }

  function uploadVariant(idx: number) {
    const dsl = variants[idx];
    if (!dsl) return;

    const post: HubPost = {
      id: uid('post'),
      user: { handle },
      prompt: prompt.trim(),
      dsl,
      createdAt: new Date().toISOString(),
      upvotes: 0,
      downvotes: 0,
    };

    setPosts([post, ...posts]);
    setTab('hub');
  }

  function vote(id: string, dir: 'up' | 'down') {
    setPosts(prev =>
      prev.map(p =>
        p.id === id
          ? {
              ...p,
              upvotes: p.upvotes + (dir === 'up' ? 1 : 0),
              downvotes: p.downvotes + (dir === 'down' ? 1 : 0),
            }
          : p
      )
    );
  }

  return (
    <div className={`min-h-screen w-full ${bgClass} token-page`}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="space-y-8">
          {/* Header */}
          <motion.header
            {...animations.fadeIn}
            className="flex items-center justify-between rounded-2xl bg-white/80 backdrop-blur-lg border border-white/60 shadow-lg px-6 py-4"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500">
                <Stars className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight token-text">
                  AI UI Generator
                </h1>
                <p className="text-xs token-muted">Professional-grade UI from text</p>
              </div>
              <Badge variant="secondary" className="ml-2 rounded-full">
                Pro
              </Badge>
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden sm:block text-right">
                <div className="text-sm font-medium token-text">Susovon Sarkar</div>
                <div className="text-xs token-muted">@remi</div>
              </div>
              <Avatar className="h-10 w-10 ring-2 ring-white shadow-md">
                <AvatarFallback className="bg-gradient-to-br from-purple-500 to-blue-500 text-white font-semibold">
                  SS
                </AvatarFallback>
              </Avatar>
            </div>
          </motion.header>

          {/* Tabs */}
          <Tabs value={tab} onValueChange={(v: any) => setTab(v)} className="w-full">
            <div className="flex items-center justify-between mb-6">
              <TabsList className="inline-flex h-11 rounded-full bg-white/70 backdrop-blur border border-white/60 shadow-md p-1">
                <TabsTrigger
                  value="generate"
                  className="rounded-full px-6 data-[state=active]:bg-white data-[state=active]:shadow-sm"
                >
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate
                </TabsTrigger>
                <TabsTrigger
                  value="hub"
                  className="rounded-full px-6 data-[state=active]:bg-white data-[state=active]:shadow-sm"
                >
                  <Search className="mr-2 h-4 w-4" />
                  Prompt Hub
                </TabsTrigger>
              </TabsList>

              {tab === 'generate' && (
                <div className="hidden sm:flex items-center gap-3">
                  <label className="text-sm font-medium token-muted">Style:</label>
                  <select
                    value={style}
                    onChange={(e) => setStyle(e.target.value as any)}
                    className="rounded-lg bg-white/70 border border-white/60 px-3 py-1.5 text-sm smooth-transition focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="apple-min">Apple Minimal</option>
                    <option value="market">Marketplace</option>
                    <option value="minimal">Ultra Minimal</option>
                  </select>
                </div>
              )}
            </div>

            {/* Generate Tab */}
            <TabsContent value="generate" className="space-y-6">
              <motion.div {...animations.slideUp}>
                <Card className="premium-card">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-purple-500" />
                      Describe Your UI
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Textarea
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      rows={4}
                      placeholder="e.g., create a modern SaaS landing page with hero section, features grid, and pricing cards"
                      className="resize-none smooth-transition"
                    />
                    <Button
                      onClick={onGenerate}
                      disabled={loading}
                      className="w-full h-12 rounded-xl shadow-lg hover:shadow-xl smooth-transition"
                      size="lg"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Stars className="mr-2 h-5 w-5" />
                          Generate UI
                        </>
                      )}
                    </Button>
                    <p className="text-sm token-muted text-center">
                      Get a high-quality, production-ready UI tailored to your prompt
                    </p>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Variant Display */}
              <AnimatePresence>
                {variants.map((v, i) => (
                  <motion.div
                    key={i}
                    {...animations.slideUp}
                    transition={{ delay: 0.1 }}
                  >
                    <Card className="premium-card overflow-hidden">
                      <CardHeader className="flex flex-row items-center justify-between pb-4">
                        <CardTitle>Generated Design</CardTitle>
                        <Badge variant="outline" className="rounded-full">
                          {dslToThumbText(v)}
                        </Badge>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="min-h-[400px] rounded-xl bg-gradient-to-br from-gray-50 to-white border border-gray-100 p-6 overflow-auto">
                          <RenderNode node={v} />
                        </div>
                        <div className="flex items-center gap-3">
                          <Button
                            variant="secondary"
                            onClick={() => setPreview({ dsl: v, title: "Generated Design" })}
                            className="flex-1 rounded-xl smooth-transition"
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            Preview
                          </Button>
                          <Button
                            onClick={() => uploadVariant(i)}
                            className="flex-1 rounded-xl smooth-transition"
                          >
                            <Upload className="mr-2 h-4 w-4" />
                            Share to Hub
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>

              {variants.length === 0 && !loading && (
                <motion.div {...animations.fadeIn} className="text-center py-12">
                  <Stars className="h-12 w-12 mx-auto token-muted mb-4" />
                  <p className="text-lg font-medium token-muted">
                    Enter a prompt above to generate your UI
                  </p>
                </motion.div>
              )}
            </TabsContent>

            {/* Hub Tab */}
            <TabsContent value="hub">
              <Card className="premium-card">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Community Prompt Hub</CardTitle>
                  <div className="flex items-center gap-2">
                    <Search className="h-4 w-4 token-muted" />
                    <Input
                      placeholder="Search prompts..."
                      value={searchQ}
                      onChange={(e) => setSearchQ(e.target.value)}
                      className="w-64 rounded-lg"
                    />
                  </div>
                </CardHeader>
                <CardContent className="space-y-4 pt-0">
                  {filtered.length === 0 && (
                    <div className="text-center py-12">
                      <p className="token-muted">
                        {posts.length === 0
                          ? "No posts yet. Generate and share your first design!"
                          : "No results found"}
                      </p>
                    </div>
                  )}

                  {filtered.map((post) => (
                    <motion.div
                      key={post.id}
                      {...animations.fadeIn}
                      className="rounded-xl border border-gray-200 bg-white p-4 space-y-3 smooth-shadow"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9">
                            <AvatarFallback>{initials(post.user.handle)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="text-sm font-medium">{post.user.handle}</div>
                            <div className="text-xs token-muted">
                              {new Date(post.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        <Badge variant="outline" className="rounded-full">
                          {dslToThumbText(post.dsl)}
                        </Badge>
                      </div>

                      <p className="text-sm token-text">{post.prompt}</p>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => setPreview({ dsl: post.dsl, title: `@${post.user.handle}` })}
                          className="rounded-lg"
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          View
                        </Button>

                        <div className="ml-auto flex items-center gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => vote(post.id, 'up')}
                            className="rounded-lg"
                          >
                            <ArrowBigUp className="h-4 w-4" />
                          </Button>
                          <span className="text-sm font-medium w-8 text-center">
                            {post.upvotes}
                          </span>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => vote(post.id, 'down')}
                            className="rounded-lg"
                          >
                            <ArrowBigDown className="h-4 w-4" />
                          </Button>
                          <span className="text-sm font-medium w-8 text-center">
                            {post.downvotes}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Preview Dialog */}
      <Dialog open={!!preview} onOpenChange={() => setPreview(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            {preview && (
              <DialogTitle className="text-xl font-semibold">
                {preview.title}
              </DialogTitle>
            )}
          </DialogHeader>
          {preview && (
            <div className="rounded-xl bg-gradient-to-br from-gray-50 to-white border border-gray-100 p-6">
              <RenderNode node={preview.dsl} />
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Footer */}
      <footer className="mt-16 pb-8 text-center text-sm token-muted">
        <p>Built with Next.js, Tailwind CSS, and Gemini AI</p>
      </footer>
    </div>
  );
}