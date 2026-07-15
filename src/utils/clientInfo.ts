import { Proyecto } from '../types';

export const getClientInfo = (proyecto: Proyecto) => ({
  razonSocial: proyecto.razonSocial || proyecto.nombre,
  rut: proyecto.rut,
  contactoConsultas: proyecto.contactoConsultas || 'Pendiente de registrar',
  numeroLicitacion: proyecto.numeroLicitacion || 'Pendiente de registrar',
  tipoLicitacion: proyecto.tipoLicitacion || 'Pendiente de registrar',
  departamentoCompra: proyecto.departamentoCompra || 'Pendiente de registrar',
  diasPlazoEvaluacion: proyecto.diasPlazoEvaluacion ?? 0,
});
