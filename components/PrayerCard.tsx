"use client";
import { useState } from "react";
import Link from "next/link";

interface PrayerCardProps {
  id: string;
  title: string;
  body: string;
  firstName?: string | null;
  isAnonymous: boolean;
  category: string;
  createdAt: string;
  prayerCount: number;
  isAnswered: boolean;
  responseCount?: number;
  index?: number;
}

const CATEGORY_COLORS: Record<string, string> = {
  Health: "bg-rose-50 text-rose-700",
  Family: "bg-amber-50 text-amber-700",
  Relationships: "bg-pink-50 text-pink-700",
  Financial: "bg-emerald-50 text-emerald-700",
  School: "bg-blue-50 text-blue-700",
  Work: "bg-indigo-50 text-indigo-700",
  Thanksgiving: "bg-yellow-50 text-yellow-700",
  Salvation: "bg-purple-50 text-purple-700",
  Other: "bg-gray-50 text-gray-600",
};

export default function PrayerCard({
  id, title, body, firstName, isAnonymous, category,
  createdAt, prayerCount, isAnswered, responseCount = 0, index = 0,
}: PrayerCardProps) {
  const [count, setCount] = useState(prayerCount);
  const [prayState, setPrayState] = useState<"idle" | "pending" | "done">("idle");

  const displayName = isAnonymous ? "Anonymous" : firstName || "Anonymous";

  const preview = (() => {
    const limit = 120;
    if (body.length <= limit) return body;
    const cut = body.slice(0, limit).replace(/\s+\S*$/, "").replace(/[,;:.!?\-–—]+$/, "");
    return cut + "…";
  })();
  const colorClass = CATEGORY_COLORS[category] || CATEGORY_COLORS["Other"];
  const date = new Date(createdAt).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });

  const handlePray = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (prayState !== "idle") return;
    setPrayState("pending");
    await new Promise((r) => setTimeout(r, 1000));
    setCount((c) => c + 1);
    setPrayState("done");
    try {
      await fetch(`/api/prayers/${id}/pray`, { method: "POST" });
    } catch {}
  };

  return (
    <div
      className="bg-white rounded-2xl border border-cream-200 p-5 hover:border-gold-400/40 transition-all duration-300 hover:shadow-[0_4px_24px_rgba(201,150,63,0.08)] flex flex-col h-full"
    >
      {isAnswered && (
        <div className="flex items-center gap-1.5 mb-3 text-xs font-medium text-emerald-600 bg-emerald-50 rounded-full px-3 py-1 w-fit">
          <span>✓</span> Answered Prayer
        </div>
      )}

      <div className="flex items-start justify-between gap-2 mb-2">
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${colorClass}`}>
          {category}
        </span>
        <span className="text-xs text-navy-700/40 shrink-0">{date}</span>
      </div>

      <Link href={`/prayer/${id}`}>
        <h3 className="font-serif text-base font-semibold text-navy-700 leading-snug mb-2 hover:text-gold-500 transition-colors">
          {title}
        </h3>
      </Link>

      <p className="text-sm text-navy-700/65 leading-relaxed mb-4">
        {preview}
      </p>

      <div className="flex items-center justify-between pt-3 border-t border-cream-200 mt-auto">
        <div className="text-xs text-navy-700/50">
          <span className="font-medium text-navy-700/70">{displayName}</span>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={`/prayer/${id}`}
            className="text-xs text-gold-500 hover:text-gold-600 font-medium"
          >
            {responseCount > 0 ? `${responseCount} ${responseCount === 1 ? "Word of Grace" : "Words of Grace"} →` : "Read more →"}
          </Link>

          <button
            onClick={handlePray}
            disabled={prayState !== "idle"}
            className={`flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-full border transition-all ${
              prayState === "done"
                ? "bg-amber-50 border-amber-200 text-amber-600"
                : prayState === "pending"
                ? "border-gold-300 text-gold-500 animate-pulse"
                : "border-cream-200 text-navy-700/50 hover:border-gold-400 hover:text-gold-500"
            }`}
          >
            <span className="inline-block">🙏</span>
            <span className="font-medium">{count}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
