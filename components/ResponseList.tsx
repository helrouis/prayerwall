import { PublicResponse } from "@/lib/prayers";

const LINK_STYLES: Record<string, string> = {
  facebook:  "bg-blue-50 text-blue-700 border-blue-200",
  instagram: "bg-pink-50 text-pink-700 border-pink-200",
  tiktok:    "bg-gray-50 text-gray-700 border-gray-200",
};

const LINK_LABELS: Record<string, string> = {
  facebook:  "Facebook",
  instagram: "Instagram",
  tiktok:    "TikTok",
};

function youTubeEmbedId(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname === "youtu.be") return u.pathname.slice(1).split("?")[0];
    if (u.hostname.includes("youtube.com")) {
      if (u.pathname.startsWith("/shorts/")) return u.pathname.split("/shorts/")[1].split("?")[0];
      return u.searchParams.get("v");
    }
  } catch {}
  return null;
}

function spotifyEmbedUrl(url: string): string | null {
  try {
    const u = new URL(url);
    if (!u.hostname.includes("spotify.com")) return null;
    return `https://open.spotify.com/embed${u.pathname}`;
  } catch {}
  return null;
}

function ResponseMedia({ platform, content }: { platform: string | null | undefined; content: string }) {
  if (platform === "youtube") {
    const videoId = youTubeEmbedId(content);
    if (videoId) {
      return (
        <div className="rounded-xl overflow-hidden aspect-video w-full">
          <iframe
            src={`https://www.youtube.com/embed/${videoId}`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full"
          />
        </div>
      );
    }
  }

  if (platform === "spotify") {
    const embedUrl = spotifyEmbedUrl(content);
    if (embedUrl) {
      return (
        <iframe
          src={embedUrl}
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          loading="lazy"
          className="w-full rounded-xl"
          height="152"
        />
      );
    }
  }

  const label = LINK_LABELS[platform || ""] || "Link";
  const style = LINK_STYLES[platform || ""] || "bg-gray-50 text-gray-700 border-gray-200";
  return (
    <a
      href={content}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border transition-opacity hover:opacity-80 ${style}`}
    >
      {label} →
    </a>
  );
}

export default function ResponseList({ responses }: { responses: PublicResponse[] }) {
  if (responses.length === 0) return null;

  return (
    <div className="mt-8">
      <p className="text-xs font-medium text-navy-700/50 uppercase tracking-wide mb-4">
        {responses.length} {responses.length === 1 ? "Response" : "Responses"}
      </p>
      <div className="space-y-3">
        {responses.map((r) => (
          <div key={r.id} className="bg-cream-50 rounded-xl border border-cream-200 p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-navy-700">{r.firstName}</span>
              <span className="text-xs text-navy-700/40">
                {new Date(r.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              </span>
            </div>
            {r.type === "comment" ? (
              <p className="text-sm text-navy-700/70 leading-relaxed">{r.content}</p>
            ) : (
              <ResponseMedia platform={r.platform} content={r.content} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
