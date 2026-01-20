'use client';

import React from 'react';
import { Hero } from '@/components/Hero';
import { CommunityShowcase } from '@/components/CommunityShowcase';
import { useRouter } from 'next/navigation';

export default function LandingPage() {
  const router = useRouter();

  // Mock handlers since Hero requires them but we just want the visual part on Landing
  // or we can allow the user to actually "start typing" which then redirects to the main app with that prompt.
  const handleStart = () => {
    router.push('/ai-ui-generator');
  };

  return (
    <div className="min-h-screen bg-black text-foreground font-sans selection:bg-primary/20 overflow-x-hidden">

      {/* 
        Hero Section 
        - We act as if 'hasStarted' is false to show the Hero.
        - We pass handlers that redirect to the main app to preserve the flow.
      */}
      <div className="relative min-h-[90vh]">
        <Hero
          hasStarted={false} // Always show hero on landing
          input=""
          setInput={() => { }} // No-op, real input happens in app or we could forward it
          handleSend={handleStart} // Clicking send goes to app
          selectedImage={null}
          setSelectedImage={() => { }}
          fileInputRef={{ current: null }}
          handleFileSelect={() => { }}
          onOpenDiscover={() => {
            const element = document.getElementById('community-section');
            element?.scrollIntoView({ behavior: 'smooth' });
          }}
        />
      </div>

      {/* Community Section */}
      <div id="community-section">
        <CommunityShowcase />
      </div>

      {/* Footer */}
      <footer className="py-12 border-t border-white/5 bg-black text-center text-muted-foreground text-sm">
        <div className="flex justify-center gap-8 mb-4">
          <a href="#" className="hover:text-primary transition-colors">Privacy</a>
          <a href="#" className="hover:text-primary transition-colors">Terms</a>
          <a href="#" className="hover:text-primary transition-colors">Twitter</a>
          <a href="#" className="hover:text-primary transition-colors">GitHub</a>
        </div>
        <p>&copy; {new Date().getFullYear()} REVision AI. All rights reserved.</p>
      </footer>

    </div>
  );
}
