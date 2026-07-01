"use client";
import { useState, useRef } from "react";
import { motion } from "framer-motion";
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
  const [turnstileReady, setTurnstileReady] = useState(false);
  const turnstileRef = useRef<TurnstileInstance>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.agreed) { setError("Please agree to the terms above."); return; }
    if (!form.category) { setError("Please choose a category."); return; }
    if (!form.firstName.trim() && !form.isAnonymous) { setError("Please enter a display name, or choose to submit anonymously."); return; }
    if (!turnstileToken) { setError("Please wait for the security check to complete."); return; }
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
      <motion.div
        className="max-w-xl mx-auto px-4 py-24 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <motion.div
          className="text-5xl mb-6"
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.15, duration: 0.4, ease: "easeOut" }}
        >🙏</motion.div>
        <h1 className="font-serif text-3xl font-semibold text-navy-700 mb-3">Thank you.</h1>
        <p className="text-navy-700/60 text-lg">Our community will be praying with you.</p>
        <p className="text-sm text-navy-700/40 mt-4">Your prayer is being reviewed and will appear on the wall shortly.</p>
        <p className="text-sm text-navy-700/50 mt-6">If the Lord answers, tell us — testimonies build faith for the whole community.</p>
        <p className="text-sm text-navy-700/40 mt-2">While you wait, lift up someone else's prayer too — the Lord multiplies what you pour out.</p>
      </motion.div>
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

        {/* Display name + anonymous */}
        <div>
          <label className="flex items-center gap-2.5 mb-3 cursor-pointer">
            <input
              type="checkbox"
              checked={form.isAnonymous}
              onChange={(e) => setForm({ ...form, isAnonymous: e.target.checked })}
              className="accent-gold-500"
            />
            <span className="text-sm text-navy-700/60">Submit anonymously</span>
          </label>
          {!form.isAnonymous && (
            <div>
              <label className="block text-sm font-medium text-navy-700 mb-1.5">Name / Nickname / Alias <span className="text-rose-400">*</span></label>
              <input
                type="text"
                maxLength={100}
                placeholder=""
                value={form.firstName}
                onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-cream-200 bg-cream-50 text-navy-700 text-sm focus:outline-none focus:ring-2 focus:ring-gold-400/30 focus:border-gold-400"
              />
              <p className={`text-xs mt-1 text-right ${form.firstName.length > 80 ? "text-amber-500" : "text-navy-700/40"}`}>{form.firstName.length}/100</p>
            </div>
          )}
        </div>

        {/* Prayer */}
        <div>
          <label className="block text-sm font-medium text-navy-700 mb-1.5">Your prayer <span className="text-rose-400">*</span></label>
          <textarea
            required
            rows={6}
            maxLength={5000}
            placeholder="Share as much or as little as you'd like…"
            value={form.body}
            onChange={(e) => setForm({ ...form, body: e.target.value })}
            className="w-full px-4 py-2.5 rounded-xl border border-cream-200 bg-cream-50 text-navy-700 text-sm focus:outline-none focus:ring-2 focus:ring-gold-400/30 focus:border-gold-400 resize-none"
          />
          <p className="text-xs text-navy-700/40 mt-1">If you're in a crisis, please reach out to someone who can truly be there with you — a family member, a friend, or a crisis helpline.</p>
          <p className={`text-xs mt-0.5 text-right ${form.body.length > 4500 ? "text-amber-500" : "text-navy-700/40"}`}>{form.body.length}/5000</p>
        </div>

        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-navy-700 mb-1.5">Give your prayer a short name <span className="text-rose-400">*</span></label>
          <input
            type="text"
            required
            maxLength={200}
            placeholder="e.g. For my father's healing"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full px-4 py-2.5 rounded-xl border border-cream-200 bg-cream-50 text-navy-700 text-sm focus:outline-none focus:ring-2 focus:ring-gold-400/30 focus:border-gold-400"
          />
          <p className={`text-xs mt-1 text-right ${form.title.length > 180 ? "text-amber-500" : "text-navy-700/40"}`}>{form.title.length}/200</p>
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-navy-700 mb-2">What area does this touch most? <span className="text-rose-400">*</span></label>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setForm({ ...form, category: c })}
                className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                  form.category === c
                    ? "bg-navy-700 text-white border-navy-700"
                    : "border-cream-200 text-navy-700/60 hover:border-gold-400 hover:text-gold-500"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Contact (optional) */}
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-navy-700 mb-0.5">Contact</label>
            <p className="text-xs text-navy-700/50">Optional — if a fellow volunteer feels led to pray with you in person, share how to reach you; if you're already part of our community, your name is often enough.</p>
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
            placeholder="Phone / Viber / WhatsApp"
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
          <span className="text-sm text-navy-700/65 space-y-1">
            <span className="block">I'm happy for my prayer to be shared on the community wall, shown under my name or anonymously.</span>
            <span className="block text-xs text-navy-700/45">My contact info, if provided, is kept private and will never be shared.</span>
          </span>
        </label>

        {/* Turnstile */}
        <div className="flex flex-col items-center gap-2">
          <Turnstile
            ref={turnstileRef}
            siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!}
            onSuccess={(token) => { setTurnstileToken(token); setTurnstileReady(true); }}
            onExpire={() => setTurnstileToken(null)}
            onError={() => { setTurnstileToken(null); setError("Security check failed. Please try again."); }}
            options={{ theme: "light", size: "normal" }}
          />
          {!turnstileReady && (
            <p className="text-xs text-navy-700/40">Waiting for security check to load…</p>
          )}
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
