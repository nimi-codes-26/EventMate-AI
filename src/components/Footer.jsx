import { motion } from "framer-motion";
import { Linkedin } from "lucide-react";

export default function Footer() {
  return (
    <motion.footer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8, delay: 0.3 }}
      className="relative border-t border-white/10 bg-gradient-to-r from-[#0B0F19]/50 via-[#111827]/40 to-[#0B0F19]/50 backdrop-blur-sm"
    >
      <div className="mx-auto max-w-[1600px] px-4 py-8 md:py-10">
        <div className="flex flex-col items-center justify-center gap-4 md:gap-6">
          {/* Name */}
          <p className="text-center text-sm font-medium text-white/70">
            Built by{" "}
            <span className="bg-gradient-to-r from-indigo-400 to-blue-400 bg-clip-text font-semibold text-transparent">
              Nimisha Sonare
            </span>
          </p>

          {/* LinkedIn Link */}
          <motion.a
            href="https://www.linkedin.com/in/nimisha-sonare/"
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 rounded-lg border border-white/20 px-4 py-2 text-white/60 transition-all duration-300 hover:border-indigo-500/50 hover:bg-indigo-500/10 hover:text-indigo-300"
          >
            <Linkedin size={16} />
            <span className="text-sm font-medium">Connect on LinkedIn</span>
          </motion.a>

          {/* Divider */}
          <div className="h-px w-12 bg-gradient-to-r from-transparent via-white/20 to-transparent" />

          {/* Copyright */}
          <p className="text-center text-xs text-white/40">
            © {new Date().getFullYear()} EventMate AI. All rights reserved.
          </p>
        </div>
      </div>
    </motion.footer>
  );
}
