# Contexto del Proyecto: Cesto Tracker (AI_CONTEXT)

Este archivo sirve como la **fuente principal de verdad** para los agentes de Inteligencia Artificial que trabajen en este repositorio. Cualquier IA debe leer y adherirse a estas instrucciones antes de realizar modificaciones en el código.

## 1. Stack Tecnológico
- **Frontend**: React 18, Vite.
- **Lenguaje**: TypeScript estricto.
- **Estilos**: Tailwind CSS.
- **Backend / Base de Datos**: Supabase (PostgreSQL, Authentication).

## 2. Reglas de Arquitectura y Estructura de Directorios
El proyecto se organiza con la siguiente estructura. Las nuevas funcionalidades deben respetar estos directorios:
- `/components`: Agrupa los componentes de React categorizados por dominio:
  - `/components/ui`: Componentes genéricos y visuales (botones, loaders, menúes, etc).
  - `/components/modals`: Todos los pop-ups y ventanas modales de la aplicación.
  - `/components/game`: Componentes relacionados explícitamente a la lógica y la pantalla del partido en vivo.
  - `/components/charts`: Visualizaciones de datos, llaves de torneos y mapas de calor.
  - `/components/views`: Componentes pesados o vistas enteras (se conectan típicamente con `/pages`).
- `/context`: Contextos globales de React (ej. manejo de estado global, autenticación).
- `/hooks`: Custom hooks de React para encapsular lógica de negocio.
- `/pages`: Componentes de páginas completas o vistas principales.
- `/supabase`: Configuración de base de datos, tipos y utilidades relacionadas a Supabase.
- `/utils`: Funciones helper genéricas (ej. cálculos, formateo de fechas).
- `types.ts`: Declaraciones de tipos globales de TypeScript.
- `constants.ts`: Constantes globales del proyecto.

## 3. Reglas de Código y Buenas Prácticas
1. **TypeScript Estricto**: Evitar el uso de `any`. Siempre tipar correctamente los props, estados y respuestas de la base de datos.
2. **React Hooks**: Usar hooks (useState, useEffect, useCallback, etc.) y componentes funcionales.
3. **Tailwind CSS**: Utilizar clases utilitarias de Tailwind. Evitar crear archivos CSS custom (a menos que sea indispensable, centralizar en `index.css`). Mantener un diseño limpio, moderno, mobile-first y responsivo.
4. **Supabase**: 
   - No exponer claves secretas (Service Role) en el cliente. Usar siempre la `anon key`.
   - Las consultas a la base de datos desde el cliente deben depender de RLS (Row Level Security) configurado en Supabase.
5. **Idioma**:
   - Variables, funciones y código: Inglés.
   - Textos de interfaz de usuario (UI), notificaciones y alertas: Español.

## 4. Flujo de Trabajo para el Agente (IA)
1. **Análisis Previo**: Antes de modificar un archivo complejo o core (ej. `HomePage.tsx`), analízalo completamente para entender su estado interno y efectos secundarios.
2. **Cambios Incrementales**: Realizar cambios granulares y testeables. Si se reescribe un componente, asegurar que no rompa las dependencias existentes.
3. **Manejo de Paquetes**: No instalar nuevas dependencias en `package.json` sin consultar primero al usuario, a menos que sea una herramienta estándar para la tarea solicitada.
4. **Preservación de Código**: No eliminar comentarios explicativos o lógica existente a menos que el objetivo explícito sea una refactorización o eliminación autorizada de esa lógica.
5. **Resolución de Errores**: Si hay errores de Linting, de TypeScript o en la terminal, analizarlos leyendo los logs en lugar de intentar cambios aleatorios.

> **Nota para el agente**: Si tienes dudas sobre la implementación de alguna regla de negocio de "Cesto Tracker" que no esté especificada aquí, pregúntale al usuario antes de asumir el comportamiento esperado.
