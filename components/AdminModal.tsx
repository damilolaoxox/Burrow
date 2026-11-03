'use client';

import React, { useState } from 'react';
import { sounds } from '@/lib/audio';
import { BURROW_CONFIG } from '@/lib/config';
import { X, Shield, Download, FileText, CheckCircle, Search, Key } from 'lucide-react';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AdminModal({ isOpen, onClose }: AdminModalProps) {
  const [adminKey, setAdminKey] = useState(BURROW_CONFIG.admin.defaultSecret);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [entries, setEntries] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleVerifyKey = async (e: React.FormEvent) => {
    e.preventDefault();
    sounds.playClick();
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch(`/api/admin/export?key=${encodeURIComponent(adminKey)}&format=json`);
      if (!res.ok) {
        throw new Error('Invalid Admin Secret Key');
      }
      const data = await res.json();
      setEntries(data.entries || []);
      setIsAuthenticated(true);
      sounds.playVictory();
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication failed');
      sounds.playError();
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadCsv = () => {
    sounds.playCoin();
    window.location.href = `/api/admin/export?key=${encodeURIComponent(adminKey)}&format=csv`;
  };

  const filteredEntries = entries.filter((e) => {
    const q = searchQuery.toLowerCase();
    return (
      e.x_handle.toLowerCase().includes(q) ||
      e.wallet.toLowerCase().includes(q) ||
      (e.ref_code && e.ref_code.toLowerCase().includes(q))
    );
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
      <div className="relative w-full max-w-3xl bg-burrow-card border-4 border-burrow-gold shadow-pixel-lg p-6 max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={() => {
            sounds.playClick();
            onClose();
          }}
          className="absolute top-4 right-4 p-1.5 text-burrow-muted hover:text-white border-2 border-burrow-border hover:border-burrow-gold bg-burrow-surface"
        >
          <X size={18} />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-burrow-border">
          <div className="p-2 bg-amber-500/20 border-2 border-burrow-gold text-burrow-gold">
            <Shield size={22} />
          </div>
          <div>
            <h3 className="font-pixel text-lg text-burrow-cream">
              BURROW ADMIN CONSOLE
            </h3>
            <p className="font-silkscreen text-xs text-burrow-muted">
              View and export everyone on the waitlist.
            </p>
          </div>
        </div>

        {!isAuthenticated ? (
          /* Authentication Screen */
          <form onSubmit={handleVerifyKey} className="space-y-4 max-w-md mx-auto py-6">
            <div>
              <label className="block text-xs font-pixel text-burrow-cream mb-2">
                ENTER ADMIN SECRET KEY:
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={adminKey}
                  onChange={(e) => setAdminKey(e.target.value)}
                  className="w-full bg-burrow-darkest border-2 border-burrow-border px-3 py-2.5 text-xs font-mono text-amber-300 focus:border-burrow-gold focus:outline-none"
                  placeholder="Secret key..."
                />
              </div>
              <p className="text-[10px] font-silkscreen text-burrow-muted mt-2">
                Default dev secret: <code className="text-burrow-gold font-mono">{BURROW_CONFIG.admin.defaultSecret}</code>
              </p>
            </div>

            {errorMsg && (
              <p className="text-xs font-silkscreen text-red-400 bg-red-950/60 p-2 border border-red-500">
                {errorMsg}
              </p>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-burrow-gold hover:bg-yellow-400 text-black font-pixel text-xs border-2 border-amber-200 shadow-pixel flex items-center justify-center gap-2 font-bold"
            >
              <Key size={15} />
              <span>{isLoading ? 'VERIFYING...' : 'AUTHENTICATE & ACCESS'}</span>
            </button>
          </form>
        ) : (
          /* Authenticated Dashboard */
          <div className="space-y-6">
            {/* Quick Stats & Controls */}
            <div className="grid grid-cols-1 gap-3">
              <div className="p-3 bg-burrow-surface border-2 border-burrow-border">
                <p className="text-[10px] font-pixel text-burrow-muted">TOTAL SIGNUPS</p>
                <p className="font-pixel text-lg text-emerald-400 mt-1">
                  {entries.length} Miners
                </p>
              </div>

            </div>

            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="relative w-full sm:w-64">
                <Search size={14} className="absolute left-3 top-2.5 text-burrow-muted" />
                <input
                  type="text"
                  placeholder="Filter handle or wallet..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-burrow-darkest border-2 border-burrow-border pl-8 pr-3 py-1.5 text-xs font-mono text-burrow-cream focus:border-burrow-gold focus:outline-none"
                />
              </div>

              <button
                onClick={handleDownloadCsv}
                className="w-full sm:w-auto px-5 py-2.5 bg-burrow-gold hover:bg-yellow-400 text-black font-pixel text-xs border-2 border-amber-200 shadow-pixel flex items-center justify-center gap-2 font-bold"
              >
                <Download size={15} />
                <span>DOWNLOAD WAITLIST CSV</span>
              </button>
            </div>

            {/* Data Table Preview */}
            <div className="border-2 border-burrow-border bg-burrow-darkest max-h-72 overflow-y-auto">
              <table className="w-full text-left text-xs font-silkscreen border-collapse">
                <thead className="sticky top-0 bg-burrow-surface border-b-2 border-burrow-border text-[10px] font-pixel text-burrow-muted">
                  <tr>
                    <th className="p-2">RANK</th>
                    <th className="p-2">X HANDLE</th>
                    <th className="p-2">WALLET</th>
                    <th className="p-2 text-right">POINTS</th>
                    <th className="p-2 text-center">RECRUITS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-burrow-border/40">
                  {filteredEntries.slice(0, 100).map((entry, idx) => {
                    return (
                      <tr key={entry.id || idx} className="hover:bg-burrow-card/50">
                        <td className="p-2 font-pixel text-[11px] text-burrow-gold">
                          #{entry.rank || idx + 1}
                        </td>
                        <td className="p-2 text-burrow-cream">
                          @{entry.x_handle}
                        </td>
                        <td className="p-2 font-mono text-[10px] text-burrow-muted">
                          {entry.wallet}
                        </td>
                        <td className="p-2 text-right font-pixel text-[11px] text-burrow-cream">
                          {entry.points}
                        </td>
                        <td className="p-2 text-center text-emerald-400 font-pixel">
                          {entry.referrals}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <p className="text-[10px] font-silkscreen text-burrow-muted">
              The CSV includes each person's reply link so you can spot-check their tasks.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
