import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { useUserRoles } from "@/hooks/useUserRoles";
import { AttachmentUpload } from "./AttachmentUpload";
import { 
  FileText, 
  Image as ImageIcon, 
  Video, 
  Award, 
  FileSpreadsheet, 
  FileCheck, 
  Receipt, 
  Presentation, 
  File, 
  Download, 
  Trash2,  Loader2,
  Plus,
  ExternalLink
} from "lucide-react";
import { format } from "date-fns";
import type { Database } from "@/integrations/supabase/types";

type Attachment = Database["public"]["Tables"]["attachments"]["Row"];
type AttachmentOwnerType = Database["public"]["Enums"]["attachment_owner_type"];
type AttachmentCategory = Database["public"]["Enums"]["attachment_category"];

interface AttachmentsListProps {
  ownerType: AttachmentOwnerType;
  ownerId: string;
  title?: string;
  description?: string;
  allowedCategories?: AttachmentCategory[];
}

const categoryIcons: Record<AttachmentCategory, typeof FileText> = {
  document: FileText,
  image: ImageIcon,
  video: Video,
  certificate: Award,
  report: FileSpreadsheet,
  contract: FileCheck,
  invoice: Receipt,
  presentation: Presentation,
  other: File,
};

const categoryLabels: Record<AttachmentCategory, string> = {
  document: "Documento",
  image: "Imagen",
  video: "Video",
  certificate: "Certificado",
  report: "Informe",
  contract: "Contrato",
  invoice: "Factura",
  presentation: "Presentación",
  other: "Otro",
};

const categoryColors: Record<AttachmentCategory, string> = {
  document: "bg-muted text-muted-foreground",
  image: "bg-warning/10 text-warning",
  video: "bg-warning/10 text-warning",
  certificate: "bg-success/10 text-success",
  report: "bg-info/10 text-info",
  contract: "bg-primary/10 text-primary",
  invoice: "bg-info/10 text-info",
  presentation: "bg-primary/10 text-primary",
  other: "bg-muted text-muted-foreground",
};

export function AttachmentsList({
  ownerType,
  ownerId,
  title = "Archivos Adjuntos",
  description = "Documentos y archivos relacionados",
  allowedCategories,
}: AttachmentsListProps) {
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const { toast } = useToast();
  const { canWrite } = useUserRoles();

  const loadAttachments = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("attachments")
        .select("*")
        .eq("owner_type", ownerType)
        .eq("owner_id", ownerId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setAttachments(data || []);
    } catch (error) {
      console.error("Error loading attachments:", error);
      toast({
        title: "Error",
        description: "Error al cargar los archivos adjuntos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAttachments();
  }, [ownerType, ownerId]);

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de que quieres eliminar este archivo?")) return;

    try {
      const { error } = await supabase
        .from("attachments")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Éxito",
        description: "Archivo eliminado correctamente",
      });

      loadAttachments();
    } catch (error) {
      console.error("Error deleting attachment:", error);
      toast({
        title: "Error",
        description: "Error al eliminar el archivo",
        variant: "destructive",
      });
    }
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return "-";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {title}
              {attachments.length > 0 && (
                <span className="text-muted-foreground">({attachments.length})</span>
              )}
            </CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          {canWrite && (
            <Button
              size="sm"
              onClick={() => setUploadDialogOpen(true)}
            >
              <Plus className="mr-2 h-4 w-4" />
              Adjuntar Archivo
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : attachments.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No hay archivos adjuntos
          </div>
        ) : (
          <div className="space-y-3">
            {attachments.map((attachment) => {
              const Icon = categoryIcons[attachment.category];
              return (
                <div
                  key={attachment.id}
                  className="flex items-start justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start gap-3 flex-1">
                    <div className="mt-1">
                      <Icon className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium truncate">
                          {attachment.title || attachment.file_name}
                        </p>
                        <Badge className={categoryColors[attachment.category]}>
                          {categoryLabels[attachment.category]}
                        </Badge>
                        {attachment.is_public && (
                          <Badge variant="outline" className="text-xs">
                            Público
                          </Badge>
                        )}
                      </div>
                      {attachment.description && (
                        <p className="text-sm text-muted-foreground mb-1">
                          {attachment.description}
                        </p>
                      )}
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="truncate max-w-xs">{attachment.file_name}</span>
                        <span>{formatFileSize(attachment.file_size)}</span>
                        <span>{format(new Date(attachment.created_at), "dd/MM/yyyy")}</span>
                      </div>
                      {attachment.tags && attachment.tags.length > 0 && (
                        <div className="flex gap-1 mt-2">
                          {attachment.tags.map((tag, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(attachment.file_url, "_blank")}
                      title="Abrir archivo"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                    {canWrite && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(attachment.id)}
                        title="Eliminar archivo"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>

      <AttachmentUpload
        ownerType={ownerType}
        ownerId={ownerId}
        open={uploadDialogOpen}
        onOpenChange={setUploadDialogOpen}
        onSuccess={loadAttachments}
        allowedCategories={allowedCategories}
      />
    </Card>
  );
}
