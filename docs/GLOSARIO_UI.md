# Glosario EN→ES para UI (Labels en Español)

## Índice
1. [Introducción](#introducción)
2. [Glosario por Entidad](#glosario-por-entidad)
3. [Glosario de Campos Comunes](#glosario-de-campos-comunes)
4. [Glosario de Estados y Tipos](#glosario-de-estados-y-tipos)
5. [Glosario de Acciones](#glosario-de-acciones)
6. [Glosario de Mensajes](#glosario-de-mensajes)

## Introducción

Este documento proporciona el mapeo completo de términos en inglés (usados en el código y base de datos) a sus equivalentes en español (mostrados en la interfaz de usuario). Esto permite mantener el código en inglés mientras se presenta una experiencia completamente en español a los usuarios finales.

### Convenciones

- **Singular/Plural**: Se proporcionan ambas formas cuando son diferentes
- **Género**: Se indica (m) para masculino, (f) para femenino
- **Contexto**: Se añaden notas cuando un término puede tener múltiples traducciones según el contexto

## Glosario por Entidad

### Companies (Empresas)

| Campo EN | Label ES | Tipo | Placeholder/Ayuda |
|----------|----------|------|-------------------|
| `companies` | Empresas | - | - |
| `company` | Empresa | - | - |
| `id` | ID | - | Identificador único |
| `legal_name` | Nombre Legal | text | Nombre completo de la empresa |
| `trade_name` | Nombre Comercial | text | Nombre con el que opera |
| `tax_id` | CIF/NIF | text | Número de identificación fiscal |
| `sector_code` | Sector | select | Seleccione el sector principal |
| `subsector` | Subsector | text | Subsector específico |
| `maturity_phase` | Fase de Madurez | select | Fase actual de desarrollo |
| `status` | Estado | select | Estado del proceso |
| `description` | Descripción | textarea | Descripción general de la empresa |
| `address` | Dirección | text | Dirección física completa |
| `postal_code` | Código Postal | text | CP |
| `municipality` | Municipio | text | Ciudad o municipio |
| `island` | Isla | text | Isla (para ubicaciones insulares) |
| `phone` | Teléfono | tel | Teléfono de contacto |
| `email` | Email | email | Correo electrónico principal |
| `website` | Sitio Web | url | URL del sitio web |
| `social_networks` | Redes Sociales | json | Enlaces a redes sociales |
| `primary_contact` | Contacto Principal | text | Nombre del contacto principal |
| `legal_form` | Forma Jurídica | text | S.L., S.A., Autónomo, etc. |
| `incorporation_date` | Fecha de Constitución | date | Fecha de constitución legal |
| `pipeline_status_code` | Estado en Pipeline | select | Estado en el proceso de ventas |
| `lead_source_code` | Origen del Lead | select | De dónde proviene el contacto |
| `assigned_technician_id` | Técnico Asignado | select | Técnico responsable |
| `diagnostic_form_url` | URL Formulario Diagnóstico | url | Enlace al formulario |
| `diagnostic_received_date` | Fecha Recepción Diagnóstico | date | Cuándo se recibió |
| `diagnostic_summary` | Resumen del Diagnóstico | textarea | Resumen de hallazgos |
| `start_date` | Fecha de Inicio | date | Inicio del proyecto/asesoramiento |
| `end_date` | Fecha de Finalización | date | Finalización del proyecto |
| `closure_reason_code` | Motivo de Cierre | select | Razón del cierre |
| `is_success_case` | Caso de Éxito | checkbox | ¿Es un caso destacado? |
| `created_by` | Creado Por | - | Usuario que lo creó |
| `created_at` | Fecha de Creación | - | Cuándo se creó |
| `updated_at` | Última Actualización | - | Última modificación |

### Company Contacts (Contactos)

| Campo EN | Label ES | Tipo | Placeholder/Ayuda |
|----------|----------|------|-------------------|
| `company_contacts` | Contactos | - | - |
| `contact` | Contacto | - | - |
| `id` | ID | - | - |
| `company_id` | Empresa | select | Empresa asociada |
| `full_name` | Nombre Completo | text | Nombre y apellidos |
| `position` | Cargo | text | Puesto en la empresa |
| `email` | Email | email | Correo electrónico |
| `phone` | Teléfono | tel | Teléfono de contacto |
| `is_primary` | Contacto Principal | checkbox | ¿Es el contacto principal? |
| `notes` | Notas | textarea | Información adicional |
| `created_by` | Creado Por | - | - |
| `created_at` | Fecha de Creación | - | - |
| `updated_at` | Última Actualización | - | - |

### Consultations (Asesoramientos)

| Campo EN | Label ES | Tipo | Placeholder/Ayuda |
|----------|----------|------|-------------------|
| `consultations` | Asesoramientos | - | - |
| `consultation` | Asesoramiento | - | - |
| `id` | ID | - | - |
| `company_id` | Empresa | select | Empresa a asesorar |
| `consultant_id` | Consultor/Técnico | select | Técnico responsable |
| `date` | Fecha | date | Fecha del asesoramiento |
| `start_time` | Hora de Inicio | time | Hora de comienzo |
| `duration_minutes` | Duración (minutos) | number | Duración en minutos |
| `status` | Estado | select | Estado actual |
| `topic` | Tema | text | Tema principal del asesoramiento |
| `minutes` | Acta | textarea | Resumen de la reunión |
| `commitments` | Compromisos | textarea | Compromisos acordados |
| `next_steps` | Próximos Pasos | textarea | Acciones a seguir |
| `report_generated` | Informe Generado | checkbox | ¿Se generó informe? |
| `created_by` | Creado Por | - | - |
| `created_at` | Fecha de Creación | - | - |
| `updated_at` | Última Actualización | - | - |

### Events (Eventos)

| Campo EN | Label ES | Tipo | Placeholder/Ayuda |
|----------|----------|------|-------------------|
| `events` | Eventos | - | - |
| `event` | Evento | - | - |
| `id` | ID | - | - |
| `name` | Nombre | text | Nombre del evento |
| `type` | Tipo | select | Tipo de evento |
| `status` | Estado | select | Estado actual |
| `date` | Fecha | date | Fecha del evento |
| `start_time` | Hora de Inicio | time | Hora de comienzo |
| `duration_minutes` | Duración (minutos) | number | Duración estimada |
| `location` | Ubicación | text | Lugar donde se realizará |
| `description` | Descripción | textarea | Descripción del evento |
| `speakers` | Ponentes | textarea | Ponentes/facilitadores |
| `remarks` | Observaciones | textarea | Notas adicionales |
| `expected_attendees` | Asistentes Esperados | number | Número esperado |
| `confirmed_attendees` | Asistentes Confirmados | number | Número confirmado |
| `company_id` | Empresa Relacionada | select | Empresa asociada (opcional) |
| `created_by` | Creado Por | - | - |
| `created_at` | Fecha de Creación | - | - |
| `updated_at` | Última Actualización | - | - |

### Trainings (Formaciones)

| Campo EN | Label ES | Tipo | Placeholder/Ayuda |
|----------|----------|------|-------------------|
| `trainings` | Formaciones | - | - |
| `training` | Formación | - | - |
| `id` | ID | - | - |
| `title` | Título | text | Título de la formación |
| `type` | Tipo | select | Tipo de formación |
| `status` | Estado | select | Estado actual |
| `start_date` | Fecha de Inicio | date | Inicio de la formación |
| `end_date` | Fecha de Fin | date | Finalización |
| `duration_hours` | Duración (horas) | number | Horas totales |
| `instructor` | Formador/Instructor | text | Nombre del formador |
| `description` | Descripción | textarea | Descripción de la formación |
| `objectives` | Objetivos | textarea | Objetivos de aprendizaje |
| `content` | Contenido | textarea | Temario/programa |
| `materials` | Materiales | textarea | Materiales didácticos |
| `remarks` | Observaciones | textarea | Notas adicionales |
| `max_participants` | Participantes Máximo | number | Aforo máximo |
| `enrolled_participants` | Participantes Inscritos | number | Número de inscritos |
| `modality` | Modalidad | select | Presencial, online, híbrida |
| `location` | Ubicación | text | Lugar (si presencial) |
| `created_by` | Creado Por | - | - |
| `created_at` | Fecha de Creación | - | - |
| `updated_at` | Última Actualización | - | - |

### Attachments (Evidencias/Adjuntos)

| Campo EN | Label ES | Tipo | Placeholder/Ayuda |
|----------|----------|------|-------------------|
| `attachments` | Evidencias | - | - |
| `attachment` | Evidencia | - | - |
| `id` | ID | - | - |
| `title` | Título | text | Título de la evidencia |
| `type` | Tipo | select | Tipo de documento |
| `description` | Descripción | textarea | Descripción del documento |
| `date` | Fecha | date | Fecha de la evidencia |
| `file_url` | URL del Archivo | url | Enlace al archivo |
| `file_name` | Nombre del Archivo | text | Nombre del archivo |
| `remarks` | Observaciones | textarea | Notas adicionales |
| `company_id` | Empresa | select | Empresa relacionada |
| `event_id` | Evento | select | Evento relacionado |
| `training_id` | Formación | select | Formación relacionada |
| `consultation_id` | Asesoramiento | select | Asesoramiento relacionado |
| `created_by` | Creado Por | - | - |
| `created_at` | Fecha de Creación | - | - |
| `updated_at` | Última Actualización | - | - |

### Partner Entities (Colaboradores)

| Campo EN | Label ES | Tipo | Placeholder/Ayuda |
|----------|----------|------|-------------------|
| `partner_entities` | Colaboradores | - | - |
| `partner_entity` | Colaborador | - | - |
| `partner` | Colaborador | - | - |
| `id` | ID | - | - |
| `name` | Nombre | text | Nombre de la entidad |
| `type` | Tipo | select | Tipo de organización |
| `status` | Estado | select | Estado de la relación |
| `tax_id` | CIF/NIF | text | Identificación fiscal |
| `description` | Descripción | textarea | Descripción de la entidad |
| `address` | Dirección | text | Dirección física |
| `phone` | Teléfono | tel | Teléfono |
| `email` | Email | email | Correo electrónico |
| `website` | Sitio Web | url | URL del sitio web |
| `primary_contact_name` | Nombre de Contacto | text | Persona de contacto |
| `primary_contact_position` | Cargo de Contacto | text | Puesto del contacto |
| `primary_contact_email` | Email de Contacto | email | Email del contacto |
| `primary_contact_phone` | Teléfono de Contacto | tel | Teléfono del contacto |
| `partnership_start_date` | Fecha Inicio Colaboración | date | Primera colaboración |
| `partnership_scope` | Ámbito de Colaboración | textarea | Descripción del ámbito |
| `agreement_signed` | Convenio Firmado | checkbox | ¿Hay convenio firmado? |
| `scope_code` | Alcance | select | Local, regional, nacional |
| `sectors_of_interest` | Sectores de Interés | multi | Sectores relevantes |
| `support_types` | Tipos de Apoyo | multi | Tipos de apoyo ofrecido |
| `ticket_range_code` | Rango de Ticket | select | Rango de inversión |
| `usual_requirements` | Requisitos Habituales | textarea | Condiciones típicas |
| `assigned_to` | Asignado A | select | Responsable de la relación |
| `notes` | Observaciones | textarea | Notas adicionales |
| `created_by` | Creado Por | - | - |
| `created_at` | Fecha de Creación | - | - |
| `updated_at` | Última Actualización | - | - |

### User Profiles (Perfiles de Usuario)

| Campo EN | Label ES | Tipo | Placeholder/Ayuda |
|----------|----------|------|-------------------|
| `user_profiles` | Perfiles de Usuario | - | - |
| `user_profile` | Perfil de Usuario | - | - |
| `profile` | Perfil | - | - |
| `id` | ID | - | - |
| `email` | Email | email | Correo electrónico |
| `full_name` | Nombre Completo | text | Nombre y apellidos |
| `avatar_url` | Avatar | url | URL de la imagen |
| `created_at` | Fecha de Creación | - | - |
| `updated_at` | Última Actualización | - | - |

### User Roles (Roles de Usuario)

| Campo EN | Label ES | Tipo | Placeholder/Ayuda |
|----------|----------|------|-------------------|
| `user_roles` | Roles de Usuario | - | - |
| `user_role` | Rol de Usuario | - | - |
| `role` | Rol | - | - |
| `id` | ID | - | - |
| `user_id` | Usuario | select | Usuario |
| `role` | Rol | select | Rol asignado |
| `created_at` | Fecha de Asignación | - | - |

## Glosario de Campos Comunes

### Identificadores

| Campo EN | Label ES |
|----------|----------|
| `id` | ID / Identificador |
| `uuid` | UUID / Identificador Único |
| `code` | Código |
| `reference` | Referencia |

### Fechas y Tiempos

| Campo EN | Label ES |
|----------|----------|
| `date` | Fecha |
| `start_date` | Fecha de Inicio |
| `end_date` | Fecha de Fin |
| `start_time` | Hora de Inicio |
| `end_time` | Hora de Fin |
| `created_at` | Fecha de Creación |
| `updated_at` | Última Actualización |
| `deleted_at` | Fecha de Eliminación |
| `timestamp` | Marca de Tiempo |
| `year` | Año |
| `month` | Mes |
| `day` | Día |
| `hour` | Hora |
| `minute` | Minuto |
| `duration` | Duración |
| `duration_minutes` | Duración (minutos) |
| `duration_hours` | Duración (horas) |
| `duration_days` | Duración (días) |

### Información de Contacto

| Campo EN | Label ES |
|----------|----------|
| `name` | Nombre |
| `full_name` | Nombre Completo |
| `first_name` | Nombre |
| `last_name` | Apellidos |
| `email` | Email / Correo Electrónico |
| `phone` | Teléfono |
| `mobile` | Móvil |
| `fax` | Fax |
| `address` | Dirección |
| `street` | Calle |
| `city` | Ciudad |
| `municipality` | Municipio |
| `state` | Provincia / Estado |
| `postal_code` | Código Postal |
| `country` | País |
| `region` | Región |
| `island` | Isla |

### Información Web

| Campo EN | Label ES |
|----------|----------|
| `website` | Sitio Web |
| `url` | URL / Enlace |
| `social_networks` | Redes Sociales |
| `linkedin` | LinkedIn |
| `twitter` | Twitter |
| `facebook` | Facebook |
| `instagram` | Instagram |
| `youtube` | YouTube |

### Información de Archivos

| Campo EN | Label ES |
|----------|----------|
| `file` | Archivo |
| `file_name` | Nombre del Archivo |
| `file_url` | URL del Archivo |
| `file_path` | Ruta del Archivo |
| `file_size` | Tamaño del Archivo |
| `file_type` | Tipo de Archivo |
| `mime_type` | Tipo MIME |
| `attachment` | Adjunto |
| `document` | Documento |
| `image` | Imagen |
| `photo` | Fotografía |
| `video` | Video |
| `audio` | Audio |

### Estados y Flags

| Campo EN | Label ES |
|----------|----------|
| `status` | Estado |
| `state` | Estado |
| `active` | Activo |
| `inactive` | Inactivo |
| `enabled` | Habilitado |
| `disabled` | Deshabilitado |
| `is_active` | ¿Está activo? |
| `is_enabled` | ¿Está habilitado? |
| `is_primary` | ¿Es principal? |
| `is_default` | ¿Es por defecto? |
| `is_public` | ¿Es público? |
| `is_private` | ¿Es privado? |
| `is_success_case` | ¿Es caso de éxito? |

### Descripciones y Notas

| Campo EN | Label ES |
|----------|----------|
| `title` | Título |
| `description` | Descripción |
| `summary` | Resumen |
| `details` | Detalles |
| `notes` | Notas |
| `remarks` | Observaciones |
| `comments` | Comentarios |
| `observations` | Observaciones |
| `content` | Contenido |
| `body` | Cuerpo |
| `text` | Texto |
| `message` | Mensaje |

### Relaciones

| Campo EN | Label ES |
|----------|----------|
| `company_id` | Empresa |
| `user_id` | Usuario |
| `consultant_id` | Consultor |
| `technician_id` | Técnico |
| `assigned_to` | Asignado A |
| `assigned_by` | Asignado Por |
| `created_by` | Creado Por |
| `updated_by` | Actualizado Por |
| `owned_by` | Propietario |
| `parent_id` | Padre |
| `related_to` | Relacionado Con |

## Glosario de Estados y Tipos

### Company Status (Estado de Empresa)

| Valor EN | Label ES |
|----------|----------|
| `pending` | Pendiente |
| `in_progress` | En Proceso |
| `advised` | Asesorada |
| `completed` | Completada |

### Maturity Phase (Fase de Madurez)

| Valor EN | Label ES |
|----------|----------|
| `idea` | Idea |
| `validation` | Validación |
| `growth` | Crecimiento |
| `consolidation` | Consolidación |

### Sector Codes (Sectores)

| Valor EN | Label ES |
|----------|----------|
| `technology` | Tecnología |
| `industry` | Industria |
| `services` | Servicios |
| `commerce` | Comercio |
| `tourism` | Turismo |
| `energy` | Energía |
| `construction` | Construcción |
| `agrifood` | Agroalimentario |
| `other` | Otro |

### Consultation Status (Estado de Asesoramiento)

| Valor EN | Label ES |
|----------|----------|
| `scheduled` | Programado |
| `in_progress` | En Curso |
| `completed` | Completado |
| `cancelled` | Cancelado |

### Event Type (Tipo de Evento)

| Valor EN | Label ES |
|----------|----------|
| `workshop` | Taller |
| `seminar` | Seminario |
| `networking` | Networking |
| `conference` | Conferencia |
| `presentation` | Presentación |
| `other` | Otro |

### Event Status (Estado de Evento)

| Valor EN | Label ES |
|----------|----------|
| `planned` | Planificado |
| `confirmed` | Confirmado |
| `in_progress` | En Curso |
| `completed` | Completado |
| `cancelled` | Cancelado |

### Training Type (Tipo de Formación)

| Valor EN | Label ES |
|----------|----------|
| `training_pill` | Píldora Formativa |
| `course` | Curso |
| `masterclass` | Masterclass |
| `webinar` | Webinar |
| `other` | Otro |

### Training Status (Estado de Formación)

| Valor EN | Label ES |
|----------|----------|
| `planned` | Planificada |
| `in_progress` | En Curso |
| `completed` | Completada |
| `cancelled` | Cancelada |

### Attachment Type (Tipo de Evidencia)

| Valor EN | Label ES |
|----------|----------|
| `report` | Informe |
| `minutes` | Acta |
| `photo` | Fotografía |
| `video` | Video |
| `certificate` | Certificado |
| `document` | Documento |
| `other` | Otro |

### Partner Type (Tipo de Colaborador)

| Valor EN | Label ES |
|----------|----------|
| `public_entity` | Entidad Pública |
| `private_entity` | Entidad Privada |
| `association` | Asociación |
| `university` | Universidad |
| `research_center` | Centro de Investigación |
| `other` | Otro |

### Partner Status (Estado de Colaborador)

| Valor EN | Label ES |
|----------|----------|
| `active` | Activo |
| `inactive` | Inactivo |
| `pending` | Pendiente |

### User Roles (Roles de Usuario)

| Valor EN | Label ES |
|----------|----------|
| `admin` | Administrador |
| `technician` | Técnico |

### Modality (Modalidad)

| Valor EN | Label ES |
|----------|----------|
| `in_person` | Presencial |
| `online` | Online |
| `hybrid` | Híbrida |

## Glosario de Acciones

### CRUD Actions

| Acción EN | Label ES |
|-----------|----------|
| `create` | Crear |
| `read` | Ver |
| `update` | Actualizar |
| `delete` | Eliminar |
| `edit` | Editar |
| `view` | Ver |
| `list` | Listar |
| `search` | Buscar |
| `filter` | Filtrar |
| `sort` | Ordenar |
| `export` | Exportar |
| `import` | Importar |
| `download` | Descargar |
| `upload` | Subir |
| `save` | Guardar |
| `cancel` | Cancelar |
| `submit` | Enviar |
| `send` | Enviar |
| `close` | Cerrar |
| `open` | Abrir |
| `add` | Añadir |
| `remove` | Eliminar |
| `duplicate` | Duplicar |
| `copy` | Copiar |
| `paste` | Pegar |
| `cut` | Cortar |
| `undo` | Deshacer |
| `redo` | Rehacer |

### Botones y Enlaces

| Texto EN | Label ES |
|----------|----------|
| `New` | Nuevo |
| `New Company` | Nueva Empresa |
| `Add Contact` | Añadir Contacto |
| `Edit` | Editar |
| `Delete` | Eliminar |
| `Save` | Guardar |
| `Save Changes` | Guardar Cambios |
| `Cancel` | Cancelar |
| `Back` | Volver |
| `Next` | Siguiente |
| `Previous` | Anterior |
| `Continue` | Continuar |
| `Finish` | Finalizar |
| `Submit` | Enviar |
| `Reset` | Restablecer |
| `Clear` | Limpiar |
| `Apply` | Aplicar |
| `Confirm` | Confirmar |
| `Yes` | Sí |
| `No` | No |
| `OK` | Aceptar |
| `Close` | Cerrar |
| `View Details` | Ver Detalles |
| `Show More` | Mostrar Más |
| `Show Less` | Mostrar Menos |
| `Load More` | Cargar Más |
| `Refresh` | Actualizar |
| `Download` | Descargar |
| `Upload` | Subir |
| `Select` | Seleccionar |
| `Select All` | Seleccionar Todo |
| `Deselect All` | Deseleccionar Todo |
| `Search` | Buscar |
| `Filter` | Filtrar |
| `Sort` | Ordenar |
| `Export` | Exportar |
| `Print` | Imprimir |

## Glosario de Mensajes

### Mensajes de Éxito

| Mensaje EN | Mensaje ES |
|------------|------------|
| `Success` | Éxito |
| `Created successfully` | Creado correctamente |
| `Updated successfully` | Actualizado correctamente |
| `Deleted successfully` | Eliminado correctamente |
| `Saved successfully` | Guardado correctamente |
| `Changes saved` | Cambios guardados |
| `Operation completed` | Operación completada |
| `Data exported successfully` | Datos exportados correctamente |
| `File uploaded successfully` | Archivo subido correctamente |

### Mensajes de Error

| Mensaje EN | Mensaje ES |
|------------|------------|
| `Error` | Error |
| `An error occurred` | Ocurrió un error |
| `Failed to create` | Error al crear |
| `Failed to update` | Error al actualizar |
| `Failed to delete` | Error al eliminar |
| `Failed to save` | Error al guardar |
| `Failed to load` | Error al cargar |
| `Invalid data` | Datos inválidos |
| `Required field` | Campo requerido |
| `Field is required` | El campo es obligatorio |
| `Invalid email` | Email inválido |
| `Invalid phone` | Teléfono inválido |
| `Invalid URL` | URL inválida |
| `Invalid date` | Fecha inválida |
| `Value too short` | Valor demasiado corto |
| `Value too long` | Valor demasiado largo |
| `Value out of range` | Valor fuera de rango |
| `Duplicate entry` | Entrada duplicada |
| `Not found` | No encontrado |
| `Access denied` | Acceso denegado |
| `Unauthorized` | No autorizado |
| `Session expired` | Sesión expirada |
| `Network error` | Error de red |
| `Server error` | Error del servidor |

### Mensajes de Confirmación

| Mensaje EN | Mensaje ES |
|------------|------------|
| `Are you sure?` | ¿Está seguro? |
| `Confirm deletion` | Confirmar eliminación |
| `This action cannot be undone` | Esta acción no se puede deshacer |
| `Do you want to continue?` | ¿Desea continuar? |
| `Unsaved changes` | Cambios sin guardar |
| `You have unsaved changes. Do you want to leave?` | Tiene cambios sin guardar. ¿Desea salir? |
| `Confirm changes` | Confirmar cambios |

### Mensajes Informativos

| Mensaje EN | Mensaje ES |
|------------|------------|
| `Loading...` | Cargando... |
| `Please wait` | Por favor espere |
| `No data available` | No hay datos disponibles |
| `No results found` | No se encontraron resultados |
| `Empty list` | Lista vacía |
| `Search results` | Resultados de búsqueda |
| `Showing X of Y results` | Mostrando X de Y resultados |
| `Page X of Y` | Página X de Y |
| `Total: X items` | Total: X elementos |
| `Last updated: X` | Última actualización: X |
| `Created on: X` | Creado el: X |

### Placeholders

| Placeholder EN | Placeholder ES |
|----------------|----------------|
| `Enter name` | Introduzca el nombre |
| `Enter email` | Introduzca el email |
| `Enter phone` | Introduzca el teléfono |
| `Enter description` | Introduzca la descripción |
| `Select an option` | Seleccione una opción |
| `Search...` | Buscar... |
| `Type to search` | Escriba para buscar |
| `Select date` | Seleccione la fecha |
| `Select time` | Seleccione la hora |
| `Choose file` | Elegir archivo |
| `No file selected` | Ningún archivo seleccionado |
| `Optional` | Opcional |
| `Required` | Obligatorio |

## Notas de Implementación

### Uso en el Código

```typescript
// En componentes TypeScript/React
import { t } from '@/i18n';

const label = t('companies.legal_name'); // "Nombre Legal"
const placeholder = t('companies.legal_name.placeholder'); // "Nombre completo de la empresa"
```

### Estructura de Archivos i18n

```
src/
  i18n/
    es/
      companies.json
      consultations.json
      events.json
      trainings.json
      attachments.json
      partners.json
      common.json
      actions.json
      messages.json
    en/
      (mismas categorías)
```

### Formato JSON Recomendado

```json
{
  "companies": {
    "title": "Empresas",
    "singular": "Empresa",
    "fields": {
      "legal_name": {
        "label": "Nombre Legal",
        "placeholder": "Nombre completo de la empresa",
        "help": "Nombre legal registrado de la empresa"
      }
    }
  }
}
```

## Referencias

- [Mapeo de Entidades](./MAPEO_ENTIDADES.md)
- [Decisiones de Duplicidades](./DECISIONES_DUPLICIDADES.md)
- [Inventario de Catálogos](./INVENTARIO_CATALOGOS.md)
