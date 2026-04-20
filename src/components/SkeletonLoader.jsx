import { motion } from 'framer-motion';

export default function SkeletonLoader({ count = 3, type = 'card' }) {
    const array = Array.from({ length: count });

    // Hub or Event Glass Card Skeletons
    if (type === 'card') {
        return (
            <div className="card-grid w-full">
                {array.map((_, i) => (
                    <motion.div 
                        key={i} 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="card flex flex-col gap-4 border border-dashed border-white/10 opacity-70"
                    >
                        <div className="skeleton-box h-6 w-3/4 mb-1"></div>
                        <div className="skeleton-box h-4 w-1/2 mb-4"></div>
                        <div className="skeleton-box h-12 w-full mt-auto"></div>
                    </motion.div>
                ))}
            </div>
        );
    }
    
    // Thin inline list variants (for sidebar arrays etc)
    return (
        <div className="flex flex-col gap-3 w-full">
            {array.map((_, i) => (
                <div key={i} className="skeleton-box h-12 w-full opacity-60"></div>
            ))}
        </div>
    );
}
