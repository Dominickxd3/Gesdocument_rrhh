/**
 * Generador de datos ficticios para el mockup. Los nombres, DNI y montos son inventados.
 * Usa una semilla por periodo para que cada mes muestre siempre los mismos datos.
 */
import type { Boleta, ConceptoBoleta, Empresa, Periodo } from '../dominio/boleta';

/** Datos de la empresa tal como aparecen en la boleta PDF de la web existente. */
export const EMPRESA_INICIAL: Empresa = {
  razonSocial: 'GRUPO PECUARIO S.A.C.',
  ruc: '20513967234',
  direccion: 'AV. CANTO BELLO 177 - LIMA - LIMA - SAN JUAN DE LURIGANCHO',
};

export const AREAS = [
  'ADM ADMINISTRACIÓN',
  'ADM ASEGURAMIENTO DE LA CALIDAD',
  'ADM CONTABILIDAD',
  'ADM FINANZAS',
  'ADM GESTIÓN HUMANA',
  'COM DISTRIBUCIÓN',
  'COM DESARROLLO DE PRODUCTO',
  'COM LOGÍSTICA',
  'COM PRODUCCIÓN',
  'COM PUNTO DE VENTA',
];

const CARGOS = ['Asistente', 'Analista', 'Operario', 'Supervisor', 'Coordinador', 'Auxiliar', 'Vendedor'];
const NOMBRES = ['Luis', 'Ana', 'Jorge', 'Rosa', 'Miguel', 'Carmen', 'José', 'Lucía', 'Pedro', 'Elena', 'Raúl', 'Sofía', 'Diego', 'Patricia', 'Andrés', 'Valeria', 'Hugo', 'Gabriela', 'Óscar', 'Daniela'];
const APELLIDOS = ['Quispe', 'Flores', 'Rojas', 'Mendoza', 'García', 'Huamán', 'Vargas', 'Castillo', 'Chávez', 'Ramos', 'Torres', 'Salazar', 'Paredes', 'Gutiérrez', 'Cárdenas', 'Medina', 'Silva', 'Espinoza', 'Ríos', 'Navarro'];

/** Generador pseudoaleatorio determinista (mulberry32). */
function crearAleatorio(semilla: number) {
  let estado = semilla;
  return () => {
    estado = (estado + 0x6d2b79f5) | 0;
    let t = Math.imul(estado ^ (estado >>> 15), 1 | estado);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const redondear = (monto: number) => Math.round(monto * 100) / 100;
const sinTildes = (texto: string) => texto.normalize('NFD').replace(/[̀-ͯ]/g, '');

/** Las boletas de un mes se envían y firman a inicios del mes siguiente. */
function fechaDespuesDe(periodo: Periodo, dia: number, hora: number): string {
  return new Date(periodo.anio, periodo.mes, dia, hora, 15).toISOString();
}

const fechaCorta = (fecha: Date) =>
  `${String(fecha.getDate()).padStart(2, '0')}/${String(fecha.getMonth() + 1).padStart(2, '0')}/${fecha.getFullYear()}`;

const MESES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
/** Formato de la planilla en la boleta PDF: "01 Octubre 2026". */
const fechaEnLetras = (fecha: Date) =>
  `${String(fecha.getDate()).padStart(2, '0')} ${MESES[fecha.getMonth()]} ${fecha.getFullYear()}`;

const capitalizar = (texto: string) => texto.charAt(0).toUpperCase() + texto.slice(1).toLowerCase();

export function generarBoletas(periodo: Periodo): Boleta[] {
  const aleatorio = crearAleatorio(periodo.anio * 100 + periodo.mes);
  const elegir = <T,>(lista: T[]) => lista[Math.floor(aleatorio() * lista.length)]!;
  const enCurso = periodo.estado === 'en_curso';
  const cantidad = enCurso ? 38 : 120 + Math.floor(aleatorio() * 40);
  const generadorDni = crearAleatorio(4242);
  const inicioMes = new Date(periodo.anio, periodo.mes - 1, 1);
  const finMes = new Date(periodo.anio, periodo.mes, 0);
  const diasDelMes = finMes.getDate();
  const mesTexto = String(periodo.mes).padStart(2, '0');
  const periodoPlanilla = `MES: ${mesTexto} - ${periodo.anio} - Del ${fechaEnLetras(inicioMes)} al ${fechaEnLetras(finMes)}`;

  const boletas: Boleta[] = [];
  for (let i = 0; i < cantidad; i++) {
    const apellidos = `${elegir(APELLIDOS)} ${elegir(APELLIDOS)}`;
    const nombre = elegir(NOMBRES);
    const dni = String(40000000 + Math.floor(generadorDni() * 39999999));
    const area = elegir(AREAS);
    const cargo = elegir(CARGOS);
    const afp = aleatorio() > 0.3;
    const sueldoBasico = 1130 + Math.floor(aleatorio() * 30) * 50;
    const diasNoLaborados = aleatorio() > 0.88 ? 1 + Math.floor(aleatorio() * 2) : 0;
    const diasLaborados = diasDelMes - diasNoLaborados;
    const horasSobretiempo = aleatorio() > 0.7 ? 2 + Math.floor(aleatorio() * 10) : 0;

    const ingresos: ConceptoBoleta[] = [
      { concepto: 'SUELDO BASICO', monto: sueldoBasico, movimiento: `${diasLaborados} DIAS` },
    ];
    if (aleatorio() > 0.5) ingresos.push({ concepto: 'ASIGNACION FAMILIAR', monto: 113 });
    if (aleatorio() > 0.6) ingresos.push({ concepto: 'BONO', monto: 50 * (2 + Math.floor(aleatorio() * 8)) });
    if (horasSobretiempo > 0) {
      ingresos.push({
        concepto: 'HORAS EXTRAS 25%',
        monto: redondear(horasSobretiempo * (sueldoBasico / 240) * 1.25),
        movimiento: `${horasSobretiempo} HORAS`,
      });
    }
    const bruto = ingresos.reduce((t, x) => t + x.monto, 0);

    const descuentos: ConceptoBoleta[] = [];
    if (diasNoLaborados > 0) descuentos.push({ concepto: 'INASISTENCIAS', monto: redondear((sueldoBasico / 30) * diasNoLaborados) });
    if (aleatorio() > 0.6) descuentos.push({ concepto: 'DESCUENTO POR ADEL. SUELDO', monto: 20 * (2 + Math.floor(aleatorio() * 10)) });
    if (bruto > 3000) descuentos.push({ concepto: 'RENTA DE QUINTA CATEGORIA', monto: redondear(bruto * 0.08) });

    const aportesTrabajador: ConceptoBoleta[] = afp
      ? [
          { concepto: 'SPP - APORTE OBLIGATORIO', monto: redondear(bruto * 0.1) },
          { concepto: 'PRIMA DE SEGURO AFP', monto: redondear(bruto * 0.0137) },
        ]
      : [{ concepto: 'SNP - APORTE ONP', monto: redondear(bruto * 0.13) }];

    const enviado = enCurso ? aleatorio() > 0.85 : aleatorio() > 0.03;
    const firmada = enviado && aleatorio() > (enCurso ? 0.5 : 0.45);
    const diaEnvio = 1 + Math.floor(aleatorio() * 3);
    const fechaIngreso = new Date(2012 + Math.floor(aleatorio() * 13), Math.floor(aleatorio() * 12), 1 + Math.floor(aleatorio() * 27));
    const areaSinTildes = sinTildes(area);

    boletas.push({
      id: `${periodo.anio}${periodo.mes}-${i}`,
      numero: periodo.mes * 1000 + i,
      dni,
      trabajador: `${apellidos} ${nombre}`.toUpperCase(),
      usuario: sinTildes(`${nombre}.${apellidos.split(' ')[0]}${i}`.toLowerCase()),
      area,
      cargo,
      detalle: {
        situacion: 'ACTIVO',
        fechaIngreso: fechaCorta(fechaIngreso),
        fechaCese: '',
        tipoTrabajador: cargo === 'Operario' ? 'OBREROS' : 'EMPLEADOS',
        regimenPensionario: afp ? elegir(['SPP Integra', 'SPP Prima', 'SPP Profuturo', 'SPP Habitat']) : 'SNP - ONP',
        cuspp: afp ? `${Math.floor(aleatorio() * 900000) + 100000}${sinTildes(nombre.slice(0, 2) + apellidos.slice(0, 3)).toUpperCase()}${Math.floor(aleatorio() * 9)}` : '',
        diasLaborados,
        diasNoLaborados,
        diasSubsidiados: 0,
        condicion: 'DOMICILIADO',
        totalHoras: diasLaborados * 8,
        minutos: 0,
        horasSobretiempo,
        minutosSobretiempo: 0,
        sueldoBasico,
        centroCostos: `${areaSinTildes} - 2020`,
        ocupacion: `${cargo} de ${capitalizar(area.slice(4).split(' ').slice(-1)[0]!)}`,
        otrosEmpleadoresRenta5ta: 'NO TIENE',
        periodoPlanilla,
        ingresos,
        descuentos,
        aportesTrabajador,
        aportesEmpleador: [
          { concepto: 'ESSALUD', monto: redondear(Math.max(bruto, 1130) * 0.09) },
          { concepto: 'S.C.T.R. - SALUD', monto: redondear(sueldoBasico * 0.007) },
          { concepto: 'S.C.T.R. - PENSIONES', monto: redondear(sueldoBasico * 0.007) },
          { concepto: 'SEGURO VIDA LEY', monto: redondear(sueldoBasico * 0.002) },
        ],
      },
      firma: firmada ? 'firmada' : 'pendiente',
      fechaFirma: firmada ? fechaDespuesDe(periodo, diaEnvio + 1 + Math.floor(aleatorio() * 5), 10) : null,
      estadoEnvio: enviado ? 'enviado' : 'no_enviado',
      fechaEnvio: enviado ? fechaDespuesDe(periodo, diaEnvio, 8) : null,
    });
  }
  return boletas.sort((a, b) => a.trabajador.localeCompare(b.trabajador));
}
