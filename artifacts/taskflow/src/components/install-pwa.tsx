import { useEffect, useState } from "react";
import { Download, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function InstallPWA() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener("beforeinstallprompt", handler);

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === "accepted") {
      toast.success("Infinity Focus installed successfully!");
      setIsInstallable(false);
    }
    setDeferredPrompt(null);
  };

  if (!isInstallable) return null;

  return (
    <Button 
      variant="outline" 
      size="sm" 
      onClick={handleInstall}
      className="w-full gap-2 rounded-xl border-primary/20 bg-primary/5 hover:bg-primary/10 text-primary font-bold text-xs shadow-sm group"
    >
      <Smartphone className="h-3.5 w-3.5 group-hover:animate-bounce" />
      Install App
    </Button>
  );
}
