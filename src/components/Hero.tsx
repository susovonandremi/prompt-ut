import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUp, Image as ImageIcon, Layout, Mic, Paperclip, Sparkles, X, Loader2 } from 'lucide-react';
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
                    exit={{ opacity: 0, scale: 0.95, filter: "blur(20px)", transition: { duration: 0.8 } }}
                    className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-background min-h-[100vh]"
                >
                    {/* Visuals: Void Glow */}
                    <div className="absolute inset-0 overflow-hidden pointer-events-none flex items-center justify-center">
                        <div className="w-[80vw] h-[80vw] md:w-[600px] md:h-[600px] void-glow rounded-full blur-3xl opacity-50" />
                    </div>

                    {/* Header: Minimal */}
                    <header className="absolute top-0 w-full p-8 flex justify-between items-center max-w-7xl mx-auto z-10">
                        <div className="flex items-center gap-2">
                            <div className="relative w-8 h-8">
                                <Image src="/logo.png" alt="REVision Logo" fill className="object-contain" />
                            </div>
                            <span className="font-medium text-lg tracking-tight text-white">REVision</span>
                        </div>
                        <div className="flex gap-4 items-center">
                            {!isSignedIn ? (
                                <>
                                    <Button variant="ghost" className="text-muted-foreground hover:text-foreground" onClick={() => openSignIn()}>Log in</Button>
                                    <Button className="rounded-full px-6 bg-white text-black hover:bg-white/90" onClick={() => openSignUp()}>Get started</Button>
                                </>
                            ) : (
                                <UserButton />
                            )}
                        </div>
                    </header>

                    {/* Hero Content: Centered & Massive */}
                    <div className="relative z-10 flex flex-col items-center justify-center w-full max-w-5xl px-4 text-center space-y-12">

                        <div className="space-y-6">
                            <motion.h1
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8, ease: "easeOut" }}
                                className="text-6xl md:text-8xl font-medium tracking-tighter"
                            >
                                <span className="text-gradient-silver">Design at the</span>
                                <br />
                                <span className="text-white/20">Speed of Thought.</span>
                            </motion.h1>

                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2, duration: 0.8 }}
                                className="text-lg md:text-xl text-muted-foreground/60 max-w-xl mx-auto font-light"
                            >
                                Generate high-fidelity wireframes with code by just prompting your idea.
                            </motion.p>
                        </div>

                        {/* Input Field: Floating Capsule */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.4, duration: 0.6 }}
                            className="w-full max-w-[600px] relative group"
                        >
                            <div className={`
                                w-full h-16 rounded-full glass-panel pl-6 pr-2 flex items-center gap-4 transition-all duration-300
                                group-hover:border-white/20 focus-within:border-white/30 focus-within:bg-white/10
                                ${isLoading ? 'animate-pulse border-white/30' : ''}
                            `}>
                                <div className="flex items-center gap-3 text-muted-foreground/50">
                                    <button
                                        className="hover:text-foreground transition-colors"
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        <Paperclip className="w-5 h-5" />
                                    </button>
                                    <button className="hover:text-foreground transition-colors">
                                        <Layout className="w-5 h-5" />
                                    </button>
                                </div>

                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') handleSend();
                                    }}
                                    placeholder="Describe your interface..."
                                    className="flex-1 bg-transparent border-none outline-none text-lg placeholder:text-muted-foreground/30 text-foreground h-full"
                                />

                                {/* Hidden Inputs */}
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    ref={fileInputRef}
                                    onChange={handleFileSelect}
                                />

                                {/* Generate Button */}
                                <Button
                                    onClick={handleSend}
                                    disabled={!input.trim() && !selectedImage}
                                    size="icon"
                                    className="h-12 w-12 rounded-full bg-white text-black hover:bg-white/90 shadow-[0_0_20px_rgba(255,255,255,0.3)] transition-all shrink-0"
                                >
                                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ArrowUp className="w-6 h-6" />}
                                </Button>
                            </div>

                            {/* Image Preview if selected */}
                            {selectedImage && (
                                <div className="absolute top-full mt-4 left-0 w-full flex justify-center">
                                    <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-white/10 group/img">
                                        <Image src={selectedImage} alt="Preview" fill className="object-cover" />
                                        <button
                                            onClick={() => setSelectedImage(null)}
                                            className="absolute top-0 right-0 bg-black/50 text-white p-1 rounded-bl-lg opacity-0 group-hover/img:opacity-100 transition-opacity"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </motion.div>

                    </div>

                    {/* Learn More / Scroll indicator */}
                    <motion.button
                        onClick={onOpenDiscover}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1, duration: 1 }}
                        className="absolute bottom-8 text-xs text-muted-foreground/30 hover:text-white transition-colors"
                    >
                        Explore Community
                    </motion.button>

                </motion.div>
            )}
        </AnimatePresence>
    );
}
