import { notificar } from '@/compartido/notificaciones/notificaciones';
/**
 * Descarga un documento en pantalla (boleta, contrato, papeleta, memorándum) como archivo PDF,
 * sin pasar por el diálogo de impresión y sin librerías:
 * 1. copia la hoja con los mismos estilos y la dibuja como imagen (SVG → lienzo);
 * 2. arma un PDF A4 con esa imagen (una o varias páginas) y lo descarga.
 * En producción el servidor podrá entregar el PDF ya generado.
 */

/** Ancho de una hoja A4 a 96 ppp y escala de la imagen (2 = nítida al hacer zoom). */
const ANCHO_PX = 794;
const ALTO_PAGINA_PX = 1123;
const ESCALA = 2;
const A4_PT = { ancho: 595.28, alto: 841.89 };

/** Ajustes solo para la copia: hoja a tamaño real, sin zoom, sin herramientas de firma. */
const AJUSTES = `
  .pdf-copia { background: #ffffff; }
  .pdf-copia .lienzo-firma, .pdf-copia .barra-firma { display: none !important; }
  .pdf-copia .dm-visor { zoom: 1 !important; max-height: none !important; overflow: visible !important; padding: 0 !important; background: none !important; }
  .pdf-copia .hoja-escalable-marco { overflow: visible !important; }
  .pdf-copia .hoja-escalable { width: auto !important; height: auto !important; }
  .pdf-copia .hoja-escalable__hoja { position: static !important; transform: none !important; }
  .pdf-copia .doc-hoja { box-shadow: none !important; }
  .pdf-copia .doc-marca-agua { position: absolute !important; top: 40% !important; left: 0; right: 0; }
`;

/** Nombre de archivo legible: sin caracteres que el sistema no acepta. */
export const nombreArchivo = (...partes: string[]) =>
  partes
    .join(' - ')
    .replace(/[\\/:*?"<>|]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

/** Reglas CSS de la página (las hojas de otro dominio, como las fuentes, no se pueden leer). */
function reglasCss(): string {
  let texto = '';
  for (const hoja of Array.from(document.styleSheets)) {
    try {
      for (const regla of Array.from(hoja.cssRules)) texto += `${regla.cssText}\n`;
    } catch {
      // Hoja de otro dominio: se omite y se usa la fuente de respaldo.
    }
  }
  return texto;
}

const aDataUrl = async (url: string) => {
  const archivo = await (await fetch(url)).blob();
  return new Promise<string>((listo) => {
    const lector = new FileReader();
    lector.onload = () => listo(String(lector.result));
    lector.readAsDataURL(archivo);
  });
};

/** Estilos de la página que se pueden copiar (los de otro dominio, como fuentes web, se omiten). */
function estilosPropios(): string {
  return Array.from(document.querySelectorAll('link[rel="stylesheet"], style'))
    .filter((n) => n.tagName === 'STYLE' || (n as HTMLLinkElement).href.startsWith(location.origin))
    .map((n) => n.outerHTML)
    .join('');
}

const esperarCarga = (elementos: (HTMLImageElement | HTMLLinkElement)[]) =>
  Promise.all(
    elementos.map((e) =>
      (e instanceof HTMLImageElement ? e.complete : !!e.sheet)
        ? Promise.resolve()
        : new Promise<void>((listo) => {
            e.addEventListener('load', () => listo(), { once: true });
            e.addEventListener('error', () => listo(), { once: true });
          }),
    ),
  );

/**
 * Dibuja el elemento en un lienzo, a ancho A4. La copia se arma en un marco de 794 px de ancho,
 * así se mide y se dibuja con el diseño de escritorio aunque se descargue desde un celular.
 */
async function dibujar(elemento: HTMLElement): Promise<HTMLCanvasElement> {
  const clon = elemento.cloneNode(true) as HTMLElement;
  clon.querySelectorAll('canvas').forEach((c) => c.remove());
  // Las imágenes (logo, firmas) se incrustan para que salgan dentro de la imagen.
  await Promise.all(
    Array.from(clon.querySelectorAll('img')).map(async (img) => {
      if (img.src && !img.src.startsWith('data:')) img.src = await aDataUrl(img.src).catch(() => img.src);
    }),
  );

  const marco = document.createElement('iframe');
  marco.setAttribute('aria-hidden', 'true');
  marco.style.cssText = `position:fixed;left:-30000px;top:0;width:${ANCHO_PX}px;height:200px;border:0;`;
  document.body.appendChild(marco);

  try {
    const doc = marco.contentDocument!;
    doc.open();
    doc.write(
      `<!doctype html><html lang="es"><head><meta charset="utf-8"><base href="${location.origin}/">${estilosPropios()}` +
        `<style>${AJUSTES}</style></head><body style="margin:0"><div class="pdf-copia" style="width:${ANCHO_PX}px"></div></body></html>`,
    );
    doc.close();
    const copia = doc.querySelector<HTMLElement>('.pdf-copia')!;
    copia.appendChild(doc.importNode(clon, true));
    await esperarCarga([...Array.from(doc.images), ...Array.from(doc.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"]'))]);
    await new Promise((listo) => requestAnimationFrame(() => listo(null)));

    const alto = Math.ceil(copia.scrollHeight);
    const html = new XMLSerializer().serializeToString(copia);
    const svg =
      `<svg xmlns="http://www.w3.org/2000/svg" width="${ANCHO_PX}" height="${alto}">` +
      `<foreignObject x="0" y="0" width="100%" height="100%">` +
      `<div xmlns="http://www.w3.org/1999/xhtml"><style><![CDATA[${reglasCss()}\n${AJUSTES}]]></style>${html}</div>` +
      `</foreignObject></svg>`;

    const imagen = new Image();
    imagen.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
    await imagen.decode();

    const lienzo = document.createElement('canvas');
    lienzo.width = ANCHO_PX * ESCALA;
    lienzo.height = alto * ESCALA;
    const ctx = lienzo.getContext('2d')!;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, lienzo.width, lienzo.height);
    ctx.scale(ESCALA, ESCALA);
    ctx.drawImage(imagen, 0, 0);
    return lienzo;
  } finally {
    marco.remove();
  }
}

interface PaginaPdf {
  jpeg: Uint8Array;
  ancho: number;
  alto: number;
}

/** Corta la imagen en páginas A4 y las pasa a JPEG. */
async function paginar(lienzo: HTMLCanvasElement): Promise<PaginaPdf[]> {
  const altoPagina = ALTO_PAGINA_PX * ESCALA;
  const paginas: PaginaPdf[] = [];
  for (let y = 0; y < lienzo.height; y += altoPagina) {
    const alto = Math.min(altoPagina, lienzo.height - y);
    if (alto < 24 * ESCALA && paginas.length > 0) break; // resto casi vacío
    const trozo = document.createElement('canvas');
    trozo.width = lienzo.width;
    trozo.height = alto;
    trozo.getContext('2d')!.drawImage(lienzo, 0, y, lienzo.width, alto, 0, 0, lienzo.width, alto);
    const blob = await new Promise<Blob>((listo) => trozo.toBlob((b) => listo(b!), 'image/jpeg', 0.92));
    paginas.push({ jpeg: new Uint8Array(await blob.arrayBuffer()), ancho: trozo.width, alto });
  }
  return paginas;
}

/** PDF mínimo: cada página A4 lleva su imagen JPEG arriba, a todo el ancho. */
function armarPdf(paginas: PaginaPdf[]): Blob {
  const codificar = (texto: string) => new TextEncoder().encode(texto);
  const partes: Uint8Array[] = [];
  const posiciones: number[] = [];
  let largo = 0;
  const agregar = (parte: Uint8Array | string) => {
    const bytes = typeof parte === 'string' ? codificar(parte) : parte;
    partes.push(bytes);
    largo += bytes.length;
  };
  const objeto = (numero: number, contenido: () => void) => {
    posiciones[numero] = largo;
    agregar(`${numero} 0 obj\n`);
    contenido();
    agregar('\nendobj\n');
  };

  agregar('%PDF-1.4\n%\xE2\xE3\xCF\xD3\n');
  const numeroPagina = (i: number) => 3 + i * 3;
  objeto(1, () => agregar('<< /Type /Catalog /Pages 2 0 R >>'));
  objeto(2, () =>
    agregar(`<< /Type /Pages /Kids [${paginas.map((_, i) => `${numeroPagina(i)} 0 R`).join(' ')}] /Count ${paginas.length} >>`),
  );
  paginas.forEach((p, i) => {
    const n = numeroPagina(i);
    const altoPt = (p.alto / p.ancho) * A4_PT.ancho;
    const dibujo = `q ${A4_PT.ancho} 0 0 ${altoPt.toFixed(2)} 0 ${(A4_PT.alto - altoPt).toFixed(2)} cm /Im0 Do Q`;
    objeto(n, () =>
      agregar(
        `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${A4_PT.ancho} ${A4_PT.alto}] ` +
          `/Resources << /XObject << /Im0 ${n + 2} 0 R >> >> /Contents ${n + 1} 0 R >>`,
      ),
    );
    objeto(n + 1, () => agregar(`<< /Length ${dibujo.length} >>\nstream\n${dibujo}\nendstream`));
    objeto(n + 2, () => {
      agregar(
        `<< /Type /XObject /Subtype /Image /Width ${p.ancho} /Height ${p.alto} /ColorSpace /DeviceRGB ` +
          `/BitsPerComponent 8 /Filter /DCTDecode /Length ${p.jpeg.length} >>\nstream\n`,
      );
      agregar(p.jpeg);
      agregar('\nendstream');
    });
  });

  const total = numeroPagina(paginas.length);
  const inicioXref = largo;
  let xref = `xref\n0 ${total}\n0000000000 65535 f \n`;
  for (let i = 1; i < total; i++) xref += `${String(posiciones[i]).padStart(10, '0')} 00000 n \n`;
  agregar(`${xref}trailer\n<< /Size ${total} /Root 1 0 R >>\nstartxref\n${inicioXref}\n%%EOF`);
  return new Blob(partes, { type: 'application/pdf' });
}

/** Genera el PDF del elemento y lo descarga con el nombre indicado (sin extensión). */
export async function guardarComoPdf(elemento: HTMLElement | null, nombre: string): Promise<void> {
  if (!elemento) return;
  let pdf: Blob;
  try {
    pdf = armarPdf(await paginar(await dibujar(elemento)));
  } catch {
    notificar.error('No se pudo generar el PDF', 'Vuelve a intentarlo en unos segundos.');
    return;
  }
  const enlace = document.createElement('a');
  enlace.href = URL.createObjectURL(pdf);
  enlace.download = `${nombre}.pdf`;
  document.body.appendChild(enlace);
  enlace.click();
  enlace.remove();
  setTimeout(() => URL.revokeObjectURL(enlace.href), 2000);
  notificar.exito('PDF descargado', `${nombre}.pdf`);
}
