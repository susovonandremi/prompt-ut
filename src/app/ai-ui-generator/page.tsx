'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useUser, useClerk } from '@clerk/nextjs';
import { ThinkingStep } from '@/components/ThinkingProcess';
import { generateUI } from '@/lib/ai-service';
import { toast } from 'sonner';
import { saveToHub, getHubPosts } from '@/app/actions';
import { Hero } from '@/components/Hero';
import { ChatSidebar, Message } from '@/components/ChatSidebar';
import { PreviewArea } from '@/components/PreviewArea';

export default function ChatPage() {
  const { user } = useUser();
  const { openSignIn } = useClerk();
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

  // Fetch Hub Posts
  useEffect(() => {
    getHubPosts().then(setHubPosts).catch(console.error);
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
      { id: '1', label: 'Analyzing Request', status: 'active' },
      { id: '2', label: 'Enhancing Prompt', status: 'pending' },
      { id: '3', label: 'Planning Layout', status: 'pending' },
      { id: '4', label: 'Generating Components', status: 'pending' }
    ];
    setCurrentThinking(steps);

    try {
      // Simulate step progress
      setTimeout(() => setCurrentThinking(s => s.map(step => step.id === '1' ? { ...step, status: 'completed' } : step.id === '2' ? { ...step, status: 'active' } : step)), 1000);

      // Pass image to generateUI
      const result = await generateUI(userMsg.content, "modern", userMsg.image);

      if (!result.success) {
        throw new Error(result.error);
      }

      // Update thinking with real data
      setCurrentThinking(s => s.map(step => ({ ...step, status: 'completed' })));

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "Here is the design based on your request.",
        thinking: [
          { id: '1', label: 'Request Analysis', status: 'completed', details: 'User requested a UI design.' },
          { id: '2', label: 'Prompt Enhancement', status: 'completed', details: result.thinking.enhancedPrompt },
          { id: '3', label: 'Generation', status: 'completed', details: 'Generated valid DSL v2.' }
        ],
        ui: result.data.variants[0]
      };

      setMessages(prev => [...prev, aiMsg]);

      // Auto-save to Hub
      if (user) {
        saveToHub(userMsg.content, result.data.variants[0], "modern")
          .then(() => {
            toast.success("Saved to Hub!");
            getHubPosts().then(setHubPosts); // Refresh hub
          })
          .catch(e => console.error("Failed to save", e));
      }

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

      // Append a clear instruction if it looks like a timeout or network error
      if (errorMessage.includes("digest") || errorMessage.includes("fetch")) {
        errorMessage += " (Network/Timeout Error - Vercel logs might show more)";
      }

      toast.error(errorMessage);
      console.error("UI Gen Error:", error);
    } finally {
      setIsLoading(false);
      setCurrentThinking([]);
    }
  }, [input, selectedImage, isLoading, hasStarted, user]);

  const handleUpload = useCallback(async () => {
    // We need to access the latest messages state, but since we can't easily access it inside useCallback without adding it to deps (which causes re-creation),
    // we'll rely on the fact that this function is recreated when messages change.
    // Ideally, we'd pass the message to upload as an argument, but the PreviewArea just calls onUpload.
    // For now, adding messages to dependency array is acceptable as upload isn't a high-frequency action.

    // Actually, to avoid stale closures, we should probably pass the UI to upload from the child or use a ref for messages if we wanted to avoid re-creation.
    // But given the frequency of upload, re-creating this function when messages change is fine.

    const lastUiMessage = [...messages].reverse().find(m => m.ui);
    if (!lastUiMessage) return;

    if (!user) {
      toast.info("Please sign in to upload");
      openSignIn();
      return;
    }

    setIsUploading(true);
    try {
      const lastUserMsg = [...messages].reverse().find(m => m.role === 'user');
      const promptText = lastUserMsg?.content || "Generated UI";

      await saveToHub(promptText, lastUiMessage.ui, "modern");
      toast.success("Successfully uploaded to Hub!");
      getHubPosts().then(setHubPosts);
    } catch (error) {
      console.error(error);
      toast.error("Failed to upload to Hub");
    } finally {
      setIsUploading(false);
    }
  }, [messages, user, openSignIn]);

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

      {/* Debug Connection Button */}
      {!hasStarted && (
        <div className="absolute top-4 right-4 z-50">
          <button
            onClick={async () => {
              const toastId = toast.loading("Testing Gemini Connection...");
              try {
                const res = await fetch('/api/debug/connection');
                const result = await res.json();

                if (res.ok && result.success) {
                  toast.success("API Key Valid! " + result.message);
                } else {
                  toast.error("API Error: " + (result.error || result.message || "Unknown Failure"));
                  console.error("API Debug Result:", result);
                }
              } catch (e: any) {
                toast.error("Network Failed: " + e.message);
              } finally {
                toast.dismiss(toastId);
              }
            }}
            className="text-xs px-3 py-1 bg-zinc-800 text-zinc-400 rounded hover:bg-zinc-700 border border-zinc-700"
          >
            Test API Key
          </button>
        </div>
      )}

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
          scrollRef={scrollRef}
          activeTab={activeTab}
          onTabChange={setActiveTab}
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
