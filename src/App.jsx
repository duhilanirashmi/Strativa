import { useState } from "react"

const menuItems = [
  "Executive Overview",
  "AI Management Advisor",
  "Decision Intelligence",
  "Approval Center",
  "Execution Tracker",
  "Agent Coordination",
]

const pageDescriptions = {
  "Executive Overview":
    "Monitor strategic goals, operational execution, and AI coordination.",

  "AI Management Advisor":
    "Analyze strategic goals and receive AI-powered management recommendations.",

  "Decision Intelligence":
    "Review insights, assess risks, and support strategic decision-making.",

  "Approval Center":
    "Review and manage tasks requiring human approval.",

  "Execution Tracker":
    "Monitor task progress, operational milestones, and execution status.",

  "Agent Coordination":
    "Oversee specialized AI agents and their assigned responsibilities.",
}

export default function App() {
  const [activePage, setActivePage] = useState("Executive Overview")

  return (
    <div className="flex min-h-screen bg-[#F4F7FB]">

      {/* SIDEBAR */}
      <aside className="w-72 shrink-0 bg-[#0B1F3A] p-6 text-white">

        {/* STRATIVA LOGO */}
        <img
          src="/branding/strativa_logo.png"
          alt="STRATIVA - AI Management Command Center"
          className="mb-10 w-full"
        />

        {/* NAVIGATION */}
        <nav className="space-y-2">
          {menuItems.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setActivePage(item)}
              className={`w-full rounded-lg px-4 py-3 text-left text-sm transition ${
                activePage === item
                  ? "bg-[#1769D2] font-semibold text-white"
                  : "text-slate-300 hover:bg-white/10"
              }`}
            >
              {item}
            </button>
          ))}
        </nav>

        {/* SIDEBAR FOOTER */}
        <div className="mt-12 border-t border-white/20 pt-5 text-xs text-slate-400">
          STRATIVA • Version 1
        </div>

      </aside>

      {/* MAIN DASHBOARD */}
      <main className="min-w-0 flex-1 p-8">

        {/* PAGE HEADER */}
        <header className="mb-8">
          <p className="text-sm font-medium text-[#1769D2]">
            AI MANAGEMENT COMMAND CENTER
          </p>

          <h1 className="mt-2 text-3xl font-bold text-[#0B1F3A]">
            {activePage}
          </h1>

          <p className="mt-2 text-slate-500">
            {pageDescriptions[activePage]}
          </p>
        </header>

        {/* EXECUTIVE OVERVIEW */}
        {activePage === "Executive Overview" && (
          <>
            {/* PERFORMANCE CARDS */}
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
                  <p className="text-sm text-slate-500">
                    {label}
                  </p>

                  <p className="mt-3 text-3xl font-bold text-[#0B1F3A]">
                    {value}
                  </p>
                </div>
              ))}
            </section>

            {/* STRATEGIC MANAGEMENT OVERVIEW */}
            <section className="mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-[#0B1F3A]">
                Strategic Management Overview
              </h2>

              <p className="mt-3 text-slate-500">
                Your strategic goals, AI recommendations, and execution
                updates will appear here once these features are connected.
              </p>
            </section>
          </>
        )}

        {/* AI MANAGEMENT ADVISOR */}
        {activePage === "AI Management Advisor" && (
          <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-[#0B1F3A]">
              Strategic Goal Analysis
            </h2>

            <p className="mt-3 text-slate-500">
              This workspace will allow managers to submit strategic
              goals and receive AI-generated recommendations, task
              breakdowns, and operational insights.
            </p>
          </section>
        )}

        {/* DECISION INTELLIGENCE */}
        {activePage === "Decision Intelligence" && (
          <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-[#0B1F3A]">
              Management Decision Support
            </h2>

            <p className="mt-3 text-slate-500">
              Decision Intelligence will help managers evaluate
              recommendations, identify potential risks, and
              compare available courses of action.
            </p>
          </section>
        )}

        {/* APPROVAL CENTER */}
        {activePage === "Approval Center" && (
          <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-[#0B1F3A]">
              Pending Management Approvals
            </h2>

            <p className="mt-3 text-slate-500">
              Tasks and recommendations requiring human authorization
              will appear here for management review.
            </p>
          </section>
        )}

        {/* EXECUTION TRACKER */}
        {activePage === "Execution Tracker" && (
          <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-[#0B1F3A]">
              Operational Execution Monitoring
            </h2>

            <p className="mt-3 text-slate-500">
              Track assigned tasks, monitor progress, identify
              delays, and review operational performance.
            </p>
          </section>
        )}

        {/* AGENT COORDINATION */}
        {activePage === "Agent Coordination" && (
          <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-[#0B1F3A]">
              AI Agent Coordination
            </h2>

            <p className="mt-3 text-slate-500">
              This section will provide visibility into specialized
              AI agents, their responsibilities, and their
              coordination across management workflows.
            </p>
          </section>
        )}

      </main>
    </div>
  )
}