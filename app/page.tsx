import Link from "next/link";
import PrayerGrid from "@/components/PrayerGrid";
import { getApprovedPrayers, getWallStats } from "@/lib/prayers";

const CATEGORIES = ["All", "Health", "Family", "Relationships", "Financial", "School", "Work", "Thanksgiving", "Salvation", "Other"];

function formatStat(n: number) {
  return n.toLocaleString("en-US");
}

export default async function Home({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  const params = await searchParams;
  const category = params.category || "All";

  let prayers: Awaited<ReturnType<typeof getApprovedPrayers>> = [];
  let stats = { totalPrayers: 0, totalPrayed: 0, totalResponses: 0, answeredCount: 0 };

  try {
    [prayers, stats] = await Promise.all([
      getApprovedPrayers(category),
      getWallStats(),
    ]);
  } catch (e) {
    console.error(e);
  }

  return (
    <>
      {/* Hero */}
      <section className="max-w-6xl mx-auto px-4 pt-16 pb-10 text-center">
        <p className="text-xs font-medium tracking-widest text-gold-500 uppercase mb-4">Community Prayer Wall</p>
        <h1 className="font-serif text-4xl md:text-5xl font-semibold text-navy-700 leading-tight mb-4">
          You are not praying alone.
        </h1>
        <p className="text-navy-700/60 text-lg max-w-xl mx-auto mb-8">
          Thousands have brought their burdens here. Every prayer is seen. Every prayer is joined.
        </p>
        <Link
          href="/submit"
          className="inline-flex items-center gap-2 bg-gold-500 hover:bg-gold-600 text-white font-medium px-6 py-3 rounded-full transition-colors text-sm"
        >
          Submit Your Prayer
        </Link>
        <div className="mt-8 flex items-center justify-center gap-8 text-center flex-wrap">
          <div><p className="font-serif text-2xl font-semibold text-navy-700">{formatStat(stats.totalPrayers)}</p><p className="text-xs text-navy-700/50 mt-0.5">Prayer Needs</p></div>
          <div className="w-px h-8 bg-cream-200" />
          <div><p className="font-serif text-2xl font-semibold text-navy-700">{formatStat(stats.totalPrayed)}</p><p className="text-xs text-navy-700/50 mt-0.5">Amens</p></div>
          {stats.totalResponses > 0 && (
            <>
              <div className="w-px h-8 bg-cream-200" />
              <div><p className="font-serif text-2xl font-semibold text-navy-700">{formatStat(stats.totalResponses)}</p><p className="text-xs text-navy-700/50 mt-0.5">Words of Grace</p></div>
            </>
          )}
          {stats.answeredCount > 0 && (
            <>
              <div className="w-px h-8 bg-cream-200" />
              <div><p className="font-serif text-2xl font-semibold text-navy-700">{formatStat(stats.answeredCount)}</p><p className="text-xs text-navy-700/50 mt-0.5">Answered Prayers</p></div>
            </>
          )}
        </div>
      </section>

      {/* Category filter */}
      <section className="max-w-6xl mx-auto px-4 mb-8">
        <div className="flex flex-wrap gap-2 justify-center">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat}
              href={cat === "All" ? "/" : `/?category=${cat}`}
              className={`text-xs px-4 py-1.5 rounded-full border transition-colors ${
                category === cat
                  ? "bg-navy-700 text-white border-navy-700"
                  : "border-cream-200 text-navy-700/60 hover:border-gold-400 hover:text-gold-500"
              }`}
            >
              {cat}
            </Link>
          ))}
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 pb-16">
        {prayers.length > 0 ? (
          <PrayerGrid prayers={prayers} category={category} />
        ) : (
          <div className="text-center py-20 text-navy-700/40">
            <p className="font-serif text-xl">No prayers in this category yet.</p>
            <p className="text-sm mt-2">Be the first to share one.</p>
          </div>
        )}
      </section>
    </>
  );
}
