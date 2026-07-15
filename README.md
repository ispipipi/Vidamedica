# Vidamedica — Implementator de Licitaciones

Adaptacion del template `implementator-template` de NPR para trackear el ciclo de vida de licitaciones publicas de VIDA MEDICA (Mercado Publico / GES).

## Origen
Basado en el levantamiento de la reunion del 22 de junio (gestion de licitaciones con apoyo IA) y en 3 insumos reales aportados por el cliente:
- `CheckList.xlsx` — Checklist Previo (20 items) y Checklist Avance/Final (20 items) de VIDA MEDICA.
- `Base_Licitaciones.xlsx` — Pizarra de Licitaciones real (licitadores Isaac y Katherine).
- Bases + 9 Anexos reales de la licitacion "Convenio Jeringas Varias" (Hospital Dr. Sotero del Rio, ID 1057501-172-LP26).

## Modelo de datos
- **Proyecto = Licitacion individual** (organismo, RUT, numero de licitacion, tipo LP/LE, departamento de compra, dias de evaluacion, estado).
- **Fase = etapa del proceso**: Carga y Asignacion, Revision Documental, Checklist Previo, Checklist Avance/Final, Homologacion de Productos, Cierre y Seguimiento.
- **Tarea = item de checklist o hito del proceso**, con estado (`pendiente` / `en_proceso` / `completada` / `bloqueada` / `cancelada` / `no_aplica`).

## Datos cargados
1. **Convenio Jeringas Varias** (Hospital Dr. Sotero del Rio) — real, checklist completo con estados reales del Excel (ej. "FDA: fecha vencida", "Recepcion de Muestras: falta timbre").
2. **Reactivos Laboratorio 2026** (Hospital Parral) — simulada a partir de fila real de la Pizarra.
3. **Suministro Insumos Laboratorio Clinico** (Instituto de Neurocirugia) — simulada a partir de fila real de la Pizarra.

## Correr localmente
```bash
npm install
npm run dev
```
Sin variables `VITE_FIREBASE_*` configuradas, la pantalla de login ofrece un acceso directo en "Modo demo" con los perfiles semilla (Julio, Jefe de Licitaciones, Isaac, Katherine).

Para produccion, configurar Firebase (Auth + Firestore, plan Spark) segun `FIREBASE_SETUP.md`.
