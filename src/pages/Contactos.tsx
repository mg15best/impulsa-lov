import { useEffect, useState } from "react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useUserRoles } from "@/hooks/useUserRoles";
import { Plus, Search, Users, Loader2, Building2 } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import type { Database } from "@/integrations/supabase/types";

type Contacto = Database["public"]["Tables"]["contactos"]["Row"];
type Empresa = Database["public"]["Tables"]["empresas"]["Row"];

export default function Contactos() {
  const [contactos, setContactos] = useState<(Contacto & { empresa?: Empresa })[]>([]);
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterEmpresa, setFilterEmpresa] = useState<string>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const { canWrite } = useUserRoles();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [formData, setFormData] = useState({
    nombre: "",
    cargo: "",
    email: "",
    telefono: "",
    empresa_id: "",
    es_principal: false,
    notas: "",
  });

  const fetchData = async () => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    setLoading(true);

    // Fetch empresas for dropdown
    const { data: empresasData } = await supabase
      .from("empresas")
      .select("*")
      .order("nombre");
    setEmpresas(empresasData || []);

    // Fetch contactos
    let query = supabase
      .from("contactos")
      .select("*, empresa:empresas(*)")
      .order("nombre");

    if (filterEmpresa && filterEmpresa !== "all") {
      query = query.eq("empresa_id", filterEmpresa);
    }

    const { data, error } = await query;
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setContactos(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    // Check for empresa_id from URL params and set filter
    const empresaIdParam = searchParams.get("empresa_id");
    if (empresaIdParam) {
      setFilterEmpresa(empresaIdParam);
    }
  }, [searchParams]);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterEmpresa]);

  const filteredContactos = contactos.filter((c) =>
    c.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.empresa?.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !supabase) return;

    setSaving(true);
    const { error } = await supabase.from("contactos").insert({
      nombre: formData.nombre,
      cargo: formData.cargo || null,
      email: formData.email || null,
      telefono: formData.telefono || null,
      empresa_id: formData.empresa_id,
      es_principal: formData.es_principal,
      notas: formData.notas || null,
      created_by: user.id,
    });

    if (error) {
      toast({ title: "Error al crear contacto", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Contacto creado", description: "El contacto se ha registrado correctamente." });
      setDialogOpen(false);
      setFormData({
        nombre: "",
        cargo: "",
        email: "",
        telefono: "",
        empresa_id: "",
        es_principal: false,
        notas: "",
      });
      fetchData();
    }
    setSaving(false);
  };

  if (!supabase) {
    return (
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Contactos</h1>
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
          <h1 className="text-3xl font-bold tracking-tight">Contactos</h1>
          <p className="text-muted-foreground">
            Gestión de contactos de las empresas
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button disabled={!canWrite || empresas.length === 0}>
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Contacto
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Registrar Nuevo Contacto</DialogTitle>
              <DialogDescription>
                Añade un contacto a una empresa
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="empresa">Empresa *</Label>
                <Select
                  value={formData.empresa_id}
                  onValueChange={(v) => setFormData({ ...formData, empresa_id: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona una empresa" />
                  </SelectTrigger>
                  <SelectContent>
                    {empresas.map((empresa) => (
                      <SelectItem key={empresa.id} value={empresa.id}>
                        {empresa.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="nombre">Nombre *</Label>
                  <Input
                    id="nombre"
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cargo">Cargo</Label>
                  <Input
                    id="cargo"
                    value={formData.cargo}
                    onChange={(e) => setFormData({ ...formData, cargo: e.target.value })}
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
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="es_principal"
                  checked={formData.es_principal}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, es_principal: checked as boolean })
                  }
                />
                <Label htmlFor="es_principal" className="text-sm font-normal">
                  Es el contacto principal de la empresa
                </Label>
              </div>
              <div className="space-y-2">
                <Label htmlFor="notas">Notas</Label>
                <Textarea
                  id="notas"
                  value={formData.notas}
                  onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
                  rows={2}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={saving || !formData.empresa_id || !formData.nombre}>
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
          {empresas.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center space-y-4">
              <Building2 className="h-12 w-12 text-muted-foreground" />
              <div>
                <p className="text-lg font-semibold text-muted-foreground">
                  No hay empresas registradas
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Para gestionar contactos, primero debes registrar al menos una empresa
                </p>
              </div>
              <Button onClick={() => navigate("/empresas")}>
                <Building2 className="mr-2 h-4 w-4" />
                Ir a Empresas
              </Button>
            </div>
          ) : (
            <div className="flex flex-wrap gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por nombre, email o empresa..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
              <Select value={filterEmpresa} onValueChange={setFilterEmpresa}>
                <SelectTrigger className="w-[220px]">
                  <SelectValue placeholder="Filtrar por empresa" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las empresas</SelectItem>
                  {empresas.map((empresa) => (
                    <SelectItem key={empresa.id} value={empresa.id}>
                      {empresa.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tabla */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Listado de Contactos
          </CardTitle>
          <CardDescription>
            {filteredContactos.length} contactos encontrados
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredContactos.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Users className="mb-4 h-12 w-12 text-muted-foreground" />
              <p className="text-muted-foreground">No hay contactos registrados</p>
              <p className="text-sm text-muted-foreground">
                Añade el primer contacto usando el botón "Nuevo Contacto"
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Empresa</TableHead>
                  <TableHead>Cargo</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Teléfono</TableHead>
                  <TableHead>Principal</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredContactos.map((contacto) => (
                  <TableRow key={contacto.id} className="cursor-pointer hover:bg-muted/50">
                    <TableCell className="font-medium">{contacto.nombre}</TableCell>
                    <TableCell>{contacto.empresa?.nombre || "-"}</TableCell>
                    <TableCell>{contacto.cargo || "-"}</TableCell>
                    <TableCell>{contacto.email || "-"}</TableCell>
                    <TableCell>{contacto.telefono || "-"}</TableCell>
                    <TableCell>
                      {contacto.es_principal && (
                        <Badge className="bg-primary/10 text-primary">Principal</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
