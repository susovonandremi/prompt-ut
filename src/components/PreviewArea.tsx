import React from 'react';
import { motion } from 'framer-motion';
import { Code, Upload, Layout, Loader2, Check, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RenderNode } from '@/components/RenderNode';
import { toast } from 'sonner';

interface PreviewAreaProps {
    lastUiMessage: any;
    onUpload: () => void;
    isUploading?: boolean;
}

export const PreviewArea = React.memo(function PreviewArea({ lastUiMessage, onUpload, isUploading = false }: PreviewAreaProps) {

    const [zoom, setZoom] = React.useState<number | 'fit'>('fit');
    const [viewMode, setViewMode] = React.useState<'preview' | 'code'>('preview');
    const [copied, setCopied] = React.useState(false);

    const handleCopy = () => {
        if (!lastUiMessage?.ui) return;
        navigator.clipboard.writeText(JSON.stringify(lastUiMessage.ui, null, 2));
        setCopied(true);
        toast.success("Code copied to clipboard");
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="flex-1 flex flex-col bg-background">
            <div className="h-14 border-b border-white/5 bg-background/50 backdrop-blur flex items-center justify-between px-4">
                <div className="flex items-center gap-2 bg-white/5 p-1 rounded-lg border border-white/5">
                    <Button
                        variant={zoom === 'fit' ? 'secondary' : 'ghost'}
                        size="sm"
                        className="h-8 px-3 text-xs hover:bg-white/10"
                        onClick={() => setZoom('fit')}
                        disabled={viewMode === 'code'}
                    >
                        Fit
                    </Button>
                    <Button
                        variant={zoom === 1 ? 'secondary' : 'ghost'}
                        size="sm"
                        className="h-8 px-3 text-xs hover:bg-white/10"
                        onClick={() => setZoom(1)}
                        disabled={viewMode === 'code'}
                    >
                        100%
                    </Button>
                    <Button
                        variant={zoom === 0.5 ? 'secondary' : 'ghost'}
                        size="sm"
                        className="h-8 px-3 text-xs hover:bg-white/10"
                        onClick={() => setZoom(0.5)}
                        disabled={viewMode === 'code'}
                    >
                        50%
                    </Button>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-3 text-xs gap-2 hover:bg-white/5"
                        onClick={handleCopy}
                    >
                        {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        {copied ? 'Copied' : 'Copy DSL'}
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-3 text-xs gap-2 hover:bg-white/5"
                        onClick={onUpload}
                        disabled={isUploading}
                    >
                        {isUploading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}
                        Upload Design
                    </Button>
                </div>
                <div className="flex bg-white/5 p-1 rounded-lg border border-white/5">
                    <Button
                        variant={viewMode === 'preview' ? 'secondary' : 'ghost'}
                        size="sm"
                        className="h-8 px-3 text-xs gap-2 hover:bg-white/10"
                        onClick={() => setViewMode('preview')}
                    >
                        <Layout className="w-3 h-3" /> Preview
                    </Button>
                    <Button
                        variant={viewMode === 'code' ? 'secondary' : 'ghost'}
                        size="sm"
                        className="h-8 px-3 text-xs gap-2 hover:bg-white/10"
                        onClick={() => setViewMode('code')}
                    >
                        <Code className="w-3 h-3" /> Code
                    </Button>
                </div>
            </div>

            <div className="flex-1 overflow-hidden relative bg-[#080808] flex items-center justify-center p-8">
                {/* Background Grid Pattern - Subtle */}
                <div className="absolute inset-0 opacity-20 pointer-events-none"
                    style={{ backgroundImage: 'radial-gradient(#333 1px, transparent 1px)', backgroundSize: '24px 24px' }}
                />

                {viewMode === 'preview' ? (
                    <motion.div
                        layout
                        className="relative z-10 w-full h-full max-w-[400px] md:max-w-[700px] lg:max-w-[1024px] transition-all duration-300 ease-in-out"
                        style={{
                            transform: zoom === 'fit' ? 'scale(1)' : `scale(${zoom})`,
                            transformOrigin: 'center center'
                        }}
                    >
                        {/* Device Frame */}
                        <div className="w-full h-full bg-background rounded-[2.5rem] border-[8px] border-zinc-900 shadow-2xl overflow-hidden relative ring-1 ring-white/10">
                            {/* Status Bar simulation */}
                            <div className="absolute top-0 left-0 right-0 h-6 bg-black z-20 flex justify-between px-6 items-center pointer-events-none">
                                <div className="text-[10px] text-white font-medium">9:41</div>
                                <div className="flex gap-1.5">
                                    <div className="w-3 h-3 rounded-full bg-white/20" />
                                    <div className="w-3 h-3 rounded-full bg-white/20" />
                                </div>
                            </div>

                            <div className="w-full h-full overflow-y-auto no-scrollbar bg-white dark:bg-black pt-6">
                                {lastUiMessage ? (
                                    <div className="min-h-full">
                                        <RenderNode node={lastUiMessage.ui} />
                                    </div>
                                ) : (
                                    <div className="h-full flex flex-col items-center justify-center text-muted-foreground/40">
                                        <div className="w-20 h-20 rounded-2xl bg-white/5 flex items-center justify-center mb-6">
                                            <Layout className="w-10 h-10" />
                                        </div>
                                        <p className="text-lg font-medium text-white/20">Ready to design</p>
                                        <p className="text-sm">Describe your UI to generate a preview</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                ) : (
                    <div className="w-full h-full max-w-4xl bg-[#0D0D0D] rounded-xl border border-white/10 overflow-hidden shadow-2xl">
                        <div className="p-4 border-b border-white/5 flex justify-between items-center bg-white/5">
                            <span className="text-xs font-mono text-muted-foreground">generated_ui.json</span>
                            <div className="flex gap-1.5">
                                <div className="w-3 h-3 rounded-full bg-red-500/20" />
                                <div className="w-3 h-3 rounded-full bg-yellow-500/20" />
                                <div className="w-3 h-3 rounded-full bg-green-500/20" />
                            </div>
                        </div>
                        <pre className="p-6 overflow-auto h-[calc(100%-3rem)] text-xs font-mono text-zinc-400">
                            {lastUiMessage?.ui ? JSON.stringify(lastUiMessage.ui, null, 2) : '// No code generated yet'}
                        </pre>
                    </div>
                )}
            </div>
        </div>
    );
});
