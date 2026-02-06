# Documentación Base - Impulsa LOV (PR-0)

## Índice General

Este directorio contiene la documentación base del contrato funcional y arquitectura de dominio del sistema Impulsa LOV.

### Documentos Disponibles

1. **[Modelo de Dominio](MODELO_DOMINIO.md)** - Entidades, relaciones y dependencias
2. **[Flujos Base](FLUJOS_BASE.md)** - Prerequisitos y dependencias para crear cada entidad
3. **[Definición de KPIs](DEFINICION_KPIS.md)** - Fuente de datos, criterio y fórmula de cada KPI
4. **[Estados y Transiciones](ESTADOS_TRANSICIONES.md)** - Tabla de estados por entidad y transiciones válidas

---

## 1. Modelo de Dominio

**Archivo**: [MODELO_DOMINIO.md](MODELO_DOMINIO.md)

### Contenido
- Definición completa de las 7 entidades principales del sistema:
  - **Empresa**: Entidad base para el seguimiento de asesoramientos
  - **Contacto**: Personas de contacto dentro de empresas
  - **Asesoramiento**: Sesiones de asesoramiento con empresas
  - **Evento**: Actividades y eventos organizados
  - **Formación**: Píldoras formativas, cursos y capacitaciones
  - **Evidencia**: Documentos, fotografías, videos y material de respaldo
  - **Colaborador**: Entidades externas que colaboran con el programa
  
- Entidades de soporte:
  - **Profile**: Perfiles de usuario
  - **User Role**: Roles asignados a usuarios (admin, tecnico)

### Aspectos Clave
- **Relaciones**: Todas las relaciones entre entidades están documentadas con cardinalidad
- **Dependencias**: Se especifican dependencias obligatorias y opcionales
- **Diagrama ER**: Incluye diagrama de entidad-relación en formato ASCII
- **Campos detallados**: Cada entidad incluye descripción completa de todos sus campos
- **Cascadas**: Documentación de políticas de eliminación en cascada (CASCADE, SET NULL)

---

## 2. Flujos Base

**Archivo**: [FLUJOS_BASE.md](FLUJOS_BASE.md)

### Contenido
Documentación detallada de los flujos de creación para cada entidad:

1. **Flujo de Creación de Empresa**
   - Prerrequisitos: Usuario autenticado, permisos
   - Datos obligatorios: nombre, sector, fase_madurez
   - Validaciones: CIF único, valores ENUM válidos
   - Estado inicial: 'pendiente'

2. **Flujo de Creación de Contacto**
   - Prerrequisito obligatorio: Empresa existente
   - Datos obligatorios: empresa_id, nombre
   - Relación 1:N con Empresa

3. **Flujo de Creación de Asesoramiento**
   - Prerrequisitos obligatorios: Empresa y Usuario (técnico) existentes
   - Datos obligatorios: empresa_id, tecnico_id, fecha
   - Estado inicial: 'programado'

4. **Flujo de Creación de Evento**
   - Sin prerrequisitos de otras entidades
   - Datos obligatorios: nombre, tipo
   - Relación opcional con Empresa

5. **Flujo de Creación de Formación**
   - Sin prerrequisitos de otras entidades
   - Datos obligatorios: titulo, tipo
   - Estado inicial: 'planificada'

6. **Flujo de Creación de Evidencia**
   - Sin prerrequisitos obligatorios
   - Puede relacionarse con: Empresa, Evento, Formación, Asesoramiento
   - Todas las relaciones son opcionales

7. **Flujo de Creación de Colaborador**
   - Sin prerrequisitos de otras entidades
   - Datos obligatorios: nombre, tipo
   - Estado inicial: 'pendiente'

### Aspectos Clave
- **Matriz de Dependencias**: Tabla resumen de dependencias obligatorias y opcionales
- **Orden de Creación**: Secuencia recomendada para crear entidades
- **Validaciones**: Validaciones recomendadas para cada campo
- **Errores Comunes**: Lista de errores típicos y mensajes sugeridos
- **Flujos Post-Creación**: Acciones recomendadas después de crear cada entidad

---

## 3. Definición de KPIs

**Archivo**: [DEFINICION_KPIS.md](DEFINICION_KPIS.md)

### Contenido

#### KPIs Operativos (Dashboard Principal)
1. **Empresas Asesoradas** (Meta: 20)
   - Fuente: tabla `empresas`, campo `estado`
   - Criterio: estado IN ('asesorada', 'completada')

2. **Informes Generados** (Meta: 15)
   - Fuente: tabla `asesoramientos`, campo `informe_generado`
   - Criterio: informe_generado = true

3. **Eventos Realizados** (Meta: 2)
   - Fuente: tabla `eventos`, campo `estado`
   - Criterio: estado = 'completado'

4. **Píldoras Formativas** (Meta: 6)
   - Fuente: tabla `formaciones`, campos `tipo`, `estado`
   - Criterio: tipo = 'pildora_formativa' AND estado = 'completada'

5. **Entidades Colaboradoras** (Meta: 8)
   - Fuente: tabla `colaboradores`, campos `estado`, `convenio_firmado`
   - Criterio: estado = 'activo' AND convenio_firmado = true

6. **Impactos de Difusión** (Meta: 15)
   - Fuente: tabla `evidencias` con relaciones a eventos/formaciones
   - Criterio: tipo IN ('fotografia', 'video') relacionado con eventos/formaciones completados

7. **Material de Apoyo** (Meta: 5)
   - Fuente: tabla `evidencias`
   - Criterio: tipo IN ('documento', 'certificado') AND formacion_id IS NOT NULL

8. **Cuadro de Mando PowerBI** (Meta: 1)
   - Fuente: Variables de entorno de configuración
   - Criterio: Integración PowerBI configurada

#### KPIs Estratégicos
- Tasa de Conversión de Empresas
- Tiempo Medio de Asesoramiento
- Tasa de Finalización de Asesoramientos
- Empresas por Técnico
- Tasa de Asistencia a Eventos
- Tasa de Ocupación de Formaciones

#### KPIs de Impacto
- Casos de Éxito
- Cobertura Sectorial
- Índice de Documentación
- Diversidad de Colaboradores

### Aspectos Clave
- **Fórmulas SQL**: Queries completas para calcular cada KPI
- **Código TypeScript**: Implementación completa para el Dashboard
- **Metas**: Objetivos definidos para cada KPI
- **Frecuencia**: Periodicidad de actualización recomendada
- **Visualización**: Sugerencias de colores, gráficos y presentación

---

## 4. Estados y Transiciones

**Archivo**: [ESTADOS_TRANSICIONES.md](ESTADOS_TRANSICIONES.md)

### Contenido

#### Estados por Entidad

1. **Empresa** (estado_empresa)
   - `pendiente` → `en_proceso` → `asesorada` → `completada`
   - Reversiones permitidas
   - Sin enforcement

2. **Asesoramiento** (estado_asesoramiento)
   - `programado` → `en_curso` → `completado`
   - Alternativa: `cancelado` (desde programado o en_curso)
   - Reprogramación: cancelado → programado

3. **Evento** (estado_evento)
   - `planificado` → `confirmado` → `en_curso` → `completado`
   - Alternativa: `cancelado` (desde cualquier estado)
   - Replanificación permitida

4. **Formación** (estado_formacion)
   - `planificada` → `en_curso` → `completada`
   - Alternativa: `cancelada`
   - Replanificación: cancelada → planificada

5. **Colaborador** (estado_colaborador)
   - `pendiente` → `activo` ⇄ `inactivo`
   - Transiciones bidireccionales activo/inactivo

### Aspectos Clave
- **Diagramas Mermaid**: Visualización de transiciones para cada entidad
- **Tablas de Transiciones**: Estado actual → Estado siguiente con eventos disparadores
- **Validaciones Recomendadas**: Condiciones sugeridas para cada transición
- **Reglas de Negocio**: Guías de uso de estados sin enforcement técnico
- **Campos Relacionados**: Campos que se actualizan con cambios de estado
- **Flujo Típico del Sistema**: Diagrama completo del flujo de trabajo
- **Sin Bloqueos**: Todas las transiciones son manuales, sin restricciones técnicas

---

## Características Generales de la Documentación

### Nivel de Detalle
- **Completo**: Incluye todos los campos, relaciones y validaciones
- **Estructurado**: Organizado por entidad con formato consistente
- **Práctico**: Incluye ejemplos de SQL, código y casos de uso
- **Actualizado**: Basado en el esquema actual del sistema (Feb 2026)

### Tecnologías Documentadas
- **Base de datos**: PostgreSQL en Supabase
- **Tipos ENUM**: Valores predefinidos para campos de estado y categoría
- **Tipos especiales**: Arrays (TEXT[]), JSONB
- **Frontend**: TypeScript/React (código de ejemplo en KPIs)
- **Integraciones**: Power Platform (PowerBI)

### Alcance
Esta documentación **NO incluye**:
- ❌ Implementación de cambios de lógica
- ❌ Modificaciones de UI
- ❌ Enforcement de transiciones de estado
- ❌ Nuevas funcionalidades

Esta documentación **SÍ incluye**:
- ✅ Modelo de dominio completo
- ✅ Definición de entidades y relaciones
- ✅ Flujos de creación y validaciones
- ✅ Definición completa de KPIs con fórmulas
- ✅ Estados y transiciones (documentación sin enforcement)
- ✅ Reglas de negocio recomendadas
- ✅ Ejemplos de código y queries SQL

---

## Uso de la Documentación

### Para Desarrolladores
- Consultar **Modelo de Dominio** para entender la estructura de datos
- Revisar **Flujos Base** antes de implementar formularios de creación
- Usar **Definición de KPIs** para implementar dashboards y reportes
- Consultar **Estados y Transiciones** para entender el ciclo de vida de las entidades

### Para Analistas de Negocio
- **Flujos Base** documenta los procesos de creación
- **Estados y Transiciones** explica el ciclo de vida de cada entidad
- **Definición de KPIs** detalla las métricas del negocio

### Para Administradores del Sistema
- **Estados y Transiciones** explica cómo gestionar el ciclo de vida
- **Definición de KPIs** ayuda a interpretar las métricas del dashboard

### Para Testing
- **Flujos Base** proporciona casos de prueba para validaciones
- **Estados y Transiciones** documenta escenarios de transición a probar
- **Definición de KPIs** permite validar cálculos de métricas

---

## Mantenimiento de la Documentación

### Versionado
- **Versión actual**: 1.0 (PR-0)
- **Fecha**: Febrero 2026
- **Basado en**: Esquema de base de datos actual

### Actualización
Esta documentación debe actualizarse cuando:
- Se agreguen nuevas entidades al sistema
- Se modifiquen campos o relaciones existentes
- Se cambien enums o tipos de datos
- Se definan nuevos KPIs
- Se agreguen nuevos estados o se modifiquen transiciones

### Responsabilidad
- **Mantenimiento**: Equipo de desarrollo
- **Aprobación**: Product Owner / Analista de Negocio
- **Revisión**: Antes de cada release

---

## Próximos Pasos (Fuera del Alcance de PR-0)

### Posibles Mejoras Futuras
1. **Enforcement de Transiciones**: Implementar validaciones opcionales de transiciones de estado
2. **Historial de Estados**: Tabla de log para auditar cambios de estado
3. **Workflow Engine**: Sistema configurable de workflows
4. **Validaciones Automáticas**: Validaciones de negocio automáticas en base de datos
5. **Notificaciones**: Sistema de alertas basado en estados y transiciones
6. **Métricas Avanzadas**: KPIs adicionales y analytics
7. **Integración PowerBI**: Sincronización automática de KPIs
8. **API de Reportes**: Endpoints específicos para exportación de datos

### Documentación Adicional Sugerida
1. **Guía de Usuario**: Manual de usuario de la aplicación
2. **API Documentation**: Documentación de endpoints y schemas
3. **Deployment Guide**: Guía de despliegue y configuración
4. **Security Policies**: Políticas de seguridad y RLS
5. **Integration Guide**: Guía de integraciones externas
6. **Testing Strategy**: Estrategia y casos de prueba

---

## Referencias

### Archivos del Proyecto
- `/supabase/migrations/` - Migraciones de base de datos
- `/src/integrations/supabase/types.ts` - Tipos TypeScript generados
- `/src/pages/Dashboard.tsx` - Implementación del Dashboard
- Páginas de entidades: `Empresas.tsx`, `Contactos.tsx`, `Asesoramientos.tsx`, etc.

### Documentos Relacionados
- `README.md` - Información general del proyecto
- `IMPLEMENTATION_SUMMARY.md` - Resumen de implementación de nuevos campos
- `CHANGES_*.md` - Documentos de cambios por entidad
- `RBAC_IMPLEMENTATION.md` - Implementación de control de acceso basado en roles

---

## Contacto y Soporte

Para preguntas o aclaraciones sobre esta documentación:
1. Revisar los archivos de documentación específicos
2. Consultar el código fuente en `/src` y `/supabase`
3. Contactar al equipo de desarrollo

---

**Última actualización**: Febrero 2026  
**Versión**: 1.0 (PR-0)  
**Estado**: Documentación base completada
