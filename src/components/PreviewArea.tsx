import React from 'react';
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
            <div className="h-14 border-b bg-background/50 backdrop-blur flex items-center justify-between px-4">
                <div className="flex items-center gap-2 bg-muted/50 p-1 rounded-lg">
                    <Button
                        variant={zoom === 'fit' ? 'secondary' : 'ghost'}
                        size="sm"
                        className="h-8 px-3 text-xs"
                        onClick={() => setZoom('fit')}
                        disabled={viewMode === 'code'}
                    >
                        Fit
                    </Button>
                    <Button
                        variant={zoom === 1 ? 'secondary' : 'ghost'}
                        size="sm"
                        className="h-8 px-3 text-xs"
                        onClick={() => setZoom(1)}
                        disabled={viewMode === 'code'}
                    >
                        100%
                    </Button>
                    <Button
                        variant={zoom === 0.5 ? 'secondary' : 'ghost'}
                        size="sm"
                        className="h-8 px-3 text-xs"
                        onClick={() => setZoom(0.5)}
                        disabled={viewMode === 'code'}
                    >
                        50%
                    </Button>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant={viewMode === 'code' ? 'secondary' : 'outline'}
                        size="sm"
                        className={`gap-2 ${viewMode === 'code' ? '' : 'bg-transparent'}`}
                        onClick={() => setViewMode(prev => prev === 'preview' ? 'code' : 'preview')}
                    >
                        <Code className="w-4 h-4" /> {viewMode === 'code' ? 'Preview' : 'Code'}
                    </Button>
                    <Button
                        variant="default"
                        size="sm"
                        className="gap-2"
                        onClick={onUpload}
                        disabled={!lastUiMessage || isUploading}
                    >
                        {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                        Upload
                    </Button>
                </div>
            </div>

            <div className="flex-1 overflow-auto bg-muted/10 relative">
                <div className={`min-h-full min-w-full flex items-center justify-center p-8 ${zoom === 'fit' ? 'h-full' : ''}`}>
                    {lastUiMessage ? (
                        viewMode === 'preview' ? (
                            <div
                                className="bg-background rounded-xl shadow-2xl border overflow-hidden transition-all duration-300 origin-center"
                                style={{
                                    width: zoom === 'fit' ? '100%' : '1024px',
                                    height: zoom === 'fit' ? '100%' : 'auto',
                                    minHeight: zoom === 'fit' ? '0' : '600px',
                                    transform: typeof zoom === 'number' ? `scale(${zoom})` : 'none',
                                    maxWidth: zoom === 'fit' ? '100%' : 'none'
                                }}
                            >
                                <div className="h-full w-full overflow-auto">
                                    <RenderNode node={lastUiMessage.ui} />
                                </div>
                            </div>
                        ) : (
                            <div className="w-full h-full max-w-4xl bg-card rounded-xl border shadow-xl flex flex-col overflow-hidden">
                                <div className="flex items-center justify-between px-4 py-2 border-b bg-muted/30">
                                    <span className="text-xs font-medium text-muted-foreground">JSON DSL</span>
                                    <Button variant="ghost" size="sm" className="h-7 gap-1 text-xs" onClick={handleCopy}>
                                        {copied ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                                        {copied ? 'Copied' : 'Copy'}
                                    </Button>
                                </div>
                                <div className="flex-1 overflow-auto p-4 bg-muted/10">
                                    <pre className="text-xs font-mono text-foreground/80 whitespace-pre-wrap break-all">
                                        {JSON.stringify(lastUiMessage.ui, null, 2)}
                                    </pre>
                                </div>
                            </div>
                        )
                    ) : (
                        <div className="text-center text-muted-foreground">
                            <Layout className="w-12 h-12 mx-auto mb-4 opacity-20" />
                            <p>Generated UI will appear here</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
});
