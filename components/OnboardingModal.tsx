"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const STORAGE_KEY = "ccf-onboarded";

const STEPS = [
  {
    emoji: "🕊",
    heading: "You are not praying alone.",
    body: "This is a place where burdens are carried together. Bring what's on your heart — others are already praying.",
  },
  {
    emoji: "🙏",
    heading: "Submit your prayer.",
    body: "Share what's on your heart. Every request is seen before it's shared — this is a safe space.\n\nWe pray in faith and trust, even when the answer looks different than we expect.",
  },
  {
    emoji: "✨",
    heading: "Pray for others.",
    body: "Tap 🙏 to quietly intercede for someone. Or open a prayer and leave a written prayer or a word of faith.",
  },
  {
    emoji: "🎵",
    heading: "Share a song or a reel.",
    body: "Sometimes a song or a scripture video is exactly what someone needs. If something moves you, share it on a prayer request — it may be God's answer.",
  },
];

export default function OnboardingModal() {
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState(0);
  const [sharing, setSharing] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!localStorage.getItem(STORAGE_KEY)) {
      setVisible(true);
    }
  }, []);

  const dismiss = () => {
    localStorage.setItem(STORAGE_KEY, "1");
    setVisible(false);
    router.push("/");
  };

  const handleShare = async () => {
    setSharing(true);
    try {
      if (navigator.share) {
        await navigator.share({
          title: "Prayer Wall",
          text: "Every answered prayer becomes a testimony. Come see what God is doing.",
          url: window.location.origin,
        });
      } else {
        await navigator.clipboard.writeText(window.location.origin);
        alert("Link copied to clipboard!");
      }
    } catch {}
    setSharing(false);
  };

  if (!visible) return null;

  const isFinal = step === STEPS.length;
  const current = STEPS[step];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-700/60 backdrop-blur-sm px-4">
      <div className="bg-white rounded-3xl w-full max-w-md p-8 flex flex-col items-center text-center shadow-xl">

        {!isFinal ? (
          <>
            <div className="text-5xl mb-6">{current.emoji}</div>
            <h2 className="font-serif text-2xl font-semibold text-navy-700 mb-4 leading-snug">
              {current.heading}
            </h2>
            <p className="text-navy-700/65 text-sm leading-relaxed whitespace-pre-line mb-8">
              {current.body}
            </p>

            {/* Progress dots */}
            <div className="flex gap-2 mb-8">
              {STEPS.map((_, i) => (
                <div
                  key={i}
                  className={`rounded-full transition-all duration-300 ${
                    i === step
                      ? "w-5 h-2 bg-gold-500"
                      : i < step
                      ? "w-2 h-2 bg-gold-300"
                      : "w-2 h-2 bg-cream-200"
                  }`}
                />
              ))}
            </div>

            <button
              onClick={() => setStep(step + 1)}
              className="w-full bg-gold-500 hover:bg-gold-600 text-white font-medium py-3 rounded-full text-sm transition-colors"
            >
              Next
            </button>
            <button
              onClick={dismiss}
              className="mt-3 text-xs text-navy-700/40 hover:text-navy-700/60 transition-colors"
            >
              Skip
            </button>
          </>
        ) : (
          <>
            <div className="text-5xl mb-6">✝️</div>
            <h2 className="font-serif text-2xl font-semibold text-navy-700 mb-4 leading-snug">
              Every answered prayer becomes a testimony.
            </h2>
            <p className="text-navy-700/65 text-sm leading-relaxed mb-8">
              Come and see what God is doing in this community.
            </p>

            <button
              onClick={dismiss}
              className="w-full bg-gold-500 hover:bg-gold-600 text-white font-medium py-3 rounded-full text-sm transition-colors"
            >
              Enter the Prayer Wall
            </button>
          </>
        )}
      </div>
    </div>
  );
}
