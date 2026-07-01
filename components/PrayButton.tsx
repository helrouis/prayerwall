"use client";
import { useState } from "react";

export default function PrayButton({ prayerId, initialCount }: { prayerId: string; initialCount: number }) {
  const [count, setCount] = useState(initialCount);
  const [state, setState] = useState<"idle" | "pending" | "done">("idle");

  const handlePray = async () => {
    if (state !== "idle") return;
    setState("pending");
    await new Promise((r) => setTimeout(r, 1000));
    setCount((c) => c + 1);
    setState("done");
    try {
      await fetch(`/api/prayers/${prayerId}/pray`, { method: "POST" });
    } catch {}
  };

  return (
    <div className="flex flex-col items-center gap-3 py-6">
      <button
        onClick={handlePray}
        disabled={state !== "idle"}
        className={`text-4xl transition-all duration-300 ${
          state === "pending" ? "animate-pulse scale-110" : ""
        } ${state === "done" ? "opacity-60" : "hover:scale-110 active:scale-95"}`}
      >
        🙏
      </button>
      <p className="text-sm font-medium text-navy-700">
        {state === "pending" ? "Praying…" : (
          <><span className="font-serif text-lg font-semibold">{count}</span> {count === 1 ? "Amen" : "Amens"}</>
        )}
      </p>
      {state === "idle" && (
        <p className="text-xs text-navy-700/45 text-center max-w-xs">
          If you've prayed for them and don't want to leave a comment, tap 🙏
        </p>
      )}
      {state === "done" && (
        <p className="text-xs text-emerald-600">Amen. Heaven hears it. 🙏</p>
      )}
    </div>
  );
}
