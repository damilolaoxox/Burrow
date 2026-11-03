'use client';

import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { sounds } from '@/lib/audio';
import { BURROW_CONFIG } from '@/lib/config';
import { PixelMiner, PixelCoin } from './PixelMinerArt';
import { MinerIdCard } from './MinerIdCard';
import {
  Twitter,
  Wallet,
  CheckCircle,
  Copy,
  Share2,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  UserCheck,
  Sparkles,
  ExternalLink,
  RefreshCw,
} from 'lucide-react';

interface WaitlistEntryState {
  id: string;
  x_id: string;
  x_handle: string;
  x_avatar?: string;
  wallet: string;
  ref_code: string;
  points: number;
  referrals: number;
  rank?: number;
}

type TaskKey = 'like' | 'repost' | 'reply' | 'follow';

const postId = BURROW_CONFIG.taskPostId;
const TASKS: { id: TaskKey; label: string; url: string }[] = [
  {
    id: 'like',
    label: 'LIKE THE BURROW POST',
    url: postId ? `https://x.com/intent/like?tweet_id=${postId}` : BURROW_CONFIG.xProfileUrl,
  },
  {
    id: 'repost',
    label: 'REPOST THE BURROW POST',
    url: postId ? `https://x.com/intent/retweet?tweet_id=${postId}` : BURROW_CONFIG.xProfileUrl,
  },
  {
    id: 'reply',
    label: 'REPLY TO THE BURROW POST',
    url: postId ? `https://x.com/intent/post?in_reply_to=${postId}` : BURROW_CONFIG.xProfileUrl,
  },
  {
    id: 'follow',
    label: `FOLLOW ${BURROW_CONFIG.handle.toUpperCase()}`,
    url: `https://x.com/intent/follow?screen_name=${BURROW_CONFIG.xUsername}`,
  },
];

interface JoinSectionProps {
  onJoinSuccess: (entry: WaitlistEntryState, position: number) => void;
  referralCodeFromCookie?: string | null;
}

export function JoinSection({ onJoinSuccess, referralCodeFromCookie }: JoinSectionProps) {
  // Joined state
  const [joinedUser, setJoinedUser] = useState<WaitlistEntryState | null>(null);
  const [userRank, setUserRank] = useState<number | null>(null);

  // Form Step States
  const [usernameInput, setUsernameInput] = useState('');
  const cleanUsername = usernameInput.trim().replace(/^@/, '');
  const isUsernameValid = /^[A-Za-z0-9_]{1,15}$/.test(cleanUsername);

  // Tasks: ticket = GO tapped (start time held by server), proof = confirmed
  const [taskTickets, setTaskTickets] = useState<Partial<Record<TaskKey, string>>>({});
  const [taskProofs, setTaskProofs] = useState<Partial<Record<TaskKey, string>>>({});
  const [taskBusy, setTaskBusy] = useState<TaskKey | null>(null);
  const [replyLink, setReplyLink] = useState('');
  const allTasksDone = TASKS.every((t) => taskProofs[t.id]);

  // Wallet
  const [walletAddress, setWalletAddress] = useState('');

  // Submission
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Load stored user from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('burrow_user_session');
      if (stored) {
        const parsed = JSON.parse(stored);
        setJoinedUser(parsed.entry);
        setUserRank(parsed.position || parsed.entry.rank || 1284);
      }
    } catch (e) {}
  }, []);

  // Changing the username resets tasks (they're tied to the username)
  const handleUsernameChange = (value: string) => {
    setUsernameInput(value);
    setTaskTickets({});
    setTaskProofs({});
    setReplyLink('');
  };

  const handleTaskGo = async (task: (typeof TASKS)[number]) => {
    if (!isUsernameValid) {
      setErrorMessage('Enter your X username first.');
      sounds.playError();
      return;
    }
    sounds.playClick();
    setErrorMessage(null);
    // Open X first so mobile browsers don't block the new tab
    window.open(task.url, '_blank', 'noopener,noreferrer');
    try {
      const res = await fetch('/api/tasks/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ task: task.id, handle: cleanUsername }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setTaskTickets((prev) => ({ ...prev, [task.id]: data.ticket }));
    } catch (err: any) {
      setErrorMessage(err.message || 'Could not start the task. Try again.');
    }
  };

  const handleTaskConfirm = async (taskId: TaskKey) => {
    const ticket = taskTickets[taskId];
    if (!ticket) return;
    setTaskBusy(taskId);
    setErrorMessage(null);
    try {
      const res = await fetch('/api/tasks/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticket, replyUrl: taskId === 'reply' ? replyLink : undefined }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.reason !== 'too_soon' && data.reason !== 'bad_link') {
          setTaskTickets((prev) => ({ ...prev, [taskId]: undefined }));
        }
        throw new Error(data.error);
      }
      setTaskProofs((prev) => ({ ...prev, [taskId]: data.proof }));
      sounds.playCoin();
    } catch (err: any) {
      setErrorMessage(err.message || 'Could not confirm. Try again.');
      sounds.playError();
    } finally {
      setTaskBusy(null);
    }
  };

  // Submit Join Request
  const handleCompleteJoin = async () => {
    if (!isUsernameValid) {
      setErrorMessage('Please enter your X username first.');
      sounds.playError();
      return;
    }

    if (!allTasksDone) {
      setErrorMessage('Please complete all the tasks first.');
      sounds.playError();
      return;
    }

    if (!walletAddress || !/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
      setErrorMessage('Please enter or connect a valid EVM wallet address (0x...).');
      sounds.playError();
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    sounds.playClick();

    try {
      // Post to /api/join
      const response = await fetch('/api/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          xHandle: cleanUsername,
          taskProofs,
          wallet: walletAddress,
          referredBy: referralCodeFromCookie,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to join waitlist');
      }

      // Success! Play fanfare & confetti
      sounds.playVictory();
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#fbbf24', '#f59e0b', '#f97316', '#ffffff'],
        });
      } catch (e) {}

      setJoinedUser(result.entry);
      setUserRank(result.position);

      localStorage.setItem(
        'burrow_user_session',
        JSON.stringify({ entry: result.entry, position: result.position })
      );

      onJoinSuccess(result.entry, result.position);
    } catch (err: any) {
      setErrorMessage(err.message || 'An error occurred while joining.');
      sounds.playError();
    } finally {
      setIsLoading(false);
    }
  };

  const getReferralUrl = () => {
    if (!joinedUser) return '';
    if (typeof window !== 'undefined') {
      return `${window.location.origin}/r/${joinedUser.ref_code}`;
    }
    return `https://burrow.xyz/r/${joinedUser.ref_code}`;
  };

  const handleCopyLink = () => {
    sounds.playCopy();
    navigator.clipboard.writeText(getReferralUrl());
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleShareOnX = () => {
    sounds.playClick();
    const refUrl = getReferralUrl();
    const tweetText = `I just joined the ${BURROW_CONFIG.handle} waitlist. 2,500 miners on Robinhood Chain. Dig with me: ${refUrl}`;
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`;
    window.open(twitterUrl, '_blank');
  };

  const handleLogout = () => {
    sounds.playClick();
    localStorage.removeItem('burrow_user_session');
    setJoinedUser(null);
    setUsernameInput('');
    setTaskTickets({});
    setTaskProofs({});
    setReplyLink('');
    setWalletAddress('');
    setUserRank(null);
  };

  // -------------------------------------------------------------
  // JOINED STATE / MINER PASS
  // -------------------------------------------------------------
  if (joinedUser) {
    return (
      <div id="join-section" className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        {/* Dynamic Generatable Miner Permit Card with PFP, Rank & Download */}
        <MinerIdCard
          handle={joinedUser.x_handle}
          avatarUrl={`/api/pfp?u=${joinedUser.x_handle}`}
          wallet={joinedUser.wallet}
          rank={userRank || 1}
          points={joinedUser.points}
          referrals={joinedUser.referrals}
          refCode={joinedUser.ref_code}
        />

        {/* Exclusive Referral Recruit Link Module */}
        <div className="bg-burrow-card border-4 border-burrow-border p-5 shadow-pixel-sm">
          <label className="block text-[11px] font-pixel text-burrow-cream mb-2">
            YOUR EXCLUSIVE RECRUIT LINK:
          </label>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              readOnly
              value={getReferralUrl()}
              className="flex-1 bg-burrow-darkest border-2 border-burrow-border px-3 py-2 text-xs font-mono text-amber-300 selection:bg-amber-600 focus:outline-none"
            />
            <button
              onClick={handleCopyLink}
              className="px-5 py-2.5 bg-burrow-gold hover:bg-yellow-400 text-black font-pixel text-xs border-2 border-amber-200 shadow-pixel transition-transform active:translate-y-0.5 flex items-center justify-center gap-1.5 font-bold"
            >
              <Copy size={14} />
              <span>{copiedLink ? 'COPIED!' : 'COPY LINK'}</span>
            </button>
          </div>

          <div className="flex items-center justify-between mt-4 pt-3 border-t border-burrow-border/80 text-xs font-silkscreen text-burrow-muted">
            <span>Invite friends: each recruit earns you <span className="text-emerald-400 font-pixel">+5 PTS</span></span>
            <button
              onClick={handleLogout}
              className="text-[10px] font-pixel text-burrow-muted hover:text-red-400 underline"
            >
              Disconnect
            </button>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // REGISTRATION STEPS (STEP 1: X -> STEP 2: WALLET -> STEP 3: JOIN)
  // -------------------------------------------------------------
  return (
    <div id="join-section" className="max-w-2xl mx-auto px-4 py-8">
      <div className="bg-burrow-surface border-4 border-burrow-border shadow-pixel-lg p-6 sm:p-8">
        <div className="text-center mb-8">
          <div className="inline-block bg-burrow-gold text-black font-pixel text-[10px] px-3 py-1 mb-2 font-bold shadow-pixel-sm">
            3 QUICK STEPS
          </div>
          <h2 className="font-pixel text-xl sm:text-2xl text-burrow-cream mb-2">
            JOIN THE BURROW WAITLIST
          </h2>
          <p className="font-silkscreen text-xs text-burrow-muted">
            Complete the steps below to join the waitlist.
          </p>
          {referralCodeFromCookie && (
            <div className="mt-3 inline-block bg-amber-950/60 border border-burrow-gold/50 px-3 py-1 text-[11px] font-pixel text-burrow-gold">
              🎁 Referred by miner: #{referralCodeFromCookie} (+10 Welcome Points)
            </div>
          )}
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-6 p-3 bg-red-950/80 border-2 border-red-500 flex items-start gap-2.5 text-red-300 text-xs font-silkscreen">
            <AlertCircle size={18} className="text-red-400 shrink-0 mt-0.5" />
            <div>{errorMessage}</div>
          </div>
        )}

        {/* STEP 1: X USERNAME */}
        <div className="mb-6 p-4 bg-burrow-darkest/70 border-2 border-burrow-border">
          <div className="flex items-center gap-2 mb-3">
            <span className={`w-6 h-6 flex items-center justify-center font-pixel text-xs border ${
                isUsernameValid ? 'bg-emerald-500 text-black border-emerald-400' : 'bg-burrow-card text-burrow-gold border-burrow-gold'
              }`}>
                {isUsernameValid ? '✓' : '1'}
              </span>
            <span className="font-pixel text-xs sm:text-sm text-burrow-cream">
              YOUR X USERNAME
            </span>
          </div>
          <div className="relative">
            <span className="absolute left-3 top-2.5 text-burrow-muted font-mono text-sm">@</span>
            <input
              type="text"
              placeholder="your_x_username"
              value={usernameInput}
              onChange={(e) => handleUsernameChange(e.target.value)}
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              maxLength={16}
              className="w-full bg-burrow-card border-2 border-burrow-border pl-8 pr-3 py-2 text-xs font-mono text-burrow-cream focus:border-sky-400 focus:outline-none"
            />
          </div>
          {usernameInput && !isUsernameValid && (
            <p className="mt-2 text-[10px] font-silkscreen text-red-400">
              Usernames use only letters, numbers and _ (max 15).
            </p>
          )}
        </div>

        {/* STEP 2: X TASKS */}
        <div className="mb-6 p-4 bg-burrow-darkest/70 border-2 border-burrow-border">
          <div className="flex items-center gap-2 mb-3">
            <span className={`w-6 h-6 flex items-center justify-center font-pixel text-xs border ${
                allTasksDone ? 'bg-emerald-500 text-black border-emerald-400' : 'bg-burrow-card text-burrow-gold border-burrow-gold'
              }`}>
                {allTasksDone ? '✓' : '2'}
              </span>
            <span className="font-pixel text-xs sm:text-sm text-burrow-cream">
              COMPLETE THE TASKS
            </span>
          </div>
          <p className="text-[11px] font-silkscreen text-burrow-muted mb-3">
            Tap GO to open X and do the task, then come back and tap CONFIRM. For the reply, paste the link to your reply before confirming.
          </p>
          <div className="space-y-2">
            {TASKS.map((task) => {
              const done = Boolean(taskProofs[task.id]);
              const started = Boolean(taskTickets[task.id]);
              return (
                <div key={task.id} className="p-2.5 bg-burrow-card border border-burrow-border">
                <div className="flex items-center justify-between gap-2">
                  <span className={`font-pixel text-[10px] sm:text-xs ${done ? 'text-emerald-400' : 'text-burrow-cream'}`}>
                    {done ? '✓ ' : ''}{task.label}
                  </span>
                  {done ? (
                    <span className="text-[10px] font-pixel text-emerald-400 flex items-center gap-1 shrink-0">
                      <CheckCircle size={12} /> DONE
                    </span>
                  ) : (
                    <div className="flex gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleTaskGo(task)}
                        disabled={!isUsernameValid}
                        className="px-3 py-1.5 text-[10px] font-pixel border border-sky-400 text-sky-400 bg-black/60 hover:bg-sky-900/30 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
                      >
                        <Twitter size={11} /> GO
                      </button>
                      <button
                        type="button"
                        onClick={() => handleTaskConfirm(task.id)}
                        disabled={!started || taskBusy === task.id || (task.id === 'reply' && !replyLink.trim())}
                        className="px-3 py-1.5 text-[10px] font-pixel border border-burrow-gold text-burrow-gold bg-black/60 hover:bg-amber-900/30 disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        {taskBusy === task.id ? '...' : 'CONFIRM'}
                      </button>
                    </div>
                  )}
                </div>
                {task.id === 'reply' && !done && started && (
                  <input
                    type="url"
                    inputMode="url"
                    placeholder="Paste the link to your reply (x.com/you/status/...)"
                    value={replyLink}
                    onChange={(e) => setReplyLink(e.target.value)}
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck={false}
                    className="mt-2 w-full bg-burrow-darkest border-2 border-burrow-border px-3 py-2 text-[11px] font-mono text-burrow-cream focus:border-sky-400 focus:outline-none"
                  />
                )}
                </div>
              );
            })}
          </div>
        </div>

        {/* STEP 3: WALLET ADDRESS */}
        <div className="mb-6 p-4 bg-burrow-darkest/70 border-2 border-burrow-border">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className={`w-6 h-6 flex items-center justify-center font-pixel text-xs border ${
                walletAddress && /^0x[a-fA-F0-9]{40}$/.test(walletAddress)
                  ? 'bg-emerald-500 text-black border-emerald-400'
                  : 'bg-burrow-card text-burrow-gold border-burrow-gold'
              }`}>
                {walletAddress && /^0x[a-fA-F0-9]{40}$/.test(walletAddress) ? '✓' : '3'}
              </span>
              <span className="font-pixel text-xs sm:text-sm text-burrow-cream">
                EVM WALLET (ROBINHOOD CHAIN)
              </span>
            </div>
            <span className="text-[10px] font-mono text-burrow-muted">
              Chain ID: 4663
            </span>
          </div>

          <div className="space-y-3">
            <p className="text-[11px] font-silkscreen text-burrow-muted">
              Paste the EVM wallet address you want on the list.
            </p>

            <input
              type="text"
              placeholder="Paste your 0x wallet address"
              value={walletAddress}
              onChange={(e) => setWalletAddress(e.target.value.trim())}
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              className="w-full bg-burrow-card border-2 border-burrow-border px-3 py-2 text-xs font-mono text-amber-200 focus:border-burrow-gold focus:outline-none"
            />
            {walletAddress && !/^0x[a-fA-F0-9]{40}$/.test(walletAddress) && (
              <p className="text-[10px] font-silkscreen text-red-400">
                That doesn't look like a wallet address. It should start with 0x and be 42 characters.
              </p>
            )}
          </div>
        </div>

        {/* STEP 3: SUBMIT JOIN BUTTON */}
        <div className="pt-2">
          <button
            type="button"
            disabled={isLoading || !isUsernameValid || !allTasksDone || !walletAddress}
            onClick={handleCompleteJoin}
            className={`w-full py-4 px-6 font-pixel text-sm sm:text-base border-4 shadow-pixel-lg flex items-center justify-center gap-3 transition-all ${
              !isUsernameValid || !allTasksDone || !walletAddress
                ? 'bg-burrow-card text-burrow-muted border-burrow-border cursor-not-allowed opacity-60'
                : 'bg-burrow-gold hover:bg-yellow-400 text-black border-amber-200 active:translate-y-1 active:shadow-pixel font-bold'
            }`}
          >
            {isLoading ? (
              <>
                <RefreshCw size={18} className="animate-spin" />
                <span>VERIFYING & JOINING...</span>
              </>
            ) : (
              <>
                <ShieldCheck size={20} />
                <span>SUBMIT & GET MY CARD</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
          
          <p className="text-[10px] font-silkscreen text-burrow-muted text-center mt-3">
            By joining, you agree to Robinhood Chain EVM verification rules. 1 spot per wallet & X username.
          </p>
        </div>
      </div>
    </div>
  );
}
