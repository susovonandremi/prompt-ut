import React from 'react';
import { motion } from 'framer-motion';
import { Code, Upload, Layout, Loader2, Check, Copy, Monitor, Tablet, Smartphone, Sparkles, FileText, FileCode, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RenderNode } from '@/components/RenderNode';
import { toast } from 'sonner';

// Imports for export utilities
import { dslToHtml } from '@/lib/html-export';
import { dslToReact, dslToTailwindHtml } from '@/lib/code-export';
import { dslToFigmaHtml, copyToClipboard } from '@/lib/figma-export';

interface PreviewAreaProps {
    lastUiMessage: any;
    onUpload: () => void;
    isUploading?: boolean;
}

export const PreviewArea = React.memo(function PreviewArea({ lastUiMessage, onUpload, isUploading = false }: PreviewAreaProps) {
    const [viewport, setViewport] = React.useState<'desktop' | 'tablet' | 'mobile'>('desktop');
    const [viewMode, setViewMode] = React.useState<'preview' | 'code'>('preview');
    const [codeTab, setCodeTab] = React.useState<'react' | 'tailwind' | 'html' | 'dsl'>('react');
    
    const [figmaCopied, setFigmaCopied] = React.useState(false);
    const [codeCopied, setCodeCopied] = React.useState(false);

    // Get current code content based on sub-tab
    const getCodeString = () => {
        if (!lastUiMessage?.ui) return '// No design generated yet';
        
        switch (codeTab) {
            case 'react':
                return dslToReact(lastUiMessage.ui);
            case 'tailwind':
                return dslToTailwindHtml(lastUiMessage.ui);
            case 'html':
                return dslToHtml(lastUiMessage.ui);
            case 'dsl':
                return JSON.stringify(lastUiMessage.ui, null, 2);
            default:
                return '';
        }
    };

    const getFilename = () => {
        switch (codeTab) {
            case 'react': return 'GeneratedComponent.tsx';
            case 'tailwind': return 'tailwind.html';
            case 'html': return 'index.html';
            case 'dsl': return 'design_dsl.json';
        }
    };

    const handleCopyCode = async () => {
        if (!lastUiMessage?.ui) return;
        const code = getCodeString();
        try {
            await navigator.clipboard.writeText(code);
            setCodeCopied(true);
            toast.success("Code copied to clipboard!");
            setTimeout(() => setCodeCopied(false), 2000);
        } catch (err) {
            toast.error("Failed to copy code");
        }
    };

    const handleCopyToFigma = async () => {
        if (!lastUiMessage?.ui) {
            toast.error("Generate a design first before copying to Figma!");
            return;
        }
        
        try {
            const figmaHtml = dslToFigmaHtml(lastUiMessage.ui);
            // Wrap in a copy-pasteable context
            const wrappedHtml = `<div id="figma-import-root" style="background-color: #09090b; padding: 40px; border-radius: 12px; display: inline-block;">${figmaHtml}</div>`;
            await copyToClipboard(wrappedHtml);
            
            setFigmaCopied(true);
            toast.success("Layer copied! Paste (Ctrl+V) directly inside Figma using html.to.design plugin", {
                duration: 4000
            });
            setTimeout(() => setFigmaCopied(false), 2000);
        } catch (err) {
            toast.error("Figma copy failed. Ensure clipboard permissions are enabled.");
        }
    };

    return (
        <div className="flex-1 flex flex-col bg-background">
            {/* Header Control Bar */}
            <div className="h-14 border-b border-white/5 bg-[#0b0b0c] flex items-center justify-between px-6">
                {/* Viewport Switcher */}
                <div className="flex items-center gap-1.5 bg-[#141416] p-1 rounded-lg border border-white/5">
                    <Button
                        variant={viewMode === 'preview' && viewport === 'desktop' ? 'secondary' : 'ghost'}
                        size="icon"
                        className="h-8 w-8 hover:bg-white/10"
                        title="Desktop View"
                        onClick={() => {
                            setViewMode('preview');
                            setViewport('desktop');
                        }}
                    >
                        <Monitor className="w-4 h-4" />
                    </Button>
                    <Button
                        variant={viewMode === 'preview' && viewport === 'tablet' ? 'secondary' : 'ghost'}
                        size="icon"
                        className="h-8 w-8 hover:bg-white/10"
                        title="Tablet View"
                        onClick={() => {
                            setViewMode('preview');
                            setViewport('tablet');
                        }}
                    >
                        <Tablet className="w-4 h-4" />
                    </Button>
                    <Button
                        variant={viewMode === 'preview' && viewport === 'mobile' ? 'secondary' : 'ghost'}
                        size="icon"
                        className="h-8 w-8 hover:bg-white/10"
                        title="Mobile View"
                        onClick={() => {
                            setViewMode('preview');
                            setViewport('mobile');
                        }}
                    >
                        <Smartphone className="w-4 h-4" />
                    </Button>
                </div>

                {/* Export Options & Actions */}
                <div className="flex items-center gap-3">
                    <Button
                        variant="default"
                        size="sm"
                        className="h-8 px-4 text-xs font-semibold gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 border-none shadow-[0_2px_10px_rgba(99,102,241,0.25)]"
                        onClick={handleCopyToFigma}
                        disabled={!lastUiMessage?.ui}
                    >
                        {figmaCopied ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Sparkles className="w-3.5 h-3.5" />}
                        {figmaCopied ? 'Copied to Clipboard' : 'Copy to Figma'}
                    </Button>
                    
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-3 text-xs gap-2 hover:bg-white/5 border border-white/5"
                        onClick={onUpload}
                        disabled={isUploading}
                    >
                        {isUploading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}
                        Upload Design
                    </Button>
                </div>

                {/* Tab Switcher */}
                <div className="flex bg-[#141416] p-1 rounded-lg border border-white/5">
                    <Button
                        variant={viewMode === 'preview' ? 'secondary' : 'ghost'}
                        size="sm"
                        className="h-8 px-3.5 text-xs gap-2 hover:bg-white/10"
                        onClick={() => setViewMode('preview')}
                    >
                        <Layout className="w-3.5 h-3.5" /> Preview
                    </Button>
                    <Button
                        variant={viewMode === 'code' ? 'secondary' : 'ghost'}
                        size="sm"
                        className="h-8 px-3.5 text-xs gap-2 hover:bg-white/10"
                        onClick={() => setViewMode('code')}
                    >
                        <Code className="w-3.5 h-3.5" /> Code
                    </Button>
                </div>
            </div>

            {/* Canvas Container */}
            <div className="flex-1 overflow-hidden relative bg-[#080809] flex items-center justify-center p-6">
                {/* Background Grid Pattern - Subtle */}
                <div className="absolute inset-0 opacity-[0.15] pointer-events-none"
                    style={{ backgroundImage: 'radial-gradient(#52525b 1px, transparent 1px)', backgroundSize: '20px 20px' }}
                />

                {viewMode === 'preview' ? (
                    <div className="w-full h-full flex items-center justify-center overflow-auto">
                        <motion.div
                            layout
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="relative shadow-2xl h-full flex items-center justify-center"
                            style={{
                                width: viewport === 'desktop' ? '100%' : viewport === 'tablet' ? '768px' : '375px',
                                maxWidth: '100%',
                            }}
                        >
                            {/* Device Frame Wrapper */}
                            <div className={`w-full h-full bg-zinc-950 flex flex-col transition-all duration-300 relative border border-white/10 overflow-hidden
                                ${viewport === 'mobile' ? 'rounded-[2.5rem] border-[10px] border-zinc-900 ring-4 ring-white/5 max-h-[812px]' : ''}
                                ${viewport === 'tablet' ? 'rounded-[1.5rem] border-[8px] border-zinc-900 ring-2 ring-white/5 max-h-[1024px]' : 'rounded-lg'}
                            `}>
                                {/* Mobile simulated top header bar */}
                                {viewport === 'mobile' && (
                                    <div className="h-6 bg-zinc-900 flex justify-between px-6 items-center select-none pointer-events-none text-white z-20">
                                        <div className="text-[10px] font-medium leading-none">9:41</div>
                                        <div className="flex gap-1">
                                            <div className="w-2 h-2 rounded-full bg-white/30" />
                                            <div className="w-2.5 h-1.5 rounded bg-white/30" />
                                        </div>
                                    </div>
                                )}

                                {/* Preview Render Area */}
                                <div className={`flex-1 overflow-y-auto no-scrollbar bg-black p-4 pt-8 min-h-0`}>
                                    {lastUiMessage ? (
                                        <div className="min-h-full">
                                            <RenderNode node={lastUiMessage.ui} />
                                        </div>
                                    ) : (
                                        <div className="h-full flex flex-col items-center justify-center text-muted-foreground/30">
                                            <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
                                                <Layout className="w-8 h-8" />
                                            </div>
                                            <p className="text-base font-semibold text-white/45">Canvas Ready</p>
                                            <p className="text-xs">Provide a prompt to begin generating designs</p>
                                        </div>
                                    )}
                                </div>

                                {/* Mobile bottom handle indicator */}
                                {viewport === 'mobile' && (
                                    <div className="h-5 bg-zinc-900 flex items-center justify-center z-20">
                                        <div className="w-24 h-1 rounded-full bg-white/20" />
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                ) : (
                    // Code mode with sub tabs
                    <div className="w-full h-full max-w-4xl flex flex-col bg-[#0b0b0c] rounded-xl border border-white/5 overflow-hidden shadow-2xl">
                        {/* Code Sub-tabs header */}
                        <div className="flex justify-between items-center bg-[#141416] px-4 py-2 border-b border-white/5">
                            <div className="flex gap-1.5">
                                <Button
                                    variant={codeTab === 'react' ? 'secondary' : 'ghost'}
                                    size="sm"
                                    className="h-8 text-xs font-mono gap-1.5"
                                    onClick={() => setCodeTab('react')}
                                >
                                    <FileCode className="w-3.5 h-3.5 text-blue-400" /> React + Tailwind
                                </Button>
                                <Button
                                    variant={codeTab === 'tailwind' ? 'secondary' : 'ghost'}
                                    size="sm"
                                    className="h-8 text-xs font-mono gap-1.5"
                                    onClick={() => setCodeTab('tailwind')}
                                >
                                    <FileCode className="w-3.5 h-3.5 text-teal-400" /> Tailwind HTML
                                </Button>
                                <Button
                                    variant={codeTab === 'html' ? 'secondary' : 'ghost'}
                                    size="sm"
                                    className="h-8 text-xs font-mono gap-1.5"
                                    onClick={() => setCodeTab('html')}
                                >
                                    <FileCode className="w-3.5 h-3.5 text-orange-400" /> Vanilla HTML+CSS
                                </Button>
                                <Button
                                    variant={codeTab === 'dsl' ? 'secondary' : 'ghost'}
                                    size="sm"
                                    className="h-8 text-xs font-mono gap-1.5"
                                    onClick={() => setCodeTab('dsl')}
                                >
                                    <FileText className="w-3.5 h-3.5 text-purple-400" /> JSON DSL
                                </Button>
                            </div>
                            
                            <div className="flex items-center gap-2">
                                <span className="text-[11px] font-mono text-muted-foreground mr-2">{getFilename()}</span>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 px-3 text-xs gap-1.5 border border-white/5 hover:bg-white/5"
                                    onClick={handleCopyCode}
                                >
                                    {codeCopied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                                    {codeCopied ? 'Copied' : 'Copy'}
                                </Button>
                            </div>
                        </div>

                        {/* Code body */}
                        <pre className="p-6 overflow-auto flex-1 text-xs font-mono text-zinc-300 bg-[#070708] leading-relaxed select-all selection:bg-zinc-800">
                            {getCodeString()}
                        </pre>
                    </div>
                )}
            </div>
        </div>
    );
});

