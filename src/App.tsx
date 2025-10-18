import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Dashboard from "./pages/Dashboard";
import Auth from "./pages/Auth";
import FormatSelection from "./pages/FormatSelection";
import NoteEditor from "./pages/NoteEditor";
import Quiz from "./pages/Quiz";
import Pricing from "./pages/Pricing";
import Settings from "./pages/Settings";
import NoteHistory from "./pages/NoteHistory";
import Collaborate from "./pages/Collaborate";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/format-selection" element={<FormatSelection />} />
          <Route path="/note/:fileId" element={<NoteEditor />} />
          <Route path="/quiz/:fileId" element={<Quiz />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/history/:fileId" element={<NoteHistory />} />
          <Route path="/collaborate/:fileId" element={<Collaborate />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
