"use client";
import { useState, useEffect } from "react";

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
}

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [prayers, setPrayers] = useState<Prayer[]>([]);
  const [tab, setTab] = useState<"pending" | "approved" | "rejected">("pending");
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (res.ok) {
        setToken(data.token);
        setAuthed(true);
      } else {
        setLoginError(data.error || "Invalid credentials.");
      }
    } catch {
      setLoginError("Could not reach server.");
    }
  };

  const fetchPrayers = async (status: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/prayers?status=${status}`, {
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
    if (authed) fetchPrayers(tab);
  }, [authed, tab]);

  const updateStatus = async (id: string, status: string) => {
    await fetch(`/api/admin/prayers`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ id, status }),
    });
    fetchPrayers(tab);
  };

  const markAnswered = async (id: string) => {
    await fetch(`/api/admin/prayers`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ id, isAnswered: true }),
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
              <label className="block text-sm font-medium text-navy-700 mb-1.5">Username</label>
              <input
                type="text"
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
        <button onClick={() => setAuthed(false)} className="text-sm text-navy-700/50 hover:text-navy-700">Sign out</button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {(["pending", "approved", "rejected"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors capitalize ${
              tab === t ? "bg-navy-700 text-white" : "border border-cream-200 text-navy-700/60 hover:border-gold-400"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-20 text-navy-700/40">Loading…</div>
      ) : prayers.length === 0 ? (
        <div className="text-center py-20 text-navy-700/40">
          <p className="font-serif text-lg">No {tab} prayers.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {prayers.map((p) => (
            <div key={p.id} className="bg-white rounded-2xl border border-cream-200 p-6">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <h3 className="font-serif text-base font-semibold text-navy-700">{p.title}</h3>
                  <p className="text-xs text-navy-700/40 mt-0.5">
                    {p.isAnonymous ? "Anonymous" : p.firstName} · {p.category} · {new Date(p.createdAt).toLocaleDateString()}
                    {p.email && ` · ${p.email}`}
                  </p>
                </div>
                <span className="text-xs font-medium px-2 py-1 rounded-full bg-amber-50 text-amber-700 capitalize shrink-0">{p.category}</span>
              </div>
              <p className="text-sm text-navy-700/65 leading-relaxed mb-4 line-clamp-3">{p.body}</p>
              <div className="flex flex-wrap gap-2">
                {tab === "pending" && (
                  <>
                    <button onClick={() => updateStatus(p.id, "approved")} className="text-xs px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full transition-colors">Approve</button>
                    <button onClick={() => updateStatus(p.id, "rejected")} className="text-xs px-3 py-1.5 bg-rose-500 hover:bg-rose-600 text-white rounded-full transition-colors">Reject</button>
                  </>
                )}
                {tab === "approved" && !p.isAnswered && (
                  <button onClick={() => markAnswered(p.id)} className="text-xs px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-full transition-colors">Mark Answered</button>
                )}
                {tab === "approved" && (
                  <button onClick={() => updateStatus(p.id, "rejected")} className="text-xs px-3 py-1.5 border border-cream-200 text-navy-700/50 hover:text-rose-500 rounded-full transition-colors">Remove</button>
                )}
                {tab === "rejected" && (
                  <button onClick={() => updateStatus(p.id, "approved")} className="text-xs px-3 py-1.5 border border-cream-200 text-navy-700/50 hover:text-emerald-600 rounded-full transition-colors">Restore</button>
                )}
                {p.isAnswered && <span className="text-xs text-emerald-600 font-medium px-3 py-1.5">✓ Answered</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
