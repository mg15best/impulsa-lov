import { Badge } from "@/components/ui/badge";
import { NavLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

const steps = [
  {
    id: 1,
    title: "Captación / Alta empresa",
    routes: ["/empresas", "/contactos", "/oportunidades", "/grants"],
    href: "/empresas",
  },
  {
    id: 2,
    title: "Asesoramiento",
    routes: ["/asesoramientos"],
    href: "/asesoramientos",
  },
  {
    id: 3,
    title: "Entregables",
    routes: ["/informes", "/planes-accion"],
    href: "/informes",
  },
  {
    id: 4,
    title: "Seguimiento",
    routes: ["/tareas", "/"],
    href: "/tareas",
  },
];

function getCurrentStepIndex(pathname: string) {
  const index = steps.findIndex((step) => step.routes.includes(pathname));
  return index === -1 ? 0 : index;
}

export function FlowJourneyBar() {
  const { pathname } = useLocation();
  const currentStepIndex = getCurrentStepIndex(pathname);

  return (
    <div className="hidden w-full items-center justify-between border-t bg-muted/20 px-4 py-2 md:flex">
      <div className="flex items-center gap-2">
        {steps.map((step, index) => {
          const isCurrent = index === currentStepIndex;
          const isCompleted = index < currentStepIndex;

          return (
            <div key={step.id} className="flex items-center gap-2">
              <NavLink
                to={step.href}
                className={cn(
                  "flex items-center gap-2 rounded-md px-2 py-1 text-xs transition-colors",
                  isCurrent && "bg-primary/10 text-primary font-medium",
                  isCompleted && "text-success",
                  !isCurrent && !isCompleted && "text-muted-foreground"
                )}
              >
                <Badge variant={isCurrent ? "default" : "secondary"}>{step.id}</Badge>
                <span>{step.title}</span>
              </NavLink>
              {index < steps.length - 1 && <span className="text-muted-foreground">→</span>}
            </div>
          );
        })}
      </div>
      <p className="text-xs text-muted-foreground">
        Automático: alta de empresa dispara tarea inicial de diagnóstico.
      </p>
    </div>
  );
}
