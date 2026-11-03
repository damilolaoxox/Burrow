'use client';

import React, { useState, useEffect } from 'react';
import { PixelHeader } from '@/components/PixelHeader';
import { HeroBanner } from '@/components/HeroBanner';
import { JoinSection } from '@/components/JoinSection';
import { FaqSection } from '@/components/FaqSection';
import { PixelFooter } from '@/components/PixelFooter';
import { AdminModal } from '@/components/AdminModal';
import { BURROW_CONFIG } from '@/lib/config';

export default function HomePage() {
  const [totalSignups, setTotalSignups] = useState(1284);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [referralCookie, setReferralCookie] = useState<string | null>(null);

  // Fetch initial stats
  useEffect(() => {
    // Check referral cookie from document.cookie
    if (typeof document !== 'undefined') {
      const match = document.cookie.match(new RegExp('(^| )' + BURROW_CONFIG.referral.cookieName + '=([^;]+)'));
      if (match) {
        setReferralCookie(match[2]);
      }
    }

    const loadStats = async () => {
      try {
        const res = await fetch('/api/stats');
        const data = await res.json();
        if (data.totalSignups) {
          setTotalSignups(data.totalSignups);
        }
      } catch (err) {
        console.error('Failed to load initial stats:', err);
      }
    };

    loadStats();
  }, []);

  const scrollToJoin = () => {
    const el = document.getElementById('join-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleJoinSuccess = (entry: any, position: number) => {
    setTotalSignups((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen flex flex-col scanlines">
      {/* Navigation Header */}
      <PixelHeader onOpenAdmin={() => setIsAdminOpen(true)} />

      {/* Hero Banner with Live Urgency Counter & Pixel Miner Art */}
      <HeroBanner
        totalSignups={totalSignups}
        onScrollToJoin={scrollToJoin}
      />

      {/* Step-by-Step Join Section / Miner Allowlist Pass */}
      <JoinSection
        onJoinSuccess={handleJoinSuccess}
        referralCodeFromCookie={referralCookie}
      />

      {/* FAQ Intel */}
      <FaqSection />

      {/* Footer & Disclaimer */}
      <PixelFooter />

      {/* Admin Allowlist Modal */}
      <AdminModal
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
      />
    </div>
  );
}
