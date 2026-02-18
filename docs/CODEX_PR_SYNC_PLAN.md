# Plan de ejecución por PRs de Codex y sincronización con GitHub

## Objetivo
Dividir la corrección en PRs pequeños, revisables y seguros, creados por Codex, que se puedan sincronizar sin fricción con GitHub.

## Requisitos previos
- Repositorio conectado a remoto GitHub.
- Branch de trabajo por PR (una rama por alcance).
- CI activa en GitHub para validar lint/tests/build.

## Estrategia de PRs (orden recomendado)

### PR-1: Infraestructura común de inserción resiliente
**Alcance**
- Crear helper reutilizable para inserciones con fallback ante columnas no disponibles por schema cache.
- Crear utilidades de normalización de payloads opcionales.
- Añadir tests unitarios de helpers.

**Criterio de aceptación**
- Helper probado para casos: éxito directo, columna faltante recuperable, error no recuperable.
- Sin cambios funcionales visuales en formularios todavía.

---

### PR-2: Flujos críticos (Empresas, Contactos, Asesoramientos)
**Alcance**
- Refactor de altas críticas para usar helper común.
- Estandarizar mensajes de error orientados a usuario + log técnico.
- Mantener lógica de compliance de Empresas.

**Criterio de aceptación**
- Alta de Empresa, Contacto y Asesoramiento operativa tras refactor.
- Sin regresiones en validaciones actuales.

---

### PR-3: Flujos secundarios (Formaciones, Colaboradores, Eventos)
**Alcance**
- Aplicar el mismo patrón a formularios secundarios.
- Homogeneizar normalización de payload y gestión de errores.

**Criterio de aceptación**
- Altas de los 3 módulos operativas y coherentes en UX de error.

---

### PR-4: Endurecimiento de migraciones y runbook operativo
**Alcance**
- Añadir migración de refuerzo para recarga de schema cache de PostgREST.
- Incluir documentación operativa de despliegue y smoke checks post-migración.

**Criterio de aceptación**
- Procedimiento de despliegue reproducible y validado.
- Runbook disponible para soporte/ops.

## Convención de ramas
- `codex/pr1-insert-resilience-core`
- `codex/pr2-critical-create-flows`
- `codex/pr3-secondary-create-flows`
- `codex/pr4-migrations-runbook`

## Plantilla de título y cuerpo para PR

### Título
`feat(<scope>): <resumen corto>`

### Cuerpo
1. **Problema**: qué fallo corrige.
2. **Cambios**: lista de modificaciones por archivo.
3. **Riesgos**: posibles impactos.
4. **Validación**: comandos ejecutados y resultado.
5. **Rollback**: cómo revertir de forma segura.

## Flujo de sincronización con GitHub
1. Codex crea cambios en rama dedicada.
2. Codex ejecuta checks locales (lint/test/typecheck/build).
3. Codex hace commit atómico con mensaje claro.
4. Codex abre PR con contexto completo.
5. Revisión humana + CI.
6. Merge a `main`.
7. Sincronizar ramas locales con `main`.

## Política de tamaño y riesgo
- Máximo recomendado: 300-500 líneas netas por PR funcional.
- Evitar mezclar refactor + cambios de comportamiento + migraciones en un único PR grande.
- Priorizar PRs reversibles.

## Checklist por PR
- [ ] Cambios acotados al alcance.
- [ ] Sin deuda técnica añadida en logs de error.
- [ ] Lint/tests/typecheck/build en verde.
- [ ] Texto de PR con problema, solución, riesgos y rollback.
- [ ] Aprobación y merge con CI verde.

