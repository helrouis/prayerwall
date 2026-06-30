"use client";
import { useState, useRef } from "react";
import { Turnstile } from "@marsidev/react-turnstile";
import type { TurnstileInstance } from "@marsidev/react-turnstile";

const CATEGORIES = ["Health", "Family", "Relationships", "Financial", "School", "Work", "Thanksgiving", "Salvation", "Other"];

export default function SubmitPage() {
  const [form, setForm] = useState({
    title: "", body: "", category: "", isAnonymous: false,
    firstName: "", email: "", phone: "", agreed: false,
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const turnstileRef = useRef<TurnstileInstance>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.agreed) { setError("Please agree to the terms above."); return; }
    if (!form.category) { setError("Please choose a category."); return; }
    if (!form.firstName.trim()) { setError("Your name is required."); return; }
    if (!turnstileToken) { setError("Please complete the security check."); return; }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/prayers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, turnstileToken }),
      });
      if (res.ok) {
        setSubmitted(true);
      } else {
        const d = await res.json();
        setError(d.error || "Something went wrong.");
        turnstileRef.current?.reset();
        setTurnstileToken(null);
      }
    } catch {
      setError("Could not reach the server.");
      turnstileRef.current?.reset();
      setTurnstileToken(null);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center">
        <div className="text-5xl mb-6">🙏</div>
        <h1 className="font-serif text-3xl font-semibold text-navy-700 mb-3">Thank you.</h1>
        <p className="text-navy-700/60 text-lg">Our community will be praying with you.</p>
        <p className="text-sm text-navy-700/40 mt-4">Your prayer is being reviewed and will appear on the wall shortly.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-16">
      <div className="text-center mb-10">
        <p className="text-xs font-medium tracking-widest text-gold-500 uppercase mb-3">Share Your Heart</p>
        <h1 className="font-serif text-3xl font-semibold text-navy-700">Submit a Prayer Request</h1>
        <p className="text-navy-700/55 mt-3">You don't need to have the right words. Just share what's on your heart.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-cream-200 p-8 space-y-6">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-navy-700 mb-1.5">Title</label>
          <input
            type="text"
            required
            maxLength={200}
            placeholder="A short title for your prayer"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full px-4 py-2.5 rounded-xl border border-cream-200 bg-cream-50 text-navy-700 text-sm focus:outline-none focus:ring-2 focus:ring-gold-400/30 focus:border-gold-400"
          />
          <p className={`text-xs mt-1 text-right ${form.title.length > 180 ? "text-amber-500" : "text-navy-700/40"}`}>{form.title.length}/200</p>
        </div>

        {/* Body */}
        <div>
          <label className="block text-sm font-medium text-navy-700 mb-1.5">Prayer</label>
          <textarea
            required
            rows={5}
            maxLength={5000}
            placeholder="Share as much or as little as you'd like…"
            value={form.body}
            onChange={(e) => setForm({ ...form, body: e.target.value })}
            className="w-full px-4 py-2.5 rounded-xl border border-cream-200 bg-cream-50 text-navy-700 text-sm focus:outline-none focus:ring-2 focus:ring-gold-400/30 focus:border-gold-400 resize-none"
          />
          <p className={`text-xs mt-1 text-right ${form.body.length > 4500 ? "text-amber-500" : "text-navy-700/40"}`}>{form.body.length}/5000</p>
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-navy-700 mb-1.5">Category</label>
          <select
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            className="w-full px-4 py-2.5 rounded-xl border border-cream-200 bg-cream-50 text-navy-700 text-sm focus:outline-none focus:ring-2 focus:ring-gold-400/30 focus:border-gold-400"
          >
            <option value="">Select a category</option>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-navy-700 mb-1.5">Your name <span className="text-rose-400">*</span></label>
          <input
            type="text"
            required
            maxLength={100}
            placeholder="First name"
            value={form.firstName}
            onChange={(e) => setForm({ ...form, firstName: e.target.value })}
            className="w-full px-4 py-2.5 rounded-xl border border-cream-200 bg-cream-50 text-navy-700 text-sm focus:outline-none focus:ring-2 focus:ring-gold-400/30 focus:border-gold-400"
          />
          <p className={`text-xs mt-1 text-right ${form.firstName.length > 80 ? "text-amber-500" : "text-navy-700/40"}`}>{form.firstName.length}/100</p>
          <label className="flex items-center gap-2.5 mt-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={form.isAnonymous}
              onChange={(e) => setForm({ ...form, isAnonymous: e.target.checked })}
              className="accent-gold-500"
            />
            <span className="text-sm text-navy-700/60">Show as anonymous on the prayer wall</span>
          </label>
        </div>

        {/* Contact (optional) */}
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-navy-700 mb-0.5">Contact <span className="text-navy-700/40 font-normal">(optional)</span></label>
            <p className="text-xs text-navy-700/50 mb-2">Optional — never shown on the wall or shared with anyone.</p>
          </div>
          <input
            type="email"
            placeholder="Email address"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full px-4 py-2.5 rounded-xl border border-cream-200 bg-cream-50 text-navy-700 text-sm focus:outline-none focus:ring-2 focus:ring-gold-400/30 focus:border-gold-400"
          />
          <input
            type="tel"
            placeholder="Phone number"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className="w-full px-4 py-2.5 rounded-xl border border-cream-200 bg-cream-50 text-navy-700 text-sm focus:outline-none focus:ring-2 focus:ring-gold-400/30 focus:border-gold-400"
          />
        </div>

        {/* Consent */}
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={form.agreed}
            onChange={(e) => setForm({ ...form, agreed: e.target.checked })}
            className="mt-0.5 accent-gold-500"
          />
          <span className="text-sm text-navy-700/65">
            I'm happy for my prayer to be shared with this community after it's reviewed, shown under my name (or anonymously if I choose). My contact info, if provided, is kept private and will not be shared with anyone.
          </span>
        </label>

        {/* Turnstile */}
        <div className="flex justify-center">
          <Turnstile
            ref={turnstileRef}
            siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!}
            onSuccess={(token) => setTurnstileToken(token)}
            onExpire={() => setTurnstileToken(null)}
            onError={() => { setTurnstileToken(null); setError("Security check failed. Please try again."); }}
            options={{ theme: "light", size: "normal" }}
          />
        </div>

        {error && <p className="text-sm text-rose-500 bg-rose-50 px-4 py-2.5 rounded-xl">{error}</p>}

        <button
          type="submit"
          disabled={loading || !turnstileToken}
          className="w-full bg-gold-500 hover:bg-gold-600 disabled:opacity-60 text-white font-medium py-3 rounded-full text-sm transition-colors"
        >
          {loading ? "Submitting…" : "Submit Prayer Request"}
        </button>
      </form>
    </div>
  );
}
