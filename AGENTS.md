# Contexto Operativo y Arquitectura del Proyecto: Cesto Tracker (`AGENTS.md`)

Este archivo es la **fuente principal de verdad operativa** para los agentes de Inteligencia Artificial y desarrolladores que interactúen con este repositorio. Debe consultarse antes de realizar modificaciones arquitectónicas o cambios de código.

---

## 1. Propósito y Dominio del Proyecto
**Cesto Tracker** es una Progressive Web Application (PWA) de alto rendimiento orientada a la comunidad del **Cestoball**. Su objetivo es digitalizar y profesionalizar la recolección, análisis y visualización de datos estadísticos en vivo durante partidos y torneos:
- Registro de tiros sobre cancha interactiva (cálculo de distancias, zonas y mapa de calor).
- Planilla técnica digital en tiempo real (goles, triples, pérdidas, recuperos, rebotes ofensivos/defensivos, asistencias y faltas personales).
- Visualización analítica avanzada (gráficos temporales por período, efectividad por zona y rachas de tiro).
- Gestión de fixtures, tablas de posiciones en vivo y cuadros eliminatorios (*knockout brackets*).
- Panel de administración y gobernanza con roles de acceso y métricas comunitarias.

---

## 2. Stack Tecnológico

| Capa | Tecnología | Versión / Detalle |
| :--- | :--- | :--- |
| **Framework UI** | React | `^19.1.1` (Componentes funcionales y Hooks) |
| **Enrutamiento** | React Router DOM | `^7.13.0` |
| **Lenguaje** | TypeScript | `~5.8.2` (Modo estricto, alias `@/*`) |
| **Estilos** | Tailwind CSS | `^3.4.19` + PostCSS + Autoprefixer |
| **BaaS / Base de Datos** | Supabase | `@supabase/supabase-js ^2.45.0` (PostgreSQL, Auth OAuth, RLS, RPCs) |
| **Build Tool / Bundler** | Vite | `^6.2.0` |
| **Exportación de Datos** | ExcelJS, FileSaver, JSZip | Generación de planillas oficiales Excel y backups |
| **Hosting & Deploy** | Netlify | Configuración SPA redirect en `netlify.toml` |
| **PWA** | Service Worker + Web Manifest | Soporte instalable y offline-first |

---

## 3. Estructura de Directorios y Mapa de Módulos

El proyecto organiza sus fuentes directamente en la raíz con path alias `@/*` configurado en `tsconfig.json` y `vite.config.ts`:

```text
cesto-tracker/
├── pages/                  # Vistas principales vinculadas al enrutador (React Router v7)
│   ├── HomeRoute.tsx       # Pantalla inicial, accesos rápidos y selector de modo
│   ├── SetupRoute.tsx      # Configuración de partido (equipos, jugadores, modo)
│   ├── MatchRoute.tsx      # Centro de comando del partido en vivo
│   ├── StandingsRoute.tsx  # Tablas de posiciones, grupos y llaves de playoff
│   ├── AdminRoute.tsx      # Panel de administración y gestión de usuarios
│   └── FaqRoute.tsx        # Preguntas frecuentes y centro de ayuda
├── context/                # Estado Global (React Context API)
│   ├── AuthContext.tsx     # Sesión de usuario, Google OAuth y estado de autenticación
│   ├── GameContext.tsx     # Estado central del partido (GameState), localStorage y migraciones
│   ├── SyncContext.tsx     # Orquestación de sincronización y autosave en Supabase
│   └── UIContext.tsx       # Gestor unificado de modales, tabs, popups y notificaciones toast
├── hooks/                  # Custom Hooks de Lógica de Negocio y Fetching
│   ├── useGameLogic.ts     # Lógica pura del juego (tiros, planilla, rachas, sustituciones, undo/redo)
│   ├── useFixture.ts       # Consulta y ordenamiento cronológico/por rondas del fixture
│   ├── useStandings.ts     # Cálculo en memoria de tablas (round-robin) y brackets eliminatorios
│   ├── useProfile.ts       # Perfil del usuario autenticado y validación de permisos
│   ├── useCommunityStats.ts# Métricas globales agregadas de la comunidad
│   └── useTeamManager.ts   # Guardado y carga local/remota de planteles de equipos
├── components/             # Componentes modulares categorizados por dominio
│   ├── game/               # Componentes del partido: Court (SVG interactivo), Scoreboard, PlayerSetup, etc.
│   ├── views/              # Vistas pesadas o compuestas (HomePage, StatisticsView, StandingsView, etc.)
│   ├── modals/             # Modales independientes (SaveGame, LoadGame, Settings, Substitution, etc.)
│   ├── ui/                 # Elementos genéricos y atómicos (AppHeader, BottomNavigation, Toast, Loader)
│   ├── charts/             # Gráficos (HeatmapOverlay, ZoneChart, TemporalChart)
│   ├── admin/              # Sub-módulo de administración (views, ui, hooks y types propios)
│   └── icons/              # Sistema consolidado de iconos SVG (index.tsx)
├── supabase/               # Migraciones de base de datos, políticas RLS y RPCs
├── utils/                  # Funciones utilitarias (supabaseClient, dbAdapters, exportToExcel, teamUtils)
├── types.ts                # Definiciones y tipos globales de TypeScript
└── constants.ts            # Constantes de negocio, almacenamiento y etiquetas
```

---

## 4. Flujo de Datos, Estado y Persistencia

### 4.1. Estrategia Offline-First / Resiliencia Local
1. Toda acción en un partido (`Shot`, `TallyStatsPeriod`, `GameEvent`) se procesa síncronamente en `GameContext`.
2. El estado completo (`GameState`) se persiste inmediatamente en `localStorage` bajo la clave `GAME_STATE_STORAGE_KEY`.
3. Al inicializar la app, `GameContext` ejecuta un pipeline de migraciones para soportar compatibilidad con partidos previos sin corromper el estado.

### 4.2. Capa de Sincronización con la Nube
- `SyncContext.tsx` es el orquestador principal de sincronización con Supabase (soporta auto-guardado silencioso y sincronización explícita).
- Utiliza adaptadores en `utils/dbAdapters.ts` para mapear los modelos de cliente (`Shot`, `TallyStatsPeriod`) con las tablas relacionales de Supabase (`games`, `shots`, `tally_stats`).
- La seguridad se apoya en **Row Level Security (RLS)** de PostgreSQL, vinculando cada registro al `user_id` del usuario autenticado.

---

## 5. Dominio de Negocio y Reglas de Cestoball

1. **Períodos de Juego:**
   - `First Half`, `Second Half`, `First Overtime`, `Second Overtime`.
2. **Modos de Partido:**
   - `shot-chart`: Registro espacial en cancha (tiros de 2 puntos, 3 puntos o fallos con coordenadas x/y).
   - `stats-tally`: Registro exhaustivo de planilla técnica (goles, triples, fallos, recuperos, pérdidas, rebotes ofensivos/defensivos, asistencias, goles en contra y faltas personales).
3. **Métricas Especiales:**
   - **Mano Caliente / Mano Fría:** Detección configurable de rachas consecutivas de aciertos o fallos para alertar al cuerpo técnico.
   - **Faltas Acumuladas:** Conteo de faltas personales por jugador y acumuladas por período para el equipo.
4. **Fixture y Posiciones:**
   - Cálculo automático de puntos (Ganado/Perdido), diferencia de gol y rachas.
   - Detección de etapas eliminatorias (`octavo`, `cuarto`, `semi`, `final`) para renderizar el árbol de playoffs.

---

## 6. Modelo de Permisos y Roles de Usuario

El sistema distingue dos niveles de roles en `UserProfile` ([types.ts](file:///c:/Proyectos/cesto-tracker/types.ts)):
- **Roles de Identidad (`IdentityRole`):** Visibles y elegibles por el usuario (`jugador`, `entrenador`, `hincha`, `dirigente`, `periodista`, `otro`).
- **Roles de Permisos (`PermissionRole`):**
  - `is_admin: true` (Owner / Admin verificado en la base de datos).
  - Solo los usuarios con permisos administrativos pueden acceder a `/admin`, editar fixtures o gestionar privilegios de otros usuarios vía RPC (`get_admin_users_rpc`).

---

## 7. Reglas de Código y Buenas Prácticas

1. **TypeScript Estricto:**
   - Evitar el tipo `any`.
   - Tipar completamente props, callbacks, payloads de base de datos y estados de React.
2. **Componentes y Hooks:**
   - Utilizar exclusivamente componentes funcionales.
   - Mantener la lógica de negocio pesada dentro de custom hooks (`/hooks`), dejando los componentes de UI enfocados en la presentación e interacción.
3. **Estilos:**
   - Uso de clases utilitarias de Tailwind CSS. Mantener diseño *mobile-first*, limpio y responsivo.
   - Modificaciones globales de diseño centralizadas en `index.css`.
4. **Supabase & Seguridad:**
   - **Nunca** exponer llaves `service_role` en el cliente frontend. Utilizar únicamente `VITE_SUPABASE_ANON_KEY`.
   - Todas las consultas y mutaciones deben respetar las políticas RLS activas en Supabase.
5. **Idioma:**
   - **Código fuente:** Nombres de variables, funciones, interfaces y comentarios técnicos en **Inglés**.
   - **Interfaz de Usuario (UI):** Textos visibles, diálogos, notificaciones y ayudas en **Español**.

---

## 8. Directrices Operativas para Agentes de IA

1. **Análisis Previo Obligatorio:** Antes de modificar un componente core o un hook complejo (ej. `MatchRoute.tsx`, `HomePage.tsx`, `useGameLogic.ts`), lee el archivo en su totalidad para comprender efectos secundarios y dependencias cruzadas.
2. **Cambios Incrementales y Testeables:** Realiza cambios granulares. Valida que las modificaciones no rompan los tipos globales en `types.ts` ni los contratos de `GameContext`.
3. **Preservación de Lógica y Documentación:** No borres lógica existente ni comentarios explicativos a menos que se trate de una refactorización solicitada explícitamente.
4. **Gestión de Paquetes:** No agregues nuevas dependencias a `package.json` sin consultar previamente al usuario, a excepción de herramientas estándar o utilidades estrictamente solicitadas.
5. **Resolución Metódica de Errores:** Cuando surjan errores de TypeScript o del build de Vite, inspecciona los logs reales de la terminal en lugar de aplicar cambios basados en suposiciones.
6. **Validación con Tests Automatizados:** Tras realizar cambios en lógica deportiva, estadísticas o tablas de posiciones, ejecuta siempre `npm test` para verificar que las suites de Vitest pasen en verde antes de dar por finalizada la tarea.

---

## 9. Deuda Técnica Conocida y Precauciones

- **Capa de Sincronización:** Consolidada al 100% en `context/SyncContext.tsx`. El hook legacy `useSupabaseSync.ts` ha sido removido y todos los modales (incluido `SaveGameModal.tsx`) consumen la sincronización directamente desde el contexto global (`useSync()`).
- **Optimización de Bundle:** Completada. Se implementó code-splitting con `React.lazy()` en todas las rutas de `App.tsx`, separación de vendors (`vendor-react`, `vendor-supabase`) y carga dinámica bajo demanda (`await import`) para `exceljs` en `exportToExcel.ts`, reduciendo la carga inicial en más de un 80%.
- **Componentes Monolíticos Pendientes de Modularizar:**
  - `PlayerSetup.tsx` (~25 KB). (`StatisticsView.tsx` y `HomePage.tsx` fueron modularizados con éxito en submódulos atómicos bajo `components/views/statistics/` y `components/views/home/`).
