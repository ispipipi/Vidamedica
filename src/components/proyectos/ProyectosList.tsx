import { CalendarDays, Edit3, Plus, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { usePermisos, useProyectosVisibles } from '../../hooks/usePermisos';
import { useAppStore, calcCumplimientoPlazosProyecto, calcPctPlanificadoProyecto, calcPctProyecto, semaforoCumplimientoProyecto } from '../../store/useAppStore';
import { Proyecto } from '../../types';
import { GlassCard } from '../ui/GlassCard';
import { ProgressBar } from '../ui/ProgressBar';
import { TrafficLightOrb } from '../ui/TrafficLightOrb';
import { ProyectoEditDrawer } from './ProyectoEditDrawer';
import { SincronizarGESButton } from './SincronizarGESModal';

export function ProyectosList() {
  const proyectos = useProyectosVisibles();
  const { tareas, setVista } = useAppStore();
  const { puedeEditarProyectos } = usePermisos();
  const [editing, setEditing] = useState<Proyecto | null>(null);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.18em] text-emerald-300">Portafolio</p>
          <h1 className="mt-2 text-3xl font-semibold text-white">Licitaciones</h1>
        </div>
        <div className="flex items-center gap-3">
          <SincronizarGESButton />
          {puedeEditarProyectos ? (
            <button className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-4 py-2 text-sm font-medium text-slate-200 hover:bg-white/8" onClick={() => setVista('ajustes')}>
              <Plus className="h-4 w-4" />
              Nueva licitacion
            </button>
          ) : null}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {proyectos.map((proyecto) => {
          const pct = calcPctProyecto(proyecto.id, tareas);
          const cumplimiento = calcCumplimientoPlazosProyecto(proyecto.id, tareas);
          const planificado = calcPctPlanificadoProyecto(proyecto.id, tareas);
          const estado = semaforoCumplimientoProyecto(proyecto.id, tareas);

          return (
            <GlassCard key={proyecto.id} interactive className={`p-5 ${proyecto.nuevaDesdeSync ? 'ring-2 ring-emerald-300/60' : ''}`}>
              <div className="flex h-full flex-col">
                {proyecto.nuevaDesdeSync ? (
                  <span className="mb-3 inline-flex w-fit items-center gap-1.5 rounded-full bg-emerald-400/15 px-2.5 py-1 text-xs font-semibold text-emerald-200 ring-1 ring-emerald-300/30">
                    <Sparkles className="h-3.5 w-3.5" />
                    Nueva · sincronizada desde GES
                  </span>
                ) : null}
                <div className="mb-5 flex items-start justify-between gap-4">
                  <button className="min-w-0 text-left" onClick={() => setVista('proyecto', proyecto.id)}>
                    <h2 className="truncate text-xl font-semibold text-white">{proyecto.nombre}</h2>
                    <p className="mt-1 text-sm text-slate-500">RUT {proyecto.rut}</p>
                  </button>
                  <div className="flex items-center gap-3">
                    <TrafficLightOrb estado={estado} size="md" />
                    {puedeEditarProyectos ? (
                      <button className="rounded-lg border border-white/10 p-2 text-slate-300 hover:bg-white/8" onClick={() => setEditing(proyecto)} aria-label={`Editar ${proyecto.nombre}`}>
                        <Edit3 className="h-4 w-4" />
                      </button>
                    ) : null}
                  </div>
                </div>

                <div className="mb-5 grid gap-3 text-sm text-slate-300">
                  <span className="inline-flex items-center gap-2">
                    <CalendarDays className="h-4 w-4 text-slate-500" />
                    {proyecto.fechaPublicacion} a {proyecto.fechaCierre}
                  </span>
                  <span>Estado: {proyecto.estadoLicitacion}</span>
                </div>

                <div className="mt-auto">
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="text-slate-400">Cumplimiento de plazos</span>
                    <span className="font-semibold text-white">{cumplimiento}%</span>
                  </div>
                  <ProgressBar value={cumplimiento} tone={estado === 'rojo' ? 'red' : estado === 'amarillo' ? 'amber' : 'emerald'} />
                  <div className="mt-3 flex items-center justify-between text-sm">
                    <span className="text-slate-400">% avance real</span>
                    <span className="font-semibold text-white">{pct}%</span>
                  </div>
                  <p className="mt-2 text-xs text-slate-500">Planificado a hoy: {planificado}%</p>
                </div>
              </div>
            </GlassCard>
          );
        })}
      </div>
      <ProyectoEditDrawer proyecto={editing} onClose={() => setEditing(null)} />
    </div>
  );
}
