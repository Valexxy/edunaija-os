'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export interface SystemNotification {
  id: string;
  category: string;
  title: string;
  message: string;
  action_label?: string;
  action_url?: string;
  priority: string;
  is_read: number;
  created_at: string;
}

interface NotificationBoardProps {
  isOpen: boolean;
  onClose: () => void;
  onUnreadChange?: (count: number) => void;
}

const CATEGORY_TABS = [
  { key: 'ALL', label: 'All Updates' },
  { key: 'competition', label: '🏆 Competitions' },
  { key: 'exam_security', label: '🛡️ Proctor & Security' },
  { key: 'parent_autopilot', label: '📱 Parent Autopilot' },
  { key: 'curriculum', label: '📚 Curriculum' },
  { key: 'system', label: '⚡ System' },
];

export default function NotificationBoard({ isOpen, onClose, onUnreadChange }: NotificationBoardProps) {
  const [notifications, setNotifications] = useState<SystemNotification[]>([]);
  const [activeTab, setActiveTab] = useState('ALL');
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const url = activeTab === 'ALL'
        ? '/api/backend/notifications'
        : `/api/backend/notifications?category=${activeTab}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
        setUnreadCount(data.unread_count || 0);
        if (onUnreadChange) onUnreadChange(data.unread_count || 0);
      }
    } catch (e) {
      console.warn('Backend notifications unavailable, using offline fallback');
      const fallback: SystemNotification[] = [
        {
          id: 'notif-001',
          category: 'competition',
          title: '🏆 Sunday 8:00 PM National UTME/WAEC Showdown',
          message: 'Join 14,200 Nigerian candidates competing live for the ₦250,000 scholarship prize pool this Sunday. Strict proctored mode enabled.',
          action_label: 'Enter Showdown Arena',
          action_url: '/exam-proctor',
          priority: 'urgent',
          is_read: 0,
          created_at: new Date().toISOString()
        },
        {
          id: 'notif-002',
          category: 'exam_security',
          title: '🛡️ Zero-Tolerance Anti-Cheat Active on Standardized Exams',
          message: 'Proctored exams now enforce 3-strike tab lockdown, dynamic anti-leak security watermarks, and monotonic server deadlines.',
          action_label: 'Review Proctor Rules',
          action_url: '/exam-proctor',
          priority: 'high',
          is_read: 0,
          created_at: new Date().toISOString()
        },
        {
          id: 'notif-003',
          category: 'parent_autopilot',
          title: '📱 Friday 5:00 PM Parent WhatsApp Telemetry Scheduled',
          message: 'Automated weekly executive briefing ready for candidate Tolu Adeleke. Syllabus coverage at 82.5% with distinction trajectory.',
          action_label: 'View Parent Hub',
          action_url: '/parent-autopilot',
          priority: 'normal',
          is_read: 0,
          created_at: new Date().toISOString()
        },
        {
          id: 'notif-004',
          category: 'curriculum',
          title: '📚 NERDC 2025 National Syllabus Auto-Sync Complete',
          message: 'Mathematics and Physics modules successfully updated with Bloom\'s taxonomy drills, Feynman analogies, and step-by-step scaffolds.',
          action_label: 'Explore Syllabus',
          action_url: '/syllabus',
          priority: 'normal',
          is_read: 1,
          created_at: new Date().toISOString()
        },
        {
          id: 'notif-005',
          category: 'system',
          title: '⚡ Power Outage & Battery Death Checkpoint Auto-Save',
          message: 'Instant recovery enabled: If your device loses power or battery dies mid-exam, your exact question progress is preserved.',
          action_label: 'Check Student Lab',
          action_url: '/student',
          priority: 'normal',
          is_read: 1,
          created_at: new Date().toISOString()
        }
      ];
      setNotifications(fallback);
      setUnreadCount(fallback.filter(n => !n.is_read).length);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen, activeTab]);

  const handleMarkAsRead = async (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: 1 } : n));
    setUnreadCount(prev => Math.max(0, prev - 1));
    if (onUnreadChange) onUnreadChange(Math.max(0, unreadCount - 1));
    try {
      await fetch(`/api/backend/notifications/${id}/read`, { method: 'POST' });
    } catch {}
  };

  const handleMarkAllRead = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, is_read: 1 })));
    setUnreadCount(0);
    if (onUnreadChange) onUnreadChange(0);
    try {
      await fetch('/api/backend/notifications/read-all', { method: 'POST' });
    } catch {}
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity duration-300"
      />

      {/* Slide-over Drawer Panel */}
      <div className="relative w-full max-w-lg bg-slate-900/95 border-l border-slate-800 shadow-2xl flex flex-col h-full z-10 text-slate-100 backdrop-blur-xl">

        {/* Drawer Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between gap-4 bg-slate-900/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-xl shadow-inner">
              🔔
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black text-white">Broadcast Center</h2>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white text-[11px] font-mono font-bold animate-pulse">
                    {unreadCount} unread
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400">Live platform telemetry & nationwide announcements</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="px-2.5 py-1 text-[11px] font-bold text-amber-400 hover:text-amber-300 hover:bg-amber-400/10 rounded-lg transition"
              >
                Mark all read
              </button>
            )}
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center text-sm font-bold transition"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Category Filter Tabs */}
        <div className="p-3 border-b border-slate-800 flex gap-1.5 overflow-x-auto no-scrollbar bg-slate-950/40">
          {CATEGORY_TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${activeTab === tab.key ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20' : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Notifications Feed */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {loading ? (
            <div className="text-center py-12 space-y-2">
              <div className="animate-spin text-2xl">⏳</div>
              <p className="text-xs text-slate-400 font-mono">Syncing nationwide broadcasts...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-12 space-y-2 text-slate-400">
              <div className="text-3xl">📭</div>
              <p className="text-sm font-medium">No announcements in this category.</p>
              <p className="text-xs text-slate-500">You are completely up to date.</p>
            </div>
          ) : (
            notifications.map(notif => {
              const isUrgent = notif.priority === 'urgent';
              const isHigh = notif.priority === 'high';
              const isUnread = !notif.is_read;

              return (
                <div
                  key={notif.id}
                  onClick={() => isUnread && handleMarkAsRead(notif.id)}
                  className={`p-4 rounded-2xl border transition relative cursor-pointer ${isUnread ? 'bg-slate-850/90 border-amber-500/40 shadow-lg shadow-amber-950/20' : 'bg-slate-950/50 border-slate-800/80 hover:border-slate-700'}`}
                >
                  {/* Unread blue dot */}
                  {isUnread && (
                    <span className="absolute top-4 right-4 w-2 h-2 rounded-full bg-amber-400 shadow-sm shadow-amber-400" />
                  )}

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase ${isUrgent ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' : isHigh ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'bg-slate-800 text-slate-300'}`}>
                        {notif.priority}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {new Date(notif.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-white leading-snug">
                      {notif.title}
                    </h4>

                    <p className="text-xs text-slate-300 leading-relaxed">
                      {notif.message}
                    </p>

                    {/* Action link */}
                    {notif.action_url && (
                      <div className="pt-2">
                        <Link
                          href={notif.action_url}
                          onClick={onClose}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-bold transition"
                        >
                          <span>{notif.action_label || 'View Details'}</span>
                          <span>→</span>
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Drawer Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 text-center">
          <p className="text-[11px] text-slate-500 font-mono">
            🛡️ OmniLearn Sovereign Security & Real-Time Broadcast Mesh
          </p>
        </div>

      </div>
    </div>
  );
}
