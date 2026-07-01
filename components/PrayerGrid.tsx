"use client";
import { motion } from "framer-motion";
import PrayerCard from "./PrayerCard";

interface Prayer {
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
}

export default function PrayerGrid({ prayers, category }: { prayers: Prayer[]; category: string }) {
  return (
    <div className="columns-1 sm:columns-2 lg:columns-3 gap-4">
      {prayers.map((prayer, i) => (
        <motion.div
          key={`${category}-${prayer.id}`}
          className="mb-4 break-inside-avoid"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut", delay: i * 0.06 }}
        >
          <PrayerCard {...prayer} index={i} />
        </motion.div>
      ))}
    </div>
  );
}
