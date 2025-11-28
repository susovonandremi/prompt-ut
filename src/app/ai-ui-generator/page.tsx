'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { ThinkingStep } from '@/components/ThinkingProcess';
import { generateUI } from '@/lib/ai-service';
import { toast } from 'sonner';
import { saveToHub, getHubPosts } from '@/app/actions';
import { Hero } from '@/components/Hero';
import { ChatSidebar, Message } from '@/components/ChatSidebar';
import { PreviewArea } from '@/components/PreviewArea';

export default function ChatPage() {
  const { user } = useUser();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentThinking, setCurrentThinking] = useState<ThinkingStep[]>([]);
  const [hubPosts, setHubPosts] = useState<any[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [hasStarted, setHasStarted] = useState(false);

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

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSend = async () => {
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

    } catch (error) {
      toast.error("Failed to generate UI");
      console.error(error);
    } finally {
      setIsLoading(false);
      setCurrentThinking([]);
    }
  };

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
          scrollRef={scrollRef}
        />

        <PreviewArea lastUiMessage={lastUiMessage} />
      </div>
    </div>
  );
}