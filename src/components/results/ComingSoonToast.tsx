"use client";
import { motion, AnimatePresence } from "framer-motion";

export default function ComingSoonToast({ visible }: { visible: boolean }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 16, scale: 0.94 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 8, scale: 0.96 }}
          transition={{ duration: 0.22, ease: [0.34, 1.56, 0.64, 1] }}
          className="fixed bottom-24 left-1/2 z-50 -translate-x-1/2 flex items-center gap-2.5 px-5 py-3 rounded-full text-white text-[12px] font-bold"
          style={{
            background: "#1A1A1A",
            boxShadow: "0 8px 32px rgba(0,0,0,0.28)",
            whiteSpace: "nowrap",
          }}
        >
          <span style={{ fontSize: 15 }}>🚀</span>
          Coming soon
        </motion.div>
      )}
    </AnimatePresence>
  );
}
