import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { AppLayout } from "@/components/layout/AppLayout";
import { SpeedInsights } from "@vercel/speed-insights/react";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Empresas from "./pages/Empresas";
import Contactos from "./pages/Contactos";
import Asesoramientos from "./pages/Asesoramientos";
import Eventos from "./pages/Eventos";
import Formaciones from "./pages/Formaciones";
import Evidencias from "./pages/Evidencias";
import Colaboradores from "./pages/Colaboradores";
import Actividades from "./pages/Actividades";
import Configuracion from "./pages/Configuracion";
import Integraciones from "./pages/Integraciones";
import StateTransitionsDemo from "./pages/StateTransitionsDemo";
import PlanesAccion from "./pages/PlanesAccion";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <SpeedInsights />
        <BrowserRouter>
          <Routes>
            <Route
              path="/auth"
              element={
                import.meta.env.VITE_LOCAL_MODE === "true" ? (
                  <Navigate to="/" replace />
                ) : (
                  <Auth />
                )
              }
            />
            <Route element={<AppLayout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/empresas" element={<Empresas />} />
              <Route path="/contactos" element={<Contactos />} />
              <Route path="/asesoramientos" element={<Asesoramientos />} />
              <Route path="/actividades" element={<Actividades />} />
              <Route path="/eventos" element={<Eventos />} />
              <Route path="/formaciones" element={<Formaciones />} />
              <Route path="/evidencias" element={<Evidencias />} />
              <Route path="/colaboradores" element={<Colaboradores />} />
              <Route path="/planes-accion" element={<PlanesAccion />} />
              <Route path="/configuracion" element={<Configuracion />} />
              <Route path="/integraciones" element={<Integraciones />} />
              <Route path="/demo-transiciones" element={<StateTransitionsDemo />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
