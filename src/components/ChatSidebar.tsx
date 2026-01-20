import React from 'react';
import { MessageSquare, Globe, Sparkles, X, Paperclip, Send, ThumbsUp, ThumbsDown, Download } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import Image from 'next/image';
import { ThinkingProcess, ThinkingStep } from './ThinkingProcess';
import { toggleVote } from '@/app/actions';
import { toast } from 'sonner';

export interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    thinking?: ThinkingStep[];
    ui?: any;
    image?: string;
}

interface ChatSidebarProps {
    hasStarted: boolean;
    messages: Message[];
    setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
    isLoading: boolean;
    currentThinking: ThinkingStep[];
    input: string;
    setInput: (value: string) => void;
    handleSend: () => void;
    selectedImage: string | null;
    setSelectedImage: (value: string | null) => void;
    fileInputRef: any;
    handleFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
    hubPosts: any[];
    scrollRef: any;
    activeTab?: string;
    onTabChange?: (tab: string) => void;
}

export const ChatSidebar = React.memo(function ChatSidebar({
    hasStarted,
    messages,
    setMessages,
    isLoading,
    currentThinking,
    input,
    setInput,
    handleSend,
    selectedImage,
    setSelectedImage,
    fileInputRef,
    handleFileSelect,
    hubPosts,
    scrollRef,
    activeTab = "chat",
    onTabChange
}: ChatSidebarProps) {
    return (
        <div className={`w-[400px] flex flex-col border-r border-white/5 bg-background transition-opacity duration-500 ${hasStarted ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
            <div className="flex-1 flex flex-col min-h-0">
                <div className="p-4 border-b border-white/5 bg-background flex-shrink-0">
                    <button
                        onClick={() => window.location.reload()}
                        className="font-bold flex items-center gap-2 mb-4 hover:opacity-80 transition-opacity cursor-pointer"
                    >
                        <div className="relative w-8 h-8">
                            <Image src="/logo.png" alt="REVision Logo" fill className="object-contain" />
                        </div>
                        <span className="text-white text-lg font-medium tracking-tight">
                            REVision
                        </span>
                    </button>
                </div>
                <Tabs value={activeTab} onValueChange={onTabChange} className="flex-1 flex flex-col min-h-0">
                    <TabsList className="w-full grid grid-cols-2 bg-white/5 mx-4 mt-2 flex-shrink-0 border border-white/5" style={{ width: 'calc(100% - 2rem)' }}>
                        <TabsTrigger value="chat" className="gap-2 data-[state=active]:bg-white/10 data-[state=active]:text-white"><MessageSquare className="w-4 h-4" /> Chat</TabsTrigger>
                        <TabsTrigger value="discover" className="gap-2 data-[state=active]:bg-white/10 data-[state=active]:text-white"><Globe className="w-4 h-4" /> Discover</TabsTrigger>
                    </TabsList>

                    <TabsContent value="chat" className="flex-1 flex flex-col min-h-0 mt-0">
                        <div className="flex-1 overflow-y-auto p-4 flex flex-col" ref={scrollRef}>
                            <div className="mt-auto space-y-6">
                                <AnimatePresence initial={false}>
                                    {messages.map((msg) => (
                                        <motion.div
                                            key={msg.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            layout
                                            className={`flex flex-col gap-2 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                                        >
                                            {msg.image && (
                                                <div className="relative w-32 h-32 rounded-lg overflow-hidden border border-white/10 mb-1">
                                                    <Image src={msg.image} alt="User upload" fill className="object-cover" />
                                                </div>
                                            )}
                                            <div className={`p-4 rounded-2xl text-sm leading-relaxed max-w-[90%] shadow-sm ${msg.role === 'user'
                                                ? 'bg-gradient-to-br from-neutral-800 to-neutral-900 text-white rounded-br-sm border border-white/5'
                                                : 'bg-white/5 backdrop-blur-md text-foreground rounded-bl-sm'
                                                }`}>
                                                {msg.content}
                                            </div>

                                            {msg.thinking && (
                                                <ThinkingProcess steps={msg.thinking} isOpen={false} />
                                            )}
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                                {isLoading && (
                                    <div className="w-full">
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="flex items-start gap-3 mb-4"
                                        >
                                            <div className="relative w-8 h-8 rounded-full bg-white/5 flex items-center justify-center overflow-hidden">
                                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent w-[200%] animate-shimmer" />
                                                <Sparkles className="w-4 h-4 text-white/50" />
                                            </div>
                                            <div className="bg-white/5 rounded-2xl rounded-bl-sm p-4 text-sm text-muted-foreground">
                                                <span className="animate-pulse">Thinking...</span>
                                            </div>
                                        </motion.div>
                                        <ThinkingProcess steps={currentThinking} isOpen={true} />
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="p-4 border-t bg-background/50 backdrop-blur">
                            {selectedImage && (
                                <div className="relative w-16 h-16 mb-2 rounded-lg overflow-hidden border group">
                                    <Image src={selectedImage} alt="Preview" fill className="object-cover" />
                                    <button
                                        onClick={() => setSelectedImage(null)}
                                        className="absolute top-0 right-0 bg-black/50 text-white p-1 rounded-bl-lg opacity-0 group-hover:opacity-100 transition-opacity z-10"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </div>
                            )}
                            <div className="flex gap-2">
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    ref={fileInputRef}
                                    onChange={handleFileSelect}
                                />
                                <Button variant="outline" size="icon" onClick={() => fileInputRef.current?.click()}>
                                    <Paperclip className="w-4 h-4" />
                                </Button>
                                <Input
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                    placeholder="Describe your UI..."
                                    disabled={isLoading}
                                    className="flex-1 bg-background/50"
                                />
                                <Button onClick={handleSend} disabled={isLoading || (!input.trim() && !selectedImage)} size="icon">
                                    <Send className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="discover" className="flex-1 flex flex-col min-h-0 mt-0">
                        <div className="flex-1 overflow-y-auto p-4">
                            <div className="space-y-4">
                                {hubPosts.map((post) => (
                                    <div key={post.id} className="border rounded-xl p-4 bg-card hover:bg-accent/5 transition-all group">
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center text-xs font-bold text-primary">
                                                    {post.user?.handle?.[0]?.toUpperCase() || 'U'}
                                                </div>
                                                <div>
                                                    <div className="text-sm font-medium">{post.user?.handle || 'Anonymous'}</div>
                                                    <div className="text-xs text-muted-foreground">{new Date(post.createdAt).toLocaleDateString()}</div>
                                                </div>
                                            </div>
                                            <Badge variant="outline" className="text-xs font-normal opacity-50">
                                                {post.style}
                                            </Badge>
                                        </div>

                                        <div className="mb-3">
                                            <p className="text-sm line-clamp-2 text-foreground/90 font-medium leading-relaxed">
                                                {post.prompt}
                                            </p>
                                        </div>

                                        <div className="flex items-center justify-between mt-4 pt-3 border-t border-border/50">
                                            <div className="flex items-center gap-1 bg-muted/30 rounded-lg p-1">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className={`h-7 px-2 gap-1 text-xs ${post.hasVoted === 'UP' ? 'text-green-500 bg-green-500/10' : 'text-muted-foreground hover:text-green-500'}`}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        toggleVote(post.id, 'UP');
                                                        // Optimistic update could go here
                                                    }}
                                                >
                                                    <ThumbsUp className="w-3 h-3" />
                                                    <span>{post.upvoteCount || 0}</span>
                                                </Button>
                                                <div className="w-px h-4 bg-border/50" />
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className={`h-7 px-2 gap-1 text-xs ${post.hasVoted === 'DOWN' ? 'text-red-500 bg-red-500/10' : 'text-muted-foreground hover:text-red-500'}`}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        toggleVote(post.id, 'DOWN');
                                                    }}
                                                >
                                                    <ThumbsDown className="w-3 h-3" />
                                                    <span>{post.downvoteCount || 0}</span>
                                                </Button>
                                            </div>

                                            <Button
                                                size="sm"
                                                variant="secondary"
                                                className="h-8 text-xs gap-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                                onClick={() => {
                                                    setMessages(prev => [...prev, {
                                                        id: Date.now().toString(),
                                                        role: 'assistant',
                                                        content: `Loaded design: ${post.prompt}`,
                                                        ui: post.dsl
                                                    }]);
                                                    toast.success("Design loaded!");
                                                }}
                                            >
                                                <Download className="w-3 h-3" />
                                                Load
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </TabsContent>
                </Tabs >
            </div >
        </div >
    );
});
