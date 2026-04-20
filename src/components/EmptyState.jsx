import { motion } from 'framer-motion';

export default function EmptyState({ icon: Icon, title, desc, action }) {
    return (
        <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center p-12 lg:p-16 text-center rounded-2xl border border-dashed border-white/10 bg-white/[0.02] w-full col-span-full"
        >
            <div className="w-20 h-20 rounded-2xl bg-surface flex items-center justify-center text-muted mb-6 shadow-inner border border-white/5 relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-t from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <Icon size={36} className="text-primary/70" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
            <p className="text-muted text-[0.95rem] max-w-sm mx-auto mb-6 leading-relaxed">{desc}</p>
            {action && (
                <div className="mt-2">
                    {action}
                </div>
            )}
        </motion.div>
    );
}
