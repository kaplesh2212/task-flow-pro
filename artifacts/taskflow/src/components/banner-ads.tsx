import { motion } from "framer-motion"
import { ExternalLink, Info } from "lucide-react"

export function BannerAds() {
  return (
    <aside className="hidden xl:flex flex-col w-64 p-6 gap-6 border-l bg-card sticky top-0 h-screen overflow-y-auto shrink-0">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Sponsors</h2>
        <Info className="h-3.5 w-3.5 text-muted-foreground/50" />
      </div>

      <motion.div
        whileHover={{ scale: 1.02 }}
        className="group relative overflow-hidden rounded-2xl aspect-[4/5] bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg"
      >
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=400')] bg-cover bg-center mix-blend-overlay opacity-40 group-hover:scale-110 transition-transform duration-700" />
        <div className="relative h-full flex flex-col justify-end p-5">
          <span className="text-[10px] font-bold uppercase tracking-widest opacity-80 mb-1">Productivity App</span>
          <h3 className="font-bold text-lg leading-tight mb-2">Master Your Workflow</h3>
          <p className="text-xs opacity-90 line-clamp-2 mb-4">The ultimate companion for your Infinity Focus journey.</p>
          <button className="w-full py-2 bg-white text-indigo-600 rounded-xl text-xs font-bold flex items-center justify-center gap-2 group-hover:bg-indigo-50 transition-colors">
            Get Started
            <ExternalLink className="h-3 w-3" />
          </button>
        </div>
      </motion.div>

      <motion.div
        whileHover={{ scale: 1.02 }}
        className="group relative overflow-hidden rounded-2xl aspect-square bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg"
      >
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=400')] bg-cover bg-center mix-blend-overlay opacity-40 group-hover:scale-110 transition-transform duration-700" />
        <div className="relative h-full flex flex-col justify-end p-5">
          <span className="text-[10px] font-bold uppercase tracking-widest opacity-80 mb-1">Wellness</span>
          <h3 className="font-bold text-lg leading-tight mb-2">Zen Mode Pro</h3>
          <p className="text-xs opacity-90 line-clamp-2 mb-4">Meditation and focus music integrated.</p>
          <button className="w-full py-2 bg-white text-emerald-600 rounded-xl text-xs font-bold flex items-center justify-center gap-2 group-hover:bg-emerald-50 transition-colors">
            Try Now
            <ExternalLink className="h-3 w-3" />
          </button>
        </div>
      </motion.div>

      <div className="mt-auto pt-6 border-t">
        <p className="text-[10px] text-center text-muted-foreground">
          Interested in advertising here?
          <br />
          <a href="#" className="font-bold hover:text-primary transition-colors">Contact Sales</a>
        </p>
      </div>
    </aside>
  )
}
