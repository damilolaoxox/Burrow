'use client';

import React, { useState, useEffect } from 'react';
import { PixelHeader } from '@/components/PixelHeader';
import { HeroBanner } from '@/components/HeroBanner';
import { JoinSection } from '@/components/JoinSection';
import { PixelFooter } from '@/components/PixelFooter';
import { AdminModal } from '@/components/AdminModal';
import { BURROW_CONFIG } from '@/lib/config';

export default function HomePage() {
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [referralCookie, setReferralCookie] = useState<string | null>(null);

  useEffect(() => {
    // Check referral cookie from document.cookie
    if (typeof document !== 'undefined') {
      const match = document.cookie.match(new RegExp('(^| )' + BURROW_CONFIG.referral.cookieName + '=([^;]+)'));
      if (match) {
        setReferralCookie(match[2]);
      }
    }

    // Fade sections in as they scroll into view
    const els = Array.from(document.querySelectorAll('.cine-reveal'));
    if (!('IntersectionObserver' in window)) return;
    document.documentElement.classList.add('js-reveal');
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('is-visible');
            io.unobserve(e.target);
          }
        }),
      { threshold: 0.12 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  const scrollToJoin = () => {
    const el = document.getElementById('join-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleJoinSuccess = (_entry: any, _position: number) => {};

  return (
    <div className="min-h-screen flex flex-col scanlines">
      {/* Cinematic overlays: film grain + vignette */}
      <div className="cine-grain" aria-hidden />
      <div className="cine-vignette" aria-hidden />

      {/* Navigation Header */}
      <PixelHeader onOpenAdmin={() => setIsAdminOpen(true)} />

      {/* Hero Banner */}
      <HeroBanner onScrollToJoin={scrollToJoin} />

      {/* Step-by-Step Join Section / Miner Card */}
      <div className="cine-reveal">
      <JoinSection
        onJoinSuccess={handleJoinSuccess}
        referralCodeFromCookie={referralCookie}
      />
      </div>

      {/* Footer & Disclaimer */}
      <PixelFooter />

      {/* Admin Modal */}
      <AdminModal
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
      />
    </div>
  );
}
