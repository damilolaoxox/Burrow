'use client';

import React, { useState, useEffect } from 'react';
import { sounds } from '@/lib/audio';
import { BURROW_CONFIG } from '@/lib/config';
import { PixelPickaxe } from './PixelMinerArt';
import { Volume2, VolumeX, Radio, Shield, Twitter, Sparkles } from 'lucide-react';

interface PixelHeaderProps {
  onOpenAdmin: () => void;
}

export function PixelHeader({ onOpenAdmin }: PixelHeaderProps) {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [ambientPlaying, setAmbientPlaying] = useState(false);

  useEffect(() => {
    sounds.initFromStorage();
    setSoundEnabled(sounds.enabled);
  }, []);

  const handleToggleSound = () => {
    const newState = sounds.toggleMute();
    setSoundEnabled(newState);
    if (newState) {
      sounds.playClick();
    }
  };

  const handleToggleAmbient = () => {
    const isPlaying = sounds.toggleCaveAtmosphere();
    setAmbientPlaying(isPlaying);
    sounds.playCoin();
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-burrow-dark/90 backdrop-blur-md border-b-4 border-burrow-border px-4 py-3">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
        {/* Brand / Logo */}
        <div className="flex items-center gap-3">
          <div className="bg-burrow-surface border-2 border-burrow-gold p-1.5 shadow-pixel-sm transform hover:scale-105 transition-transform cursor-pointer">
            <PixelPickaxe size={24} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-pixel text-lg md:text-xl font-bold tracking-wider text-burrow-gold drop-shadow-[2px_2px_0px_#000]">
                BURROW
              </span>
              <span className="hidden sm:inline-block text-[10px] font-pixel bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5">
                2,500 MINERS
              </span>
            </div>
            <p className="text-[10px] font-silkscreen text-burrow-muted hidden md:block">
              Free Mint on Robinhood Chain
            </p>
          </div>
        </div>

        {/* Center / Chain badge */}
        <div className="hidden lg:flex items-center gap-2 bg-burrow-darkest/80 border-2 border-burrow-border px-3 py-1.5 shadow-pixel-sm">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-[11px] font-pixel text-emerald-400">
            Robinhood Chain
          </span>
          <span className="text-[9px] font-mono text-burrow-muted bg-burrow-card px-1.5 py-0.5 border border-burrow-border">
            ID: 4663
          </span>
        </div>

        {/* Right Controls: Audio + Social + Admin */}
        <div className="flex items-center gap-2 md:gap-3">
          {/* 8-bit Ambient Cave Drip */}
          <button
            onClick={handleToggleAmbient}
            title={ambientPlaying ? "Mute cave echoes" : "Play cave ambience"}
            className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 border-2 text-[10px] font-pixel shadow-pixel-sm transition-transform active:translate-y-0.5 ${
              ambientPlaying
                ? 'bg-amber-600/30 border-burrow-gold text-burrow-gold'
                : 'bg-burrow-surface border-burrow-border text-burrow-muted hover:border-burrow-gold/50'
            }`}
          >
            <Radio size={14} className={ambientPlaying ? 'animate-pulse text-burrow-gold' : ''} />
            <span>CAVE FX</span>
          </button>

          {/* Sound FX Toggle Button */}
          <button
            onClick={handleToggleSound}
            title={soundEnabled ? "Mute retro sounds" : "Enable 8-bit sounds"}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 border-2 text-[10px] font-pixel shadow-pixel-sm transition-transform active:translate-y-0.5 ${
              soundEnabled
                ? 'bg-burrow-gold text-black border-amber-300 font-bold hover:bg-yellow-400'
                : 'bg-burrow-surface text-burrow-muted border-burrow-border hover:text-white'
            }`}
          >
            {soundEnabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
            <span className="hidden xs:inline">{soundEnabled ? '8-BIT ON' : 'MUTED'}</span>
          </button>

          {/* Official X link */}
          <a
            href={BURROW_CONFIG.xProfileUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => sounds.playClick()}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-black/60 border-2 border-sky-500/50 hover:border-sky-400 text-sky-400 text-[10px] font-pixel shadow-pixel-sm transition-all"
            title="Follow Burrow on X"
          >
            <Twitter size={14} />
            <span className="hidden sm:inline">{BURROW_CONFIG.handle}</span>
          </a>

          {/* Admin Allowlist Access */}
          <button
            onClick={() => {
              sounds.playClick();
              onOpenAdmin();
            }}
            title="Admin Allowlist Export"
            className="p-1.5 bg-burrow-surface hover:bg-burrow-card border-2 border-burrow-border hover:border-burrow-gold text-burrow-cream shadow-pixel-sm transition-all"
          >
            <Shield size={16} />
          </button>
        </div>
      </div>
    </header>
  );
}
