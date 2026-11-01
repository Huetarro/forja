/**
 * Piezas comunes de las gráficas (Recharts). Este módulo solo se importa desde
 * componentes cargados con React.lazy, para no engordar la carga inicial.
 */
import type { ReactNode } from 'react'

/** Caja del tooltip: texto en tinta, el color de la serie solo en la marca. */
export function TooltipBox({
  title,
  rows,
}: {
  title: string
  rows: Array<{ label: string; value: string; color?: string }>
}) {
  return (
    <div className="rounded-sm bg-card-2 px-3 py-2 text-footnote shadow-[0_6px_20px_rgba(0,0,0,0.2)] ring-1 ring-sep">
      <div className="mb-0.5 font-semibold text-ink">{title}</div>
      {rows.map((r) => (
        <div key={r.label} className="tnum flex items-center gap-1.5 text-ink-2">
          {r.color && (
            <span className="size-2 rounded-full" style={{ background: r.color }} aria-hidden />
          )}
          {r.label}: <span className="font-semibold text-ink">{r.value}</span>
        </div>
      ))}
    </div>
  )
}

/** Tarjeta de gráfica con título, nota y tabla accesible. */
export function ChartCard({
  title,
  note,
  action,
  children,
  table,
}: {
  title: string
  note?: string
  action?: ReactNode
  children: ReactNode
  table?: { head: string[]; rows: string[][] }
}) {
  return (
    <section className="rounded-card bg-card p-4">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-body font-semibold">{title}</h2>
          {note && <p className="text-footnote text-ink-2">{note}</p>}
        </div>
        {action}
      </div>
      <div aria-hidden={table ? true : undefined}>{children}</div>
      {table && (
        <table className="sr-only">
          <caption>{title}</caption>
          <thead>
            <tr>
              {table.head.map((h) => (
                <th key={h}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {table.rows.map((r, i) => (
              <tr key={i}>
                {r.map((c, k) => (
                  <td key={k}>{c}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  )
}
