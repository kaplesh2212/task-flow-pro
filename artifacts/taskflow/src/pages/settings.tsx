import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useTheme } from "next-themes";
import {
  Github,
  Twitter,
  Mail,
  HelpCircle,
  Volume2,
  Palette,
  User,
  ShieldAlert,
  BellRing,
  Zap,
  Sparkles,
  Smartphone,
  Cloud,
  History,
  Languages,
  Send,
  MessageSquare,
  CheckCircle2,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState, useRef } from "react";
import { getMuted, setMuted, sfx } from "@/lib/sfx";
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import { PerspectiveCard } from "@/components/perspective-card";
import { useAuth } from "@/context/AuthContext";
import { LogOut } from "lucide-react";
import { useLocation } from "wouter";

export default function Settings() {
  const { theme, setTheme } = useTheme();
  const [soundOn, setSoundOn] = useState(true);
  const [userName, setUserName] = useState(() => localStorage.getItem("Infinitodo_userName") || "Productive User");
  const [accentColor, setAccentColor] = useState("blue");
  const { user, logout } = useAuth();
  const [, setLocation] = useLocation();

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Logged out successfully");
      setLocation("/landing");
    } catch (err) {
      toast.error("Logout failed");
    }
  };

  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactSubject, setContactSubject] = useState("");
  const [contactMessage, setContactMessage] = useState("");
  const [contactSending, setContactSending] = useState(false);
  const [contactSent, setContactSent] = useState(false);

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName || !contactEmail || !contactMessage) {
      toast.error("Please fill all required fields");
      return;
    }
    setContactSending(true);
    try {
      const res = await fetch("https://formsubmit.co/ajax/kaplesh2212@gmail.com", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({
          name: contactName,
          email: contactEmail,
          message: contactMessage,
          _subject: contactSubject || "New Contact from Infinity Focus App",
          _template: "table",
          _captcha: "false"
        }),
      });
      const data = await res.json();
      if (data.success) {
        setContactSent(true);
        sfx.taskComplete();
        toast.success("Message sent successfully!");
        setTimeout(() => {
          setContactSent(false);
          setContactName("");
          setContactEmail("");
          setContactSubject("");
          setContactMessage("");
        }, 4000);
      } else {
        throw new Error("Failed");
      }
    } catch {
      toast.error("Failed to send message. Please try again.");
    } finally {
      setContactSending(false);
    }
  };

  useEffect(() => {
    setSoundOn(!getMuted());
  }, []);

  useEffect(() => {
    localStorage.setItem("Infinitodo_userName", userName);
  }, [userName]);

  const handleResetData = () => {
    toast.error("Are you sure?", {
      description: "This will permanently delete all your tasks and habits.",
      action: {
        label: "Reset",
        onClick: async () => {
          try {
            await fetch('/api/system/reset', { method: 'POST' });
            localStorage.clear();
            toast.success("System wiped successfully");
            setTimeout(() => window.location.reload(), 1000);
          } catch (e) {
            toast.error("Failed to reset system");
          }
        },
      },
    });
  };

  return (
    <div className="space-y-10 pb-20 max-w-4xl mx-auto">
      {/* Header with 3D feel */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative px-6 py-10 rounded-3xl overflow-hidden glass border-primary/20 shadow-2xl"
      >
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Sparkles className="w-32 h-32 text-primary animate-pulse" />
        </div>
        <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
          <PerspectiveCard className="shrink-0">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-white shadow-glow ring-4 ring-border/50 overflow-hidden relative group">
              <User className="w-12 h-12" aria-label="User Avatar" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-[10px] font-bold uppercase tracking-widest">
                Edit
              </div>
            </div>
          </PerspectiveCard>
          <div className="text-center md:text-left space-y-2">
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight bg-gradient-to-br from-foreground to-foreground/60 bg-clip-text text-transparent">
              Hello, {userName}
            </h1>
            <p className="text-muted-foreground font-medium italic">Command Center: Fine-tune your Infinitodo experience.</p>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Appearance Section */}
        <PerspectiveCard>
          <Card className="h-full border-primary/10 glass-primary hover:border-primary/30 transition-colors overflow-hidden">
            <CardHeader className="relative">
              <Palette className="absolute top-6 right-6 w-10 h-10 text-primary opacity-20" />
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                Aesthetics
              </CardTitle>
              <CardDescription>Visual preferences and themes.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="flex items-center justify-between p-3 rounded-xl bg-background/40 border border-border/50">
                <div className="space-y-0.5">
                  <Label className="text-sm font-bold">Dark Mode</Label>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-tight">System sync enabled</p>
                </div>
                <Switch
                  checked={theme === 'dark'}
                  onCheckedChange={(checked) => {
                    setTheme(checked ? 'dark' : 'light');
                    sfx.click();
                  }}
                />
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-bold">Accent Color</Label>
                <div className="flex gap-3">
                  {['blue', 'purple', 'emerald', 'orange'].map((color) => (
                    <button
                      key={color}
                      onClick={() => {
                        setAccentColor(color);
                        sfx.habitCheckIn();
                      }}
                      className={cn(
                        "w-8 h-8 rounded-full border-2 transition-all hover:scale-110",
                        accentColor === color ? "border-white ring-2 ring-primary" : "border-transparent",
                        color === 'blue' && "bg-blue-500",
                        color === 'purple' && "bg-purple-500",
                        color === 'emerald' && "bg-emerald-500",
                        color === 'orange' && "bg-orange-500"
                      )}
                    />
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </PerspectiveCard>

        {/* Notifications Section */}
        <PerspectiveCard>
          <Card className="h-full border-primary/10 glass hover:border-primary/30 transition-colors">
            <CardHeader className="relative">
              <BellRing className="absolute top-6 right-6 w-10 h-10 text-orange-500 opacity-20" />
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-orange-500" />
                Interactions
              </CardTitle>
              <CardDescription>How the app talks back to you.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="flex items-center justify-between p-3 rounded-xl bg-background/40 border border-border/50">
                <div className="space-y-0.5">
                  <Label className="text-sm font-bold">SFX & Chimes</Label>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-tight">Audio feedback</p>
                </div>
                <Switch
                  checked={soundOn}
                  onCheckedChange={(checked) => {
                    setSoundOn(checked);
                    setMuted(!checked);
                    if (checked) sfx.taskComplete();
                  }}
                />
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-bold">Notification Tone</Label>
                <Select defaultValue="premium">
                  <SelectTrigger className="bg-background/40 border-border/50">
                    <SelectValue placeholder="Select tone" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="premium">Crystal Clear</SelectItem>
                    <SelectItem value="minimal">Minimal Tick</SelectItem>
                    <SelectItem value="dramatic">Deep Pulse</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </PerspectiveCard>

        {/* Account Section */}
        <PerspectiveCard>
          <Card className="h-full border-primary/10 glass hover:border-primary/30 transition-colors">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5 text-emerald-500" />
                Identity
              </CardTitle>
              <CardDescription>Personalize your presence.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-3">
                <Label className="text-sm font-bold">Display Name</Label>
                <Input
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="bg-background/40 border-border/50 focus:ring-primary"
                />
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
                <div className="flex items-center gap-3">
                  <Cloud className="w-5 h-5 text-emerald-500" />
                  <div className="space-y-0.5">
                    <Label className="text-xs font-bold">Cloud Sync</Label>
                    <p className="text-[9px] text-emerald-600/70 font-bold uppercase tracking-widest">{user ? "Connected" : "Local"}</p>
                  </div>
                </div>
                {user ? (
                  <Button variant="ghost" size="sm" onClick={handleLogout} className="text-[10px] font-bold h-8 text-red-500 hover:text-red-600 hover:bg-red-500/10">
                    <LogOut className="w-3 h-3 mr-1.5" />
                    Logout
                  </Button>
                ) : (
                  <Button variant="ghost" size="sm" onClick={() => setLocation("/landing")} className="text-[10px] font-bold h-8">Login</Button>
                )}
              </div>
            </CardContent>
          </Card>
        </PerspectiveCard>

        {/* App Info Section */}
        <PerspectiveCard>
          <Card className="h-full border-primary/10 glass hover:border-primary/30 transition-colors">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-violet-500" />
                System
              </CardTitle>
              <CardDescription>App details and support.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="bg-primary/10 p-3 rounded-2xl">
                  <Smartphone className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-sm">Infinitodo v1.2.4</h3>
                  <p className="text-xs text-muted-foreground">Pro License · Perpetual</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <Button variant="outline" size="sm" className="h-10 p-0 hover:bg-primary/5 hover:text-primary">
                  <Github className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" className="h-10 p-0 hover:bg-[#1DA1F2]/5 hover:text-[#1DA1F2]">
                  <Twitter className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" className="h-10 p-0 hover:bg-red-500/5 hover:text-red-500">
                  <Mail className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </PerspectiveCard>
      </div>

      {/* Contact Us Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <Card className="border-primary/10 glass overflow-hidden relative">
          <div className="absolute -top-20 -right-20 w-60 h-60 bg-gradient-to-br from-cyan-500/10 via-blue-500/10 to-purple-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-gradient-to-tr from-purple-500/10 via-pink-500/10 to-orange-500/10 rounded-full blur-3xl pointer-events-none" />
          <CardHeader className="relative">
            <div className="absolute top-6 right-6 opacity-15 pointer-events-none">
              <MessageSquare className="w-12 h-12 text-cyan-500" />
            </div>
            <CardTitle className="flex items-center gap-2 text-lg">
              <div className="p-2 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/20">
                <Mail className="w-5 h-5 text-cyan-400" />
              </div>
              Contact Us
            </CardTitle>
            <CardDescription>Have a question, feedback, or need help? Drop us a message and we'll get back to you.</CardDescription>
          </CardHeader>
          <CardContent>
            <AnimatePresence mode="wait">
              {contactSent ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="flex flex-col items-center justify-center py-12 gap-4"
                >
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500/20 to-green-500/20 flex items-center justify-center border border-emerald-500/30">
                    <CheckCircle2 className="w-10 h-10 text-emerald-400" />
                  </div>
                  <h3 className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-green-400 bg-clip-text text-transparent">Message Sent!</h3>
                  <p className="text-sm text-muted-foreground text-center max-w-sm">Thank you for reaching out. We'll review your message and respond as soon as possible.</p>
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onSubmit={handleContactSubmit}
                  className="space-y-5"
                >

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Full Name <span className="text-red-400">*</span></Label>
                      <Input
                        id="contact-name"
                        name="name"
                        placeholder="John Doe"
                        value={contactName}
                        onChange={(e) => setContactName(e.target.value)}
                        className="bg-background/40 border-border/50 focus:ring-cyan-500/30 focus:border-cyan-500/50 transition-all"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Email Address <span className="text-red-400">*</span></Label>
                      <Input
                        id="contact-email"
                        name="email"
                        type="email"
                        placeholder="john@example.com"
                        value={contactEmail}
                        onChange={(e) => setContactEmail(e.target.value)}
                        className="bg-background/40 border-border/50 focus:ring-cyan-500/30 focus:border-cyan-500/50 transition-all"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Subject</Label>
                    <Select value={contactSubject} onValueChange={setContactSubject}>
                      <SelectTrigger className="bg-background/40 border-border/50">
                        <SelectValue placeholder="Select a topic" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="General Inquiry">General Inquiry</SelectItem>
                        <SelectItem value="Bug Report">Bug Report</SelectItem>
                        <SelectItem value="Feature Request">Feature Request</SelectItem>
                        <SelectItem value="Account Issue">Account Issue</SelectItem>
                        <SelectItem value="Feedback">Feedback</SelectItem>
                        <SelectItem value="Partnership">Partnership</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Message <span className="text-red-400">*</span></Label>
                    <Textarea
                      id="contact-message"
                      name="message"
                      placeholder="Tell us what's on your mind..."
                      value={contactMessage}
                      onChange={(e) => setContactMessage(e.target.value)}
                      rows={5}
                      className="bg-background/40 border-border/50 focus:ring-cyan-500/30 focus:border-cyan-500/50 transition-all resize-none"
                      required
                    />
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <p className="text-[10px] text-muted-foreground font-medium">
                      We typically respond within 24 hours.
                    </p>
                    <Button
                      type="submit"
                      disabled={contactSending}
                      className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 transition-all px-6 disabled:opacity-60"
                    >
                      {contactSending ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4 mr-2" />
                          Send Message
                        </>
                      )}
                    </Button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </motion.div>

      {/* Danger Zone */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
      >
        <Card className="border-destructive/20 bg-destructive/5 overflow-hidden relative">
          <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
            <ShieldAlert className="w-24 h-24 text-destructive" />
          </div>
          <CardHeader>
            <CardTitle className="text-destructive flex items-center gap-2">
              <ShieldAlert className="w-5 h-5" />
              Danger Zone
            </CardTitle>
            <CardDescription>Irreversible actions for your data.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col sm:flex-row gap-4">
            <Button
              variant="outline"
              className="flex-1 border-destructive/30 hover:bg-destructive/10 hover:text-destructive font-bold transition-all"
              onClick={handleResetData}
            >
              <History className="w-4 h-4 mr-2" />
              Reset All Data
            </Button>
            <Button
              variant="destructive"
              className="flex-1 font-bold shadow-lg shadow-destructive/20"
            >
              <Languages className="w-4 h-4 mr-2" />
              Manage Languages
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      {/* Footer Branding */}
      <div className="text-center space-y-4 py-10 opacity-40 hover:opacity-100 transition-opacity">
        <div className="flex items-center justify-center gap-2 font-black tracking-tighter text-2xl italic">
          <img src="/logo.png" className="w-6 h-6 rounded-lg" alt="Infinitodo App Brand Logo" />
          INFINITY FOCUS
        </div>
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
          Precision Built for Peak Performance © 2026
        </p>
      </div>
    </div>
  );
}
