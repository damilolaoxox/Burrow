'use client';

import React, { useState } from 'react';
import { PixelMiner, PixelBuggy } from './PixelMinerArt';
import { sounds } from '@/lib/audio';
import { BURROW_CONFIG } from '@/lib/config';
import { Flame, Pickaxe, ChevronDown } from 'lucide-react';

interface HeroBannerProps {
  onScrollToJoin: () => void;
}

// Fixed positions so the dust looks the same on server and client
const DUST = Array.from({ length: 28 }, (_, i) => ({
  left: (i * 37) % 100,
  delay: (i * 1.7) % 14,
  duration: 12 + ((i * 5) % 10),
  size: 2 + (i % 3),
}));

export function HeroBanner({ onScrollToJoin }: HeroBannerProps) {
  const [clinkCount, setClinkCount] = useState(0);

  const handlePickaxeClick = () => {
    sounds.playPickaxe();
    setClinkCount((prev) => prev + 1);
    if ((clinkCount + 1) % 5 === 0) {
      sounds.playCoin();
    }
  };

  return (
    <section className="cine-hero relative overflow-hidden min-h-[92vh] flex items-center px-4 py-16 border-b-4 border-burrow-border">
      {/* Letterbox bars that open on load */}
      <div className="cine-letterbox cine-letterbox-top" aria-hidden />
      <div className="cine-letterbox cine-letterbox-bottom" aria-hidden />

      {/* Deep cave backdrop with a slow push-in */}
      <div className="absolute inset-0 cine-kenburns pointer-events-none" aria-hidden>
        <div className="absolute inset-0 bg-gradient-to-b from-[#05020a] via-burrow-darkest to-[#08030e]" />
        <div className="absolute inset-0 opacity-[0.12] bg-[radial-gradient(#fbbf24_1px,transparent_1px)] [background-size:28px_28px]" />
        {/* Flickering lantern light */}
        <div className="cine-lantern absolute top-[38%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[34rem] h-[34rem] max-w-[120vw] rounded-full bg-amber-500/20 blur-3xl" />
        {/* Light shaft from the surface */}
        <div className="cine-shaft absolute -top-10 left-1/2 -translate-x-1/2 w-[60%] h-[75%]" />
      </div>

      {/* Floating dust in the lamp light */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden>
        {DUST.map((d, i) => (
          <span
            key={i}
            className="cine-dust"
            style={{
              left: `${d.left}%`,
              width: d.size,
              height: d.size,
              animationDelay: `${d.delay}s`,
              animationDuration: `${d.duration}s`,
            }}
          />
        ))}
      </div>

      <div className="max-w-5xl mx-auto relative z-10 flex flex-col items-center text-center w-full">
        <h1
          className="cine-rise cine-title font-pixel text-3xl sm:text-5xl md:text-6xl text-burrow-cream tracking-tight leading-tight mb-5"
          style={{ animationDelay: '1.3s' }}
        >
          DIG THROUGH
          <br />
          THE MINES.
        </h1>

        <div
          className="cine-rise cine-shimmer font-pixel text-base sm:text-2xl md:text-3xl mb-6"
          style={{ animationDelay: '1.9s' }}
        >
          2,500 WORKERS. ONE MINE.
        </div>

        <p
          className="cine-rise max-w-2xl text-xs sm:text-sm md:text-base font-silkscreen text-burrow-muted mb-10 leading-relaxed"
          style={{ animationDelay: '2.3s' }}
        >
          {BURROW_CONFIG.description}
        </p>

        {/* Pixel Characters Scene */}
        <div
          className="cine-rise relative p-6 bg-burrow-surface/70 backdrop-blur-sm border-4 border-burrow-border shadow-pixel-lg max-w-xl w-full flex flex-col items-center justify-center"
          style={{ animationDelay: '2.7s' }}
        >
          <div className="absolute -top-3 left-6 right-6 flex justify-between text-burrow-border pointer-events-none select-none">
            <span>▼</span><span>▼▼</span><span>▼</span><span>▼▼▼</span><span>▼</span>
          </div>

          <div className="flex items-end justify-center gap-6 sm:gap-10 py-4">
            <div
              onClick={handlePickaxeClick}
              className="cursor-pointer group flex flex-col items-center transform transition-transform active:scale-95"
              title="Tap the miner to strike the wall"
            >
              <div className="relative">
                <PixelMiner size={110} className="filter drop-shadow-[0_8px_24px_rgba(251,191,36,0.45)] animate-float" />
                <span className="absolute -top-4 -right-2 bg-amber-400 text-black text-[9px] font-pixel px-1.5 py-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  MINE!
                </span>
              </div>
              <span className="text-[10px] font-pixel text-burrow-gold mt-2 flex items-center gap-1">
                <Pickaxe size={12} /> TAP TO MINE ({clinkCount})
              </span>
            </div>

            <div className="flex flex-col items-center cine-drive">
              <PixelBuggy size={140} className="filter drop-shadow-[0_8px_24px_rgba(239,68,68,0.4)]" />
              <span className="text-[10px] font-pixel text-red-400 mt-2">HILL CLIMB BUGGY</span>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t-2 border-burrow-border w-full">
            <button
              onClick={() => {
                sounds.playVictory();
                onScrollToJoin();
              }}
              className="cine-glow w-full px-6 py-3.5 bg-burrow-gold hover:bg-yellow-400 text-black font-pixel text-xs sm:text-sm border-2 border-amber-200 shadow-pixel transition-transform active:translate-y-1 active:shadow-pixel-sm flex items-center justify-center gap-2 font-bold"
            >
              <Flame size={16} className="text-orange-600" />
              JOIN THE WAITLIST
            </button>
          </div>
        </div>

        {/* Feature Pills */}
        <div className="cine-rise grid grid-cols-3 gap-3 max-w-2xl w-full mt-8" style={{ animationDelay: '3.1s' }}>
          <div className="p-3 bg-burrow-surface/50 border-2 border-burrow-border text-left">
            <p className="text-[9px] sm:text-[10px] font-pixel text-burrow-muted">COLLECTION</p>
            <p className="text-[10px] sm:text-sm font-pixel text-burrow-cream mt-1">2,500 WORKERS</p>
          </div>
          <div className="p-3 bg-burrow-surface/50 border-2 border-burrow-border text-left">
            <p className="text-[9px] sm:text-[10px] font-pixel text-burrow-muted">NETWORK</p>
            <p className="text-[10px] sm:text-sm font-pixel text-amber-300 mt-1">ROBINHOOD</p>
          </div>
          <div className="p-3 bg-burrow-surface/50 border-2 border-burrow-border text-left">
            <p className="text-[9px] sm:text-[10px] font-pixel text-burrow-muted">GAME</p>
            <p className="text-[10px] sm:text-sm font-pixel text-burrow-cream mt-1">HILL CLIMB</p>
          </div>
        </div>

        <div className="cine-rise mt-10" style={{ animationDelay: '3.5s' }}>
          <button
            onClick={onScrollToJoin}
            className="text-burrow-muted hover:text-burrow-gold animate-bounce"
            aria-label="Scroll to the waitlist"
          >
            <ChevronDown size={28} />
          </button>
        </div>
      </div>
    </section>
  );
}
