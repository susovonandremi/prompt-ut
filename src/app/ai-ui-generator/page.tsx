'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ThinkingStep } from '@/components/ThinkingProcess';
import { generateUI } from '@/lib/ai-service';
import { toast } from 'sonner';
import { Hero } from '@/components/Hero';
import { ChatSidebar, Message } from '@/components/ChatSidebar';
import { PreviewArea } from '@/components/PreviewArea';
import { getGalleryPosts, saveGalleryPost } from '@/lib/gallery';

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentThinking, setCurrentThinking] = useState<ThinkingStep[]>([]);
  const [hubPosts, setHubPosts] = useState<any[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [hasStarted, setHasStarted] = useState(false);
  const [activeTab, setActiveTab] = useState("chat");
  const [isUploading, setIsUploading] = useState(false);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, currentThinking]);

  // Fetch local gallery posts on load
  useEffect(() => {
    setHubPosts(getGalleryPosts());
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const handleSend = useCallback(async () => {
    if ((!input.trim() && !selectedImage) || isLoading) return;

    if (!hasStarted) setHasStarted(true);

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      image: selectedImage || undefined
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setSelectedImage(null);
    setIsLoading(true);

    // Simulate thinking steps for UI feedback
    const steps: ThinkingStep[] = [
      { id: '1', label: 'Analyzing request...', status: 'active' },
      { id: '2', label: 'Resolving layout grid...', status: 'pending' },
      { id: '3', label: 'Applying Stitch design system...', status: 'pending' },
      { id: '4', label: 'Generating components code...', status: 'pending' }
    ];
    setCurrentThinking(steps);

    try {
      // Simulate step progress
      setTimeout(() => setCurrentThinking(s => s.map(step => step.id === '1' ? { ...step, status: 'completed' } : step.id === '2' ? { ...step, status: 'active' } : step)), 800);
      setTimeout(() => setCurrentThinking(s => s.map(step => step.id === '2' ? { ...step, status: 'completed' } : step.id === '3' ? { ...step, status: 'active' } : step)), 1600);

      // Build conversation history for iterative refinement
      const history = messages.map(m => {
        if (m.role === 'assistant') {
          return {
            role: m.role,
            content: m.ui ? JSON.stringify({ version: "2", variants: [m.ui] }) : m.content
          };
        }
        return {
          role: m.role,
          content: m.content
        };
      });

      // Pass history to generateUI
      const result = await generateUI(userMsg.content, "modern", userMsg.image, history);

      if (!result.success) {
        throw new Error(result.error);
      }

      // Update thinking with real data
      setCurrentThinking(s => s.map(step => ({ ...step, status: 'completed' })));

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "Here is your design, styled using the Stitch design system. You can iterate on this design by typing follow-up instructions in the sidebar.",
        thinking: [
          { id: '1', label: 'Request Analysis', status: 'completed', details: 'Iterative layout design requested.' },
          { id: '2', label: 'Prompt Enhancement', status: 'completed', details: result.thinking.enhancedPrompt },
          { id: '3', label: 'Generation', status: 'completed', details: 'Rendered valid high-fidelity DSL.' }
        ],
        ui: result.data.variants[0]
      };

      setMessages(prev => [...prev, aiMsg]);
    } catch (error: any) {
      let errorMessage = "Failed to generate UI";

      if (typeof error === 'string') {
        errorMessage = error;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      } else if (error && typeof error === 'object') {
        try {
          errorMessage = JSON.stringify(error) || "Unknown Error Object";
        } catch {
          errorMessage = "Unserializable Error";
        }
      }

      toast.error(errorMessage);
      console.error("UI Gen Error:", error);
    } finally {
      setIsLoading(false);
      setCurrentThinking([]);
    }
  }, [input, selectedImage, isLoading, hasStarted, messages]);

  const handleUpload = useCallback(async () => {
    const lastUiMessage = [...messages].reverse().find(m => m.ui);
    if (!lastUiMessage) {
      toast.error("Please generate a UI design before publishing.");
      return;
    }

    setIsUploading(true);
    try {
      const lastUserMsg = [...messages].reverse().find(m => m.role === 'user');
      const promptText = lastUserMsg?.content || "Generated UI component";

      const updatedPosts = saveGalleryPost(promptText, lastUiMessage.ui, "modern", "LocalDesigner");
      setHubPosts(updatedPosts);
      toast.success("Design published successfully to the local gallery!");
      
      // Auto switch to discover tab so the user sees their post
      setActiveTab("discover");
    } catch (error) {
      console.error(error);
      toast.error("Failed to publish design");
    } finally {
      setIsUploading(false);
    }
  }, [messages]);

  const handleRemix = useCallback((dsl: any, prompt: string) => {
    // Set up messages state with the remixed component
    setMessages([
      {
        id: `remix-user-${Date.now()}`,
        role: 'user',
        content: `Remix design: "${prompt}"`
      },
      {
        id: `remix-ai-${Date.now()}`,
        role: 'assistant',
        content: `Loaded design template: "${prompt}". You can modify, iterate or redesign it by sending new prompts.`,
        ui: dsl
      }
    ]);
    
    setInput(prompt);
    setActiveTab("chat");
    toast.success("Loaded design template into your sandbox!");
  }, []);

  const handleOpenDiscover = useCallback(() => {
    setActiveTab("discover");
    setHasStarted(true);
  }, []);

  const lastUiMessage = [...messages].reverse().find(m => m.ui);

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden font-sans selection:bg-primary/20">
      <Hero
        hasStarted={hasStarted}
        input={input}
        setInput={setInput}
        handleSend={handleSend}
        selectedImage={selectedImage}
        setSelectedImage={setSelectedImage}
        fileInputRef={fileInputRef}
        handleFileSelect={handleFileSelect}
        onOpenDiscover={handleOpenDiscover}
        isLoading={isLoading}
      />

      <div className={`flex w-full h-full transition-opacity duration-500 ${hasStarted ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <ChatSidebar
          hasStarted={hasStarted}
          messages={messages}
          setMessages={setMessages}
          isLoading={isLoading}
          currentThinking={currentThinking}
          input={input}
          setInput={setInput}
          handleSend={handleSend}
          selectedImage={selectedImage}
          setSelectedImage={setSelectedImage}
          fileInputRef={fileInputRef}
          handleFileSelect={handleFileSelect}
          hubPosts={hubPosts}
          setHubPosts={setHubPosts}
          scrollRef={scrollRef}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onRemix={handleRemix}
        />

        <PreviewArea
          lastUiMessage={lastUiMessage}
          onUpload={handleUpload}
          isUploading={isUploading}
        />
      </div>
    </div>
  );
}
