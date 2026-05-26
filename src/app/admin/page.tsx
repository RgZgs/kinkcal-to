'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { events, categories } from '@/lib/data';

interface ReportEvent {
  id: string;
  title: string;
  source: string;
  start_time: string;
  category_slugs: string[];
  is_verified: boolean;
  verification_notes: string[];
  search_queries: string[];
  classification: { isKink: boolean; confidence: number; reason: string };
  is_future: boolean;
}

interface Submission {
  id: string;
  title: string;
  description: string;
  venue: string;
  address: string;
  start_time: string;
  url: string;
  categories: string[];
  recurrence: string;
  submitted_at: string;
  status: 'pending' | 'approved' | 'rejected';
}

type Tab = 'events' | 'reports' | 'submissions';

export default function AdminPage() {
  const [tab, setTab] = useState<Tab>('events');
  const [reportData, setReportData] = useState<any>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [authError, setAuthError] = useState('');

  const fetchWithAuth = async (url: string, method = 'GET', body?: any) => {
    const opts: RequestInit = {
      method,
      headers: {
        'Authorization': `Bearer ${token}`,
        ...(body ? { 'Content-Type': 'application/json' } : {}),
      },
    };
    if (body) opts.body = JSON.stringify(body);
    return fetch(url, opts);
  };

  const tryAuth = async () => {
    const res = await fetchWithAuth('/api/reports');
    if (res.ok) {
      setAuthenticated(true);
      setAuthError('');
      const data = await res.json();
      setReportData(data);
    } else {
      setAuthError('Wrong password');
    }
  };

  useEffect(() => {
    if (tab === 'reports' && authenticated) {
      setLoading(true);
      fetchWithAuth('/api/reports')
        .then(r => r.json())
        .then(data => { setReportData(data); setLoading(false); })
        .catch(() => setLoading(false));
    }
    if (tab === 'submissions' && authenticated) {
      fetchWithAuth('/api/submit')
        .then(r => r.json())
        .then(data => setSubmissions(data.submissions || []))
        .catch(() => {});
    }
  }, [tab, authenticated]);

  const approveSubmission = async (id: string) => {
    await fetchWithAuth('/api/submit', 'PATCH', { id, status: 'approved' });
    setSubmissions(prev => prev.map(s => s.id === id ? { ...s, status: 'approved' as const } : s));
  };

  const rejectSubmission = async (id: string) => {
    await fetchWithAuth('/api/submit', 'PATCH', { id, status: 'rejected' });
    setSubmissions(prev => prev.map(s => s.id === id ? { ...s, status: 'rejected' as const } : s));
  };

  const pendingSubs = submissions.filter(s => s.status === 'pending');

  return (
    <main className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <Link href="/" className="text-sm text-violet-400 hover:text-violet-300 inline-block mb-2">← Back to Calendar</Link>
          <h1 className="text-2xl font-bold">Admin</h1>
        </div>
        <a href="/api/calendar.ics" className="btn-secondary text-sm">📅 .ics Feed</a>
      </div>

      {/* Auth gate */}
      {!authenticated && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 text-center">
          <p className="text-zinc-400 mb-4">Enter admin password to access reports & submissions</p>
          <div className="flex gap-2 max-w-sm mx-auto">
            <input
              type="password"
              value={token}
              onChange={e => setToken(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && tryAuth()}
              className="input-field flex-1"
              placeholder="Admin token"
            />
            <button onClick={tryAuth} className="btn-primary">Unlock</button>
          </div>
          {authError && <p className="text-red-400 text-sm mt-2">{authError}</p>}
          <p className="text-zinc-600 text-xs mt-4">
            Events tab is visible without auth. Reports & submissions require the admin token.
          </p>
        </div>
      )}

      {/* Tab nav — always visible */}
      <div className="flex gap-1 mb-6 border-b border-zinc-800 mt-4">
        {(['events', 'reports', 'submissions'] as Tab[]).map(t => {
          const needsAuth = t !== 'events';
          const locked = needsAuth && !authenticated;
          return (
            <button
              key={t}
              onClick={() => setTab(t)}
              disabled={locked}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                tab === t
                  ? 'border-violet-400 text-violet-400'
                  : locked
                    ? 'border-transparent text-zinc-700 cursor-not-allowed'
                    : 'border-transparent text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {t === 'events' ? `Events (${events.length})` : t === 'reports' ? `Reports ${locked ? '🔒' : ''}` : `Submissions (${pendingSubs.length}) ${locked ? '🔒' : ''}`}
            </button>
          );
        })}
      </div>

      {/* EVENTS TAB — no auth needed, reads static data */}
      {tab === 'events' && (
        <section>
          <h2 className="text-lg font-semibold text-green-400 mb-3">✅ Published Events ({events.length})</h2>
          <div className="space-y-2">
            {events.map((event: any) => {
              const catEmojis = event.category_slugs?.map((slug: string) => categories.find(c => c.slug === slug)?.emoji).filter(Boolean).join(' ') || '';
              return (
                <div key={event.id} className="bg-zinc-900 border border-zinc-800 rounded-lg p-3 flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <span className="font-medium text-sm">{event.title}</span>
                    <span className="text-xs text-zinc-500 ml-2">{event.start_time.slice(0, 10)}</span>
                    {event.recurrence_label && <span className="text-xs text-violet-400 ml-2">🔄 {event.recurrence_label}</span>}
                    <span className="text-xs ml-2">{catEmojis}</span>
                  </div>
                  <a href={event.url || '#'} className="text-xs text-zinc-500 hover:text-zinc-300 ml-2" target="_blank">🔗</a>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* REPORTS TAB */}
      {tab === 'reports' && authenticated && (
        <section>
          {loading && <p className="text-zinc-500">Loading report...</p>}
          {reportData && (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-green-400">{reportData.verified}</div>
                  <div className="text-xs text-zinc-500">Verified</div>
                </div>
                <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-amber-400">{reportData.unverified}</div>
                  <div className="text-xs text-zinc-500">Unverified</div>
                </div>
                <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-red-400">{reportData.past_events}</div>
                  <div className="text-xs text-zinc-500">Past</div>
                </div>
                <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-blue-400">{reportData.pending_submissions}</div>
                  <div className="text-xs text-zinc-500">Pending</div>
                </div>
              </div>

              <h3 className="text-sm font-semibold text-amber-400 mb-3">⚠️ Unverified Events</h3>
              <div className="space-y-3">
                {reportData.events
                  .filter((e: ReportEvent) => !e.is_verified)
                  .map((e: ReportEvent) => (
                    <div key={e.id} className="bg-zinc-900 border border-amber-900/40 rounded-lg p-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="font-medium text-sm">{e.title}</span>
                          <span className="text-xs text-zinc-500 ml-2">{e.source}</span>
                          {!e.is_future && <span className="text-xs text-red-400 ml-2">PAST</span>}
                        </div>
                        <span className={`text-xs px-2 py-0.5 rounded ${e.classification.isKink ? 'bg-green-900/40 text-green-400' : 'bg-red-900/40 text-red-400'}`}>
                          {e.classification.isKink ? 'Kink' : 'Non-kink'} ({(e.classification.confidence * 100).toFixed(0)}%)
                        </span>
                      </div>
                      {e.verification_notes.length > 0 && (
                        <div className="mt-2">
                          {e.verification_notes.map((n, i) => (
                            <p key={i} className="text-xs text-zinc-500">• {n}</p>
                          ))}
                        </div>
                      )}
                      <details className="mt-2">
                        <summary className="text-xs text-zinc-600 cursor-pointer hover:text-zinc-400">Search queries to verify</summary>
                        <div className="mt-1 space-y-1">
                          {e.search_queries.slice(0, 5).map((q, i) => (
                            <p key={i} className="text-xs text-zinc-600 font-mono">{q}</p>
                          ))}
                        </div>
                      </details>
                    </div>
                  ))}
              </div>

              {reportData.events.filter((e: ReportEvent) => e.is_verified).length > 0 && (
                <>
                  <h3 className="text-sm font-semibold text-green-400 mb-3 mt-8">✅ Verified Events</h3>
                  <div className="space-y-2">
                    {reportData.events
                      .filter((e: ReportEvent) => e.is_verified)
                      .map((e: ReportEvent) => (
                        <div key={e.id} className="bg-zinc-900 border border-zinc-800 rounded-lg p-2 flex items-center justify-between">
                          <span className="text-sm">{e.title}</span>
                          <span className="text-xs text-zinc-600">{e.source}</span>
                        </div>
                      ))}
                  </div>
                </>
              )}
            </>
          )}
        </section>
      )}

      {/* SUBMISSIONS TAB */}
      {tab === 'submissions' && authenticated && (
        <section>
          {pendingSubs.length === 0 ? (
            <p className="text-zinc-500 text-center py-8">No pending submissions</p>
          ) : (
            <div className="space-y-3">
              {pendingSubs.map(sub => (
                <div key={sub.id} className="bg-zinc-900 border border-blue-900/40 rounded-lg p-4">
                  <h3 className="font-medium">{sub.title}</h3>
                  <p className="text-xs text-zinc-500 mt-1">{sub.venue} — {sub.start_time}</p>
                  {sub.description && <p className="text-sm text-zinc-400 mt-2">{sub.description}</p>}
                  {sub.url && <a href={sub.url} className="text-xs text-violet-400 hover:text-violet-300 mt-1 inline-block" target="_blank">🔗 {sub.url}</a>}
                  <div className="flex gap-2 mt-3">
                    <button onClick={() => approveSubmission(sub.id)} className="px-3 py-1 text-xs bg-green-900/40 text-green-400 rounded hover:bg-green-900/60">✅ Approve</button>
                    <button onClick={() => rejectSubmission(sub.id)} className="px-3 py-1 text-xs bg-red-900/40 text-red-400 rounded hover:bg-red-900/60">❌ Reject</button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {submissions.filter(s => s.status !== 'pending').length > 0 && (
            <>
              <h3 className="text-sm font-semibold text-zinc-500 mt-8 mb-3">Reviewed</h3>
              <div className="space-y-2">
                {submissions.filter(s => s.status !== 'pending').map(sub => (
                  <div key={sub.id} className="bg-zinc-900 border border-zinc-800 rounded-lg p-2 flex items-center justify-between">
                    <span className="text-sm text-zinc-400">{sub.title}</span>
                    <span className={`text-xs ${sub.status === 'approved' ? 'text-green-400' : 'text-red-400'}`}>
                      {sub.status === 'approved' ? '✅' : '❌'}
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
        </section>
      )}
    </main>
  );
}