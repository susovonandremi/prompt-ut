import React from 'react';
import { MessageSquare, Globe, Sparkles, X, Paperclip, Send, ThumbsUp, ThumbsDown, ArrowUpRight } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ThinkingProcess, ThinkingStep } from './ThinkingProcess';
import { toggleGalleryVote } from '@/lib/gallery';
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
    setHubPosts: React.Dispatch<React.SetStateAction<any[]>>;
    scrollRef: any;
    activeTab?: string;
    onTabChange?: (tab: string) => void;
    onRemix?: (dsl: any, prompt: string) => void;
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
    setHubPosts,
    scrollRef,
    activeTab = "chat",
    onTabChange,
    onRemix
}: ChatSidebarProps) {

    const handleVote = (postId: string, voteType: 'UP' | 'DOWN') => {
        const updated = toggleGalleryVote(postId, voteType);
        setHubPosts(updated);
        toast.success(voteType === 'UP' ? "Upvoted!" : "Downvoted!");
    };

    return (
        <div className={`w-[400px] flex flex-col border-r border-white/5 bg-[#09090b] transition-opacity duration-500 ${hasStarted ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
            <div className="flex-1 flex flex-col min-h-0">
                <div className="p-4 border-b border-white/5 bg-[#09090b] flex-shrink-0 flex items-center justify-between">
                    <button
                        onClick={() => window.location.reload()}
                        className="font-bold flex items-center gap-2 hover:opacity-85 transition-opacity cursor-pointer"
                    >
                        <div className="w-7 h-7 rounded bg-gradient-to-r from-violet-600 to-indigo-600 flex items-center justify-center font-bold text-white text-sm shadow-[0_0_15px_rgba(99,102,241,0.5)]">
                            S
                        </div>
                        <span className="text-white text-base font-semibold tracking-tight">
                            Stitch AI
                        </span>
                    </button>
                    <Badge className="bg-indigo-600/10 text-indigo-400 hover:bg-indigo-600/20 border-none font-medium text-[10px]">
                        Stitch Mode
                    </Badge>
                </div>
                
                <Tabs value={activeTab} onValueChange={onTabChange} className="flex-1 flex flex-col min-h-0">
                    <TabsList className="w-full grid grid-cols-2 bg-white/5 mx-4 mt-3 flex-shrink-0 border border-white/5" style={{ width: 'calc(100% - 2rem)' }}>
                        <TabsTrigger value="chat" className="gap-2 data-[state=active]:bg-white/10 data-[state=active]:text-white"><MessageSquare className="w-4 h-4" /> Prompt Editor</TabsTrigger>
                        <TabsTrigger value="discover" className="gap-2 data-[state=active]:bg-white/10 data-[state=active]:text-white"><Globe className="w-4 h-4" /> Gallery Discover</TabsTrigger>
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
                                                    <img src={msg.image} alt="User upload" className="w-full h-full object-cover" />
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
                                                <span className="animate-pulse">Designing layout...</span>
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
                                    <img src={selectedImage} alt="Preview" className="w-full h-full object-cover" />
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
                                <Button variant="outline" size="icon" onClick={() => fileInputRef.current?.click()} className="border-white/5 bg-white/5 hover:bg-white/10 shrink-0">
                                    <Paperclip className="w-4 h-4" />
                                </Button>
                                <Input
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                    placeholder="Iterate or redesign this layout..."
                                    disabled={isLoading}
                                    className="flex-1 bg-[#141416] border-white/5 focus-visible:ring-1 focus-visible:ring-indigo-500"
                                />
                                <Button onClick={handleSend} disabled={isLoading || (!input.trim() && !selectedImage)} size="icon" className="bg-indigo-600 hover:bg-indigo-700 shadow-sm shrink-0">
                                    <Send className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    </TabsContent>
 
                    <TabsContent value="discover" className="flex-1 flex flex-col min-h-0 mt-0">
                        <div className="flex-1 overflow-y-auto p-4">
                            <div className="space-y-4">
                                {hubPosts.length === 0 ? (
                                    <div className="p-8 text-center text-zinc-500 text-sm">
                                        No designs published yet. Click "Publish to Gallery" on the right when you generate a design!
                                    </div>
                                ) : (
                                    hubPosts.map((post) => (
                                        <div key={post.id} className="border border-white/5 rounded-xl p-4 bg-[#0e0e10] hover:bg-white/5 transition-all group flex flex-col">
                                            <div className="flex justify-between items-start mb-2">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center text-xs font-bold text-indigo-400">
                                                        {post.author?.[0]?.toUpperCase() || 'U'}
                                                    </div>
                                                    <div>
                                                        <div className="text-xs font-medium text-white/80">{post.author || 'Anonymous'}</div>
                                                        <div className="text-[10px] text-muted-foreground">{new Date(post.createdAt).toLocaleDateString()}</div>
                                                    </div>
                                                </div>
                                                <Badge variant="outline" className="text-[9px] font-normal opacity-50 bg-white/5 text-zinc-300 border-none px-1.5 py-0.5">
                                                    {post.style}
                                                </Badge>
                                            </div>
 
                                            <div className="mb-3">
                                                <p className="text-xs text-zinc-300 font-medium leading-relaxed italic">
                                                    "{post.prompt}"
                                                </p>
                                            </div>
 
                                            <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/5">
                                                <div className="flex items-center gap-1 bg-white/5 rounded-lg p-0.5">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className={`h-6 px-1.5 gap-1 text-[10px] hover:bg-white/10 ${post.userVote === 'UP' ? 'text-green-500 bg-green-500/10' : 'text-muted-foreground hover:text-green-500'}`}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleVote(post.id, 'UP');
                                                        }}
                                                    >
                                                        <ThumbsUp className="w-3 h-3" />
                                                        <span>{post.upvotes || 0}</span>
                                                    </Button>
                                                    <div className="w-px h-3 bg-white/10" />
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className={`h-6 px-1.5 gap-1 text-[10px] hover:bg-white/10 ${post.userVote === 'DOWN' ? 'text-red-500 bg-red-500/10' : 'text-muted-foreground hover:text-red-500'}`}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleVote(post.id, 'DOWN');
                                                        }}
                                                    >
                                                        <ThumbsDown className="w-3 h-3" />
                                                        <span>{post.downvotes || 0}</span>
                                                    </Button>
                                                </div>
 
                                                <Button
                                                    size="sm"
                                                    variant="secondary"
                                                    className="h-7 text-[10px] gap-1 px-2.5 bg-indigo-600 text-white hover:bg-indigo-700 border-none transition-all shadow-sm"
                                                    onClick={() => {
                                                        if (onRemix) {
                                                            onRemix(post.dsl, post.prompt);
                                                        }
                                                    }}
                                                >
                                                    <ArrowUpRight className="w-3 h-3" />
                                                    Remix Design
                                                </Button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </TabsContent>
                </Tabs >
            </div >
        </div >
    );
});
