'use client';
import React, { useState } from 'react';

// --- RECIPE 1: The Danger Button (Now accepts an onClick action!) ---
const DangerButton = (props: { label: string; onClick?: () => void }) => {
  return (
    <button 
      onClick={props.onClick} // ⬅️ WIRED UP: Connects the click to the function passed down
      className="bg-red-900/20 border border-red-500/50 text-red-500 px-4 py-2 rounded-md hover:bg-red-500 hover:text-white transition-all text-sm font-medium"
    >
      {props.label}
    </button>
  );
};

// --- RECIPE 2: The Counter Button (Now 'dumb', just displays what it's told) ---
const CounterButton = (props: { count: number; onIncrement: () => void }) => {
  return (
    <div className="w-full space-y-2">
      <button
        onClick={props.onIncrement} // ⬅️ WIRED UP: Tells the parent "I was clicked"
        className="bg-blue-600 text-white px-4 py-3 rounded-md w-full hover:bg-blue-500 active:scale-95 transition-all font-bold shadow-lg shadow-blue-500/20 flex justify-between items-center"
      >
        <span>Tap to Count</span>
        <span className="bg-blue-800 px-2 py-1 rounded text-xs">
          {props.count}
        </span>
      </button>

      {/* The Warning Logic */}
      {props.count > 5 && (
        <div className="bg-amber-500/10 border border-amber-500 text-amber-500 text-xs p-2 rounded text-center animate-pulse">
          ⚠️ Warning: High Traffic!
        </div>
      )}
    </div>
  );
};

// --- MAIN PAGE: The Brain (Holds all the State) ---
export default function Playground() {
  // 1. STATE: The Counter Memory (Moved up here!)
  const [count, setCount] = useState(0);

  // 2. STATE: The Visibility Memory (For the Delete button)
  const [showCard, setShowCard] = useState(true);

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-10 font-sans">
      
      <h1 className="text-4xl font-bold text-white mb-8 tracking-tighter">
        Susovon's Control Panel
      </h1>

      {/* CONDITIONAL RENDERING: Only show if showCard is true */}
      {showCard ? (
        <div className="bg-neutral-900 border border-neutral-800 p-8 rounded-2xl shadow-2xl flex flex-col gap-8 w-full max-w-md">
          
          {/* Section A: Danger Zone */}
          <div className="space-y-3">
            <p className="text-neutral-500 text-xs font-bold uppercase tracking-widest">Danger Zone</p>
            <div className="flex gap-3">
              {/* DELETE LOGIC: Hides the card */}
              <DangerButton 
                label="Delete Panel" 
                onClick={() => setShowCard(false)} 
              />
              
              {/* RESET LOGIC: Sets count to 0 */}
              <DangerButton 
                label="Reset Counter" 
                onClick={() => setCount(0)} 
              />
            </div>
          </div>

          {/* Section B: Activity */}
          <div className="space-y-3">
             <p className="text-neutral-500 text-xs font-bold uppercase tracking-widest">Activity</p>
             
             {/* Pass the State and the Function down to the child */}
             <CounterButton 
                count={count} 
                onIncrement={() => setCount(count + 1)} 
             />
          </div>

        </div>
      ) : (
        // What to show if card is deleted
        <button 
          onClick={() => setShowCard(true)}
          className="text-neutral-500 hover:text-white transition-colors"
        >
          🔄 Restore Panel
        </button>
      )}

    </div>
  );
}