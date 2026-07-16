import { useMemo } from 'react';
import { MessageSquare, History as HistoryIcon, ClipboardList } from 'lucide-react';
import { Tarea } from '../../types';
import { GlassCard } from '../ui/GlassCard';

type EntradaBitacora = {
  id: string;
  tipo: 'comentario' | 'cambio' | 'creacion';
  fecha: string;
  usuario: string;
  tareaNombre: string;
  texto: string;
};

const formatFecha = (iso: string) => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString('es-CL', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};

const labelCampo: Record<string, string> = {
  estado: 'Estado',
  responsable: 'Responsable',
  fechaFinPlan: 'Fecha maxima de gestion',
  observacion: 'Observacion',
};

export function ProyectoBitacora({ tareas }: { tareas: Tarea[] }) {
  const entradas = useMemo(() => {
    const items: EntradaBitacora[] = [];

    tareas.forEach((tarea) => {
      (tarea.comentarios ?? []).forEach((c) => {
        items.push({
          id: `com-${c.id}`,
          tipo: 'comentario',
          fecha: c.fecha,
          usuario: c.usuario,
          tareaNombre: tarea.nombre,
          texto: c.texto,
        });
      });

      (tarea.historial ?? []).forEach((h, i) => {
        const campo = labelCampo[h.campo] ?? h.campo;
        items.push({
          id: `hist-${tarea.id}-${i}-${h.fecha}`,
          tipo: 'cambio',
          fecha: h.fecha,
          usuario: h.usuario ?? tarea.responsable,
          tareaNombre: tarea.nombre,
          texto: `${campo}: ${h.valorAnterior || '—'} → ${h.valorNuevo || '—'}`,
        });
      });
    });

    return items.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
  }, [tareas]);

  if (!entradas.length) {
    return (
      <GlassCard className="p-8 text-center">
        <ClipboardList className="mx-auto mb-3 h-8 w-8 text-slate-600" />
        <p className="text-slate-300">Aun no hay movimientos registrados en esta licitacion.</p>
        <p className="mt-1 text-sm text-slate-500">Los cambios de estado y comentarios del checklist van a aparecer aca automaticamente.</p>
      </GlassCard>
    );
  }

  return (
    <div className="space-y-3">
      {entradas.map((entrada) => (
        <GlassCard key={entrada.id} className="p-4">
          <div className="flex items-start gap-3">
            <div
              className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                entrada.tipo === 'comentario' ? 'bg-sky-400/12 text-sky-300' : 'bg-emerald-400/12 text-emerald-300'
              }`}
            >
              {entrada.tipo === 'comentario' ? <MessageSquare className="h-4 w-4" /> : <HistoryIcon className="h-4 w-4" />}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-medium text-white">{entrada.tareaNombre}</p>
                <span className="text-xs text-slate-500">{formatFecha(entrada.fecha)}</span>
              </div>
              <p className="mt-1 text-sm text-slate-300">{entrada.texto}</p>
              <p className="mt-1 text-xs text-slate-500">{entrada.usuario}</p>
            </div>
          </div>
        </GlassCard>
      ))}
    </div>
  );
}
