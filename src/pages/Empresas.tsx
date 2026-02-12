import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useUserRoles } from "@/hooks/useUserRoles";
import { useDataLoader, useLocalSearch } from "@/hooks/useDataLoader";
import { PermissionButton } from "@/components/PermissionButton";
import { CatalogSelect } from "@/components/CatalogSelect";
import { Plus, Search, Building2, Filter, Loader2, Users, ClipboardList, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { Database } from "@/integrations/supabase/types";

type Empresa = Database["public"]["Tables"]["empresas"]["Row"];
type SectorEmpresa = Database["public"]["Enums"]["sector_empresa"];
type EstadoEmpresa = Database["public"]["Enums"]["estado_empresa"];
type FaseMadurez = Database["public"]["Enums"]["fase_madurez"];
type Json = Database["public"]["Tables"]["empresas"]["Row"]["redes_sociales"];

const sectorLabels: Record<SectorEmpresa, string> = {
  tecnologia: "Tecnología",
  industria: "Industria",
  servicios: "Servicios",
  comercio: "Comercio",
  turismo: "Turismo",
  energia: "Energía",
  construccion: "Construcción",
  agroalimentario: "Agroalimentario",
  otro: "Otro",
};

const estadoLabels: Record<EstadoEmpresa, string> = {
  pendiente: "Pendiente",
  en_proceso: "En proceso",
  asesorada: "Asesorada",
  completada: "Completada",
};

const faseLabels: Record<FaseMadurez, string> = {
  idea: "Idea",
  validacion: "Validación",
  crecimiento: "Crecimiento",
  consolidacion: "Consolidación",
};

const estadoColors: Record<EstadoEmpresa, string> = {
  pendiente: "bg-muted text-muted-foreground",
  en_proceso: "bg-warning/10 text-warning",
  asesorada: "bg-info/10 text-info",
  completada: "bg-success/10 text-success",
};

const legalFormFallbackEntries = [
  { code: "sl", label: "S.L. (Sociedad Limitada)" },
  { code: "sa", label: "S.A. (Sociedad Anónima)" },
  { code: "autonomo", label: "Autónomo" },
  { code: "cooperativa", label: "Cooperativa" },
  { code: "asociacion", label: "Asociación" },
  { code: "fundacion", label: "Fundación" },
  { code: "slp", label: "S.L.P. (Sociedad Limitada Profesional)" },
  { code: "cb", label: "C.B. (Comunidad de Bienes)" },
  { code: "slu", label: "S.L.U. (Sociedad Limitada Unipersonal)" },
  { code: "other", label: "Otra" },
];

const leadSourceFallbackEntries = [
  { code: "web", label: "Sitio Web" },
  { code: "referral", label: "Referido" },
  { code: "event", label: "Evento" },
  { code: "partner", label: "Socio/Partner" },
  { code: "direct", label: "Contacto Directo" },
  { code: "campaign", label: "Campaña" },
  { code: "social_media", label: "Redes Sociales" },
  { code: "other", label: "Otro" },
];

const pipelineStatusFallbackEntries = [
  { code: "lead", label: "Lead" },
  { code: "qualified", label: "Cualificado" },
  { code: "proposal", label: "Propuesta" },
  { code: "negotiation", label: "Negociación" },
  { code: "won", label: "Ganado" },
  { code: "lost", label: "Perdido" },
];

const initialFormData = {
  nombre: "",
  nombre_comercial: "",
  cif: "",
  forma_juridica: "",
  sector: "otro" as SectorEmpresa,
  subsector: "",
  fase_madurez: "idea" as FaseMadurez,
  estado: "pendiente" as EstadoEmpresa,
  descripcion: "",
  direccion: "",
  codigo_postal: "",
  municipio: "",
  isla: "",
  telefono: "",
  email: "",
  web: "",
  redes_sociales: null as Json | null,
  contacto_principal: "",
  fecha_constitucion: "",
  codigo_estado_pipeline: "",
  codigo_origen_lead: "",
  url_formulario_diagnostico: "",
  fecha_recepcion_diagnostico: "",
  resumen_diagnostico: "",
  fecha_inicio: "",
  fecha_finalizacion: "",
  codigo_motivo_cierre: "",
  es_caso_exito: false,
  // Compliance fields
  data_protection_consent: false,
  data_consent_date: "",
  image_rights_consent: false,
  image_consent_date: "",
};

export default function Empresas() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterSector, setFilterSector] = useState<string>("all");
  const [filterEstado, setFilterEstado] = useState<string>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedEmpresa, setSelectedEmpresa] = useState<Empresa | null>(null);
  const [relatedDialogOpen, setRelatedDialogOpen] = useState(false);
  const [contactosCount, setContactosCount] = useState(0);
  const [asesoramientosCount, setAsesoramientosCount] = useState(0);
  const { toast } = useToast();
  const { user } = useAuth();
  const { canWrite } = useUserRoles();
  const navigate = useNavigate();

  // Use the consolidated data loader hook
  const { data: empresas, loading, reload } = useDataLoader<Empresa>(
    "empresas",
    (query) => {
      let filteredQuery = query.order("created_at", { ascending: false });
      
      if (filterSector && filterSector !== "all") {
        filteredQuery = filteredQuery.eq("sector", filterSector as SectorEmpresa);
      }
      if (filterEstado && filterEstado !== "all") {
        filteredQuery = filteredQuery.eq("estado", filterEstado as EstadoEmpresa);
      }
      
      return filteredQuery;
    },
    [filterSector, filterEstado]
  );

  // Use local search hook for filtering
  const filteredEmpresas = useLocalSearch(
    empresas,
    searchTerm,
    (empresa, term) =>
      empresa.nombre.toLowerCase().includes(term) ||
      empresa.cif?.toLowerCase().includes(term)
  );

  const [formData, setFormData] = useState(initialFormData);

  const handleViewRelated = async (empresa: Empresa) => {
    if (!supabase) return;
    
    setSelectedEmpresa(empresa);
    
    // Fetch counts for contactos and asesoramientos in parallel
    const [contactosResult, asesoramientosResult] = await Promise.all([
      supabase
        .from("contactos")
        .select("*", { count: "exact", head: true })
        .eq("empresa_id", empresa.id),
      supabase
        .from("asesoramientos")
        .select("*", { count: "exact", head: true })
        .eq("empresa_id", empresa.id)
    ]);
    
    if (contactosResult.error) {
      toast({ title: "Error", description: "No se pudo obtener el conteo de contactos", variant: "destructive" });
      setContactosCount(0);
    } else {
      setContactosCount(contactosResult.count || 0);
    }
    
    if (asesoramientosResult.error) {
      toast({ title: "Error", description: "No se pudo obtener el conteo de asesoramientos", variant: "destructive" });
      setAsesoramientosCount(0);
    } else {
      setAsesoramientosCount(asesoramientosResult.count || 0);
    }
    
    setRelatedDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !supabase) return;

    // Validate compliance fields
    const {
      data_protection_consent,
      data_consent_date,
      image_rights_consent,
      image_consent_date,
    } = formData;

    // Validate required dates when consent is checked
    if (data_protection_consent && !data_consent_date) {
      toast({ 
        title: "Error de validación", 
        description: "Debe proporcionar la fecha de consentimiento de protección de datos.", 
        variant: "destructive" 
      });
      return;
    }

    if (image_rights_consent && !image_consent_date) {
      toast({ 
        title: "Error de validación", 
        description: "Debe proporcionar la fecha de consentimiento de derechos de imagen.", 
        variant: "destructive" 
      });
      return;
    }

    // Validate dates are not in the future
    const today = new Date().toISOString().split('T')[0];
    
    if (data_consent_date && data_consent_date > today) {
      toast({ 
        title: "Error de validación", 
        description: "La fecha de consentimiento de protección de datos no puede ser futura.", 
        variant: "destructive" 
      });
      return;
    }

    if (image_consent_date && image_consent_date > today) {
      toast({ 
        title: "Error de validación", 
        description: "La fecha de consentimiento de derechos de imagen no puede ser futura.", 
        variant: "destructive" 
      });
      return;
    }

    setSaving(true);
    
    // Separate compliance fields from company data
    const {
      data_protection_consent: _dpc,
      data_consent_date: _dcd,
      image_rights_consent: _irc,
      image_consent_date: _icd,
      ...companyData
    } = formData;
    
    const normalizeOptional = (value: string) => {
      const trimmedValue = value.trim();
      return trimmedValue.length > 0 ? trimmedValue : null;
    };

    // Insert company
    const { data: newCompany, error: companyError } = await supabase
      .from("empresas")
      .insert({
        ...companyData,
        nombre_comercial: normalizeOptional(companyData.nombre_comercial),
        cif: normalizeOptional(companyData.cif),
        forma_juridica: normalizeOptional(companyData.forma_juridica),
        subsector: normalizeOptional(companyData.subsector),
        descripcion: normalizeOptional(companyData.descripcion),
        direccion: normalizeOptional(companyData.direccion),
        codigo_postal: normalizeOptional(companyData.codigo_postal),
        municipio: normalizeOptional(companyData.municipio),
        isla: normalizeOptional(companyData.isla),
        telefono: normalizeOptional(companyData.telefono),
        email: normalizeOptional(companyData.email),
        web: normalizeOptional(companyData.web),
        contacto_principal: normalizeOptional(companyData.contacto_principal),
        fecha_constitucion: normalizeOptional(companyData.fecha_constitucion),
        codigo_estado_pipeline: normalizeOptional(companyData.codigo_estado_pipeline),
        codigo_origen_lead: normalizeOptional(companyData.codigo_origen_lead),
        url_formulario_diagnostico: normalizeOptional(companyData.url_formulario_diagnostico),
        fecha_recepcion_diagnostico: normalizeOptional(companyData.fecha_recepcion_diagnostico),
        resumen_diagnostico: normalizeOptional(companyData.resumen_diagnostico),
        fecha_inicio: normalizeOptional(companyData.fecha_inicio),
        fecha_finalizacion: normalizeOptional(companyData.fecha_finalizacion),
        codigo_motivo_cierre: normalizeOptional(companyData.codigo_motivo_cierre),
        created_by: user.id,
      })
      .select()
      .single();

    if (companyError) {
      toast({ title: "Error al crear empresa", description: companyError.message, variant: "destructive" });
      setSaving(false);
      return;
    }
    
    const hasComplianceData =
      data_protection_consent ||
      image_rights_consent ||
      Boolean(data_consent_date) ||
      Boolean(image_consent_date);

    if (hasComplianceData) {
      const { error: complianceError } = await supabase
        .from("company_compliance")
        .insert({
          company_id: newCompany.id,
          data_protection_consent,
          data_consent_date: data_consent_date || null,
          image_rights_consent,
          image_consent_date: image_consent_date || null,
          created_by: user.id,
        });

      if (complianceError) {
        console.error("Error creating compliance record:", {
          error: complianceError,
          companyId: newCompany.id,
          userId: user.id,
          companyName: companyData.nombre,
          timestamp: new Date().toISOString(),
        });

        toast({
          title: "Empresa creada con advertencia",
          description:
            "La empresa se guardó, pero no se pudieron registrar los consentimientos. Contacte al administrador si necesita guardarlos.",
          variant: "destructive",
        });
      }
    }
    
    // Success
    toast({ title: "Empresa creada", description: "La empresa se ha registrado correctamente." });
    setDialogOpen(false);
    setFormData(initialFormData);
    reload();
    setSaving(false);
  };

  if (!supabase) {
    return (
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Empresas</h1>
        <p className="text-muted-foreground">
          Configura Supabase para habilitar esta vista.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Empresas</h1>
          <p className="text-muted-foreground">
            Gestión de empresas emergentes del proyecto
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <PermissionButton action="create">
              <Plus className="mr-2 h-4 w-4" />
              Nueva Empresa
            </PermissionButton>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Registrar Nueva Empresa</DialogTitle>
              <DialogDescription>
                Completa los datos de la empresa emergente
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="nombre">Nombre Legal *</Label>
                  <Input
                    id="nombre"
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nombre_comercial">Nombre Comercial</Label>
                  <Input
                    id="nombre_comercial"
                    value={formData.nombre_comercial}
                    onChange={(e) => setFormData({ ...formData, nombre_comercial: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="cif">CIF</Label>
                  <Input
                    id="cif"
                    value={formData.cif}
                    onChange={(e) => setFormData({ ...formData, cif: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="forma_juridica">Forma Jurídica</Label>
                  <CatalogSelect
                    catalogType="legal_forms"
                    value={formData.forma_juridica}
                    onValueChange={(v) => setFormData({ ...formData, forma_juridica: v })}
                    placeholder="Seleccionar forma jurídica"
                    fallbackEntries={legalFormFallbackEntries}
                  />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="sector">Sector</Label>
                  <Select
                    value={formData.sector}
                    onValueChange={(v) => setFormData({ ...formData, sector: v as SectorEmpresa })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(sectorLabels).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subsector">Subsector</Label>
                  <Input
                    id="subsector"
                    value={formData.subsector}
                    onChange={(e) => setFormData({ ...formData, subsector: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="fase">Fase de Madurez</Label>
                  <Select
                    value={formData.fase_madurez}
                    onValueChange={(v) => setFormData({ ...formData, fase_madurez: v as FaseMadurez })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(faseLabels).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fecha_constitucion">Fecha de Constitución</Label>
                  <Input
                    id="fecha_constitucion"
                    type="date"
                    value={formData.fecha_constitucion}
                    onChange={(e) => setFormData({ ...formData, fecha_constitucion: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="telefono">Teléfono</Label>
                  <Input
                    id="telefono"
                    value={formData.telefono}
                    onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="direccion">Dirección</Label>
                <Input
                  id="direccion"
                  value={formData.direccion}
                  onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="codigo_postal">Código Postal</Label>
                  <Input
                    id="codigo_postal"
                    value={formData.codigo_postal}
                    onChange={(e) => setFormData({ ...formData, codigo_postal: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="municipio">Municipio</Label>
                  <Input
                    id="municipio"
                    value={formData.municipio}
                    onChange={(e) => setFormData({ ...formData, municipio: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="isla">Isla</Label>
                  <Input
                    id="isla"
                    value={formData.isla}
                    onChange={(e) => setFormData({ ...formData, isla: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="web">Sitio Web</Label>
                  <Input
                    id="web"
                    type="url"
                    placeholder="https://..."
                    value={formData.web}
                    onChange={(e) => setFormData({ ...formData, web: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="codigo_origen_lead">Origen del Lead</Label>
                  <CatalogSelect
                    catalogType="lead_sources"
                    value={formData.codigo_origen_lead}
                    onValueChange={(v) => setFormData({ ...formData, codigo_origen_lead: v })}
                    placeholder="Seleccionar origen"
                    fallbackEntries={leadSourceFallbackEntries}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="contacto_principal">Contacto Principal</Label>
                <Input
                  id="contacto_principal"
                  value={formData.contacto_principal}
                  onChange={(e) => setFormData({ ...formData, contacto_principal: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="descripcion">Descripción</Label>
                <Textarea
                  id="descripcion"
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  rows={3}
                />
              </div>
              
              {/* Compliance Section - Consentimientos */}
              <div className="space-y-4 rounded-lg border p-4 bg-muted/50">
                <h3 className="font-semibold text-sm">Consentimientos</h3>
                <div className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <input
                        id="data_protection_consent"
                        type="checkbox"
                        checked={formData.data_protection_consent}
                        onChange={(e) => setFormData({ ...formData, data_protection_consent: e.target.checked })}
                        className="h-4 w-4 rounded border-gray-300"
                      />
                      <Label htmlFor="data_protection_consent" className="cursor-pointer">
                        Consentimiento de Protección de Datos
                      </Label>
                    </div>
                    <div className="space-y-2 ml-6">
                      <Label htmlFor="data_consent_date">
                        Fecha de Consentimiento de Datos
                        {formData.data_protection_consent && <span className="text-destructive ml-1">*</span>}
                      </Label>
                      <Input
                        id="data_consent_date"
                        type="date"
                        value={formData.data_consent_date}
                        onChange={(e) => setFormData({ ...formData, data_consent_date: e.target.value })}
                        disabled={!formData.data_protection_consent}
                        required={formData.data_protection_consent}
                      />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <input
                        id="image_rights_consent"
                        type="checkbox"
                        checked={formData.image_rights_consent}
                        onChange={(e) => setFormData({ ...formData, image_rights_consent: e.target.checked })}
                        className="h-4 w-4 rounded border-gray-300"
                      />
                      <Label htmlFor="image_rights_consent" className="cursor-pointer">
                        Consentimiento de Derechos de Imagen
                      </Label>
                    </div>
                    <div className="space-y-2 ml-6">
                      <Label htmlFor="image_consent_date">
                        Fecha de Consentimiento de Imagen
                        {formData.image_rights_consent && <span className="text-destructive ml-1">*</span>}
                      </Label>
                      <Input
                        id="image_consent_date"
                        type="date"
                        value={formData.image_consent_date}
                        onChange={(e) => setFormData({ ...formData, image_consent_date: e.target.value })}
                        disabled={!formData.image_rights_consent}
                        required={formData.image_rights_consent}
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Advanced Fields Section */}
              <details className="space-y-4 rounded-lg border p-4">
                <summary className="cursor-pointer font-semibold text-sm">
                  Campos Avanzados (Opcional)
                </summary>
                <div className="mt-4 space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="codigo_estado_pipeline">Estado Pipeline</Label>
                      <CatalogSelect
                        catalogType="pipeline_statuses"
                        value={formData.codigo_estado_pipeline}
                        onValueChange={(v) => setFormData({ ...formData, codigo_estado_pipeline: v })}
                        placeholder="Seleccionar estado"
                        fallbackEntries={pipelineStatusFallbackEntries}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="fecha_inicio">Fecha de Inicio</Label>
                      <Input
                        id="fecha_inicio"
                        type="date"
                        value={formData.fecha_inicio}
                        onChange={(e) => setFormData({ ...formData, fecha_inicio: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="fecha_finalizacion">Fecha de Finalización</Label>
                      <Input
                        id="fecha_finalizacion"
                        type="date"
                        value={formData.fecha_finalizacion}
                        onChange={(e) => setFormData({ ...formData, fecha_finalizacion: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="codigo_motivo_cierre">Motivo de Cierre</Label>
                      <CatalogSelect
                        catalogType="close_reasons"
                        value={formData.codigo_motivo_cierre}
                        onValueChange={(v) => setFormData({ ...formData, codigo_motivo_cierre: v })}
                        placeholder="Seleccionar motivo"
                      />
                    </div>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="url_formulario_diagnostico">URL Formulario Diagnóstico</Label>
                      <Input
                        id="url_formulario_diagnostico"
                        type="url"
                        placeholder="https://..."
                        value={formData.url_formulario_diagnostico}
                        onChange={(e) => setFormData({ ...formData, url_formulario_diagnostico: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="fecha_recepcion_diagnostico">Fecha Recepción Diagnóstico</Label>
                      <Input
                        id="fecha_recepcion_diagnostico"
                        type="date"
                        value={formData.fecha_recepcion_diagnostico}
                        onChange={(e) => setFormData({ ...formData, fecha_recepcion_diagnostico: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="resumen_diagnostico">Resumen Diagnóstico</Label>
                    <Textarea
                      id="resumen_diagnostico"
                      value={formData.resumen_diagnostico}
                      onChange={(e) => setFormData({ ...formData, resumen_diagnostico: e.target.value })}
                      rows={3}
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      id="es_caso_exito"
                      type="checkbox"
                      checked={formData.es_caso_exito}
                      onChange={(e) => setFormData({ ...formData, es_caso_exito: e.target.checked })}
                      className="h-4 w-4 rounded border-gray-300"
                    />
                    <Label htmlFor="es_caso_exito" className="cursor-pointer">
                      Marcar como Caso de Éxito
                    </Label>
                  </div>
                </div>
              </details>
              
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Guardar
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nombre o CIF..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <Select value={filterSector} onValueChange={setFilterSector}>
              <SelectTrigger className="w-[180px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Sector" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los sectores</SelectItem>
                {Object.entries(sectorLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterEstado} onValueChange={setFilterEstado}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                {Object.entries(estadoLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tabla de Empresas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Listado de Empresas
          </CardTitle>
          <CardDescription>
            {filteredEmpresas.length} empresas encontradas
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredEmpresas.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Building2 className="mb-4 h-12 w-12 text-muted-foreground" />
              <p className="text-muted-foreground">No hay empresas registradas</p>
              <p className="text-sm text-muted-foreground">
                Crea la primera empresa usando el botón "Nueva Empresa"
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>CIF</TableHead>
                  <TableHead>Municipio</TableHead>
                  <TableHead>Sector</TableHead>
                  <TableHead>Fase</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Contacto</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEmpresas.map((empresa) => (
                  <TableRow 
                    key={empresa.id} 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleViewRelated(empresa)}
                  >
                    <TableCell className="font-medium">
                      <div>{empresa.nombre}</div>
                      {empresa.nombre_comercial && (
                        <div className="text-xs text-muted-foreground">{empresa.nombre_comercial}</div>
                      )}
                    </TableCell>
                    <TableCell>{empresa.cif || "-"}</TableCell>
                    <TableCell>{empresa.municipio || "-"}</TableCell>
                    <TableCell>
                      <div>{sectorLabels[empresa.sector]}</div>
                      {empresa.subsector && (
                        <div className="text-xs text-muted-foreground">{empresa.subsector}</div>
                      )}
                    </TableCell>
                    <TableCell>{faseLabels[empresa.fase_madurez]}</TableCell>
                    <TableCell>
                      <Badge className={estadoColors[empresa.estado]}>
                        {estadoLabels[empresa.estado]}
                      </Badge>
                    </TableCell>
                    <TableCell>{empresa.contacto_principal || empresa.email || "-"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Dialog de entidades relacionadas */}
      <Dialog open={relatedDialogOpen} onOpenChange={setRelatedDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Entidades Relacionadas</DialogTitle>
            <DialogDescription>
              {selectedEmpresa?.nombre}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Card className="cursor-pointer hover:bg-muted/50" onClick={() => {
              setRelatedDialogOpen(false);
              navigate(`/contactos?empresa_id=${selectedEmpresa?.id}`);
            }}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Users className="h-8 w-8 text-primary" />
                    <div>
                      <p className="font-semibold">Contactos</p>
                      <p className="text-sm text-muted-foreground">
                        {contactosCount} {contactosCount === 1 ? "contacto" : "contactos"}
                      </p>
                    </div>
                  </div>
                  <ExternalLink className="h-4 w-4 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="cursor-pointer hover:bg-muted/50" onClick={() => {
              setRelatedDialogOpen(false);
              navigate(`/asesoramientos?empresa_id=${selectedEmpresa?.id}`);
            }}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <ClipboardList className="h-8 w-8 text-primary" />
                    <div>
                      <p className="font-semibold">Asesoramientos</p>
                      <p className="text-sm text-muted-foreground">
                        {asesoramientosCount} {asesoramientosCount === 1 ? "asesoramiento" : "asesoramientos"}
                      </p>
                    </div>
                  </div>
                  <ExternalLink className="h-4 w-4 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
