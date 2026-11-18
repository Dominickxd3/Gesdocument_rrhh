# Gesdocument RR. HH. — Gestión Documental

Portal de gestión documental de recursos humanos.

| Parte | Tecnología |
|---|---|
| `cliente/` | React 18 + TypeScript + Vite + PrimeReact |
| `servidor/` | Nest.js 11 (sobre Express) + TypeScript |
| Base de datos | SQL Server (pendiente de conectar) |

## Cómo ejecutar

```
cd servidor && npm install && cp .env.ejemplo .env && npm run start:dev   # http://localhost:3000/api
cd cliente  && npm install && npm run dev                                   # http://localhost:5173
```

El cliente redirige `/api` al servidor mediante el proxy de Vite.

## Arquitectura

- **Por funcionalidades:** cada funcionalidad vive en su propia carpeta (`cliente/src/modulos/<funcionalidad>`, `servidor/src/modulos/<funcionalidad>`).
- **Capas (Clean Architecture pragmática):** dentro de cada módulo del servidor, `presentacion/` (controladores), `aplicacion/` (servicios con las reglas de negocio), y cuando haga falta `dominio/` (entidades e interfaces de repositorio) e `infraestructura/` (repositorios de SQL Server). Las dependencias apuntan hacia adentro: la presentación usa la aplicación, y la aplicación depende de interfaces de repositorio, no de SQL Server.
- **Inyección de dependencias:** la de Nest en el servidor; los servicios se registran como `providers` del módulo.
- **Cliente:** `aplicacion/` (arranque y rutas), `compartido/` (diseño, navegación, componentes y ganchos reutilizables) y `modulos/` (páginas de cada funcionalidad). Las interfaces se arman por composición de componentes pequeños.
- **Nombres:** en español, salvo los sufijos que exigen las herramientas (`.module.ts`, `.controller.ts`, `.service.ts`, prefijo `use` de los ganchos de React).

## Barra lateral

Ubicada en `cliente/src/compartido/diseno/`.

- Escritorio (≥ 1024 px): barra completa con logo, grupos de enlaces y usuario con su cargo.
- Tableta (768–1023 px): barra compacta con íconos e información emergente; el logo muestra solo el isotipo.
- Móvil (< 768 px): barra superior con botón de menú que abre la barra lateral como panel (`Sidebar` de PrimeReact).
- Los enlaces se definen en `compartido/navegacion/elementosNavegacion.ts`.

## Inicio de sesión (mockup)

- Página en `/iniciar-sesion` (`cliente/src/modulos/autenticacion/`). Todas las demás rutas exigen sesión.
- Por ahora la validación es **local**, para la presentación del mockup: `ServicioAutenticacionLocal` compara contra los usuarios de prueba de `modulos/autenticacion/infraestructura/usuariosPrueba.ts`.
- La sesión se guarda en el navegador: con "Recordarme" 30 días (localStorage); sin él, hasta cerrar el navegador (sessionStorage).
- El contrato está en `compartido/sesion/tipos.ts` (`ServicioAutenticacion`). Para el despliegue se crea una implementación HTTP contra Nest.js y se cambia solo en `aplicacion/Aplicacion.tsx`; los usuarios de prueba se eliminan.
- Base de datos prevista para el despliegue: SQL Server con TypeORM.

## Boletas de pago (mockup)

- Módulo en `cliente/src/modulos/boletas-pago/`, separado en `dominio/` (modelo, reglas y contrato `RepositorioBoletas`), `infraestructura/` (repositorio en memoria con datos ficticios), `aplicacion/` (hook `useBoletas`, exportación y formatos), `componentes/` y `paginas/`.
- El diseño replica la pantalla de boletas de la web existente (`D:\boleta_rrhh\frontend\app\panel\boletas\page.tsx`): fondo slate-50, tarjetas blancas con sombra, colores de insignias y botones de Tailwind, fuente Geist. Igual que allí, las boletas firmadas se pueden revertir y las pendientes se envían o comparten por enlace.
- La boleta ya no se envía por correo: se publica en la cuenta del colaborador dentro de la plataforma, donde la revisa y firma. Por eso se quitó el cupo diario de correos.
- Al abrir una boleta se muestra una ventana centrada con el documento. Es una réplica de la boleta PDF oficial de la web existente (`D:\boleta_rrhh\backend\src\pdf\pdf.service.ts`): hoja A4 con cuadrícula, secciones de identidad, fechas, jornada, sueldo, centro de costos, planilla, conceptos (grupos 01–04 con MOVIM., INGRESOS y DESCUENTOS), neto y firmas del empleador y del colaborador. Los campos siguen el detalle de `nomina.service.ts`. En pantallas angostas la hoja se reduce proporcionalmente.
- **Configuración de boletas** (sidebar → "Boletas de pago" se despliega con un clic → "Configuración"; ruta `/boletas-pago/configuracion`, página `boletas-pago/paginas/PaginaConfiguracionBoletas.tsx`): firma del representante legal (PNG, máx. 1 MB, con vista de la imagen actual y opción de eliminar) y datos de la empresa (razón social, R.U.C., dirección fiscal), igual que la página de configuración de la web existente. Los datos iniciales son los de la boleta PDF real. En el mockup se guarda en el navegador (localStorage); en producción irá a SQL Server.
- La firma del colaborador del mockup es un trazo de ejemplo.
- Los nombres, DNI y montos son inventados. Los envíos son simulados y solo duran mientras la página esté abierta.
- Para el despliegue se crea un repositorio HTTP y se cambia en `aplicacion/repositorioBoletas.ts`.

## Pendiente

- Autenticación real en el servidor (Nest.js + TypeORM + SQL Server) con contraseñas cifradas y token.
- "¿Olvidaste tu contraseña?" aún no tiene flujo.
- El contador de Documentos es fijo (2) hasta conectarlo con el servidor.
- La conexión a SQL Server no está configurada: falta elegir el ORM o controlador (por ejemplo TypeORM o `mssql`) y crear la base de datos. Las variables previstas están en `servidor/.env.ejemplo`.
