"use client";
import { useState } from "react";

const ALLOWED_HOSTS: Record<string, string> = {
  "open.spotify.com": "spotify",
  "spotify.com": "spotify",
  "youtube.com": "youtube",
  "youtu.be": "youtube",
  "facebook.com": "facebook",
  "fb.watch": "facebook",
  "instagram.com": "instagram",
  "tiktok.com": "tiktok",
  "vm.tiktok.com": "tiktok",
};

const PLATFORM_LABELS: Record<string, string> = {
  spotify: "Spotify",
  youtube: "YouTube",
  facebook: "Facebook",
  instagram: "Instagram",
  tiktok: "TikTok",
};

function detectPlatform(url: string): string | null {
  try {
    const host = new URL(url).hostname.replace(/^www\./, "");
    return ALLOWED_HOSTS[host] ?? null;
  } catch {
    return null;
  }
}

export default function ResponseForm({ prayerId }: { prayerId: string }) {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<"comment" | "link">("comment");
  const [firstName, setFirstName] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const detectedPlatform = type === "link" && content ? detectPlatform(content) : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!firstName.trim()) { setError("Please enter your first name."); return; }
    if (!content.trim()) { setError(type === "comment" ? "Please write something." : "Please paste a link."); return; }
    if (type === "link" && !detectedPlatform) {
      setError("Only Spotify, YouTube, Facebook, Instagram, and TikTok links are allowed.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/prayers/${prayerId}/responses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName, type, content }),
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
      <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100 text-center">
        <p className="text-sm font-medium text-emerald-700">Thank you — your response is being reviewed.</p>
      </div>
    );
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="text-sm font-medium text-gold-500 hover:text-gold-600 transition-colors"
      >
        Respond with prayer or encouragement →
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" id="respond">
      <p className="text-sm font-medium text-navy-700">
        Write a prayer, share a song, or leave an encouragement.
      </p>

      {/* Type toggle */}
      <div className="flex gap-2">
        {(["comment", "link"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => { setType(t); setContent(""); }}
            className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
              type === t
                ? "bg-navy-700 text-white border-navy-700"
                : "border-cream-200 text-navy-700/60 hover:border-gold-400"
            }`}
          >
            {t === "comment" ? "✍️ Write a prayer" : "🔗 Share a link"}
          </button>
        ))}
      </div>

      {/* First name */}
      <input
        type="text"
        placeholder="Your first name"
        value={firstName}
        onChange={(e) => setFirstName(e.target.value)}
        className="w-full px-4 py-2.5 rounded-xl border border-cream-200 bg-cream-50 text-navy-700 text-sm focus:outline-none focus:ring-2 focus:ring-gold-400/30 focus:border-gold-400"
      />

      {/* Content */}
      {type === "comment" ? (
        <div>
          <textarea
            rows={4}
            placeholder="Write a prayer or word of encouragement…"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            maxLength={1000}
            className="w-full px-4 py-2.5 rounded-xl border border-cream-200 bg-cream-50 text-navy-700 text-sm focus:outline-none focus:ring-2 focus:ring-gold-400/30 focus:border-gold-400 resize-none"
          />
          <p className="text-xs text-navy-700/40 mt-1 text-right">{content.length}/1000</p>
        </div>
      ) : (
        <div>
          <input
            type="url"
            placeholder="Paste a Spotify, YouTube, Facebook, Instagram, or TikTok link"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-cream-200 bg-cream-50 text-navy-700 text-sm focus:outline-none focus:ring-2 focus:ring-gold-400/30 focus:border-gold-400"
          />
          {content && (
            <p className={`text-xs mt-1.5 ${detectedPlatform ? "text-emerald-600" : "text-rose-500"}`}>
              {detectedPlatform
                ? `✓ ${PLATFORM_LABELS[detectedPlatform]} link detected`
                : "Only Spotify, YouTube, Facebook, Instagram, and TikTok links allowed"}
            </p>
          )}
        </div>
      )}

      {error && <p className="text-sm text-rose-500">{error}</p>}

      <p className="text-xs text-navy-700/40">Your response will be reviewed before it appears.</p>

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={loading}
          className="bg-gold-500 hover:bg-gold-600 disabled:opacity-60 text-white text-sm font-medium px-5 py-2 rounded-full transition-colors"
        >
          {loading ? "Submitting…" : "Submit"}
        </button>
        <button
          type="button"
          onClick={() => { setOpen(false); setContent(""); setError(""); }}
          className="text-sm text-navy-700/50 hover:text-navy-700 px-3 py-2 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
