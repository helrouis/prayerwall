import Link from "next/link";
import { getApprovedPrayerById } from "@/lib/prayers";
import TestimonyForm from "@/components/TestimonyForm";

export default async function PrayerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let prayer = null;

  try {
    prayer = await getApprovedPrayerById(id);
  } catch (e) {
    console.error(e);
  }

  if (!prayer) {
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center">
        <p className="font-serif text-2xl text-navy-700">Prayer not found.</p>
        <Link href="/" className="text-gold-500 text-sm mt-4 inline-block hover:underline">← Back to Prayer Wall</Link>
      </div>
    );
  }

  const displayName = prayer.isAnonymous ? "Anonymous" : prayer.firstName;
  const date = new Date(prayer.createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

  return (
    <div className="max-w-2xl mx-auto px-4 py-16">
      <Link href="/" className="text-sm text-navy-700/50 hover:text-gold-500 flex items-center gap-1 mb-8 transition-colors">
        ← Back to Prayer Wall
      </Link>

      {prayer.isAnswered && (
        <div className="flex items-center gap-2 mb-6 text-sm font-medium text-emerald-600 bg-emerald-50 rounded-2xl px-4 py-3 border border-emerald-100">
          <span>✓</span> This prayer has been answered
        </div>
      )}

      <div className="bg-white rounded-2xl border border-cream-200 p-8">
        <div className="flex items-center justify-between mb-5">
          <span className="text-xs font-medium bg-amber-50 text-amber-700 px-3 py-1 rounded-full">{prayer.category}</span>
          <span className="text-xs text-navy-700/40">{date}</span>
        </div>

        <h1 className="font-serif text-2xl font-semibold text-navy-700 mb-2 leading-snug">{prayer.title}</h1>
        <p className="text-xs text-navy-700/50 mb-8">Submitted by {displayName}</p>

        <p className="text-navy-700/75 leading-relaxed whitespace-pre-wrap">{prayer.body}</p>

        {prayer.isAnswered && prayer.answeredStory && (
          <div className="mt-8 p-5 bg-emerald-50 rounded-xl border border-emerald-100">
            <p className="text-xs font-medium text-emerald-600 uppercase tracking-wide mb-2">Testimony</p>
            <p className="text-emerald-800 text-sm leading-relaxed">{prayer.answeredStory}</p>
          </div>
        )}

        {!prayer.isAnswered && <TestimonyForm prayerId={prayer.id} />}

        <div className="mt-8 pt-6 border-t border-cream-200 flex items-center justify-between">
          <div className="text-sm text-navy-700/50">
            <span className="font-serif text-2xl font-semibold text-navy-700 mr-1.5">{prayer.prayerCount}</span>
            people have prayed
          </div>
          <Link href="/submit" className="text-sm text-gold-500 hover:text-gold-600 font-medium transition-colors">
            Submit your own prayer →
          </Link>
        </div>
      </div>
    </div>
  );
}
