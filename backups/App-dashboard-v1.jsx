const menuItems = [
  "Executive Overview",
  "AI Management Advisor",
  "Decision Intelligence",
  "Approval Center",
  "Execution Tracker",
  "Agent Coordination",
]

export default function App() {
  return (
    <div className="flex min-h-screen bg-[#F4F7FB]">
      {/* Sidebar */}
      <aside className="w-72 shrink-0 bg-[#0B1F3A] p-6 text-white">
        <img
          src="/branding/strativa_logo.png"
          alt="STRATIVA"
          className="mb-10 w-full"
        />

        <nav className="space-y-2">
          {menuItems.map((item, index) => (
            <button
              key={item}
              type="button"
              className={`w-full rounded-lg px-4 py-3 text-left text-sm transition ${
                index === 0
                  ? "bg-[#1769D2] font-semibold text-white"
                  : "text-slate-300 hover:bg-white/10"
              }`}
            >
              {item}
            </button>
          ))}
        </nav>

        <div className="mt-12 border-t border-white/20 pt-5 text-xs text-slate-400">
          STRATIVA • Version 1
        </div>
      </aside>

      {/* Main dashboard */}
      <main className="flex-1 p-8">
        <header className="mb-8">
          <p className="text-sm font-medium text-[#1769D2]">
            AI MANAGEMENT COMMAND CENTER
          </p>
          <h1 className="mt-2 text-3xl font-bold text-[#0B1F3A]">
            Executive Overview
          </h1>
          <p className="mt-2 text-slate-500">
            Monitor strategic goals, operational execution, and AI coordination.
          </p>
        </header>

        <section className="grid gap-5 md:grid-cols-3">
          {[
            ["Active Goals", "0"],
            ["Pending Approvals", "0"],
            ["Active Agents", "0"],
          ].map(([label, value]) => (
            <div
              key={label}
              className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <p className="text-sm text-slate-500">{label}</p>
              <p className="mt-3 text-3xl font-bold text-[#0B1F3A]">
                {value}
              </p>
            </div>
          ))}
        </section>

        <section className="mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-[#0B1F3A]">
            Strategic Management Overview
          </h2>
          <p className="mt-3 text-slate-500">
            Your strategic goals, AI recommendations, and execution updates
            will appear here once these features are connected.
          </p>
        </section>
      </main>
    </div>
  )
}