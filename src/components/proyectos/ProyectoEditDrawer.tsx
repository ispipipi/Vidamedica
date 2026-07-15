import { useEffect, useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { Proyecto, EstadoLicitacion } from '../../types';
import { getClientInfo } from '../../utils/clientInfo';
import { Drawer } from '../ui/Drawer';

type Props = {
  proyecto: Proyecto | null;
  onClose: () => void;
};

const sistemas: EstadoLicitacion[] = ['Pendiente', 'Vencida', 'Atrasada', 'No Lograda', 'Adjudicada', 'Desierta'];

export function ProyectoEditDrawer({ proyecto, onClose }: Props) {
  const actualizarProyecto = useAppStore((s) => s.actualizarProyecto);
  const [form, setForm] = useState({
    nombre: '',
    rut: '',
    razonSocial: '',
    contactoConsultas: '',
    numeroLicitacion: '',
    tipoLicitacion: '',
    departamentoCompra: '',
    diasPlazoEvaluacion: 0,
    estadoLicitacion: 'Pendiente' as EstadoLicitacion,
    fechaPublicacion: '',
    fechaCierre: '',
    estado: 'activo' as Proyecto['estado'],
    observaciones: '',
  });

  useEffect(() => {
    if (!proyecto) return;
    const info = getClientInfo(proyecto);
    setForm({
      nombre: proyecto.nombre,
      rut: proyecto.rut,
      razonSocial: info.razonSocial,
      contactoConsultas: info.contactoConsultas,
      numeroLicitacion: info.numeroLicitacion,
      tipoLicitacion: info.tipoLicitacion,
      departamentoCompra: info.departamentoCompra,
      diasPlazoEvaluacion: info.diasPlazoEvaluacion,
      estadoLicitacion: proyecto.estadoLicitacion,
      fechaPublicacion: proyecto.fechaPublicacion,
      fechaCierre: proyecto.fechaCierre,
      estado: proyecto.estado,
      observaciones: proyecto.observaciones,
    });
  }, [proyecto]);

  const save = () => {
    if (!proyecto) return;
    actualizarProyecto(proyecto.id, form);
    onClose();
  };

  return (
    <Drawer open={!!proyecto} title="Editar licitacion" onClose={onClose}>
      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="grid gap-2 text-sm text-slate-300 sm:col-span-2">
            Nombre comercial
            <input className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white" value={form.nombre} onChange={(e) => setForm((s) => ({ ...s, nombre: e.target.value }))} />
          </label>
          <label className="grid gap-2 text-sm text-slate-300 sm:col-span-2">
            Razon social
            <input className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white" value={form.razonSocial} onChange={(e) => setForm((s) => ({ ...s, razonSocial: e.target.value }))} />
          </label>
          <label className="grid gap-2 text-sm text-slate-300">
            RUT
            <input className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white" value={form.rut} onChange={(e) => setForm((s) => ({ ...s, rut: e.target.value }))} />
          </label>
          <label className="grid gap-2 text-sm text-slate-300">
            Estado licitacion
            <select className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white" value={form.estadoLicitacion} onChange={(e) => setForm((s) => ({ ...s, estadoLicitacion: e.target.value as EstadoLicitacion }))}>
              {sistemas.map((sistema) => (
                <option key={sistema}>{sistema}</option>
              ))}
            </select>
          </label>
          <label className="grid gap-2 text-sm text-slate-300">
            Inicio
            <input type="date" className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white" value={form.fechaPublicacion} onChange={(e) => setForm((s) => ({ ...s, fechaPublicacion: e.target.value }))} />
          </label>
          <label className="grid gap-2 text-sm text-slate-300">
            Go live
            <input type="date" className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white" value={form.fechaCierre} onChange={(e) => setForm((s) => ({ ...s, fechaCierre: e.target.value }))} />
          </label>
          <label className="grid gap-2 text-sm text-slate-300">
            Contacto consultas
            <input className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white" value={form.contactoConsultas} onChange={(e) => setForm((s) => ({ ...s, contactoConsultas: e.target.value }))} />
          </label>
          <label className="grid gap-2 text-sm text-slate-300">
            Direccion
            <input className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white" value={form.numeroLicitacion} onChange={(e) => setForm((s) => ({ ...s, numeroLicitacion: e.target.value }))} />
          </label>
          <label className="grid gap-2 text-sm text-slate-300">
            Tipo licitacion
            <input className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white" value={form.tipoLicitacion} onChange={(e) => setForm((s) => ({ ...s, tipoLicitacion: e.target.value }))} />
          </label>
          <label className="grid gap-2 text-sm text-slate-300">
            Departamento de compra
            <input className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white" value={form.departamentoCompra} onChange={(e) => setForm((s) => ({ ...s, departamentoCompra: e.target.value }))} />
          </label>
          <label className="grid gap-2 text-sm text-slate-300">
            % departamentoCompra
            <input type="number" step="0.01" className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white" value={form.diasPlazoEvaluacion} onChange={(e) => setForm((s) => ({ ...s, diasPlazoEvaluacion: Number(e.target.value) }))} />
          </label>
          <label className="grid gap-2 text-sm text-slate-300">
            Estado
            <select className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white" value={form.estado} onChange={(e) => setForm((s) => ({ ...s, estado: e.target.value as Proyecto['estado'] }))}>
              <option value="activo">Activo</option>
              <option value="completado">Completado</option>
              <option value="pausado">Pausado</option>
            </select>
          </label>
        </div>

        <label className="grid gap-2 text-sm text-slate-300">
          Observaciones
          <textarea className="min-h-24 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white" value={form.observaciones} onChange={(e) => setForm((s) => ({ ...s, observaciones: e.target.value }))} />
        </label>

        <button className="w-full rounded-lg bg-emerald-400 px-4 py-3 font-semibold text-slate-950 hover:bg-emerald-300" onClick={save}>
          Guardar proyecto
        </button>
      </div>
    </Drawer>
  );
}
