import { useEffect, useRef } from "react";

interface AdProps {
  type: "leaderboard" | "mobile";
}

export function ExternalAd({ type }: AdProps) {
  const adContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!adContainerRef.current) return;
    
    // Only inject if not already injected
    if (adContainerRef.current.children.length > 0) return;

    (window as any).atOptions = type === "leaderboard" 
      ? {
          'key' : '133cf50e8f1be74b4a065e920d77913a',
          'format' : 'iframe',
          'height' : 90,
          'width' : 728,
          'params' : {}
        }
      : {
          'key' : '8021da7ff0a90da23cb32a3567dd7904',
          'format' : 'iframe',
          'height' : 50,
          'width' : 320,
          'params' : {}
        };

    const script = document.createElement("script");
    script.src = type === "leaderboard" 
      ? "https://www.highperformanceformat.com/133cf50e8f1be74b4a065e920d77913a/invoke.js"
      : "https://www.highperformanceformat.com/8021da7ff0a90da23cb32a3567dd7904/invoke.js";
    script.async = true;
    
    adContainerRef.current.appendChild(script);
  }, [type]);

  const containerClasses = type === "leaderboard" 
    ? "flex justify-center items-center overflow-hidden rounded-lg bg-transparent min-h-[90px] w-full max-w-[728px] mx-auto"
    : "flex justify-center items-center overflow-hidden rounded-lg bg-transparent min-h-[50px] w-full max-w-[320px] mx-auto";

  return (
    <div className={containerClasses}>
      <div ref={adContainerRef} className="w-full h-full flex justify-center items-center" />
    </div>
  );
}
