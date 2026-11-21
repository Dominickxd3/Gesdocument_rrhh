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

## Roles y permisos (mockup)

Usuarios de prueba (contraseña `Mockup2026`, salvo `admin`): `admin`, `maria.torres` y `carlos.ramirez` (RR. HH.), `jose.quispe` (trabajador) y `seguridad` (Prevencionista de Seguridad, sede Lima – Canto Bello).

| Rol | Ve |
| --- | --- |
| Administrador / RR. HH. | Todo: expedientes de todos los trabajadores, boletas, papeletas, descansos, incidencias y administración. |
| Trabajador | Solo sus datos (RNF01). Todo lo suyo está agrupado en **Mi expediente** (`/mi-expediente`, módulo `modulos/mi-expediente/`), con pestañas y submenú: Documentos, Boletas de pago (revisa y firma), Descansos médicos y Memorándums. Aparte, "Mis papeletas" (estado e impresión de las aprobadas). Si entra a una ruta de gestión (`/documentos`, `/boletas-pago`, …) se le lleva a la sección equivalente de su expediente. |
| Seguridad | Es un trabajador más (ve sus propios datos como cualquier trabajador) con un permiso adicional: "Control de salidas" (RF12, CUS17, CUS18). No ve diagnósticos ni boletas de otros (RNF02). |

- Los roles se definen en `compartido/sesion/tipos.ts` (`Rol`, `esGestor`, `rutaInicialPara`). El menú filtra por `roles` en `compartido/navegacion/elementosNavegacion.ts` y las rutas se protegen con `RutaParaRoles` en `aplicacion/enrutador.tsx`.
- Las páginas internas tienen un botón **Volver** (`compartido/componentes/BotonVolver.tsx`): regresa a la página anterior o, si se abrió directo, a una ruta fija.

## Expediente digital (RF03, RF04, CUS40–CUS50)

- RR. HH. entra a **Expedientes** y ve una fila por trabajador con sus documentos requeridos firmados, pendientes y observados; puede filtrar por área, situación y fecha. La pestaña "Todos los documentos" conserva la tabla general.
- Al abrir un trabajador (`/documentos/expediente/:dni`) se ve su ficha, la lista de documentos requeridos (firmado, en curso o falta; con "Preparar" para los que faltan) y sus documentos agrupados por categoría.
- El trabajador ve lo mismo en **Mi expediente**, solo con los documentos que RR. HH. ya le envió; desde ahí firma u observa.
- El informe no detalla qué documentos son obligatorios. Se usaron los tipos existentes; la lista se ajusta en `modulos/documentos/dominio/documento.ts` (`CATEGORIAS_EXPEDIENTE` y `TIPOS_REQUERIDOS`).

## Envíos del trabajador y firmas

- **Editar antes de enviar:** el aviso de descanso médico se puede guardar como **borrador** (`descansos-medicos/aplicacion/borradoresDescanso.ts`): el trabajador lo crea, edita o elimina y RR. HH. no lo ve. Al enviarlo se pide confirmación ("ya no podrás editarlo ni eliminarlo") y queda bloqueado. Los archivos recién adjuntados también se pueden quitar hasta que se envían.
- **Firma dibujada en el propio documento:** documentos, boletas y memorándums se firman dibujando la firma con el mouse, el dedo o un lápiz directamente en el espacio de firma del documento, sobre la línea del trabajador, donde solo se ve "Firme aquí" (`compartido/componentes/LienzoFirma.tsx`); no hay ventana flotante ni se sube una imagen. Una barra flotante abajo ofrece deshacer y rehacer por trazo, borrar, alejar / tamaño original / acercar, y el botón de enviar, que se activa cuando hay firma. La firma se recorta a su trazo para quedar centrada, y bajo ella no se muestran fecha ni hora (quedan solo en el historial).

- **Guardar documentos:** boletas, contratos y demás documentos, papeletas y memorándums tienen el botón **Descargar PDF** (`compartido/documentos/guardarComoPdf.ts`). Descarga el archivo directamente, sin diálogo de impresión ni librerías: dibuja la hoja como imagen y arma un PDF A4 (una o varias páginas) con un nombre como "Boleta - Septiembre 2026 - QUISPE ROJAS JOSÉ.pdf". El texto del PDF no se puede seleccionar; en producción el servidor podrá generar el PDF con texto. Los documentos subidos como archivo se descargan tal cual.
- **Papeleta digital:** ya no se imprime (sin selector A5/A4). El trabajador abre su papeleta aprobada con el mismo detalle que ve Seguridad (`papeletas-permiso/componentes/DetallePapeleta.tsx`): autorización de RR. HH., la papeleta en formato oficial y sus datos, para mostrarla en vigilancia. Seguridad la evalúa y registra la salida.

## Control de salidas (Seguridad)

- Módulo `cliente/src/modulos/control-salidas/`. Muestra las papeletas **aprobadas por RR. HH.** de una sede y fecha (por defecto, la sede del usuario y hoy).
- Al abrir una papeleta se ve la papeleta impresa ("Copia para Vigilancia", mismo formato oficial) y el detalle del colaborador (DNI, cargo, área, sede, jefe inmediato); ahí se registra la hora de salida observada y una nota opcional. "Imprimir papeleta" abre la vista previa con las dos copias.
- Las papeletas se comparten entre módulos con `papeletas-permiso/aplicacion/almacenPapeletas.ts`, así lo que RR. HH. aprueba aparece al instante en Control de salidas.

## Uso en celulares

Muchos trabajadores entran solo desde el teléfono; todas las pantallas se probaron a 320, 375, 768 y 1280 px.

- **Estilos:** `compartido/estilos/movil.css` (cargado en `main.tsx`) reúne los ajustes para pantallas angostas.
- **Tablas:** hasta 900 px cada fila se muestra como tarjeta (DataTable `responsiveLayout="stack"`): el primer dato hace de título y el resto va como "etiqueta · valor"; nada se sale por la derecha.
- **Ventanas:** en el celular ocupan toda la pantalla; los botones del pie van en una fila (con tres, el principal arriba a todo el ancho).
- **Mi expediente:** las cuatro pestañas caben sin desplazarse (ícono arriba y nombre abajo).
- **Papeleta:** se reacomoda en una columna con letra legible. Usa consultas de contenedor, así el PDF conserva el formato oficial.
- **Firma:** en el celular la hoja se ve reducida; el zoom de la barra llega a 3× y centra solo el espacio "Firme aquí" para firmar con el dedo.
- **PDF:** se arma siempre a ancho A4 (en un marco aparte de 794 px), aunque se descargue desde el teléfono.
- **Control de salidas:** los contadores quedan en una fila; en laptops el botón de cada fila muestra solo el ícono para que la tabla quepa.

## Pendiente

- Autenticación real en el servidor (Nest.js + TypeORM + SQL Server) con contraseñas cifradas y token.
- "¿Olvidaste tu contraseña?" aún no tiene flujo.
- El contador de Documentos es fijo (2) hasta conectarlo con el servidor.
- La conexión a SQL Server no está configurada: falta elegir el ORM o controlador (por ejemplo TypeORM o `mssql`) y crear la base de datos. Las variables previstas están en `servidor/.env.ejemplo`.
