"use client";
import { useState } from "react";

export default function TestimonyForm({ prayerId }: { prayerId: string }) {
  const [open, setOpen] = useState(false);
  const [story, setStory] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!story.trim()) { setError("Please share what happened."); return; }
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/prayers/${prayerId}/testimony`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ story }),
      });
      if (res.ok) {
        setDone(true);
      } else {
        const d = await res.json();
        setError(d.error || "Something went wrong.");
      }
    } catch {
      setError("Could not reach the server.");
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div className="mt-8 p-5 bg-emerald-50 rounded-xl border border-emerald-100 text-center">
        <p className="text-emerald-700 font-medium">🙏 Thank you for sharing!</p>
        <p className="text-sm text-emerald-600 mt-1">Your testimony has been recorded.</p>
      </div>
    );
  }

  if (!open) {
    return (
      <div className="mt-8 pt-6 border-t border-cream-200 text-center">
        <p className="text-sm text-navy-700/50 mb-3">Did God answer this prayer?</p>
        <button
          onClick={() => setOpen(true)}
          className="text-sm font-medium text-gold-500 hover:text-gold-600 transition-colors"
        >
          Share your testimony →
        </button>
      </div>
    );
  }

  return (
    <div className="mt-8 pt-6 border-t border-cream-200">
      <p className="text-sm font-medium text-navy-700 mb-3">Share what God did</p>
      <form onSubmit={handleSubmit} className="space-y-3">
        <textarea
          rows={4}
          placeholder="Tell us how this prayer was answered…"
          value={story}
          onChange={(e) => setStory(e.target.value)}
          className="w-full px-4 py-2.5 rounded-xl border border-cream-200 bg-cream-50 text-navy-700 text-sm focus:outline-none focus:ring-2 focus:ring-gold-400/30 focus:border-gold-400 resize-none"
        />
        {error && <p className="text-sm text-rose-500">{error}</p>}
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={loading}
            className="bg-gold-500 hover:bg-gold-600 disabled:opacity-60 text-white text-sm font-medium px-5 py-2 rounded-full transition-colors"
          >
            {loading ? "Submitting…" : "Submit Testimony"}
          </button>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="text-sm text-navy-700/50 hover:text-navy-700 px-3 py-2 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
