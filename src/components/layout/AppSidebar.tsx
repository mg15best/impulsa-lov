import { 
  LayoutDashboard, 
  Building2, 
  Users, 
  ClipboardList, 
  Calendar, 
  GraduationCap,
  FileText,
  Handshake,
  Plug,
  Settings,
  LogOut,
  ChevronDown,
  Activity,
  ListChecks,
  ClipboardCheck
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";

const mainNavItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Empresas", url: "/empresas", icon: Building2 },
  { title: "Contactos", url: "/contactos", icon: Users },
  { title: "Asesoramientos", url: "/asesoramientos", icon: ClipboardList },
  { title: "Planes de Acción", url: "/planes-accion", icon: ListChecks },
  { title: "Informes", url: "/informes", icon: ClipboardCheck },
];

const activityNavItems = [
  { title: "Ver todo", url: "/actividades", icon: Activity },
  { title: "Eventos", url: "/eventos", icon: Calendar },
  { title: "Formaciones", url: "/formaciones", icon: GraduationCap },
  { title: "Evidencias", url: "/evidencias", icon: FileText },
  { title: "Colaboradores", url: "/colaboradores", icon: Handshake },
];

const systemNavItems = [
  { title: "Integraciones", url: "/integraciones", icon: Plug },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const navigate = useNavigate();
  const collapsed = state === "collapsed";

  const isActive = (path: string) => location.pathname === path;
  const isMainExpanded = mainNavItems.some((i) => isActive(i.url));
  const isActivityExpanded = activityNavItems.some((i) => isActive(i.url));

  const handleLogout = async () => {
    if (supabase) {
      await supabase.auth.signOut();
      navigate("/auth");
    }
  };

  return (
    <Sidebar collapsible="icon" className="border-r-0">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sidebar-primary">
            <Building2 className="h-5 w-5 text-sidebar-primary-foreground" />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-sidebar-foreground">FEMETE</span>
              <span className="text-xs text-sidebar-foreground/70">IMPULSA</span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/50">
            Principal
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.url)}
                    tooltip={item.title}
                  >
                    <NavLink to={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <Collapsible defaultOpen={isActivityExpanded} className="group/collapsible">
            <SidebarGroupLabel asChild className="text-sidebar-foreground/50">
              <CollapsibleTrigger className="flex w-full items-center justify-between">
                Actividades
                <ChevronDown className="h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-180" />
              </CollapsibleTrigger>
            </SidebarGroupLabel>
            <CollapsibleContent>
              <SidebarGroupContent>
                <SidebarMenu>
                  {activityNavItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive(item.url)}
                        tooltip={item.title}
                      >
                        <NavLink to={item.url}>
                          <item.icon className="h-4 w-4" />
                          <span>{item.title}</span>
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </CollapsibleContent>
          </Collapsible>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/50">
            Sistema
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {systemNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.url)}
                    tooltip={item.title}
                  >
                    <NavLink to={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

        <SidebarFooter className="p-2">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Configuración">
                <NavLink to="/configuracion">
                  <Settings className="h-4 w-4" />
                  <span>Configuración</span>
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
            {supabase && (
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={handleLogout}
                  tooltip="Cerrar sesión"
                  className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Cerrar sesión</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )}
          </SidebarMenu>
        </SidebarFooter>
    </Sidebar>
  );
}
