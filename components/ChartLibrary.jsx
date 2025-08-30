"use client"

import { useEffect, useState } from "react"
import {
  Menu,
  Bell,
  Search,
  BrainCircuit,
  Target,
  ClipboardList,
  Flag,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Rocket,
  CalendarDays,
  FileText,
  PlayCircle,
  Plus,
} from "lucide-react"
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts"

// --- Design Tokens ---
const cobalt = "#0047AB" // brand primary
const ok = "#16a34a" // green-600
const warn = "#f59e0b" // amber-500
const danger = "#ef4444" // red-500

// --- Utilities ---
function classNames(...a) {
  return a.filter(Boolean).join(" ")
}

// --- Small UI primitives (Tailwind-only to avoid external UI deps) ---
const Button = ({ variant = "solid", className = "", children, ...props }) => {
  const base =
    "inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2"
  const variants = {
    solid: `bg-[${cobalt}] text-white hover:opacity-90 focus:ring-[${cobalt}]`,
    ghost: "bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-gray-300",
    soft: `bg-[${cobalt}14] text-[${cobalt}] hover:bg-[${cobalt}1f] focus:ring-[${cobalt}]`,
    danger: `bg-[${danger}] text-white hover:opacity-90 focus:ring-[${danger}]`,
  }
  return (
    <button className={classNames(base, variants[variant], className)} {...props}>
      {children}
    </button>
  )
}

const Card = ({ className = "", children }) => (
  <div className={classNames("rounded-2xl border border-gray-200 bg-white shadow-sm", className)}>{children}</div>
)
const CardHeader = ({ className = "", title, actions }) => (
  <div className={classNames("flex items-center justify-between p-4", className)}>
    <h3 className="text-sm font-semibold text-gray-800">{title}</h3>
    <div className="flex items-center gap-2">{actions}</div>
  </div>
)
const CardBody = ({ className = "", children }) => <div className={classNames("p-4", className)}>{children}</div>

const Badge = ({ tone = "gray", children }) => {
  const tones = {
    gray: "bg-gray-100 text-gray-700",
    blue: `bg-[${cobalt}14] text-[${cobalt}]`,
    green: "bg-green-100 text-green-700",
    amber: "bg-amber-100 text-amber-700",
    red: "bg-red-100 text-red-700",
  }
  return (
    <span className={classNames("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs", tones[tone])}>
      {children}
    </span>
  )
}

const Progress = ({ value }) => (
  <div className="h-2 w-full rounded-full bg-gray-200">
    <div
      className="h-2 rounded-full bg-gray-900"
      style={{ width: `${Math.min(100, Math.max(0, value))}%`, backgroundColor: cobalt }}
    />
  </div>
)

// --- Types (JSDoc for editor intellisense) ---
/** @typedef {{id:string, title:string}} Topic */
/** @typedef {{id:string, text:string, createdAt:number}} Note */
/** @typedef {{id:string, type:'Riesgo'|'Oportunidad', title:string, prob:number, impact:number, owner?:string}} Risk */
/** @typedef {{id:string, kind:string, items:string[]}} Matrix */
/** @typedef {{id:string, title:string, progress:number, krs:{id:string, title:string, progress:number}[]}} OKR */

// --- Mock seed data ---
const seedTopics = /** @type {Topic[]} */ ([
  { id: "t1", title: "Contexto de la Organización" },
  { id: "t2", title: "Análisis de Interesados" },
  { id: "t3", title: "Procesos actuales (As-Is)" },
  { id: "t4", title: "Tecnología & Datos" },
  { id: "t5", title: "Regulación & Conformidad (PMP/ISO)" },
])

const seedOKRs = /** @type {OKR[]} */ ([
  {
    id: "o1",
    title: "Disminuir tiempos de ciclo en 20%",
    progress: 58,
    krs: [
      { id: "kr1", title: "KR 1.1: Automatizar reportes semanales", progress: 80 },
      { id: "kr2", title: "KR 1.2: Reducir retrabajos a <5%", progress: 35 },
      { id: "kr3", title: "KR 1.3: SLA de proveedor crítico >= 95%", progress: 60 },
    ],
  },
  {
    id: "o2",
    title: "Incrementar satisfacción del stakeholder clave a 4.5/5",
    progress: 42,
    krs: [
      { id: "kr4", title: "KR 2.1: Implementar tablero CX", progress: 30 },
      { id: "kr5", title: "KR 2.2: Sesiones quincenales con sponsor", progress: 50 },
    ],
  },
])

const velocityData = [
  { sprint: "S1", pts: 20 },
  { sprint: "S2", pts: 24 },
  { sprint: "S3", pts: 18 },
  { sprint: "S4", pts: 27 },
  { sprint: "S5", pts: 29 },
]

// --- Main App ---
export default function MaIAApp() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [activeModule, setActiveModule] = useState(
    /** @type {'diagnostico'|'diseno'|'ejecucion'|'cierre'} */ ("diagnostico"),
  )
  const [role, setRole] = useState(/** @type {'consultor'|'lider'} */ ("consultor"))
  const [q, setQ] = useState("")

  return (
    <div className="h-screen w-full overflow-hidden bg-gray-50 text-gray-900">
      {/* Topbar */}
      <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-gray-200 bg-white px-4">
        <div className="flex items-center gap-3">
          <button
            className="rounded-lg p-2 hover:bg-gray-100"
            onClick={() => setSidebarOpen((v) => !v)}
            aria-label="Toggle sidebar"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2 text-[15px] font-semibold">
            <BrainCircuit style={{ color: cobalt }} className="h-5 w-5" />
            <span className="tracking-tight" style={{ color: cobalt }}>
              MaIA — Suite de Agentes para Gestión (PMP / ISO 56000)
            </span>
          </div>
        </div>
        <div className="flex flex-1 items-center justify-center px-4">
          <div className="flex w-full max-w-xl items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2">
            <Search className="h-4 w-4 text-gray-500" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar proyectos, riesgos, OKRs…"
              className="w-full bg-transparent text-sm outline-none placeholder:text-gray-400"
            />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <RoleSwitcher role={role} setRole={setRole} />
          <button className="relative rounded-lg p-2 hover:bg-gray-100" aria-label="Notifications">
            <Bell className="h-5 w-5" />
            <span className="absolute -right-0.5 -top-0.5 inline-flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
              3
            </span>
          </button>
          <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-1.5">
            <div className="h-6 w-6 rounded-full bg-gray-200" />
            <div className="leading-tight">
              <div className="text-xs font-semibold">Tú</div>
              <div className="text-[10px] text-gray-500">{role === "lider" ? "Líder de Proyecto" : "Consultor"}</div>
            </div>
          </div>
        </div>
      </header>

      {/* Body */}
      <div className="flex h-[calc(100vh-4rem)]">
        {sidebarOpen && (
          <aside className="w-72 shrink-0 border-r border-gray-200 bg-white">
            <nav className="flex h-full flex-col p-3">
              <NavItem
                icon={<ClipboardList className="h-4 w-4" />}
                label="Diagnóstico (As-Is / Iniciativas)"
                active={activeModule === "diagnostico"}
                onClick={() => setActiveModule("diagnostico")}
              />
              <NavItem
                icon={<Target className="h-4 w-4" />}
                label="Diseño & Planificación"
                active={activeModule === "diseno"}
                onClick={() => setActiveModule("diseno")}
              />
              <NavItem
                icon={<PlayCircle className="h-4 w-4" />}
                label="Ejecución & Seguimiento"
                active={activeModule === "ejecucion"}
                onClick={() => setActiveModule("ejecucion")}
              />
              <NavItem
                icon={<FileText className="h-4 w-4" />}
                label="Cierre, Reportes & Lecciones Aprendidas"
                active={activeModule === "cierre"}
                onClick={() => setActiveModule("cierre")}
              />

              <div className="mt-4 border-t pt-4">
                <div className="px-2 text-[10px] uppercase tracking-wide text-gray-500">Vistas</div>
                <div className="mt-2 flex flex-col gap-1">
                  <SecondaryNav label="Todos los Proyectos" />
                  <SecondaryNav label="Portafolio & Roadmap" />
                  <SecondaryNav label="Reportes" />
                </div>
              </div>

              <div className="mt-auto p-2">
                <Card>
                  <CardBody>
                    <div className="mb-2 flex items-center gap-2 text-sm font-semibold">
                      <Rocket style={{ color: cobalt }} className="h-4 w-4" />
                      Quick Start
                    </div>
                    <p className="text-xs text-gray-600">
                      Crea una iniciativa y deja que MaIA te guíe con preguntas y matrices.
                    </p>
                    <div className="mt-3">
                      <Button className="w-full">
                        <Plus className="h-4 w-4" /> Nueva Iniciativa
                      </Button>
                    </div>
                  </CardBody>
                </Card>
              </div>
            </nav>
          </aside>
        )}

        <main className="relative flex-1 overflow-auto p-4">
          {activeModule === "diagnostico" && <Diagnostico role={role} />}
          {activeModule === "diseno" && <Diseno role={role} />}
          {activeModule === "ejecucion" && <Ejecucion role={role} />}
          {activeModule === "cierre" && <Cierre />}
        </main>
      </div>
    </div>
  )
}

// --- Role Switcher ---
function RoleSwitcher({ role, setRole }) {
  return (
    <div className="flex items-center rounded-xl border border-gray-200 p-0.5">
      <button
        onClick={() => setRole("consultor")}
        className={classNames(
          "rounded-lg px-3 py-1.5 text-xs",
          role === "consultor" ? `bg-[${cobalt}] text-white` : "text-gray-700 hover:bg-gray-100",
        )}
      >
        Consultor
      </button>
      <button
        onClick={() => setRole("lider")}
        className={classNames(
          "rounded-lg px-3 py-1.5 text-xs",
          role === "lider" ? `bg-[${cobalt}] text-white` : "text-gray-700 hover:bg-gray-100",
        )}
      >
        Líder
      </button>
    </div>
  )
}

// --- Navigation Items ---
function NavItem({ icon, label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={classNames(
        "mb-1 flex items-center gap-3 rounded-xl px-3 py-2 text-left text-sm",
        active ? `bg-[${cobalt}] text-white` : "hover:bg-gray-100",
      )}
    >
      {icon}
      <span className="truncate">{label}</span>
    </button>
  )
}
const SecondaryNav = ({ label }) => (
  <button className="w-full truncate rounded-lg px-3 py-1.5 text-left text-sm text-gray-700 hover:bg-gray-100">
    {label}
  </button>
)

// --- Module 1: Diagnóstico & Iniciativas ---
function Diagnostico({ role }) {
  const [topics] = useState(seedTopics)
  const [activeTopic, setActiveTopic] = useState(topics[0].id)
  const [notes, setNotes] = useState(
    /** @type {Note[]} */ ([
      {
        id: "n1",
        text: "El gerente de logística mencionó retrasos del proveedor principal en el último trimestre.",
        createdAt: Date.now() - 3600_000,
      },
    ]),
  )
  const [matrices, setMatrices] = useState(
    /** @type {Matrix[]} */ ([
      { id: "m1", kind: "SWOT", items: ["F: Equipo con experiencia PMP", "D: Proveedor crítico con atrasos"] },
    ]),
  )
  const [risks, setRisks] = useState(
    /** @type {Risk[]} */ ([
      { id: "r1", type: "Riesgo", title: "Retrasos del proveedor crítico", prob: 0.5, impact: 0.7, owner: "Compras" },
    ]),
  )
  const [input, setInput] = useState("")
  const [suggestions, setSuggestions] = useState(
    /** @type {string[]} */ ([
      "Detecté una posible debilidad/riesgo por 'retrasos'. ¿Agregar a matriz de riesgos?",
      "¿Se ha medido el impacto histórico? ¿Existen proveedores alternativos?",
    ]),
  )

  // Lightweight NLP-ish suggestion: whenever notes include certain keywords, push a suggestion once
  useEffect(() => {
    const joined = notes.map((n) => n.text.toLowerCase()).join(" ")
    if (joined.includes("retraso") && !suggestions.some((s) => s.includes("deb"))) {
      setSuggestions((s) => [
        ...s,
        "Te sugiero cuantificar probabilidad e impacto (P*I) y definir un plan de mitigación.",
      ])
    }
  }, [notes])

  const addMatrix = (kind) => {
    setMatrices((arr) => [...arr, { id: crypto.randomUUID(), kind, items: [] }])
  }
  const addRisk = (title) => {
    setRisks((arr) => [...arr, { id: crypto.randomUUID(), type: "Riesgo", title, prob: 0.3, impact: 0.4 }])
  }
  const addNote = () => {
    if (!input.trim()) return
    setNotes((arr) => [{ id: crypto.randomUUID(), text: input.trim(), createdAt: Date.now() }, ...arr])
    setInput("")
  }

  return (
    <div className="grid h-full grid-cols-12 gap-4">
      {/* Left: sections */}
      <div className="col-span-2">
        <Card>
          <CardHeader title="Secciones del Diagnóstico" />
          <CardBody>
            <div className="flex flex-col gap-1">
              {topics.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setActiveTopic(t.id)}
                  className={classNames(
                    "w-full truncate rounded-lg px-3 py-2 text-left text-sm",
                    activeTopic === t.id ? `bg-[${cobalt}] text-white` : "hover:bg-gray-100",
                  )}
                >
                  {t.title}
                </button>
              ))}
            </div>

            <div className="mt-4">
              <div className="mb-2 text-xs font-semibold text-gray-500">Matrices</div>
              <div className="flex flex-wrap gap-2">
                {matrices.map((m) => (
                  <Badge key={m.id} tone="blue">
                    {m.kind}
                  </Badge>
                ))}
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {["SWOT", "PESTEL", "CAME", "Stakeholders", "Riesgos"].map((k) => (
                  <Button key={k} variant="soft" onClick={() => addMatrix(k)}>
                    <Plus className="h-4 w-4" /> {k}
                  </Button>
                ))}
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Center: notes */}
      <div className="col-span-6">
        <Card className="h-full">
          <CardHeader
            title={
              <div className="flex items-center gap-2">
                <ClipboardList className="h-4 w-4" />
                <span>Notas & Hallazgos — {topics.find((t) => t.id === activeTopic)?.title}</span>
              </div>
            }
            actions={
              <div className="flex items-center gap-2">
                <Button variant="ghost" onClick={() => addRisk("Riesgo sin título")}>
                  + Riesgo
                </Button>
                <Button onClick={() => alert("Resumen de diagnóstico generado (demo)")}>Generar Resumen</Button>
              </div>
            }
          />
          <CardBody className="flex h-[calc(100%-3.5rem)] flex-col">
            <div className="mb-2 flex items-center gap-2">
              <input
                placeholder="Escribe una nota… (MaIA detectará riesgos, oportunidades y matrices)"
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addNote()}
              />
              <Button onClick={addNote}>Agregar</Button>
            </div>
            <div className="flex-1 overflow-auto">
              <ul className="flex flex-col gap-3">
                {notes.map((n) => (
                  <li key={n.id} className="rounded-xl border border-gray-200 p-3">
                    <div className="mb-1 text-xs text-gray-500">{new Date(n.createdAt).toLocaleString()}</div>
                    <div className="text-sm text-gray-800">{n.text}</div>
                  </li>
                ))}
              </ul>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Right: MaIA panel */}
      <div className="col-span-4">
        <Card className="h-full">
          <CardHeader
            title={
              <div className="flex items-center gap-2">
                <BrainCircuit style={{ color: cobalt }} className="h-4 w-4" />
                <span>MaIA • Sugerencias en tiempo real</span>
              </div>
            }
          />
          <CardBody className="flex h-[calc(100%-3.5rem)] flex-col gap-3">
            <div className="flex flex-wrap gap-2">
              <Badge tone="blue">PMP</Badge>
              <Badge tone="blue">ISO 56000</Badge>
              <Badge>As-Is</Badge>
              <Badge>Onboarding</Badge>
            </div>

            <div className="max-h-[55vh] flex-1 space-y-2 overflow-auto pr-1">
              {suggestions.map((s, i) => (
                <div key={i} className="rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm">
                  {s}
                  {s.toLowerCase().includes("riesg") && (
                    <div className="mt-2 flex gap-2">
                      <Button variant="soft" onClick={() => addRisk("Retrasos del proveedor principal")}>
                        Agregar a Riesgos
                      </Button>
                      <Button variant="ghost" onClick={() => alert("Preguntas de profundización (demo)")}>
                        Profundizar
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="space-y-2 rounded-xl border border-gray-200 p-3">
              <div className="mb-1 text-xs font-semibold text-gray-500">Riesgos detectados</div>
              <ul className="space-y-2">
                {risks.map((r) => (
                  <li key={r.id} className="flex items-center justify-between rounded-lg bg-white p-2 text-sm">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-red-500" /> {r.title}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span>P:{Math.round(r.prob * 100)}%</span>
                      <span>I:{Math.round(r.impact * 100)}%</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  )
}

// --- Module 2: Diseño & Planificación ---
function Diseno({ role }) {
  const [pool, setPool] = useState([
    "Módulo de reportes automáticos",
    "Integración ERP",
    "Portal de stakeholders",
    "Capacitación del equipo",
  ])
  const [inScope, setInScope] = useState(["Integración ERP"])
  const [outScope, setOutScope] = useState(["Capacitación del equipo"])
  const [phases, setPhases] = useState([
    { id: "p1", name: "Fase 1: Descubrimiento", weeks: 2 },
    { id: "p2", name: "Hito: Aprobación de Alcance", weeks: 0 },
    { id: "p3", name: "Fase 2: Construcción", weeks: 8 },
    { id: "p4", name: "Fase 3: Deploy & UAT", weeks: 2 },
  ])

  const move = (item, from, to, setFrom, setTo) => {
    setFrom(from.filter((i) => i !== item))
    if (!to.includes(item)) setTo([...to, item])
  }

  const suggestScrum = () => {
    setPhases([
      { id: "s0", name: "Kickoff & Backlog", weeks: 1 },
      { id: "s1", name: "Sprint 1", weeks: 2 },
      { id: "s2", name: "Sprint 2", weeks: 2 },
      { id: "s3", name: "Sprint 3", weeks: 2 },
      { id: "s4", name: "Cierre de Iteración & Retro", weeks: 1 },
    ])
  }

  return (
    <div className="grid h-full grid-cols-12 gap-4">
      <div className="col-span-6 space-y-4">
        <Card>
          <CardHeader
            title={
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4" /> Alcance (drag-less: click para mover)
              </div>
            }
            actions={
              role === "lider" ? (
                <div className="flex items-center gap-2">
                  <Button variant="ghost">Solicitar cambios</Button>
                  <Button> Aprobar Alcance</Button>
                </div>
              ) : (
                <Button>Proponer Plan</Button>
              )
            }
          />
          <CardBody>
            <div className="grid grid-cols-3 gap-3">
              <Card className="col-span-1">
                <CardHeader title="Backlog inicial" />
                <CardBody>
                  <ul className="space-y-2 text-sm">
                    {pool.map((i) => (
                      <li key={i} className="flex items-center justify-between">
                        <span>{i}</span>
                        <div className="flex gap-1">
                          <Button variant="soft" onClick={() => move(i, pool, inScope, setPool, setInScope)}>
                            In
                          </Button>
                          <Button variant="ghost" onClick={() => move(i, pool, outScope, setPool, setOutScope)}>
                            Out
                          </Button>
                        </div>
                      </li>
                    ))}
                  </ul>
                </CardBody>
              </Card>

              <Card className="col-span-1">
                <CardHeader title="Incluido" />
                <CardBody>
                  <ul className="space-y-2 text-sm">
                    {inScope.map((i) => (
                      <li key={i} className="flex items-center justify-between">
                        <span>{i}</span>
                        <Button variant="ghost" onClick={() => move(i, inScope, pool, setInScope, setPool)}>
                          ←
                        </Button>
                      </li>
                    ))}
                  </ul>
                </CardBody>
              </Card>

              <Card className="col-span-1">
                <CardHeader title="Excluido" />
                <CardBody>
                  <ul className="space-y-2 text-sm">
                    {outScope.map((i) => (
                      <li key={i} className="flex items-center justify-between">
                        <span>{i}</span>
                        <Button variant="ghost" onClick={() => move(i, outScope, pool, setOutScope, setPool)}>
                          ←
                        </Button>
                      </li>
                    ))}
                  </ul>
                </CardBody>
              </Card>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader
            title={
              <div className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4" /> Planificación relativa por fases
              </div>
            }
            actions={
              <Button variant="soft" onClick={suggestScrum}>
                Sugerir estructura Scrum
              </Button>
            }
          />
          <CardBody>
            <ul className="space-y-2 text-sm">
              {phases.map((p) => (
                <li
                  key={p.id}
                  className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-2"
                >
                  <div className="flex items-center gap-2">
                    {p.weeks === 0 ? (
                      <Flag className="h-4 w-4 text-amber-500" />
                    ) : (
                      <Clock className="h-4 w-4 text-gray-500" />
                    )}
                    <span>{p.name}</span>
                  </div>
                  <div className="text-xs text-gray-500">{p.weeks} semanas</div>
                </li>
              ))}
            </ul>
          </CardBody>
        </Card>
      </div>

      <div className="col-span-6 space-y-4">
        <Card>
          <CardHeader
            title="Matrices de Diseño (sugeridas por MaIA)"
            actions={<Button variant="soft">Crear plantilla de OKRs</Button>}
          />
          <CardBody>
            <div className="flex flex-wrap gap-2">
              <Badge tone="blue">WBS</Badge>
              <Badge tone="blue">RACI</Badge>
              <Badge tone="blue">Matriz de Riesgos (P*I)</Badge>
              <Badge tone="blue">Mapa de Stakeholders</Badge>
            </div>
          </CardBody>
        </Card>

        <Card className="h-[340px]">
          <CardHeader title="Estimación de equipo (demo)" />
          <CardBody className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={velocityData} margin={{ left: 10, right: 20, top: 10, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="sprint" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="pts" stroke={cobalt} strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>
      </div>
    </div>
  )
}

// --- Module 3: Ejecución & Seguimiento ---
function Ejecucion({ role }) {
  const [okrs, setOkrs] = useState(seedOKRs)
  const [activity, setActivity] = useState([
    { id: "a1", t: "Se cargó documento de alcance v1.2", when: "hoy 10:22" },
    { id: "a2", t: "Mitigación de riesgo 'Proveedor' actualizada", when: "ayer 16:45" },
    { id: "a3", t: "Hito 'UAT listo' movido al 24/08", when: "ayer 12:10" },
  ])
  const [risks, setRisks] = useState([
    { id: "r1", title: "Retraso de proveedor crítico", status: "Alto", owner: "Compras" },
    { id: "r2", title: "Rotación de devs", status: "Medio", owner: "TI" },
    { id: "r3", title: "Cambio regulatorio", status: "Bajo", owner: "Legal" },
  ])

  const quickNudge = () => {
    alert("MaIA: No se registró progreso en 'KR 2.1' esta semana. ¿Notificar al responsable? (demo)")
  }

  return (
    <div className="grid h-full grid-cols-12 gap-4">
      <div className="col-span-8 space-y-4">
        <Card>
          <CardHeader
            title={
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4" /> OKRs del Proyecto
              </div>
            }
            actions={
              <Button variant="soft" onClick={quickNudge}>
                Empujón Proactivo
              </Button>
            }
          />
          <CardBody>
            <div className="grid grid-cols-2 gap-4">
              {okrs.map((o) => (
                <Card key={o.id}>
                  <CardBody>
                    <div className="mb-2 flex items-center justify-between">
                      <div className="font-semibold">{o.title}</div>
                      <Badge tone="blue">{o.progress}%</Badge>
                    </div>
                    <Progress value={o.progress} />
                    <ul className="mt-3 space-y-2 text-sm">
                      {o.krs.map((k) => (
                        <li key={k.id} className="flex items-center justify-between">
                          <span className="truncate">{k.title}</span>
                          <div className="flex items-center gap-2">
                            <Badge tone="gray">{k.progress}%</Badge>
                            <button
                              className="rounded-lg px-2 py-1 text-xs hover:bg-gray-100"
                              onClick={() => alert("Check-in de KR (demo)")}
                            >
                              Check-in
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </CardBody>
                </Card>
              ))}
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader
            title={
              <div className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4" /> Hitos & Línea de tiempo
              </div>
            }
          />
          <CardBody>
            <div className="flex items-center gap-4 overflow-x-auto py-2">
              {["Kickoff", "Aprobación Alcance", "MVP", "UAT", "Go-Live"].map((m, i) => (
                <div key={m} className="flex min-w-[160px] items-center gap-2">
                  <div
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: i < 2 ? ok : i === 2 ? warn : cobalt }}
                  />
                  <div className="text-sm">{m}</div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      </div>

      <div className="col-span-4 space-y-4">
        <Card>
          <CardHeader
            title={
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" /> Riesgos Prioritarios
              </div>
            }
          />
          <CardBody>
            <ul className="space-y-2 text-sm">
              {risks.map((r) => (
                <li
                  key={r.id}
                  className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-2"
                >
                  <div className="flex items-center gap-2">
                    <AlertTriangle
                      className={classNames(
                        "h-4 w-4",
                        r.status === "Alto"
                          ? "text-red-500"
                          : r.status === "Medio"
                            ? "text-amber-500"
                            : "text-green-500",
                      )}
                    />
                    <span>{r.title}</span>
                  </div>
                  <Badge tone={r.status === "Alto" ? "red" : r.status === "Medio" ? "amber" : "green"}>
                    {r.status}
                  </Badge>
                </li>
              ))}
            </ul>
          </CardBody>
        </Card>

        <Card>
          <CardHeader
            title={
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4" /> Registro de Actividad
              </div>
            }
          />
          <CardBody>
            <ul className="space-y-2 text-sm">
              {activity.map((a) => (
                <li
                  key={a.id}
                  className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-2"
                >
                  <span className="truncate">{a.t}</span>
                  <span className="text-xs text-gray-500">{a.when}</span>
                </li>
              ))}
            </ul>
          </CardBody>
        </Card>
      </div>
    </div>
  )
}

// --- Module 4: Cierre & Lecciones ---
function Cierre() {
  const [learnings, setLearnings] = useState([
    "Formalizar plan B de proveedores (dual-sourcing)",
    "Establecer Definition of Ready para reducir retrabajos",
    "Automatizar reportes de avance semanales",
  ])
  const [newL, setNewL] = useState("")

  const addL = () => {
    if (!newL.trim()) return
    setLearnings((arr) => [newL.trim(), ...arr])
    setNewL("")
  }

  return (
    <div className="grid h-full grid-cols-12 gap-4">
      <div className="col-span-7 space-y-4">
        <Card>
          <CardHeader
            title={
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" /> Cierre del Proyecto
              </div>
            }
            actions={<Button onClick={() => alert("Reporte PDF generado (demo)")}>Generar Reporte</Button>}
          />
          <CardBody>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-xl border border-gray-200 p-3">
                <div className="mb-2 text-xs font-semibold text-gray-500">Entregables</div>
                <ul className="space-y-1 list-disc pl-4">
                  <li>Alcance aprobado v1.2</li>
                  <li>MVP desplegado</li>
                  <li>UAT completado</li>
                </ul>
              </div>
              <div className="rounded-xl border border-gray-200 p-3">
                <div className="mb-2 text-xs font-semibold text-gray-500">Cumplimiento</div>
                <ul className="space-y-1 list-disc pl-4">
                  <li>PMP: Gestión de Riesgos documentada</li>
                  <li>ISO 56000: Oportunidades de innovación registradas</li>
                </ul>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Checklist de Cierre (demo)" />
          <CardBody>
            <ul className="space-y-2 text-sm">
              {["Aceptar entregables", "Liberar recursos", "Archivar artefactos", "Encuesta de satisfacción"].map(
                (c) => (
                  <li key={c} className="flex items-center gap-2">
                    <input type="checkbox" className="h-4 w-4 rounded" />
                    <span>{c}</span>
                  </li>
                ),
              )}
            </ul>
          </CardBody>
        </Card>
      </div>

      <div className="col-span-5 space-y-4">
        <Card>
          <CardHeader title="Lecciones aprendidas" />
          <CardBody>
            <div className="mb-2 flex items-center gap-2">
              <input
                value={newL}
                onChange={(e) => setNewL(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addL()}
                placeholder="Añade una lección…"
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2"
              />
              <Button onClick={addL}>Agregar</Button>
            </div>
            <ul className="space-y-2 text-sm">
              {learnings.map((l, i) => (
                <li key={i} className="rounded-lg border border-gray-200 bg-white p-2">
                  {l}
                </li>
              ))}
            </ul>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Indicadores de cierre (demo)" />
          <CardBody>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="rounded-xl border border-gray-200 bg-white p-3">
                <div className="text-xs text-gray-500">Duración vs. plan</div>
                <div className="text-lg font-semibold text-gray-800">+6%</div>
              </div>
              <div className="rounded-xl border border-gray-200 bg-white p-3">
                <div className="text-xs text-gray-500">Presupuesto</div>
                <div className="text-lg font-semibold text-gray-800">-3%</div>
              </div>
              <div className="rounded-xl border border-gray-200 bg-white p-3">
                <div className="text-xs text-gray-500">Satisfacción</div>
                <div className="text-lg font-semibold text-gray-800">4.3/5</div>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  )
}
