import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { AppLayout } from "@/components/layout/AppLayout";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Empresas from "./pages/Empresas";
import Contactos from "./pages/Contactos";
import Asesoramientos from "./pages/Asesoramientos";
import Eventos from "./pages/Eventos";
import Formaciones from "./pages/Formaciones";
import Evidencias from "./pages/Evidencias";
import Colaboradores from "./pages/Colaboradores";
import Configuracion from "./pages/Configuracion";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route element={<AppLayout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/empresas" element={<Empresas />} />
              <Route path="/contactos" element={<Contactos />} />
              <Route path="/asesoramientos" element={<Asesoramientos />} />
              <Route path="/eventos" element={<Eventos />} />
              <Route path="/formaciones" element={<Formaciones />} />
              <Route path="/evidencias" element={<Evidencias />} />
              <Route path="/colaboradores" element={<Colaboradores />} />
              <Route path="/configuracion" element={<Configuracion />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
