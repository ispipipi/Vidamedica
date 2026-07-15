import { Plus, Trash2 } from 'lucide-react';
import { FormEvent, useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { EstadoLicitacion } from '../../types';
import { GlassCard } from '../ui/GlassCard';

const sistemas: EstadoLicitacion[] = ['Pendiente', 'Vencida', 'Atrasada', 'No Lograda', 'Adjudicada', 'Desierta'];

export function MantenedorProyectos() {
  const { proyectos, ejecutivos, crearProyecto, eliminarProyecto } = useAppStore();
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
    ejecutivoId: ejecutivos.find((e) => e.perfil === 'artbpo_ejecutivo')?.id ?? ejecutivos[0]?.id ?? '',
    supervisorId: ejecutivos.find((e) => e.perfil === 'artbpo_admin')?.id ?? ejecutivos[0]?.id ?? '',
    fechaPublicacion: '2026-05-04',
    fechaCierre: '2026-08-01',
    estado: 'activo' as const,
    observaciones: '',
  });

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!form.nombre.trim()) return;
    crearProyecto(form);
    setForm((s) => ({
      ...s,
      nombre: '',
      rut: '',
      razonSocial: '',
      contactoConsultas: '',
      numeroLicitacion: '',
      tipoLicitacion: '',
      departamentoCompra: '',
      diasPlazoEvaluacion: 0,
      observaciones: '',
    }));
  };

  return (
    <GlassCard className="p-5">
      <h2 className="mb-4 text-xl font-semibold text-white">Mantenedor de proyectos</h2>
      <form className="grid gap-3 lg:grid-cols-4" onSubmit={submit}>
        <input className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white lg:col-span-2" placeholder="Nombre cliente" value={form.nombre} onChange={(e) => setForm((s) => ({ ...s, nombre: e.target.value }))} />
        <input className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white" placeholder="RUT" value={form.rut} onChange={(e) => setForm((s) => ({ ...s, rut: e.target.value }))} />
        <select className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white" value={form.estadoLicitacion} onChange={(e) => setForm((s) => ({ ...s, estadoLicitacion: e.target.value as EstadoLicitacion }))}>
          {sistemas.map((sistema) => (
            <option key={sistema}>{sistema}</option>
          ))}
        </select>
        <input className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white lg:col-span-2" placeholder="Razon social" value={form.razonSocial} onChange={(e) => setForm((s) => ({ ...s, razonSocial: e.target.value }))} />
        <input className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white" placeholder="Contacto consultas" value={form.contactoConsultas} onChange={(e) => setForm((s) => ({ ...s, contactoConsultas: e.target.value }))} />
        <input className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white" placeholder="Direccion" value={form.numeroLicitacion} onChange={(e) => setForm((s) => ({ ...s, numeroLicitacion: e.target.value }))} />
        <input className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white" placeholder="Tipo licitacion (LP/LE)" value={form.tipoLicitacion} onChange={(e) => setForm((s) => ({ ...s, tipoLicitacion: e.target.value }))} />
        <input className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white" placeholder="Departamento de compra" value={form.departamentoCompra} onChange={(e) => setForm((s) => ({ ...s, departamentoCompra: e.target.value }))} />
        <input type="number" step="0.01" className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white" placeholder="% departamentoCompra" value={form.diasPlazoEvaluacion} onChange={(e) => setForm((s) => ({ ...s, diasPlazoEvaluacion: Number(e.target.value) }))} />
        <input type="date" className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white" value={form.fechaPublicacion} onChange={(e) => setForm((s) => ({ ...s, fechaPublicacion: e.target.value }))} />
        <input type="date" className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white" value={form.fechaCierre} onChange={(e) => setForm((s) => ({ ...s, fechaCierre: e.target.value }))} />
        <button className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-400 px-4 py-2 font-semibold text-slate-950 hover:bg-emerald-300">
          <Plus className="h-4 w-4" />
          Crear
        </button>
      </form>

      <div className="mt-5 divide-y divide-white/8">
        {proyectos.map((p) => (
          <div key={p.id} className="flex items-center justify-between gap-4 py-3">
            <div>
              <p className="font-medium text-white">{p.nombre}</p>
              <p className="text-sm text-slate-500">{p.estadoLicitacion} · {p.fechaCierre}</p>
            </div>
            <button className="rounded-lg border border-red-400/20 p-2 text-red-300 hover:bg-red-500/10" onClick={() => eliminarProyecto(p.id)} aria-label={`Eliminar ${p.nombre}`}>
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}
