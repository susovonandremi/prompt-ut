import React from 'react';
import { Monitor, Tablet, Smartphone, Code, Download, Layout } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RenderNode } from '@/components/RenderNode';
import { toast } from 'sonner';

interface PreviewAreaProps {
    lastUiMessage: any; // Using any for Message to avoid circular deps for now
}

export function PreviewArea({ lastUiMessage }: PreviewAreaProps) {

    const handleExport = () => {
        if (!lastUiMessage?.ui) {
            toast.error("No design to export");
            return;
        }

        try {
            // In a real app, this would convert DSL to React code string
            // For now, we'll just export the JSON DSL
            const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(lastUiMessage.ui, null, 2));
            const downloadAnchorNode = document.createElement('a');
            downloadAnchorNode.setAttribute("href", dataStr);
            downloadAnchorNode.setAttribute("download", "ui-design.json");
            document.body.appendChild(downloadAnchorNode);
            downloadAnchorNode.click();
            downloadAnchorNode.remove();

            toast.success("Design exported as JSON");
        } catch (error) {
            console.error("Export failed", error);
            toast.error("Failed to export design");
        }
    };

    return (
        <div className="flex-1 flex flex-col bg-background">
            <div className="h-14 border-b bg-background/50 backdrop-blur flex items-center justify-between px-4">
                <div className="flex items-center gap-2 bg-muted/50 p-1 rounded-lg">
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-background"><Monitor className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-background"><Tablet className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-background"><Smartphone className="w-4 h-4" /></Button>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                        <Code className="w-4 h-4" /> Code
                    </Button>
                    <Button variant="default" size="sm" className="gap-2" onClick={handleExport}>
                        <Download className="w-4 h-4" /> Export
                    </Button>
                </div>
            </div>

            <div className="flex-1 overflow-auto p-8 flex items-center justify-center bg-muted/10">
                {lastUiMessage ? (
                    <div className="w-full max-w-5xl bg-background rounded-xl shadow-2xl border overflow-hidden min-h-[600px]">
                        <RenderNode node={lastUiMessage.ui} />
                    </div>
                ) : (
                    <div className="text-center text-muted-foreground">
                        <Layout className="w-12 h-12 mx-auto mb-4 opacity-20" />
                        <p>Generated UI will appear here</p>
                    </div>
                )}
            </div>
        </div>
    );
}
