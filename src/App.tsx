import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { AppLayout } from "@/components/layout/AppLayout";
import { SpeedInsights } from "@vercel/speed-insights/react";

const Auth = lazy(() => import("./pages/Auth"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Empresas = lazy(() => import("./pages/Empresas"));
const Contactos = lazy(() => import("./pages/Contactos"));
const Asesoramientos = lazy(() => import("./pages/Asesoramientos"));
const Eventos = lazy(() => import("./pages/Eventos"));
const Formaciones = lazy(() => import("./pages/Formaciones"));
const Evidencias = lazy(() => import("./pages/Evidencias"));
const Colaboradores = lazy(() => import("./pages/Colaboradores"));
const Actividades = lazy(() => import("./pages/Actividades"));
const Configuracion = lazy(() => import("./pages/Configuracion"));
const Integraciones = lazy(() => import("./pages/Integraciones"));
const StateTransitionsDemo = lazy(() => import("./pages/StateTransitionsDemo"));
const PlanesAccion = lazy(() => import("./pages/PlanesAccion"));
const Informes = lazy(() => import("./pages/Informes"));
const Oportunidades = lazy(() => import("./pages/Oportunidades"));
const Grants = lazy(() => import("./pages/Grants"));
const Materiales = lazy(() => import("./pages/Materiales"));
const ImpactosDifusion = lazy(() => import("./pages/ImpactosDifusion"));
const Tareas = lazy(() => import("./pages/Tareas"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <SpeedInsights />
        <BrowserRouter>
          <Suspense fallback={null}>
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
                <Route path="/informes" element={<Informes />} />
                <Route path="/oportunidades" element={<Oportunidades />} />
                <Route path="/grants" element={<Grants />} />
                <Route path="/materiales" element={<Materiales />} />
                <Route path="/impactos-difusion" element={<ImpactosDifusion />} />
                <Route path="/tareas" element={<Tareas />} />
                <Route path="/configuracion" element={<Configuracion />} />
                <Route path="/integraciones" element={<Integraciones />} />
                <Route path="/demo-transiciones" element={<StateTransitionsDemo />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
