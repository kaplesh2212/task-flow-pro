import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";

interface PerspectiveCardProps {
  children: React.ReactNode;
  className?: string;
  depth?: number;
}

export function PerspectiveCard({ children, className, depth = 75 }: PerspectiveCardProps) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["12.5deg", "-12.5deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-12.5deg", "12.5deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateY,
        rotateX,
        transformStyle: "preserve-3d",
      }}
      className={cn("relative group", className)}
    >
      <div 
        style={{ transform: `translateZ(${depth}px)`, transformStyle: "preserve-3d" }}
        className="h-full w-full"
      >
        {children}
      </div>
      {/* Glossy overlay effect */}
      <div 
        className="absolute inset-0 rounded-[inherit] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
        style={{
          background: "radial-gradient(circle at center, rgba(255,255,255,0.1) 0%, transparent 80%)",
          transform: "translateZ(100px)"
        }}
      />
    </motion.div>
  );
}
