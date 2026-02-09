import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Upload, Loader2 } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type AttachmentOwnerType = Database["public"]["Enums"]["attachment_owner_type"];
type AttachmentCategory = Database["public"]["Enums"]["attachment_category"];

interface AttachmentUploadProps {
  ownerType: AttachmentOwnerType;
  ownerId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  allowedCategories?: AttachmentCategory[];
}

const initialFormData = {
  file_name: "",
  file_url: "",
  file_size: "",
  mime_type: "",
  title: "",
  description: "",
  category: "document" as AttachmentCategory,
  tags: "",
  is_public: false,
};

export function AttachmentUpload({
  ownerType,
  ownerId,
  open,
  onOpenChange,
  onSuccess,
}: AttachmentUploadProps) {
  const [formData, setFormData] = useState(initialFormData);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!formData.file_name || !formData.file_url) {
      toast({
        title: "Error",
        description: "El nombre del archivo y la URL son obligatorios",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      const tagsArray = formData.tags
        ? formData.tags.split(",").map((tag) => tag.trim()).filter((tag) => tag.length > 0)
        : null;

      const dataToSave = {
        owner_type: ownerType,
        owner_id: ownerId,
        file_name: formData.file_name,
        file_url: formData.file_url,
        file_size: formData.file_size ? parseInt(formData.file_size) : null,
        mime_type: formData.mime_type || null,
        title: formData.title || null,
        description: formData.description || null,
        category: formData.category,
        tags: tagsArray,
        is_public: formData.is_public,
        created_by: user?.id,
      };

      const { error } = await supabase
        .from("attachments")
        .insert([dataToSave]);

      if (error) throw error;

      toast({
        title: "Éxito",
        description: "Archivo adjuntado correctamente",
      });

      setFormData(initialFormData);
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      console.error("Error saving attachment:", error);
      const errorMessage = error instanceof Error ? error.message : "Error al guardar el archivo";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Adjuntar Archivo
          </DialogTitle>
          <DialogDescription>
            Añade un archivo o documento relacionado
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="file_name">Nombre del Archivo *</Label>
            <Input
              id="file_name"
              value={formData.file_name}
              onChange={(e) => handleInputChange("file_name", e.target.value)}
              placeholder="documento.pdf"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="file_url">URL del Archivo *</Label>
            <Input
              id="file_url"
              value={formData.file_url}
              onChange={(e) => handleInputChange("file_url", e.target.value)}
              placeholder="https://..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="file_size">Tamaño (bytes)</Label>
              <Input
                id="file_size"
                type="number"
                value={formData.file_size}
                onChange={(e) => handleInputChange("file_size", e.target.value)}
                placeholder="1024"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="mime_type">Tipo MIME</Label>
              <Input
                id="mime_type"
                value={formData.mime_type}
                onChange={(e) => handleInputChange("mime_type", e.target.value)}
                placeholder="application/pdf"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Título</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              placeholder="Título descriptivo del archivo"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Categoría</Label>
            <select
              id="category"
              value={formData.category}
              onChange={(e) => handleInputChange("category", e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="document">Documento</option>
              <option value="image">Imagen</option>
              <option value="video">Video</option>
              <option value="certificate">Certificado</option>
              <option value="report">Informe</option>
              <option value="contract">Contrato</option>
              <option value="invoice">Factura</option>
              <option value="presentation">Presentación</option>
              <option value="other">Otro</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Descripción del archivo"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags">Etiquetas (separadas por coma)</Label>
            <Input
              id="tags"
              value={formData.tags}
              onChange={(e) => handleInputChange("tags", e.target.value)}
              placeholder="etiqueta1, etiqueta2, etiqueta3"
            />
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="is_public"
              checked={formData.is_public}
              onChange={(e) => handleInputChange("is_public", e.target.checked)}
              className="h-4 w-4 rounded border-gray-300"
            />
            <Label htmlFor="is_public" className="cursor-pointer">
              Archivo público (accesible con enlace)
            </Label>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Guardar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
