import { useEffect, useState } from 'react';
import { CheckCircle2, Loader2, RefreshCw, Sparkles } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';

type Paso = { label: string; ms: number };

const PASOS: Paso[] = [
  { label: 'Conectando con GES...', ms: 550 },
  { label: 'Trayendo licitaciones asignadas...', ms: 600 },
  { label: 'Descargando documentacion desde Mercado Publico...', ms: 550 },
  { label: 'Leyendo bases y anexos (IA)...', ms: 550 },
  { label: 'Generando checklist a partir de la documentacion...', ms: 350 },
];

export function SincronizarGESButton() {
  const sincronizarConGES = useAppStore((s) => s.sincronizarConGES);
  const [abierto, setAbierto] = useState(false);
  const [pasoActual, setPasoActual] = useState(-1);
  const [resultado, setResultado] = useState<{ agregados: number; nombres: string[] } | null>(null);

  const iniciar = () => {
    setAbierto(true);
    setResultado(null);
    setPasoActual(0);
  };

  useEffect(() => {
    if (!abierto || pasoActual < 0 || resultado) return;

    if (pasoActual >= PASOS.length) {
      sincronizarConGES().then((r) => setResultado(r));
      return;
    }

    const timer = setTimeout(() => setPasoActual((p) => p + 1), PASOS[pasoActual].ms);
    return () => clearTimeout(timer);
  }, [abierto, pasoActual, resultado, sincronizarConGES]);

  const cerrar = () => {
    setAbierto(false);
    setPasoActual(-1);
    setResultado(null);
  };

  return (
    <>
      <button
        className="inline-flex items-center gap-2 rounded-lg border border-emerald-300/30 bg-emerald-400/10 px-4 py-2 text-sm font-medium text-emerald-200 hover:bg-emerald-400/20"
        onClick={iniciar}
      >
        <RefreshCw className="h-4 w-4" />
        Sincronizar con GES
      </button>

      {abierto ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0f1117]/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl border border-white/10 bg-[#14161f] p-6 shadow-2xl">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-400/12 text-emerald-300">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <p className="text-base font-semibold text-white">Sincronizacion con GES</p>
                <p className="text-xs text-slate-500">Trae licitaciones nuevas y arma su checklist automaticamente</p>
              </div>
            </div>

            {!resultado ? (
              <div className="space-y-2">
                {PASOS.map((paso, i) => {
                  const estado = i < pasoActual ? 'ok' : i === pasoActual ? 'activo' : 'pendiente';
                  return (
                    <div
                      key={paso.label}
                      className={`flex items-center gap-3 rounded-lg border px-3 py-2 text-sm ${
                        estado === 'activo'
                          ? 'border-emerald-300/30 bg-emerald-400/10 text-emerald-100'
                          : estado === 'ok'
                            ? 'border-white/10 bg-white/5 text-slate-300'
                            : 'border-white/5 bg-transparent text-slate-600'
                      }`}
                    >
                      {estado === 'ok' ? (
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                      ) : estado === 'activo' ? (
                        <Loader2 className="h-4 w-4 shrink-0 animate-spin text-emerald-300" />
                      ) : (
                        <span className="h-4 w-4 shrink-0 rounded-full border border-slate-700" />
                      )}
                      {paso.label}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="space-y-3">
                {resultado.agregados > 0 ? (
                  <div className="rounded-lg border border-emerald-300/30 bg-emerald-400/10 p-4">
                    <p className="text-sm font-semibold text-emerald-100">
                      {resultado.agregados} licitacion{resultado.agregados > 1 ? 'es' : ''} nueva{resultado.agregados > 1 ? 's' : ''} sincronizada{resultado.agregados > 1 ? 's' : ''}
                    </p>
                    <ul className="mt-2 space-y-1 text-sm text-emerald-200/90">
                      {resultado.nombres.map((nombre) => (
                        <li key={nombre}>• {nombre}</li>
                      ))}
                    </ul>
                    <p className="mt-3 text-xs text-emerald-200/70">
                      Checklist generado automaticamente a partir de las bases y anexos. Queda pendiente de validacion humana.
                    </p>
                  </div>
                ) : (
                  <div className="rounded-lg border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
                    No hay licitaciones nuevas asignadas en GES por el momento.
                  </div>
                )}
                <button
                  className="w-full rounded-lg bg-emerald-400 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-emerald-300"
                  onClick={cerrar}
                >
                  Cerrar
                </button>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </>
  );
}
