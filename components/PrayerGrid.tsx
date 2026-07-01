"use client";
import { motion, AnimatePresence } from "framer-motion";
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

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } },
};

export default function PrayerGrid({ prayers, category }: { prayers: Prayer[]; category: string }) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={category}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {prayers.map((prayer, i) => (
          <motion.div key={prayer.id} variants={item}>
            <PrayerCard {...prayer} index={i} />
          </motion.div>
        ))}
      </motion.div>
    </AnimatePresence>
  );
}
