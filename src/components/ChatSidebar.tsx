import React from 'react';
import { Sparkles, MessageSquare, Globe, Paperclip, X, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ThinkingProcess, type ThinkingStep } from '@/components/ThinkingProcess';
import Image from 'next/image';

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
}

export function ChatSidebar({
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
    scrollRef
}: ChatSidebarProps) {
    return (
        <div className={`w-[400px] flex flex-col border-r bg-muted/30 backdrop-blur-xl transition-opacity duration-500 ${hasStarted ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
            <div className="p-4 border-b bg-background/50 backdrop-blur">
                <h1 className="font-semibold flex items-center gap-2 mb-4">
                    <Sparkles className="w-4 h-4 text-primary" />
                    AI Designer
                </h1>
                <Tabs defaultValue="chat" className="w-full">
                    <TabsList className="w-full grid grid-cols-2 bg-muted/50">
                        <TabsTrigger value="chat" className="gap-2 data-[state=active]:bg-background"><MessageSquare className="w-4 h-4" /> Chat</TabsTrigger>
                        <TabsTrigger value="discover" className="gap-2 data-[state=active]:bg-background"><Globe className="w-4 h-4" /> Discover</TabsTrigger>
                    </TabsList>

                    <TabsContent value="chat" className="flex-1 flex flex-col h-[calc(100vh-140px)] mt-0">
                        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
                            <div className="space-y-6">
                                {messages.map((msg) => (
                                    <div key={msg.id} className={`flex flex-col gap-2 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                                        {msg.image && (
                                            <div className="relative w-32 h-32 rounded-lg overflow-hidden border mb-1">
                                                <Image src={msg.image} alt="User upload" fill className="object-cover" />
                                            </div>
                                        )}
                                        <div className={`p-3 rounded-xl text-sm max-w-[90%] ${msg.role === 'user'
                                            ? 'bg-primary text-primary-foreground rounded-br-none'
                                            : 'bg-muted rounded-bl-none'
                                            }`}>
                                            {msg.content}
                                        </div>

                                        {msg.thinking && (
                                            <ThinkingProcess steps={msg.thinking} isOpen={false} />
                                        )}
                                    </div>
                                ))}

                                {isLoading && (
                                    <div className="w-full">
                                        <ThinkingProcess steps={currentThinking} isOpen={true} />
                                    </div>
                                )}
                            </div>
                        </ScrollArea>

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

                    <TabsContent value="discover" className="flex-1 h-[calc(100vh-140px)] mt-0">
                        <ScrollArea className="h-full p-4">
                            <div className="space-y-4">
                                {hubPosts.map((post) => (
                                    <div key={post.id} className="border rounded-lg p-3 bg-card hover:bg-accent/50 cursor-pointer transition-colors" onClick={() => {
                                        setMessages(prev => [...prev, {
                                            id: Date.now().toString(),
                                            role: 'assistant',
                                            content: `Loaded design: ${post.prompt}`,
                                            ui: post.dsl
                                        }]);
                                    }}>
                                        <div className="text-sm font-medium line-clamp-2">{post.prompt}</div>
                                        <div className="text-xs text-muted-foreground mt-2 flex justify-between">
                                            <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                                            <span>by {post.user?.handle || 'User'}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
