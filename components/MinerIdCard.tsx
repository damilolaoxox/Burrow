'use client';

import React, { useRef, useState } from 'react';
import { sounds } from '@/lib/audio';
import { BURROW_CONFIG } from '@/lib/config';
import { PixelPickaxe, PixelCoin, PixelMiner } from './PixelMinerArt';
import { Twitter, Camera, Clock } from 'lucide-react';

interface MinerIdCardProps {
  handle: string;
  avatarUrl?: string;
  wallet: string;
  rank: number;
  points: number;
  referrals: number;
  refCode: string;
}

export function MinerIdCard({
  handle,
  avatarUrl,
  wallet,
  rank,
  points,
  referrals,
  refCode,
}: MinerIdCardProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const cardRef = useRef<HTMLDivElement | null>(null);

  const cleanHandle = handle.replace(/^@/, '');
  const maskedWallet = wallet ? `${wallet.slice(0, 6)}...${wallet.slice(-4)}` : '0x000...000';
  const referralUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/r/${refCode}`
    : `https://burrow.xyz/r/${refCode}`;

  const fallbackAvatar = `https://api.dicebear.com/7.x/bottts/svg?seed=${cleanHandle}`;
  const [imgSrc, setImgSrc] = useState(avatarUrl || fallbackAvatar);

  // Generate downloadable high-resolution PNG using HTML5 Canvas
  const handleDownloadPng = async () => {
    sounds.playCoin();
    setIsGenerating(true);

    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // 1200x675 (ideal 16:9 Twitter & social card size)
      canvas.width = 1200;
      canvas.height = 675;

      // 1. Dark Underground Cave Background
      const bgGrad = ctx.createLinearGradient(0, 0, 1200, 675);
      bgGrad.addColorStop(0, '#10081c');
      bgGrad.addColorStop(0.5, '#190e2a');
      bgGrad.addColorStop(1, '#0c0615');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, 1200, 675);

      // Cave grid pattern
      ctx.strokeStyle = 'rgba(251, 191, 36, 0.05)';
      ctx.lineWidth = 1;
      for (let x = 0; x < 1200; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, 675);
        ctx.stroke();
      }
      for (let y = 0; y < 675; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(1200, y);
        ctx.stroke();
      }

      // Outer Gold Pixel Border
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 8;
      ctx.strokeRect(20, 20, 1160, 635);

      // Inner Border
      ctx.strokeStyle = '#3d275e';
      ctx.lineWidth = 3;
      ctx.strokeRect(32, 32, 1136, 611);

      // Top Banner Header
      ctx.fillStyle = '#26193b';
      ctx.fillRect(36, 36, 1128, 85);

      // Header Text
      ctx.fillStyle = '#fbbf24';
      ctx.font = 'bold 28px monospace';
      ctx.fillText('⛏️ BURROW MINING PERMIT // 2,500 WORKERS', 60, 90);

      // Network Pill
      ctx.fillStyle = '#052e16';
      ctx.fillRect(860, 52, 280, 48);
      ctx.strokeStyle = '#22c55e';
      ctx.lineWidth = 2;
      ctx.strokeRect(860, 52, 280, 48);
      ctx.fillStyle = '#4ade80';
      ctx.font = 'bold 18px monospace';
      ctx.fillText('● ROBINHOOD CHAIN (4663)', 875, 83);

      // Left: Avatar Photo Frame
      const avatarX = 70;
      const avatarY = 160;
      const avatarSize = 220;

      // Photo frame backing
      ctx.fillStyle = '#0c0714';
      ctx.fillRect(avatarX, avatarY, avatarSize, avatarSize);
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 6;
      ctx.strokeRect(avatarX, avatarY, avatarSize, avatarSize);

      // Draw Avatar Image or Fallback
      if (imgSrc) {
        try {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.src = imgSrc;
          await new Promise((resolve) => {
            img.onload = resolve;
            img.onerror = resolve; // Continue if CORS blocked
          });
          if (img.complete && img.naturalWidth !== 0) {
            ctx.drawImage(img, avatarX + 8, avatarY + 8, avatarSize - 16, avatarSize - 16);
          } else {
            drawFallbackAvatar(ctx, avatarX + 8, avatarY + 8, avatarSize - 16);
          }
        } catch (e) {
          drawFallbackAvatar(ctx, avatarX + 8, avatarY + 8, avatarSize - 16);
        }
      } else {
        drawFallbackAvatar(ctx, avatarX + 8, avatarY + 8, avatarSize - 16);
      }

      // Rank Pill under photo
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(avatarX, avatarY + avatarSize + 15, avatarSize, 50);
      ctx.fillStyle = '#000000';
      ctx.font = 'bold 22px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`MINER #${rank}`, avatarX + avatarSize / 2, avatarY + avatarSize + 48);
      ctx.textAlign = 'left';

      // Status Pill
      ctx.fillStyle = '#451a03';
      ctx.fillRect(avatarX, avatarY + avatarSize + 75, avatarSize, 40);
      ctx.fillStyle = '#fcd34d';
      ctx.font = 'bold 16px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('◷ STATUS: PENDING', avatarX + avatarSize / 2, avatarY + avatarSize + 101);
      ctx.textAlign = 'left';

      // Right: Worker Credentials Table
      const credX = 340;
      let credY = 185;

      const drawField = (label: string, value: string, color: string = '#fef3c7', isBig: boolean = false) => {
        ctx.fillStyle = '#94a3b8';
        ctx.font = '16px monospace';
        ctx.fillText(label, credX, credY);

        ctx.fillStyle = color;
        ctx.font = isBig ? 'bold 32px monospace' : 'bold 24px monospace';
        ctx.fillText(value, credX, credY + (isBig ? 36 : 28));

        credY += isBig ? 75 : 62;
      };

      drawField('OPERATOR HANDLE', `@${cleanHandle}`, '#fbbf24', true);
      drawField('ROBINHOOD CHAIN WALLET', maskedWallet, '#38bdf8');
      drawField('MINER SCORE', `${points} POINTS`, '#4ade80');
      drawField('RECRUITS IN MINES', `${referrals} MINERS INVITED`, '#fde047');

      // Bottom Barcode & Seal Bar
      ctx.fillStyle = '#1e1329';
      ctx.fillRect(36, 560, 1128, 80);
      ctx.strokeStyle = '#3d275e';
      ctx.lineWidth = 2;
      ctx.strokeRect(36, 560, 1128, 80);

      // Simulated Pixel Barcode
      ctx.fillStyle = '#ffffff';
      const barcodeX = 60;
      const barY = 575;
      const bars = [4, 2, 8, 3, 6, 2, 10, 4, 3, 6, 2, 8, 4, 2, 10, 3, 6, 4, 8, 2, 6, 4, 2, 8];
      let currentBx = barcodeX;
      bars.forEach((width, i) => {
        if (i % 2 === 0) {
          ctx.fillRect(currentBx, barY, width, 45);
        }
        currentBx += width + 2;
      });

      // Barcode subtext
      ctx.fillStyle = '#94a3b8';
      ctx.font = '12px monospace';
      ctx.fillText(`ID-${refCode.toUpperCase()}`, barcodeX, 632);

      // Center: Watermark / Referral Link
      ctx.fillStyle = '#fbbf24';
      ctx.font = 'bold 20px monospace';
      ctx.fillText(`DIG WITH ME: ${referralUrl.replace(/^https?:\/\//, '')}`, 360, 608);

      // Right Seal
      ctx.fillStyle = '#fbbf24';
      ctx.font = 'bold 15px monospace';
      ctx.fillText('2,500 WORKERS • ONE MINE', 900, 608);

      // PENDING rubber stamp across the card
      ctx.save();
      ctx.translate(800, 330);
      ctx.rotate((-14 * Math.PI) / 180);
      ctx.globalAlpha = 0.85;
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 10;
      ctx.strokeRect(-230, -70, 460, 140);
      ctx.lineWidth = 4;
      ctx.strokeRect(-214, -54, 428, 108);
      ctx.fillStyle = '#ef4444';
      ctx.font = 'bold 92px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('PENDING', 0, 6);
      ctx.restore();
      ctx.textAlign = 'left';
      ctx.textBaseline = 'alphabetic';

      // Convert to downloadable file
      const dataUrl = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.href = dataUrl;
      downloadLink.download = `burrow-miner-card-${cleanHandle}.png`;
      downloadLink.click();
    } catch (err) {
      console.error('Failed to generate PNG card:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  // Helper for drawing a retro miner avatar inside canvas if image fails
  const drawFallbackAvatar = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number) => {
    ctx.fillStyle = '#1c122b';
    ctx.fillRect(x, y, size, size);
    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 64px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('⛏️', x + size / 2, y + size / 2 + 20);
    ctx.textAlign = 'left';
  };

  const handleShareTweet = () => {
    sounds.playClick();
    const tweetText = `Just submitted my Miner Card for ${BURROW_CONFIG.handle}. Status: PENDING ⛏️ 2,500 pixel workers on Robinhood Chain. I'm Miner #${rank}. Dig with me: ${referralUrl}`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`, '_blank');
  };

  return (
    <div className="w-full">
      {/* Visual Miner ID Card Container */}
      <div
        ref={cardRef}
        className="relative bg-gradient-to-br from-[#1c122b] via-[#140c1f] to-[#0c0714] border-4 border-burrow-gold shadow-pixel-lg p-5 sm:p-7 overflow-hidden select-none transition-transform hover:scale-[1.01]"
      >
        {/* Lanyard Hole at the top */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-16 h-3 bg-burrow-darkest border-2 border-burrow-border rounded-full flex items-center justify-center">
          <div className="w-8 h-1 bg-burrow-card rounded-full"></div>
        </div>

        {/* Top Header */}
        <div className="flex items-center justify-between border-b-2 border-burrow-border pb-3 pt-2 mb-5">
          <div className="flex items-center gap-2">
            <PixelPickaxe size={20} />
            <span className="font-pixel text-xs sm:text-sm text-burrow-gold tracking-wide">
              BURROW MINING PERMIT
            </span>
          </div>
          <span className="bg-emerald-950/80 border border-emerald-500 text-emerald-400 font-pixel text-[9px] sm:text-[10px] px-2 py-0.5">
            ROBINHOOD CHAIN 4663
          </span>
        </div>

        {/* Main Body */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 sm:gap-6">
          {/* Avatar & Photo Frame */}
          <div className="flex flex-col items-center shrink-0">
            <div className="relative p-1.5 bg-burrow-darkest border-3 border-burrow-gold shadow-pixel-sm">
              <img
                src={imgSrc}
                onError={() => imgSrc !== fallbackAvatar && setImgSrc(fallbackAvatar)}
                alt={cleanHandle}
                className="w-24 h-24 sm:w-28 sm:h-28 object-cover bg-burrow-surface border border-burrow-border"
              />
              <div className="absolute top-0 right-0 bg-amber-400 text-black p-0.5 border border-black">
                <Clock size={14} />
              </div>
            </div>

            <div className="mt-2 text-center w-full">
              <span className="inline-block bg-burrow-gold text-black font-pixel text-xs px-2.5 py-1 font-bold shadow-pixel-sm w-full">
                MINER #{rank}
              </span>
              <span className="block mt-1 text-[9px] font-pixel px-1.5 py-0.5 border bg-amber-950/80 border-amber-500 text-amber-300">
                ◷ PENDING REVIEW
              </span>
            </div>
          </div>

          {/* Details Column */}
          <div className="flex-1 w-full space-y-3 text-left">
            <div>
              <p className="text-[10px] font-silkscreen text-burrow-muted">MINER HANDLE</p>
              <h3 className="font-pixel text-base sm:text-lg text-burrow-cream flex items-center gap-1.5">
                <span>@{cleanHandle}</span>
              </h3>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-burrow-darkest/70 p-2 border border-burrow-border">
                <p className="text-[9px] font-pixel text-burrow-muted">TOTAL POINTS</p>
                <p className="font-pixel text-sm text-burrow-gold mt-0.5">
                  {points} <span className="text-[9px]">PTS</span>
                </p>
              </div>

              <div className="bg-burrow-darkest/70 p-2 border border-burrow-border">
                <p className="text-[9px] font-pixel text-burrow-muted">CREW RECRUITS</p>
                <p className="font-pixel text-sm text-emerald-400 mt-0.5">
                  {referrals} <span className="text-[9px]">MINERS</span>
                </p>
              </div>
            </div>

            <div className="bg-burrow-darkest/70 p-2 border border-burrow-border">
              <p className="text-[9px] font-pixel text-burrow-muted">REGISTERED EVM WALLET</p>
              <p className="font-mono text-xs text-sky-300 truncate">
                {wallet}
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Barcode Strip */}
        <div className="mt-5 pt-3 border-t-2 border-burrow-border flex items-center justify-between text-[10px] font-silkscreen text-burrow-muted">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[9px] tracking-widest text-burrow-cream select-all">
              ||| |||| | ||||| | ||
            </span>
            <span className="text-[9px] font-pixel text-burrow-gold">
              PASS #{refCode.toUpperCase()}
            </span>
          </div>
          <span className="font-pixel text-[9px] text-amber-300 hidden sm:inline">
            2,500 WORKERS • ONE MINE
          </span>
        </div>

        {/* PENDING rubber stamp */}
        <div
          className="cine-stamp pointer-events-none absolute top-1/2 left-1/2 z-10 border-[5px] border-red-500/85 px-4 py-1.5 sm:px-6 sm:py-2"
          style={{ transform: 'translate(-50%, -50%) rotate(-14deg)', boxShadow: 'inset 0 0 0 3px rgba(0,0,0,0.25)' }}
          aria-label="Status: pending"
        >
          <div className="border-2 border-red-500/85 px-3 py-1 sm:px-5">
            <span className="font-pixel text-2xl sm:text-4xl text-red-500/90 tracking-widest drop-shadow-[2px_2px_0_rgba(0,0,0,0.6)]">
              PENDING
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons: Download PNG & Share on X */}
      <div className="flex flex-col sm:flex-row gap-3 mt-4">
        <button
          onClick={handleDownloadPng}
          disabled={isGenerating}
          className="flex-1 py-3 px-4 bg-burrow-gold hover:bg-yellow-400 text-black font-pixel text-xs border-2 border-amber-200 shadow-pixel flex items-center justify-center gap-2 font-bold transition-transform active:translate-y-0.5"
        >
          <Camera size={16} />
          <span>{isGenerating ? 'GENERATING PNG...' : 'DOWNLOAD MINER CARD (PNG)'}</span>
        </button>

        <button
          onClick={handleShareTweet}
          className="flex-1 py-3 px-4 bg-sky-500 hover:bg-sky-400 text-black font-pixel text-xs border-2 border-sky-300 shadow-pixel flex items-center justify-center gap-2 font-bold transition-transform active:translate-y-0.5"
        >
          <Twitter size={16} />
          <span>SHARE CARD ON X</span>
        </button>
      </div>
    </div>
  );
}
