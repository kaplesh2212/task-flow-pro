import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";

interface ReminderAlertProps {
  open: boolean;
  title: string;
  message?: string;
  onClose: () => void;
}

export function ReminderAlert({
  open,
  title,
  message,
  onClose,
}: ReminderAlertProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 backdrop-blur-md overflow-y-auto"
          style={{
            background:
              "radial-gradient(circle at center, rgba(244,63,94,0.25), rgba(0,0,0,0.85))",
          }}
        >
          <motion.div
            initial={{ scale: 0.6, opacity: 0, y: 40 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="relative w-full max-w-xl rounded-2xl sm:rounded-3xl border border-white/10 bg-gradient-to-br from-rose-500/95 via-orange-500/95 to-amber-500/95 p-6 sm:p-10 text-white shadow-2xl my-auto"
          >
            <button
              onClick={onClose}
              className="absolute right-4 top-4 rounded-full p-2 text-white/80 transition-colors hover:bg-white/10 hover:text-white"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex flex-col items-center text-center">
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.15, type: "spring", stiffness: 220 }}
                className="mb-4 sm:mb-6 rounded-full bg-white/15 p-4 sm:p-6 ring-4 ring-white/20"
              >
                <motion.div
                  animate={{ rotate: [0, -8, 8, -8, 8, 0] }}
                  transition={{
                    duration: 0.6,
                    repeat: Infinity,
                    repeatDelay: 1.4,
                  }}
                >
                  <AlertTriangle
                    className="h-12 w-12 sm:h-16 sm:w-16 text-white drop-shadow-lg"
                    strokeWidth={2.5}
                  />
                </motion.div>
              </motion.div>

              <motion.h2
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.25 }}
                className="mb-2 text-3xl sm:text-5xl font-black tracking-tight uppercase drop-shadow"
              >
                Reminder
              </motion.h2>

              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.35 }}
                className="mb-2 text-lg sm:text-2xl font-semibold text-white break-words max-w-full"
              >
                {title}
              </motion.p>

              {message && (
                <motion.p
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.45 }}
                  className="mb-4 sm:mb-6 max-w-md text-sm sm:text-base text-white/90 px-2"
                >
                  {message}
                </motion.p>
              )}

              <motion.div
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.55 }}
              >
                <Button
                  size="lg"
                  variant="secondary"
                  onClick={onClose}
                  className="mt-2 sm:mt-4 bg-white px-8 sm:px-10 text-base font-bold text-rose-600 hover:bg-white/90 min-h-[44px]"
                >
                  Got it!
                </Button>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
