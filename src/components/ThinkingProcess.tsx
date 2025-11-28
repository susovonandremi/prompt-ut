// components/ThinkingProcess.tsx
'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronRight, Loader2, CheckCircle2, BrainCircuit } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ThinkingStep {
    id: string;
    label: string;
    status: 'pending' | 'active' | 'completed';
    details?: string;
}

interface ThinkingProcessProps {
    steps: ThinkingStep[];
    isOpen?: boolean;
    onToggle?: () => void;
}

export function ThinkingProcess({ steps, isOpen: defaultIsOpen = true, onToggle }: ThinkingProcessProps) {
    const [internalIsOpen, setInternalIsOpen] = useState(defaultIsOpen);
    const isExpanded = onToggle ? defaultIsOpen : internalIsOpen;

    const handleToggle = () => {
        if (onToggle) {
            onToggle();
        } else {
            setInternalIsOpen(!internalIsOpen);
        }
    };

    const activeStep = steps.find(s => s.status === 'active') || steps[steps.length - 1];

    return (
        <div className="w-full max-w-md mx-auto my-4 border rounded-xl bg-card shadow-sm overflow-hidden">
            {/* Header */}
            <button
                onClick={handleToggle}
                className="w-full flex items-center justify-between p-3 bg-muted/30 hover:bg-muted/50 transition-colors"
            >
                <div className="flex items-center gap-2 text-sm font-medium">
                    <BrainCircuit className={cn("w-4 h-4", activeStep?.status === 'active' ? "text-primary animate-pulse" : "text-muted-foreground")} />
                    <span>
                        {activeStep?.status === 'active' ? activeStep.label : 'Generation Complete'}
                    </span>
                </div>
                {isExpanded ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
            </button>

            {/* Content */}
            <AnimatePresence initial={false}>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        <div className="p-3 space-y-3 border-t bg-card/50">
                            {steps.map((step) => (
                                <div key={step.id} className="flex flex-col gap-1">
                                    <div className="flex items-center gap-2 text-sm">
                                        {step.status === 'pending' && <div className="w-4 h-4 rounded-full border-2 border-muted" />}
                                        {step.status === 'active' && <Loader2 className="w-4 h-4 text-primary animate-spin" />}
                                        {step.status === 'completed' && <CheckCircle2 className="w-4 h-4 text-green-500" />}

                                        <span className={cn(
                                            step.status === 'active' ? "font-medium text-foreground" : "text-muted-foreground",
                                            step.status === 'completed' && "text-foreground/80"
                                        )}>
                                            {step.label}
                                        </span>
                                    </div>

                                    {step.details && step.status !== 'pending' && (
                                        <div className="ml-6 text-xs text-muted-foreground bg-muted/30 p-2 rounded-md font-mono whitespace-pre-wrap">
                                            {step.details}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
