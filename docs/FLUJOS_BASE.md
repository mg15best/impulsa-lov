# Flujos Base y Dependencias - Impulsa LOV

## Índice
1. [Introducción](#introducción)
2. [Flujo de Creación de Empresa](#flujo-de-creación-de-empresa)
3. [Flujo de Creación de Contacto](#flujo-de-creación-de-contacto)
4. [Flujo de Creación de Asesoramiento](#flujo-de-creación-de-asesoramiento)
5. [Flujo de Creación de Evento](#flujo-de-creación-de-evento)
6. [Flujo de Creación de Formación](#flujo-de-creación-de-formación)
7. [Flujo de Creación de Evidencia](#flujo-de-creación-de-evidencia)
8. [Flujo de Creación de Colaborador](#flujo-de-creación-de-colaborador)
9. [Matriz de Dependencias](#matriz-de-dependencias)

## Introducción

Este documento describe los flujos de creación de cada entidad del sistema, incluyendo prerrequisitos, validaciones y dependencias. Cada flujo asegura la integridad de los datos y el cumplimiento de las reglas de negocio.

## Flujo de Creación de Empresa

### Prerrequisitos
1. Usuario autenticado en el sistema
2. Usuario debe tener permisos de lectura/escritura en empresas
3. No se requieren otras entidades previas

### Datos Obligatorios
- `nombre`: Nombre legal de la empresa (no vacío)
- `sector`: Código de sector (valor ENUM válido)
- `fase_madurez`: Fase de madurez (valor ENUM válido)

### Datos Opcionales Recomendados
- `cif`: Identificación fiscal (único en el sistema)
- `nombre_comercial`: Nombre comercial
- `email`: Correo electrónico de contacto
- `telefono`: Teléfono de contacto
- `tecnico_asignado_id`: Técnico responsable
- `contacto_principal`: Nombre del contacto principal

### Validaciones
1. **CIF único**: Si se proporciona CIF, debe ser único en el sistema
2. **Sector válido**: Debe ser uno de los valores del ENUM `sector_empresa`
3. **Fase de madurez válida**: Debe ser uno de los valores del ENUM `fase_madurez`
4. **Técnico existente**: Si se asigna un técnico, el usuario debe existir
5. **Email válido**: Si se proporciona, debe tener formato de email válido

### Flujo de Creación
```
1. Usuario accede al formulario de nueva empresa
2. Sistema presenta campos del formulario
3. Usuario completa información obligatoria y opcional
4. Usuario envía el formulario
5. Sistema valida los datos:
   - Campos obligatorios completos
   - CIF único (si se proporciona)
   - Valores ENUM válidos
   - Técnico existe (si se proporciona)
6. Sistema crea registro con:
   - Estado inicial: 'pendiente'
   - created_by: Usuario actual
   - created_at: Fecha/hora actual
   - updated_at: Fecha/hora actual
7. Sistema confirma creación exitosa
8. Sistema redirige a vista de detalle o listado
```

### Estados Iniciales
- `estado`: 'pendiente' (por defecto)
- `es_caso_exito`: false (por defecto)

### Dependencias Post-Creación
Una vez creada una empresa, se pueden crear:
- **Contactos**: Asociados a esta empresa
- **Asesoramientos**: Para esta empresa
- **Eventos**: Relacionados con esta empresa (opcional)
- **Evidencias**: Relacionadas con esta empresa (opcional)

### Errores Comunes
- **CIF duplicado**: Mensaje "Ya existe una empresa con este CIF"
- **Técnico no encontrado**: Mensaje "El técnico seleccionado no existe"
- **Sector inválido**: Mensaje "Sector no válido"

---

## Flujo de Creación de Contacto

### Prerrequisitos
1. Usuario autenticado en el sistema
2. **OBLIGATORIO**: Debe existir al menos una Empresa en el sistema
3. Usuario debe tener permisos de lectura/escritura en contactos

### Datos Obligatorios
- `empresa_id`: ID de la empresa a la que pertenece el contacto
- `nombre`: Nombre completo del contacto (no vacío)

### Datos Opcionales Recomendados
- `cargo`: Posición o cargo
- `email`: Correo electrónico
- `telefono`: Teléfono de contacto
- `es_principal`: Indicador de contacto principal (por defecto: false)
- `notas`: Información adicional

### Validaciones
1. **Empresa existente**: La empresa_id debe corresponder a una empresa válida
2. **Email válido**: Si se proporciona, debe tener formato válido
3. **Unicidad de contacto principal**: Se recomienda (no obligatorio) que solo haya un contacto principal por empresa

### Flujo de Creación
```
1. Usuario selecciona una empresa existente
2. Usuario accede al formulario de nuevo contacto
3. Sistema precarga empresa_id seleccionada
4. Usuario completa información del contacto
5. Usuario envía el formulario
6. Sistema valida los datos:
   - empresa_id corresponde a empresa existente
   - Nombre no vacío
   - Email válido (si se proporciona)
7. Si es_principal = true, sistema recomienda revisar otros contactos
8. Sistema crea registro con:
   - empresa_id: Empresa seleccionada
   - created_by: Usuario actual
   - created_at: Fecha/hora actual
   - updated_at: Fecha/hora actual
9. Sistema confirma creación exitosa
10. Sistema actualiza la vista de contactos de la empresa
```

### Estados Iniciales
- `es_principal`: false (por defecto)

### Dependencias
- **Depende de**: Empresa (obligatorio)

### Errores Comunes
- **Empresa no encontrada**: Mensaje "La empresa seleccionada no existe"
- **Email inválido**: Mensaje "Formato de email no válido"
- **Nombre vacío**: Mensaje "El nombre del contacto es obligatorio"

---

## Flujo de Creación de Asesoramiento

### Prerrequisitos
1. Usuario autenticado en el sistema
2. **OBLIGATORIO**: Debe existir al menos una Empresa
3. **OBLIGATORIO**: Debe existir al menos un Usuario técnico
4. Usuario debe tener permisos para crear asesoramientos

### Datos Obligatorios
- `empresa_id`: ID de la empresa a asesorar
- `tecnico_id`: ID del técnico que realizará el asesoramiento
- `fecha`: Fecha del asesoramiento

### Datos Opcionales Recomendados
- `hora_inicio`: Hora de inicio
- `duracion_minutos`: Duración (por defecto: 60 minutos)
- `tema`: Tema del asesoramiento
- `estado`: Estado (por defecto: 'programado')

### Datos de Seguimiento (completados posteriormente)
- `acta`: Acta de la reunión
- `compromisos`: Compromisos acordados
- `proximos_pasos`: Próximos pasos
- `informe_generado`: Indica si se generó informe

### Validaciones
1. **Empresa existente**: La empresa_id debe corresponder a una empresa válida
2. **Técnico existente**: El tecnico_id debe corresponder a un usuario válido
3. **Fecha válida**: La fecha debe ser válida (se permite programar en el pasado o futuro)
4. **Estado válido**: Debe ser uno de los valores del ENUM `estado_asesoramiento`

### Flujo de Creación
```
1. Usuario selecciona una empresa existente
2. Usuario accede al formulario de nuevo asesoramiento
3. Sistema precarga empresa_id seleccionada
4. Usuario selecciona técnico responsable
5. Usuario establece fecha y hora
6. Usuario define tema y duración
7. Usuario envía el formulario
8. Sistema valida los datos:
   - empresa_id corresponde a empresa existente
   - tecnico_id corresponde a usuario existente
   - Fecha válida
   - Estado válido
9. Sistema crea registro con:
   - Estado inicial: 'programado'
   - duracion_minutos: 60 (si no se especifica)
   - informe_generado: false
   - created_by: Usuario actual
   - created_at: Fecha/hora actual
   - updated_at: Fecha/hora actual
10. Sistema confirma creación exitosa
11. Sistema actualiza calendario/agenda
```

### Estados Iniciales
- `estado`: 'programado' (por defecto)
- `duracion_minutos`: 60 (por defecto)
- `informe_generado`: false (por defecto)

### Dependencias
- **Depende de**: Empresa (obligatorio)
- **Depende de**: Usuario/Técnico (obligatorio)

### Flujo Post-Asesoramiento
Después de realizar el asesoramiento, el usuario puede:
1. Cambiar estado a 'en_curso' o 'completado'
2. Completar acta, compromisos y próximos pasos
3. Marcar informe_generado como true
4. Crear Evidencias relacionadas con este asesoramiento

### Errores Comunes
- **Empresa no encontrada**: Mensaje "La empresa seleccionada no existe"
- **Técnico no encontrado**: Mensaje "El técnico seleccionado no existe"
- **Fecha inválida**: Mensaje "La fecha proporcionada no es válida"

---

## Flujo de Creación de Evento

### Prerrequisitos
1. Usuario autenticado en el sistema
2. Usuario debe tener permisos para crear eventos
3. No se requieren otras entidades previas (empresa_id es opcional)

### Datos Obligatorios
- `nombre`: Nombre del evento (no vacío)
- `tipo`: Tipo de evento (valor ENUM válido)

### Datos Opcionales Recomendados
- `estado`: Estado (por defecto: 'planificado')
- `fecha`: Fecha del evento
- `hora_inicio`: Hora de inicio
- `duracion_minutos`: Duración (por defecto: 120 minutos)
- `ubicacion`: Lugar del evento
- `descripcion`: Descripción detallada
- `ponentes`: Ponentes o facilitadores
- `asistentes_esperados`: Número esperado de asistentes
- `empresa_id`: Empresa relacionada (opcional)

### Validaciones
1. **Tipo válido**: Debe ser uno de los valores del ENUM `tipo_evento`
2. **Estado válido**: Debe ser uno de los valores del ENUM `estado_evento`
3. **Empresa existente**: Si se proporciona empresa_id, debe ser válida
4. **Asistentes**: asistentes_confirmados no debe exceder asistentes_esperados

### Flujo de Creación
```
1. Usuario accede al formulario de nuevo evento
2. Sistema presenta campos del formulario
3. Usuario completa información del evento
4. Usuario opcionalmente relaciona con una empresa
5. Usuario envía el formulario
6. Sistema valida los datos:
   - Nombre no vacío
   - Tipo de evento válido
   - Estado válido
   - Empresa existe (si se proporciona)
7. Sistema crea registro con:
   - Estado inicial: 'planificado'
   - duracion_minutos: 120 (si no se especifica)
   - asistentes_confirmados: 0
   - created_by: Usuario actual
   - created_at: Fecha/hora actual
   - updated_at: Fecha/hora actual
8. Sistema confirma creación exitosa
9. Sistema actualiza calendario de eventos
```

### Estados Iniciales
- `estado`: 'planificado' (por defecto)
- `duracion_minutos`: 120 (por defecto)
- `asistentes_confirmados`: 0 (por defecto)

### Dependencias
- **Depende de**: Ninguna entidad obligatoria
- **Relación opcional con**: Empresa

### Flujo Post-Evento
Después de crear el evento:
1. Actualizar estado según avance (confirmado → en_curso → completado)
2. Actualizar número de asistentes confirmados
3. Crear Evidencias relacionadas con el evento

### Errores Comunes
- **Tipo inválido**: Mensaje "Tipo de evento no válido"
- **Empresa no encontrada**: Mensaje "La empresa relacionada no existe"
- **Nombre vacío**: Mensaje "El nombre del evento es obligatorio"

---

## Flujo de Creación de Formación

### Prerrequisitos
1. Usuario autenticado en el sistema
2. Usuario debe tener permisos para crear formaciones
3. No se requieren otras entidades previas

### Datos Obligatorios
- `titulo`: Título de la formación (no vacío)
- `tipo`: Tipo de formación (valor ENUM válido)

### Datos Opcionales Recomendados
- `estado`: Estado (por defecto: 'planificada')
- `fecha_inicio`: Fecha de inicio
- `fecha_fin`: Fecha de finalización
- `duracion_horas`: Duración en horas
- `formador`: Nombre del formador/instructor
- `descripcion`: Descripción de la formación
- `objetivos`: Objetivos de aprendizaje
- `contenido`: Contenido del programa
- `participantes_max`: Número máximo de participantes
- `modalidad`: Modalidad (presencial, online, hibrida)
- `ubicacion`: Ubicación (si es presencial)
- `materiales`: Materiales didácticos

### Validaciones
1. **Tipo válido**: Debe ser uno de los valores del ENUM `tipo_formacion`
2. **Estado válido**: Debe ser uno de los valores del ENUM `estado_formacion`
3. **Fechas coherentes**: fecha_fin debe ser posterior a fecha_inicio
4. **Participantes**: participantes_inscritos no debe exceder participantes_max

### Flujo de Creación
```
1. Usuario accede al formulario de nueva formación
2. Sistema presenta campos del formulario
3. Usuario completa información de la formación
4. Usuario define modalidad y ubicación
5. Usuario envía el formulario
6. Sistema valida los datos:
   - Título no vacío
   - Tipo de formación válido
   - Estado válido
   - Fechas coherentes (si ambas están presentes)
7. Sistema crea registro con:
   - Estado inicial: 'planificada'
   - participantes_inscritos: 0
   - created_by: Usuario actual
   - created_at: Fecha/hora actual
   - updated_at: Fecha/hora actual
8. Sistema confirma creación exitosa
9. Sistema actualiza catálogo de formaciones
```

### Estados Iniciales
- `estado`: 'planificada' (por defecto)
- `participantes_inscritos`: 0 (por defecto)

### Dependencias
- **Depende de**: Ninguna entidad obligatoria

### Flujo Post-Formación
Después de crear la formación:
1. Actualizar estado según avance (en_curso → completada)
2. Actualizar número de participantes inscritos
3. Crear Evidencias relacionadas con la formación (materiales, certificados)

### Errores Comunes
- **Tipo inválido**: Mensaje "Tipo de formación no válido"
- **Fechas incoherentes**: Mensaje "La fecha de fin debe ser posterior a la fecha de inicio"
- **Título vacío**: Mensaje "El título de la formación es obligatorio"

---

## Flujo de Creación de Evidencia

### Prerrequisitos
1. Usuario autenticado en el sistema
2. Usuario debe tener permisos para crear evidencias
3. No se requieren otras entidades previas (todas las relaciones son opcionales)

### Datos Obligatorios
- `titulo`: Título de la evidencia (no vacío)
- `tipo`: Tipo de evidencia (valor ENUM válido)
- `fecha`: Fecha de la evidencia (por defecto: fecha actual)

### Datos Opcionales Recomendados
- `descripcion`: Descripción de la evidencia
- `archivo_url`: URL del archivo almacenado
- `archivo_nombre`: Nombre del archivo
- `observaciones`: Observaciones adicionales

### Relaciones Opcionales (al menos una recomendada)
- `empresa_id`: Empresa relacionada
- `evento_id`: Evento relacionado
- `formacion_id`: Formación relacionada
- `asesoramiento_id`: Asesoramiento relacionado

### Validaciones
1. **Tipo válido**: Debe ser uno de los valores del ENUM `tipo_evidencia`
2. **Fecha válida**: La fecha debe ser válida
3. **Entidades relacionadas existen**: Si se proporciona algún ID de relación, debe existir
4. **Al menos una relación**: Se recomienda (no obligatorio) relacionar con al menos una entidad

### Flujo de Creación
```
1. Usuario accede al formulario de nueva evidencia
2. Sistema presenta campos del formulario
3. Usuario completa información básica
4. Usuario opcionalmente sube un archivo
5. Usuario opcionalmente relaciona con entidades existentes
6. Usuario envía el formulario
7. Sistema valida los datos:
   - Título no vacío
   - Tipo de evidencia válido
   - Fecha válida
   - Entidades relacionadas existen (si se proporcionan)
8. Sistema procesa archivo (si se proporciona):
   - Valida tipo y tamaño de archivo
   - Almacena en storage
   - Obtiene URL pública
9. Sistema crea registro con:
   - fecha: Fecha actual (si no se especifica)
   - archivo_url: URL del archivo almacenado
   - archivo_nombre: Nombre original del archivo
   - created_by: Usuario actual
   - created_at: Fecha/hora actual
   - updated_at: Fecha/hora actual
10. Sistema confirma creación exitosa
11. Sistema actualiza repositorio de evidencias
```

### Estados Iniciales
- `fecha`: Fecha actual (por defecto: CURRENT_DATE)

### Dependencias
- **Depende de**: Ninguna entidad obligatoria
- **Relaciones opcionales con**: Empresa, Evento, Formación, Asesoramiento

### Casos de Uso Comunes
1. **Evidencia de Asesoramiento**: Relacionar con empresa_id y asesoramiento_id
2. **Evidencia de Evento**: Relacionar con evento_id (fotografías, videos)
3. **Evidencia de Formación**: Relacionar con formacion_id (materiales, certificados)
4. **Evidencia General de Empresa**: Relacionar solo con empresa_id

### Errores Comunes
- **Tipo inválido**: Mensaje "Tipo de evidencia no válido"
- **Entidad relacionada no existe**: Mensaje "La entidad relacionada no existe"
- **Archivo muy grande**: Mensaje "El archivo excede el tamaño máximo permitido"
- **Título vacío**: Mensaje "El título de la evidencia es obligatorio"

---

## Flujo de Creación de Colaborador

### Prerrequisitos
1. Usuario autenticado en el sistema
2. Usuario debe tener permisos para crear colaboradores
3. No se requieren otras entidades previas

### Datos Obligatorios
- `nombre`: Nombre de la entidad colaboradora (no vacío)
- `tipo`: Tipo de colaborador (valor ENUM válido)

### Datos Opcionales Recomendados
- `estado`: Estado (por defecto: 'pendiente')
- `cif`: Identificación fiscal
- `descripcion`: Descripción de la entidad
- `email`: Correo electrónico
- `telefono`: Teléfono
- `web`: Sitio web
- `contacto_principal`: Nombre del contacto
- `cargo_contacto`: Cargo del contacto
- `email_contacto`: Email del contacto
- `telefono_contacto`: Teléfono del contacto
- `fecha_inicio_colaboracion`: Fecha de primer contacto
- `ambito_colaboracion`: Ámbito de colaboración
- `convenio_firmado`: Indicador de convenio (por defecto: false)
- `codigo_alcance`: Código de alcance (local, regional, nacional)
- `sectores_interes`: Array de sectores de interés
- `tipos_apoyo`: Array de tipos de apoyo
- `asignado_a`: Usuario asignado (opcional)

### Validaciones
1. **Tipo válido**: Debe ser uno de los valores del ENUM `tipo_colaborador`
2. **Estado válido**: Debe ser uno de los valores del ENUM `estado_colaborador`
3. **Usuario asignado existe**: Si se proporciona asignado_a, el usuario debe existir
4. **Email válido**: Si se proporciona, debe tener formato válido

### Flujo de Creación
```
1. Usuario accede al formulario de nuevo colaborador
2. Sistema presenta campos del formulario
3. Usuario completa información básica de la entidad
4. Usuario ingresa datos de contacto
5. Usuario define ámbito y tipo de colaboración
6. Usuario opcionalmente asigna a un técnico
7. Usuario envía el formulario
8. Sistema valida los datos:
   - Nombre no vacío
   - Tipo de colaborador válido
   - Estado válido
   - Usuario asignado existe (si se proporciona)
   - Email válido (si se proporciona)
9. Sistema procesa arrays:
   - Convierte sectores_interes de string a array
   - Convierte tipos_apoyo de string a array
10. Sistema crea registro con:
   - Estado inicial: 'pendiente'
   - convenio_firmado: false
   - created_by: Usuario actual
   - created_at: Fecha/hora actual
   - updated_at: Fecha/hora actual
11. Sistema confirma creación exitosa
12. Sistema actualiza directorio de colaboradores
```

### Estados Iniciales
- `estado`: 'pendiente' (por defecto)
- `convenio_firmado`: false (por defecto)

### Dependencias
- **Depende de**: Ninguna entidad obligatoria
- **Relación opcional con**: Usuario (asignado_a)

### Flujo Post-Creación
Después de crear el colaborador:
1. Actualizar estado a 'activo' cuando se confirme la colaboración
2. Marcar convenio_firmado como true cuando corresponda
3. Documentar colaboraciones específicas en observaciones

### Errores Comunes
- **Tipo inválido**: Mensaje "Tipo de colaborador no válido"
- **Usuario asignado no encontrado**: Mensaje "El usuario asignado no existe"
- **Email inválido**: Mensaje "Formato de email no válido"
- **Nombre vacío**: Mensaje "El nombre del colaborador es obligatorio"

---

## Matriz de Dependencias

### Tabla de Dependencias Obligatorias

| Entidad         | Depende de (Obligatorio) | Campos de Relación              |
|-----------------|-------------------------|---------------------------------|
| Empresa         | Ninguna                 | -                               |
| Contacto        | Empresa                 | empresa_id                      |
| Asesoramiento   | Empresa, Usuario        | empresa_id, tecnico_id          |
| Evento          | Ninguna                 | -                               |
| Formación       | Ninguna                 | -                               |
| Evidencia       | Ninguna                 | -                               |
| Colaborador     | Ninguna                 | -                               |

### Tabla de Dependencias Opcionales

| Entidad         | Puede relacionarse con (Opcional) | Campos de Relación                                    |
|-----------------|----------------------------------|-------------------------------------------------------|
| Empresa         | Usuario (técnico asignado)       | tecnico_asignado_id                                   |
| Contacto        | -                                | -                                                     |
| Asesoramiento   | -                                | -                                                     |
| Evento          | Empresa                          | empresa_id                                            |
| Formación       | -                                | -                                                     |
| Evidencia       | Empresa, Evento, Formación, Asesoramiento | empresa_id, evento_id, formacion_id, asesoramiento_id |
| Colaborador     | Usuario (asignado a)             | asignado_a                                            |

### Orden Recomendado de Creación

Para un flujo completo del sistema, el orden recomendado de creación es:

1. **Usuarios** (creados por el sistema de autenticación)
2. **Empresa** (entidad base para asesoramientos)
3. **Contacto** (asociado a empresas)
4. **Asesoramiento** (requiere empresa y usuario/técnico)
5. **Evento** (independiente o relacionado con empresas)
6. **Formación** (independiente)
7. **Colaborador** (independiente)
8. **Evidencia** (puede relacionarse con cualquier entidad anterior)

### Restricciones de Eliminación

| Entidad         | Al eliminar...                    | Efecto en entidades relacionadas                      |
|-----------------|----------------------------------|-------------------------------------------------------|
| Empresa         | Se eliminan en cascada           | Contactos, Asesoramientos                             |
|                 | Se establece a NULL              | Eventos (empresa_id), Evidencias (empresa_id)         |
| Usuario         | Se establece a NULL              | Empresas (tecnico_asignado_id), Colaboradores (asignado_a) |
| Evento          | Se establece a NULL              | Evidencias (evento_id)                                |
| Formación       | Se establece a NULL              | Evidencias (formacion_id)                             |
| Asesoramiento   | Se establece a NULL              | Evidencias (asesoramiento_id)                         |
| Contacto        | Sin efecto                       | -                                                     |
| Evidencia       | Sin efecto                       | -                                                     |
| Colaborador     | Sin efecto                       | -                                                     |

## Notas Importantes

1. **Validación del lado del cliente**: Aunque el sistema valida en el servidor, se recomienda validar también en el cliente para mejorar la experiencia de usuario.

2. **Campos calculados**: Algunos campos se calculan automáticamente (created_at, updated_at) mediante triggers de base de datos.

3. **Permisos**: Todos los flujos requieren que el usuario esté autenticado y tenga los permisos apropiados según su rol.

4. **Auditoría**: El campo created_by registra automáticamente el usuario que creó cada registro.

5. **Valores ENUM**: Los valores de los campos ENUM están predefinidos en el esquema de base de datos y no pueden cambiarse desde la aplicación.

6. **Integridad referencial**: El sistema mantiene automáticamente la integridad referencial mediante constraints y triggers de base de datos.

7. **Transacciones**: Las operaciones de creación deben realizarse dentro de transacciones para garantizar la consistencia de los datos.

8. **Manejo de errores**: Todos los flujos deben implementar manejo de errores apropiado para informar al usuario de problemas de validación o creación.
