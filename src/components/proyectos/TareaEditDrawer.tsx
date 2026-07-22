import { AlertTriangle, Ban, CheckCircle2, CircleDashed, MessageSquare, OctagonAlert, PlayCircle, Save, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Drawer } from '../ui/Drawer';
import { EstadoTarea, Tarea } from '../../types';
import { useAppStore } from '../../store/useAppStore';
import { usePermisos } from '../../hooks/usePermisos';
import { StatusBadge } from '../ui/StatusBadge';
import { responsableAsignadoAUsuario } from '../../utils/assignee';
import { diasVencida, tareaEstaVencida } from '../../utils/taskHealth';

type Props = {
  tarea: Tarea | null;
  onClose: () => void;
};

const estados: EstadoTarea[] = ['pendiente', 'en_proceso', 'completada', 'bloqueada', 'no_aplica', 'cancelada'];
const estadoConfig: Record<EstadoTarea, { label: string; icon: typeof CheckCircle2; active: string }> = {
  pendiente: { label: 'Pendiente', icon: CircleDashed, active: 'border-slate-300/40 bg-slate-300/15 text-white' },
  en_proceso: { label: 'En proceso', icon: PlayCircle, active: 'border-blue-300/50 bg-blue-400/15 text-blue-100' },
  completada: { label: 'Completado', icon: CheckCircle2, active: 'border-emerald-300/50 bg-emerald-400/15 text-emerald-100' },
  bloqueada: { label: 'Bloqueado', icon: OctagonAlert, active: 'border-amber-300/60 bg-amber-400/15 text-amber-100' },
  no_aplica: { label: 'No aplica', icon: XCircle, active: 'border-zinc-400/40 bg-zinc-400/10 text-zinc-300' },
  cancelada: { label: 'Cancelado', icon: Ban, active: 'border-red-300/50 bg-red-400/15 text-red-100' },
};

const formatFecha = (fecha: string) =>
  new Intl.DateTimeFormat('es-CL', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(fecha));

export function TareaEditDrawer({ tarea, onClose }: Props) {
  const { actualizarTarea, usuarioActivo, proyectos, fases, tareas } = useAppStore();
  const { puedeCambiarEstadoTarea, esComercial, esRexPlus } = usePermisos();
  const [form, setForm] = useState({ estado: 'pendiente' as EstadoTarea, comentarioNuevo: '' });

  const tareaActual = tarea ? tareas.find((item) => item.id === tarea.id) ?? tarea : null;
  const proyecto = tareaActual ? proyectos.find((p) => p.id === tareaActual.proyectoId) : null;
  const fase = tareaActual ? fases.find((f) => f.id === tareaActual.faseId) : null;
  const vencida = tareaActual ? tareaEstaVencida(tareaActual) : false;
  const overdueDays = tareaActual ? diasVencida(tareaActual) : 0;
  const puedeCambiarEstaTarea =
    !esComercial &&
    !!usuarioActivo &&
    !!tareaActual &&
    puedeCambiarEstadoTarea &&
    (!esRexPlus || responsableAsignadoAUsuario(tareaActual.responsable, usuarioActivo));
  const puedeComentar = !esComercial && !esRexPlus;
  const comentarios = tareaActual?.comentarios ?? [];

  useEffect(() => {
    if (!tareaActual) return;
    setForm({ estado: tareaActual.estado, comentarioNuevo: '' });
  }, [tareaActual?.id, tareaActual?.estado]);

  const save = () => {
    if (!tareaActual) return;
    const hoy = new Date().toISOString().slice(0, 10);
    const nuevoComentario = form.comentarioNuevo.trim();
    const nuevosComentarios = puedeComentar && nuevoComentario
      ? [
          ...(tareaActual.comentarios ?? []),
          {
            id: `comentario-${crypto.randomUUID?.() ?? Date.now()}`,
            texto: nuevoComentario,
            usuario: usuarioActivo?.nombre ?? 'Sistema',
            fecha: new Date().toISOString(),
          },
        ]
      : tareaActual.comentarios;

    const cambios: Partial<Tarea> = {
      estado: form.estado,
      ...(nuevosComentarios ? { comentarios: nuevosComentarios } : {}),
    };
    if (form.estado === 'en_proceso' || form.estado === 'completada') {
      cambios.fechaInicioReal = tareaActual.fechaInicioReal ?? hoy;
    }
    if (form.estado === 'completada') {
      cambios.fechaFinReal = tareaActual.fechaFinReal ?? hoy;
    }

    actualizarTarea(tareaActual.id, cambios, usuarioActivo?.nombre ?? 'Sistema');
    setForm((current) => ({ ...current, comentarioNuevo: '' }));
    onClose();
  };

  return (
    <Drawer open={!!tareaActual} title="Punto de checklist" onClose={onClose}>
      <div className="space-y-4">
        <section className="rounded-xl border border-white/10 bg-white/[0.035] p-4">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            {tareaActual ? <StatusBadge estado={form.estado} ping={form.estado === 'bloqueada'} /> : null}
            {vencida ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-red-500 px-2.5 py-1 text-xs font-semibold text-white">
                <AlertTriangle className="h-3.5 w-3.5" />
                Vencido hace {overdueDays} dia(s)
              </span>
            ) : null}
          </div>
          <h3 className="text-xl font-semibold leading-tight text-white">{tareaActual?.nombre}</h3>
          <p className="mt-1 text-sm text-slate-400">
            {proyecto?.nombre ?? 'Licitacion'}{fase ? ` · ${fase.nombre}` : ''}{tareaActual?.responsable ? ` · ${tareaActual.responsable}` : ''}
          </p>
        </section>

        <section className="rounded-xl border border-white/10 bg-white/[0.035] p-4">
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-white">
            <CheckCircle2 className="h-4 w-4 text-emerald-300" />
            Estado del checklist
          </div>
          <div className="grid grid-cols-3 gap-2">
            {estados.map((estado) => {
              const config = estadoConfig[estado];
              const Icon = config.icon;
              const active = form.estado === estado;
              return (
                <button
                  key={estado}
                  disabled={!puedeCambiarEstaTarea}
                  className={[
                    'flex min-h-14 flex-col items-center justify-center gap-1 rounded-lg border px-2 py-2 text-center transition disabled:cursor-not-allowed disabled:opacity-55',
                    active ? config.active : 'border-white/10 bg-white/[0.035] text-slate-300 hover:border-emerald-300/35 hover:bg-white/8',
                  ].join(' ')}
                  onClick={() => setForm((s) => ({ ...s, estado }))}
                  type="button"
                >
                  <Icon className="h-4 w-4" />
                  <span className="text-xs font-semibold">{config.label}</span>
                </button>
              );
            })}
          </div>
        </section>

        <section className="rounded-xl border border-white/10 bg-white/[0.035] p-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <span className="inline-flex items-center gap-2 font-semibold text-white">
              <MessageSquare className="h-4 w-4 text-emerald-300" />
              Comentarios
            </span>
          </div>

          <div className="mb-3 max-h-52 space-y-2 overflow-y-auto pr-1">
            {tareaActual?.observacion ? (
              <div className="rounded-lg border border-white/10 bg-white/[0.035] p-2">
                <p className="mb-1 text-xs font-medium text-slate-300">Nota</p>
                <p className="whitespace-pre-wrap text-sm text-slate-300">{tareaActual.observacion}</p>
              </div>
            ) : null}

            {comentarios.length ? (
              comentarios.map((comentario) => (
                <div key={comentario.id} className="rounded-lg border border-emerald-300/10 bg-emerald-400/[0.045] p-2">
                  <div className="mb-1 flex flex-wrap items-center justify-between gap-2 text-xs">
                    <span className="font-medium text-emerald-100">{comentario.usuario}</span>
                    <span className="text-slate-500">{formatFecha(comentario.fecha)}</span>
                  </div>
                  <p className="whitespace-pre-wrap text-sm text-slate-200">{comentario.texto}</p>
                </div>
              ))
            ) : !tareaActual?.observacion ? (
              <p className="rounded-lg border border-dashed border-white/10 p-3 text-sm text-slate-500">Sin comentarios todavia.</p>
            ) : null}
          </div>

          <label className="grid gap-2 text-sm text-slate-300">
            Agregar comentario
            <textarea
              disabled={!puedeComentar}
              className="min-h-20 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white disabled:cursor-not-allowed disabled:opacity-60"
              placeholder={!puedeComentar ? 'Este perfil no puede agregar comentarios' : 'Escribe una nota, avance o motivo del cambio...'}
              value={form.comentarioNuevo}
              onChange={(e) => setForm((s) => ({ ...s, comentarioNuevo: e.target.value }))}
            />
          </label>
        </section>

        {esComercial ? (
          <div className="rounded-xl border border-white/10 bg-white/[0.035] p-4 text-center text-sm font-medium text-slate-400">
            Perfil solo lectura: no puede modificar estado ni comentarios.
          </div>
        ) : !puedeCambiarEstaTarea && esRexPlus ? (
          <div className="rounded-xl border border-white/10 bg-white/[0.035] p-4 text-center text-sm font-medium text-slate-400">
            Solo puedes cambiar el estado de items asignados a tu nombre.
          </div>
        ) : (
          <button className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-400 px-4 py-3.5 font-semibold text-slate-950 shadow-[0_16px_32px_rgba(16,185,129,0.24)] hover:bg-emerald-300" onClick={save}>
            <Save className="h-4 w-4" />
            Actualizar checklist
          </button>
        )}
      </div>
    </Drawer>
  );
}
