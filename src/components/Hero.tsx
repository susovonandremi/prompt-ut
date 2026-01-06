import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Layout, Mic, ArrowUp, Paperclip, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { toast } from 'sonner';

import { useClerk, useUser, UserButton } from '@clerk/nextjs';

interface HeroProps {
    hasStarted: boolean;
    input: string;
    setInput: (value: string) => void;
    handleSend: () => void;
    selectedImage: string | null;
    setSelectedImage: (value: string | null) => void;
    fileInputRef: any;
    handleFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onOpenDiscover?: () => void;
    isLoading?: boolean;
}

export function Hero({
    hasStarted,
    input,
    setInput,
    handleSend,
    selectedImage,
    setSelectedImage,
    fileInputRef,
    handleFileSelect,
    onOpenDiscover,
    isLoading = false
}: HeroProps) {
    const { openSignIn, openSignUp } = useClerk();
    const { isSignedIn } = useUser();

    return (
        <AnimatePresence>
            {!hasStarted && (
                <motion.div
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-background lovable-hero-gradient"
                >
                    {/* Header */}
                    <header className="absolute top-0 w-full p-6 flex justify-between items-center max-w-7xl mx-auto">
                        <div className="flex items-center gap-2 font-bold text-xl">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-pink-500 to-blue-500 flex items-center justify-center text-white">
                                <Sparkles className="w-5 h-5" />
                            </div>
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-blue-500">
                                REVision
                            </span>
                        </div>
                        <nav className="hidden md:flex gap-8 text-sm font-medium text-muted-foreground">
                            {/* <button onClick={() => toast.info("Solutions coming soon!")} className="hover:text-foreground transition-colors">Solutions</button>
                            <button onClick={() => toast.info("Enterprise coming soon!")} className="hover:text-foreground transition-colors">Enterprise</button>
                            <button onClick={() => toast.info("Pricing coming soon!")} className="hover:text-foreground transition-colors">Pricing</button> */}
                            <button onClick={onOpenDiscover} className="hover:text-foreground transition-colors">Community</button>
                        </nav>
                        <div className="flex gap-4 items-center">
                            {!isSignedIn ? (
                                <>
                                    <Button variant="ghost" className="text-muted-foreground hover:text-foreground" onClick={() => openSignIn()}>Log in</Button>
                                    <Button className="rounded-full px-6" onClick={() => openSignUp()}>Get started</Button>
                                </>
                            ) : (
                                <UserButton afterSignOutUrl="/" />
                            )}
                        </div>
                    </header>

                    {/* Hero Content */}
                    <div className="text-center max-w-3xl px-6 -mt-20">

                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="text-5xl md:text-7xl font-bold tracking-tight mb-6"
                        >
                            Let's <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-blue-500">Revision</span>
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="text-xl text-muted-foreground mb-12"
                        >
                            Create apps and websites by chatting with AI
                        </motion.p>

                        {/* Centered Input */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.5 }}
                            className="relative max-w-2xl mx-auto w-full"
                        >
                            <div className={`glass-input rounded-2xl p-2 flex flex-col gap-2 ${isLoading ? 'loading' : ''}`}>
                                <textarea
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            handleSend();
                                        }
                                    }}
                                    placeholder="Ask RE-Vision to create a blog about..."
                                    className="w-full bg-transparent border-none text-lg p-4 min-h-[60px] resize-none focus:ring-0 placeholder:text-muted-foreground/50"
                                />

                                {selectedImage && (
                                    <div className="px-4 pb-2">
                                        <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-white/10 group">
                                            <Image src={selectedImage} alt="Preview" fill className="object-cover" />
                                            <button
                                                onClick={() => setSelectedImage(null)}
                                                className="absolute top-0 right-0 bg-black/50 text-white p-1 rounded-bl-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        </div>
                                    </div>
                                )}

                                <div className="flex justify-between items-center px-2 pb-1">
                                    <div className="flex gap-2">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            ref={fileInputRef}
                                            onChange={handleFileSelect}
                                        />
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="rounded-full text-muted-foreground hover:text-foreground hover:bg-white/5 gap-2"
                                            onClick={() => fileInputRef.current?.click()}
                                        >
                                            <Paperclip className="w-4 h-4" />
                                            Attach
                                        </Button>
                                        <Button variant="ghost" size="sm" className="rounded-full text-muted-foreground hover:text-foreground hover:bg-white/5 gap-2" onClick={() => toast.info("Themes coming soon!")}>
                                            <Layout className="w-4 h-4" />
                                            Theme
                                        </Button>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button variant="ghost" size="icon" className="rounded-full text-muted-foreground hover:text-foreground hover:bg-white/5" onClick={() => toast.info("Voice input coming soon!")}>
                                            <Mic className="w-4 h-4" />
                                        </Button>
                                        <Button
                                            onClick={handleSend}
                                            disabled={!input.trim() && !selectedImage}
                                            size="icon"
                                            className="rounded-full bg-white text-black hover:bg-white/90 transition-all"
                                        >
                                            <ArrowUp className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
