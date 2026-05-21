import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { Layout } from "@/components/layout";
import NotFound from "@/pages/not-found";

import Dashboard from "@/pages/dashboard";
import Tasks from "@/pages/tasks";
import Habits from "@/pages/habits";
import Reminders from "@/pages/reminders";
import Settings from "@/pages/settings";
import Landing from "@/pages/landing";
import Timer from "@/pages/timer";
import AIAnalyser from "@/pages/analytics";
import { AuthProvider } from "@/context/AuthContext";
import { useAuth } from "@/context/AuthContext";

const queryClient = new QueryClient();

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Landing} />
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/tasks" component={Tasks} />
        <Route path="/habits" component={Habits} />
        <Route path="/reminders" component={Reminders} />
        <Route path="/timer" component={Timer} />
        <Route path="/ai-analyser" component={AIAnalyser} />
        <Route path="/intelligence" component={AIAnalyser} />
        <Route path="/analytics" component={AIAnalyser} />
        <Route path="/settings" component={Settings} />
        <Route path="/landing" component={Landing} />
        <Route path="/about" component={Landing} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <AuthProvider>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
              <Router />
            </WouterRouter>
            <Toaster position="bottom-right" richColors closeButton />
          </TooltipProvider>
        </QueryClientProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
