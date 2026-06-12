# MesaUTP — Frontend (React 19 + Vite)

SPA / PWA del marketplace de comida **MesaUTP** para estudiantes de **UTP Ate**.
Consume la API REST del backend Laravel.

> Backend (API Laravel): repositorio **mesautp-backend**.
> Documento de requerimientos: `../DOCUMENTACION_REQUERIMIENTOS.md`.

---

## Stack

- **React 19** + **Vite**
- **React Router v7** — enrutado SPA
- **Tailwind CSS v4** (`@tailwindcss/vite`)
- **Sonner** — notificaciones toast (único sistema de notificaciones)
- **Lucide React** — iconografía (sin emojis)
- **Leaflet** + **react-leaflet** — mapa con geolocalización
- **Axios** — cliente HTTP
- **vite-plugin-pwa** — instalable como PWA

---

## Requisitos previos

- Node.js 18+ y npm
- El backend corriendo en `http://localhost:8000`

---

## Instalación y ejecución

```bash
# 1. Instalar dependencias
npm install

# 2. Crear el archivo de entorno
copy .env.example .env       # Windows  (o crea .env manualmente)

# 3. Levantar el servidor de desarrollo
npm run dev
# App disponible en http://localhost:5173

# Build de producción
npm run build
npm run preview              # previsualizar el build
```

### Variables de entorno (`.env`)

```env
VITE_API_URL=http://localhost:8000/api
```

> El cliente Axios (`src/api/axios.js`) usa esta URL base y adjunta el token Bearer.

---

## Diseño responsive

La interfaz es **mobile-first** y se adapta a 3 tamaños:

| Breakpoint | Rango | Navegación | Listados |
|------------|-------|------------|----------|
| Móvil | < 768px | Barra inferior flotante | 1 columna |
| Tablet | 768–1024px | Barra inferior flotante | 2 columnas |
| Desktop | > 1024px (`lg:`) | **Sidebar lateral fijo** | grids de 3–5 columnas |

- En desktop, el `BottomNav` se oculta (`lg:hidden`) y aparece el `Sidebar`.
- Las páginas autenticadas se envuelven en `AppShell` (sidebar + offset `lg:pl-64`).
- Las vistas de detalle usan layout de 2 columnas con **panel de reserva sticky**.
- El login es **split-screen** en desktop (marca a la izquierda, acceso a la derecha).

---

## Estructura

```
src/
├── api/                    # clientes Axios (auth, locales, pedidos, emprendedor)
│   └── axios.js            # instancia base + token Bearer
├── components/
│   ├── AppShell.jsx        # envoltura desktop (sidebar + offset)
│   ├── Sidebar.jsx         # navegación lateral (desktop)
│   ├── BottomNav.jsx       # navegación inferior consumidor (móvil/tablet)
│   ├── BottomNavEmprendedor.jsx
│   ├── AppLayout.jsx       # layout con header para formularios
│   └── FoodImg.jsx         # imagen con fallback de icono si falla/falta
├── contexts/
│   └── AuthContext.jsx     # estado de sesión (token, usuario)
├── lib/
│   └── filtros.js          # búsqueda sin acentos + filtros por chip
├── pages/
│   ├── Auth/               # Login (welcome/form/verify), Callback
│   ├── LocalesExternos/    # Index, Todos (lista+mapa), Show
│   ├── LocalesInternos/    # Index, Show
│   ├── Pedidos/            # Mis pedidos
│   ├── Perfil/             # Perfil del consumidor
│   ├── Reserva/            # Confirmación de reserva
│   └── Emprendedor/        # Dashboard, Registro, Publicar, Pedidos, Ventas
└── App.jsx                 # rutas + Toaster (Sonner)
```

---

## Rutas (React Router)

| Ruta | Página | Acceso |
|------|--------|--------|
| `/login` | Login (magic link) | Invitado |
| `/auth/callback` | Verificación del enlace | Público |
| `/locales-externos` | Home consumidor | Privado |
| `/locales-externos/todos` | Lista completa + mapa | Privado |
| `/locales-externos/:id` | Detalle local externo | Privado |
| `/locales-internos` | Lista de internos | Privado |
| `/locales-internos/:id` | Detalle oferta interna | Privado |
| `/mis-pedidos` | Mis pedidos | Privado |
| `/perfil` | Perfil | Privado |
| `/reserva/confirmacion` | Confirmación de reserva | Privado |
| `/emprendedor` | Dashboard emprendedor | Privado |
| `/emprendedor/registro` | Registrar local | Privado |
| `/emprendedor/publicar` | Publicar oferta | Privado |
| `/emprendedor/pedidos` | Pedidos recibidos | Privado |
| `/emprendedor/ventas` | Historial de ventas | Privado |

`PrivateRoute` exige sesión y envuelve la página en `AppShell`.
`GuestRoute` redirige a `/locales-externos` si ya hay sesión.

---

## Convenciones del proyecto

- **Sin emojis como iconos** — usar siempre componentes de **Lucide**.
- **Notificaciones** — solo `toast` de **Sonner** (`import { toast } from 'sonner'`).
  Nada de `alert()` nativo.
- **Formularios** — `noValidate` + validación manual con `toast.error()`
  (sin popups nativos del navegador).
- **Imágenes** — usar `<FoodImg />` para que las rotas/ausentes muestren un placeholder.
- **Búsqueda/filtros** — usar los helpers de `src/lib/filtros.js`
  (`matchQuery`, `matchChipExterno`, `matchChipInterno`); la búsqueda ignora acentos y mayúsculas.
- **Datos de la API** — las listas de locales vienen paginadas: leer `response.data.data`.

---

## Autenticación

1. El usuario ingresa su correo @utp.edu.pe y recibe un **enlace mágico**.
2. Al abrir el enlace, `/auth/callback` verifica el token contra el backend.
3. El token Bearer se guarda en `localStorage` y se adjunta en cada petición.
4. El token no expira por inactividad; la sesión persiste hasta cerrar sesión.

---

## Scripts

```bash
npm run dev        # desarrollo (HMR)
npm run build      # build de producción
npm run preview    # previsualizar build
npm run lint       # ESLint
```
