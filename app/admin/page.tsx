"use client";
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Prayer {
  id: string;
  title: string;
  body: string;
  firstName?: string;
  isAnonymous: boolean;
  category: string;
  status: string;
  createdAt: string;
  prayerCount: number;
  isAnswered: boolean;
  email?: string;
  phone?: string;
}

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [prayers, setPrayers] = useState<Prayer[]>([]);
  const [tab, setTab] = useState<"pending" | "approved" | "held" | "testimonies">("pending");
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState("");
  const [forceAnonIds, setForceAnonIds] = useState<Set<string>>(new Set());
  const [mode, setMode] = useState<"prayers" | "responses">("prayers");
  const [responses, setResponses] = useState<{ id: string; prayerTitle: string; firstName: string; type: string; content: string; platform?: string; createdAt: string }[]>([]);
  const [responsesLoading, setResponsesLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) { setToken(session.access_token); setAuthed(true); }
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) { setToken(session.access_token); setAuthed(true); }
      else { setToken(""); setAuthed(false); }
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    const { data, error } = await supabase.auth.signInWithPassword({ email: username, password });
    if (error) {
      setLoginError(error.message);
    } else {
      setToken(data.session.access_token);
      setAuthed(true);
    }
  };

  const fetchPrayers = async (status: string) => {
    setLoading(true);
    const apiStatus = status === "held" ? "rejected" : status;
    try {
      const res = await fetch(`/api/admin/prayers?status=${apiStatus}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setPrayers(data.prayers || []);
    } catch {
      setPrayers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authed && mode === "prayers") fetchPrayers(tab);
  }, [authed, tab, mode]);

  useEffect(() => {
    if (authed && mode === "responses") fetchResponses();
  }, [authed, mode]);

  const fetchResponses = async () => {
    setResponsesLoading(true);
    try {
      const res = await fetch(`/api/admin/responses?status=pending`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setResponses(data.responses || []);
    } catch {
      setResponses([]);
    } finally {
      setResponsesLoading(false);
    }
  };

  const updateResponse = async (id: string, status: string) => {
    await fetch(`/api/admin/responses`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ id, status }),
    });
    fetchResponses();
  };

  const updateStatus = async (id: string, status: string) => {
    const body: Record<string, unknown> = { id, status };
    if (status === "approved" && forceAnonIds.has(id)) body.isAnonymous = true;
    await fetch(`/api/admin/prayers`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(body),
    });
    setForceAnonIds(prev => { const next = new Set(prev); next.delete(id); return next; });
    fetchPrayers(tab);
  };

  const markAnswered = async (id: string, story?: string) => {
    await fetch(`/api/admin/prayers`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ id, isAnswered: true, answeredStory: story ?? null }),
    });
    fetchPrayers(tab);
  };

  if (!authed) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-sm">
          <h1 className="font-serif text-2xl font-semibold text-navy-700 text-center mb-8">Admin Login</h1>
          <form onSubmit={handleLogin} className="bg-white rounded-2xl border border-cream-200 p-8 space-y-4">
            <div>
              <label className="block text-sm font-medium text-navy-700 mb-1.5">Email</label>
              <input
                type="email"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-cream-200 text-sm focus:outline-none focus:ring-2 focus:ring-gold-400/30"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-navy-700 mb-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-cream-200 text-sm focus:outline-none focus:ring-2 focus:ring-gold-400/30"
              />
            </div>
            {loginError && <p className="text-sm text-rose-500">{loginError}</p>}
            <button
              type="submit"
              className="w-full bg-navy-700 hover:bg-navy-800 text-white font-medium py-3 rounded-full text-sm transition-colors"
            >
              Sign in
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-serif text-2xl font-semibold text-navy-700">Prayer Wall Admin</h1>
        <button onClick={() => supabase.auth.signOut()} className="text-sm text-navy-700/50 hover:text-navy-700">Sign out</button>
      </div>

      {/* Mode switcher */}
      <div className="flex gap-2 mb-6 border-b border-cream-200 pb-4">
        {(["prayers", "responses"] as const).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors capitalize ${
              mode === m ? "bg-gold-500 text-white" : "border border-cream-200 text-navy-700/60 hover:border-gold-400"
            }`}
          >
            {m}
          </button>
        ))}
      </div>

      {/* Responses panel */}
      {mode === "responses" && (
        <div>
          {responsesLoading ? (
            <div className="text-center py-20 text-navy-700/40">Loading…</div>
          ) : responses.length === 0 ? (
            <div className="text-center py-20 text-navy-700/40">
              <p className="font-serif text-lg">No pending responses.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {responses.map((r) => (
                <div key={r.id} className="bg-white rounded-2xl border border-cream-200 p-6">
                  <p className="text-xs text-navy-700/40 mb-1">On prayer: <span className="font-medium text-navy-700/60">{r.prayerTitle}</span></p>
                  <p className="text-sm font-medium text-navy-700 mb-2">{r.firstName}</p>
                  {r.type === "comment" ? (
                    <p className="text-sm text-navy-700/65 leading-relaxed mb-4">{r.content}</p>
                  ) : (
                    <a href={r.content} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-gold-500 hover:text-gold-600 font-medium mb-4 break-all">
                      {r.platform ? r.platform.charAt(0).toUpperCase() + r.platform.slice(1) : "Link"}: {r.content} →
                    </a>
                  )}
                  <div className="flex gap-2">
                    <button onClick={() => updateResponse(r.id, "approved")}
                      className="text-xs px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full transition-colors">
                      Approve
                    </button>
                    <button onClick={() => updateResponse(r.id, "rejected")}
                      className="text-xs px-3 py-1.5 border border-cream-200 text-navy-700/50 hover:text-rose-500 rounded-full transition-colors">
                      Dismiss
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Prayers panel */}
      {mode === "prayers" && <>
      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {(["pending", "approved", "held", "testimonies"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              tab === t ? "bg-navy-700 text-white" : "border border-cream-200 text-navy-700/60 hover:border-gold-400"
            }`}
          >
            {t === "held" ? "Held Prayers" : t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-20 text-navy-700/40">Loading…</div>
      ) : prayers.length === 0 ? (
        <div className="text-center py-20 text-navy-700/40">
          <p className="font-serif text-lg">No {tab === "held" ? "held" : tab} prayers.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {prayers.map((p) => (
            <div key={p.id} className="bg-white rounded-2xl border border-cream-200 p-6">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <h3 className="font-serif text-base font-semibold text-navy-700">{p.title}</h3>
                  <p className="text-xs text-navy-700/40 mt-0.5">
                    {p.firstName} {p.isAnonymous ? "(anonymous)" : ""} · {p.category} · {new Date(p.createdAt).toLocaleDateString()}
                    {p.email && ` · ${p.email}`}{p.phone && ` · ${p.phone}`}
                  </p>
                </div>
                <span className="text-xs font-medium px-2 py-1 rounded-full bg-amber-50 text-amber-700 capitalize shrink-0">{p.category}</span>
              </div>
              <p className="text-sm text-navy-700/65 leading-relaxed mb-4">{p.body}</p>
              {tab === "testimonies" && (p as Prayer & { answeredStory?: string }).answeredStory && (
                <div className="mb-4 p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                  <p className="text-xs font-medium text-emerald-600 mb-1">Submitted Testimony</p>
                  <p className="text-sm text-emerald-800">{(p as Prayer & { answeredStory?: string }).answeredStory}</p>
                </div>
              )}
              <div className="flex flex-wrap gap-2">
                {tab === "pending" && (
                  <>
                    <label className="flex items-center gap-2 text-xs text-navy-700/60 cursor-pointer w-full mb-1">
                      <input
                        type="checkbox"
                        checked={forceAnonIds.has(p.id)}
                        onChange={(e) => setForceAnonIds(prev => {
                          const next = new Set(prev);
                          if (e.target.checked) next.add(p.id); else next.delete(p.id);
                          return next;
                        })}
                        className="accent-gold-500"
                      />
                      Make anonymous
                    </label>
                    <button onClick={() => updateStatus(p.id, "approved")} className="text-xs px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full transition-colors">Approve</button>
                    <button onClick={() => updateStatus(p.id, "rejected")} className="text-xs px-3 py-1.5 border border-cream-200 text-navy-700/50 hover:text-rose-500 rounded-full transition-colors">Set Aside</button>
                  </>
                )}
                {tab === "approved" && (
                  <>
                    <button onClick={() => updateStatus(p.id, "pending")} className="text-xs px-3 py-1.5 border border-cream-200 text-navy-700/50 hover:text-amber-600 rounded-full transition-colors">Hold for Review</button>
                    <button onClick={() => updateStatus(p.id, "rejected")} className="text-xs px-3 py-1.5 border border-cream-200 text-navy-700/50 hover:text-rose-500 rounded-full transition-colors">Not for Wall</button>
                  </>
                )}
                {tab === "held" && (
                  <button onClick={() => updateStatus(p.id, "pending")} className="text-xs px-3 py-1.5 border border-cream-200 text-navy-700/50 hover:text-emerald-600 rounded-full transition-colors">Return to Queue</button>
                )}
                {tab === "testimonies" && (
                  <>
                    <button onClick={() => markAnswered(p.id, (p as Prayer & { answeredStory?: string }).answeredStory)} className="text-xs px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full transition-colors">Approve Testimony</button>
                    <button onClick={async () => {
                      await fetch(`/api/admin/prayers`, {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                        body: JSON.stringify({ id: p.id, answeredStory: null }),
                      });
                      fetchPrayers(tab);
                    }} className="text-xs px-3 py-1.5 border border-cream-200 text-navy-700/50 hover:text-rose-500 rounded-full transition-colors">Dismiss</button>
                  </>
                )}
                {p.isAnswered && <span className="text-xs text-emerald-600 font-medium px-3 py-1.5">✓ Answered</span>}
              </div>
            </div>
          ))}
        </div>
      )}
      </>}
    </div>
  );
}
