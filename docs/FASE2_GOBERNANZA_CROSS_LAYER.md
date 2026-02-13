# Fase 2 — Gobernanza de reglas de estado y permisos (cross-layer)

## Objetivo

Asegurar coherencia entre:
1. Lo que el usuario ve en UI.
2. Lo que la UI permite ejecutar.
3. Lo que el backend/RLS acepta realmente.

---

## 1) Política single-policy behavior

### 1.1 Estados
- **Bloqueo funcional en UI**: las transiciones de estado se validan en frontend con `src/lib/stateTransitions.ts` y `EstadoSelector`.
- **Backend flexible**: no se fuerza workflow de estados en RLS.
- **Decisión de gobernanza**: para estados, el enforcement canónico es **UI-first** (con contrato documental explícito).

### 1.2 Permisos CRUD
- Se incorpora una política centralizada en `src/config/permissionPolicy.ts`.
- La política define por entidad y acción (`create`, `edit`, `delete`) qué roles están permitidos.
- Para entidades con RLS conocido (empresas, contactos, asesoramientos, tasks), la política refleja restricciones más estrictas de eliminación (`delete` solo admin).
- Para entidades sin matriz RLS detallada en esta fase, se mantiene fallback funcional (`admin`/`tecnico`) y se documenta explícitamente.

---

## 2) Mapeo CRUD por rol y entidad (fase operativa)

### Entidades con alineación explícita a RLS

| Entidad | Create | Edit | Delete | Notas |
|---|---|---|---|---|
| `empresas` | admin, tecnico | admin, tecnico | admin | update con scope; delete solo admin |
| `contactos` | admin, tecnico | admin, tecnico | admin | update con scope; delete solo admin |
| `asesoramientos` | admin, tecnico | admin, tecnico | admin | update con scope; delete solo admin |
| `tasks` | admin, tecnico | admin, tecnico | admin | update con scope; delete solo admin |

### Entidades con fallback funcional (en esta fase)

`eventos`, `formaciones`, `evidencias`, `colaboradores`, `oportunidades`, `grants`, `planes_accion`, `informes`, `materials`, `dissemination_impacts`:

- create: admin, tecnico
- edit: admin, tecnico
- delete: admin, tecnico

> Nota de gobernanza: en una fase posterior se debe completar el mapeo RLS exhaustivo de estas entidades para endurecer la matriz de UI donde aplique.

---

## 3) Reducción de sorpresas UI vs RLS

### 3.1 PermissionButton
- `PermissionButton` ahora admite `entity` además de `action`.
- El cálculo de permiso usa política central (`canPerformAction(action, entity)`).
- El mensaje de feedback indica roles permitidos para la entidad/acción.

### 3.2 Hook de permisos
- `usePermissionFeedback` consume la política centralizada y deja de depender solo del booleano global `canWrite`.
- La verificación y el feedback son consistentes para `create/edit/delete` por entidad.

### 3.3 Caso aplicado en `Tareas`
- Botones de crear/editar/eliminar usan `action` + `entity="tasks"`.
- `delete` queda alineado al comportamiento esperado (solo admin en política UI), reduciendo intentos fallidos contra RLS.

---

## 4) Criterio de cumplimiento fase 2

Se considera cumplida la fase cuando:
1. Existe política de permisos central y versionada en código.
2. Los componentes de acción en UI consultan esa política por entidad/acción.
3. La documentación explica explícitamente dónde se hace enforcement (UI vs backend).
4. Se minimizan desajustes visibles entre feedback de UI y denegaciones por RLS en acciones críticas.
