
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import MemoryCapsuleLanding from "./pages/MemoryCapsuleLanding";
import CreateCapsule from "./pages/CreateCapsule";
import UnlockCapsule from "./pages/UnlockCapsule";
import CapsuleFeed from "./pages/CapsuleFeed";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          {/* MEMORY CAPSULE SUB-APP ROUTES */}
          <Route path="/memory-capsule" element={<MemoryCapsuleLanding />} />
          <Route path="/memory-capsule/create" element={<CreateCapsule />} />
          <Route path="/memory-capsule/unlock/:id" element={<UnlockCapsule />} />
          <Route path="/memory-capsule/feed" element={<CapsuleFeed />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
