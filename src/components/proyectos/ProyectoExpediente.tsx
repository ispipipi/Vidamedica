import { ExternalLink, FileText, KeyRound, Link2, Plus, ShieldAlert, Trash2, Upload } from 'lucide-react';
import { ChangeEvent, FormEvent, useMemo, useState } from 'react';
import { usePermisos } from '../../hooks/usePermisos';
import { useAppStore } from '../../store/useAppStore';
import { AccesoCompania, DocumentoExpediente, PortalAcceso, TipoDocumentoExpediente } from '../../types';
import { GlassCard } from '../ui/GlassCard';

type Props = {
  proyectoId: string;
};

type AccesoForm = Omit<AccesoCompania, 'id' | 'actualizadoPor' | 'actualizadoEn'> & { id?: string };

const tiposDocumento: TipoDocumentoExpediente[] = ['Bases', 'Anexo administrativo', 'Anexo tecnico', 'Certificado', 'Boleta de garantia', 'Ficha tecnica', 'Otro'];
const portales: PortalAcceso[] = ['Previred', 'MiDT', 'Caja compensacion', 'AFC', 'Mutual', 'Portal licencias', 'Otro'];
const TAMANO_MAXIMO_BYTES = 4 * 1024 * 1024; // 4MB, limite razonable para guardar en el navegador (demo)

const formatoFecha = (fecha: string) =>
  new Intl.DateTimeFormat('es-CL', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(fecha));

const formatoTamano = (bytes?: number) => {
  if (!bytes) return null;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const leerArchivoComoDataUrl = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });

export function ProyectoExpediente({ proyectoId }: Props) {
  const {
    expedientes,
    agregarDocumentoExpediente,
    eliminarDocumentoExpediente,
    guardarAccesoExpediente,
    eliminarAccesoExpediente,
  } = useAppStore();
  const { puedeAdministrar } = usePermisos();
  const expediente = expedientes[proyectoId] ?? { documentos: [], accesos: [] };
  const [modo, setModo] = useState<'archivo' | 'enlace'>('archivo');
  const [archivoSeleccionado, setArchivoSeleccionado] = useState<File | null>(null);
  const [errorArchivo, setErrorArchivo] = useState<string | null>(null);
  const [subiendo, setSubiendo] = useState(false);
  const [documentoForm, setDocumentoForm] = useState({
    nombre: '',
    tipo: 'Bases' as TipoDocumentoExpediente,
    url: '',
    descripcion: '',
  });
  const [accesoForm, setAccesoForm] = useState<AccesoForm>({
    portal: 'Previred',
    url: '',
    usuario: '',
    referenciaClave: '',
    responsable: '',
    notas: '',
  });

  const documentosOrdenados = useMemo(
    () => [...expediente.documentos].sort((a, b) => b.creadoEn.localeCompare(a.creadoEn)),
    [expediente.documentos],
  );

  const accesosOrdenados = useMemo(
    () => [...expediente.accesos].sort((a, b) => a.portal.localeCompare(b.portal)),
    [expediente.accesos],
  );

  const onSeleccionarArchivo = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setErrorArchivo(null);
    if (!file) {
      setArchivoSeleccionado(null);
      return;
    }
    if (file.size > TAMANO_MAXIMO_BYTES) {
      setErrorArchivo(`El archivo pesa ${formatoTamano(file.size)}, el maximo para esta demo es 4 MB.`);
      setArchivoSeleccionado(null);
      event.target.value = '';
      return;
    }
    setArchivoSeleccionado(file);
    setDocumentoForm((current) => ({ ...current, nombre: current.nombre || file.name }));
  };

  const submitDocumento = async (event: FormEvent) => {
    event.preventDefault();

    if (modo === 'archivo') {
      if (!archivoSeleccionado) {
        setErrorArchivo('Selecciona un archivo para cargar.');
        return;
      }
      setSubiendo(true);
      try {
        const dataUrl = await leerArchivoComoDataUrl(archivoSeleccionado);
        agregarDocumentoExpediente(proyectoId, {
          nombre: documentoForm.nombre.trim() || archivoSeleccionado.name,
          tipo: documentoForm.tipo,
          url: dataUrl,
          descripcion: documentoForm.descripcion.trim(),
          origen: 'archivo',
          mimeType: archivoSeleccionado.type,
          tamanoBytes: archivoSeleccionado.size,
        });
        setDocumentoForm((current) => ({ ...current, nombre: '', descripcion: '' }));
        setArchivoSeleccionado(null);
      } finally {
        setSubiendo(false);
      }
      return;
    }

    if (!documentoForm.nombre.trim() || !documentoForm.url.trim()) return;
    agregarDocumentoExpediente(proyectoId, {
      nombre: documentoForm.nombre.trim(),
      tipo: documentoForm.tipo,
      url: documentoForm.url.trim(),
      descripcion: documentoForm.descripcion.trim(),
      origen: 'enlace',
    });
    setDocumentoForm((current) => ({ ...current, nombre: '', url: '', descripcion: '' }));
  };

  const submitAcceso = (event: FormEvent) => {
    event.preventDefault();
    if (!accesoForm.portal || !accesoForm.usuario.trim()) return;
    guardarAccesoExpediente(proyectoId, {
      ...accesoForm,
      url: accesoForm.url.trim(),
      usuario: accesoForm.usuario.trim(),
      referenciaClave: accesoForm.referenciaClave.trim(),
      responsable: accesoForm.responsable.trim(),
      notas: accesoForm.notas?.trim(),
    });
    setAccesoForm({
      portal: 'Previred',
      url: '',
      usuario: '',
      referenciaClave: '',
      responsable: '',
      notas: '',
    });
  };

  const editarAcceso = (acceso: AccesoCompania) => {
    setAccesoForm({
      id: acceso.id,
      portal: acceso.portal,
      url: acceso.url,
      usuario: acceso.usuario,
      referenciaClave: acceso.referenciaClave,
      responsable: acceso.responsable,
      notas: acceso.notas ?? '',
    });
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
      <section className="space-y-4">
        <div>
          <p className="text-sm uppercase tracking-[0.18em] text-emerald-300">Expediente digital</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">Documentos importantes</h2>
          <p className="mt-2 text-sm text-slate-400">
            Carga bases, anexos, certificados y demas archivos de esta licitacion, o pega un enlace (Drive, Mercado Publico, etc).
          </p>
        </div>

        {puedeAdministrar ? (
          <GlassCard className="p-4">
            <div className="mb-3 flex gap-2">
              <button
                type="button"
                onClick={() => setModo('archivo')}
                className={`inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-semibold ${modo === 'archivo' ? 'border-emerald-300/40 bg-emerald-300/12 text-emerald-100' : 'border-white/10 text-slate-400 hover:bg-white/8'}`}
              >
                <Upload className="h-3.5 w-3.5" />
                Cargar archivo
              </button>
              <button
                type="button"
                onClick={() => setModo('enlace')}
                className={`inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-semibold ${modo === 'enlace' ? 'border-emerald-300/40 bg-emerald-300/12 text-emerald-100' : 'border-white/10 text-slate-400 hover:bg-white/8'}`}
              >
                <Link2 className="h-3.5 w-3.5" />
                Pegar enlace
              </button>
            </div>

            <form className="grid gap-3 md:grid-cols-6" onSubmit={submitDocumento}>
              {modo === 'archivo' ? (
                <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-white/15 bg-white/5 px-3 py-2 text-sm text-slate-300 hover:border-emerald-300/40 md:col-span-2">
                  <Upload className="h-4 w-4 shrink-0 text-emerald-300" />
                  <span className="truncate">{archivoSeleccionado ? archivoSeleccionado.name : 'Elegir archivo (PDF, imagen, Word...)'}</span>
                  <input type="file" className="hidden" onChange={onSeleccionarArchivo} />
                </label>
              ) : (
                <input
                  className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white md:col-span-2"
                  placeholder="URL del documento"
                  type="url"
                  value={documentoForm.url}
                  onChange={(event) => setDocumentoForm((current) => ({ ...current, url: event.target.value }))}
                />
              )}
              <input
                className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
                placeholder="Nombre del documento"
                value={documentoForm.nombre}
                onChange={(event) => setDocumentoForm((current) => ({ ...current, nombre: event.target.value }))}
              />
              <select
                className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
                value={documentoForm.tipo}
                onChange={(event) => setDocumentoForm((current) => ({ ...current, tipo: event.target.value as TipoDocumentoExpediente }))}
              >
                {tiposDocumento.map((tipo) => (
                  <option key={tipo} value={tipo}>{tipo}</option>
                ))}
              </select>
              <button disabled={subiendo} className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-400 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-emerald-300 disabled:opacity-60">
                <Plus className="h-4 w-4" />
                {subiendo ? 'Cargando...' : 'Agregar'}
              </button>
              <textarea
                className="min-h-20 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white md:col-span-6"
                placeholder="Descripcion breve"
                value={documentoForm.descripcion}
                onChange={(event) => setDocumentoForm((current) => ({ ...current, descripcion: event.target.value }))}
              />
              {errorArchivo ? <p className="text-xs text-red-300 md:col-span-6">{errorArchivo}</p> : null}
            </form>
          </GlassCard>
        ) : null}

        <div className="grid gap-3">
          {documentosOrdenados.length ? (
            documentosOrdenados.map((documento) => (
              <DocumentoCard
                key={documento.id}
                documento={documento}
                puedeAdministrar={puedeAdministrar}
                onDelete={() => eliminarDocumentoExpediente(proyectoId, documento.id)}
              />
            ))
          ) : (
            <GlassCard className="p-5 text-sm text-slate-400">Aun no hay documentos registrados en el expediente.</GlassCard>
          )}
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <p className="text-sm uppercase tracking-[0.18em] text-emerald-300">Accesos operacionales</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">Portales y claves</h2>
          <p className="mt-2 text-sm text-slate-400">
            Registra portal, usuario y referencia segura de la clave. No guardes contrasenas en texto plano.
          </p>
        </div>

        {puedeAdministrar ? (
          <>
            <div className="rounded-lg border border-amber-300/20 bg-amber-300/10 p-3 text-sm text-amber-100">
              <div className="flex gap-2">
                <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
                <p>Por seguridad, usa el campo referencia para indicar donde esta la clave: 1Password, Bitwarden, Keeper, caja fuerte interna o ticket autorizado.</p>
              </div>
            </div>
            <GlassCard className="p-4">
              <form className="grid gap-3 sm:grid-cols-2" onSubmit={submitAcceso}>
                <select
                  className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
                  value={accesoForm.portal}
                  onChange={(event) => setAccesoForm((current) => ({ ...current, portal: event.target.value as PortalAcceso }))}
                >
                  {portales.map((portal) => (
                    <option key={portal} value={portal}>{portal}</option>
                  ))}
                </select>
                <input
                  className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
                  placeholder="URL portal"
                  value={accesoForm.url}
                  onChange={(event) => setAccesoForm((current) => ({ ...current, url: event.target.value }))}
                />
                <input
                  className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
                  placeholder="Usuario"
                  value={accesoForm.usuario}
                  onChange={(event) => setAccesoForm((current) => ({ ...current, usuario: event.target.value }))}
                />
                <input
                  className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
                  placeholder="Referencia segura de clave"
                  value={accesoForm.referenciaClave}
                  onChange={(event) => setAccesoForm((current) => ({ ...current, referenciaClave: event.target.value }))}
                />
                <input
                  className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
                  placeholder="Responsable del acceso"
                  value={accesoForm.responsable}
                  onChange={(event) => setAccesoForm((current) => ({ ...current, responsable: event.target.value }))}
                />
                <button className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-400 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-emerald-300">
                  <KeyRound className="h-4 w-4" />
                  {accesoForm.id ? 'Actualizar acceso' : 'Guardar acceso'}
                </button>
                <textarea
                  className="min-h-20 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white sm:col-span-2"
                  placeholder="Notas de uso, permisos, restricciones o proceso de solicitud"
                  value={accesoForm.notas}
                  onChange={(event) => setAccesoForm((current) => ({ ...current, notas: event.target.value }))}
                />
              </form>
            </GlassCard>
          </>
        ) : (
          <GlassCard className="p-5 text-sm text-slate-400">
            Los accesos operacionales solo estan disponibles para administradores.
          </GlassCard>
        )}

        {puedeAdministrar ? (
          <div className="grid gap-3">
            {accesosOrdenados.length ? (
              accesosOrdenados.map((acceso) => (
                <AccesoCard
                  key={acceso.id}
                  acceso={acceso}
                  onEdit={() => editarAcceso(acceso)}
                  onDelete={() => eliminarAccesoExpediente(proyectoId, acceso.id)}
                />
              ))
            ) : (
              <GlassCard className="p-5 text-sm text-slate-400">Aun no hay accesos registrados.</GlassCard>
            )}
          </div>
        ) : null}
      </section>
    </div>
  );
}

function DocumentoCard({
  documento,
  puedeAdministrar,
  onDelete,
}: {
  documento: DocumentoExpediente;
  puedeAdministrar: boolean;
  onDelete: () => void;
}) {
  return (
    <GlassCard className="p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/8 px-2.5 py-1 text-xs text-slate-300">
              <FileText className="h-3.5 w-3.5" />
              {documento.tipo}
            </span>
            <span className="text-xs text-slate-500">{formatoFecha(documento.creadoEn)} · {documento.creadoPor}{documento.tamanoBytes ? ` · ${formatoTamano(documento.tamanoBytes)}` : ''}</span>
          </div>
          <h3 className="font-semibold text-white">{documento.nombre}</h3>
          {documento.descripcion ? <p className="mt-1 text-sm text-slate-400">{documento.descripcion}</p> : null}
        </div>
        <div className="flex items-center gap-2">
          <a
            className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-sm text-slate-200 hover:bg-white/8"
            href={documento.url}
            target="_blank"
            rel="noreferrer"
            download={documento.origen === 'archivo' ? documento.nombre : undefined}
          >
            Abrir
            <ExternalLink className="h-4 w-4" />
          </a>
          {puedeAdministrar ? (
            <button className="rounded-lg border border-red-400/20 p-2 text-red-300 hover:bg-red-500/10" onClick={onDelete} aria-label={`Eliminar ${documento.nombre}`}>
              <Trash2 className="h-4 w-4" />
            </button>
          ) : null}
        </div>
      </div>
    </GlassCard>
  );
}

function AccesoCard({
  acceso,
  onEdit,
  onDelete,
}: {
  acceso: AccesoCompania;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <GlassCard className="p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-400/10 px-2.5 py-1 text-xs text-emerald-100">
              <KeyRound className="h-3.5 w-3.5" />
              {acceso.portal}
            </span>
            <span className="text-xs text-slate-500">Actualizado {formatoFecha(acceso.actualizadoEn)}</span>
          </div>
          <p className="text-sm text-slate-400">Usuario</p>
          <h3 className="font-semibold text-white">{acceso.usuario}</h3>
          <div className="mt-3 grid gap-2 text-sm text-slate-400">
            <p><span className="text-slate-500">Clave:</span> {acceso.referenciaClave || 'Referencia no registrada'}</p>
            <p><span className="text-slate-500">Responsable:</span> {acceso.responsable || 'Sin responsable'}</p>
            {acceso.notas ? <p><span className="text-slate-500">Notas:</span> {acceso.notas}</p> : null}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {acceso.url ? (
            <a className="rounded-lg border border-white/10 p-2 text-slate-300 hover:bg-white/8" href={acceso.url} target="_blank" rel="noreferrer" aria-label={`Abrir ${acceso.portal}`}>
              <ExternalLink className="h-4 w-4" />
            </a>
          ) : null}
          <button className="rounded-lg border border-white/10 px-3 py-2 text-sm text-slate-300 hover:bg-white/8" onClick={onEdit}>
            Editar
          </button>
          <button className="rounded-lg border border-red-400/20 p-2 text-red-300 hover:bg-red-500/10" onClick={onDelete} aria-label={`Eliminar ${acceso.portal}`}>
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </GlassCard>
  );
}
