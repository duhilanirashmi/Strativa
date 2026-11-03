
import {
  Target,
  ListChecks,
  CircleCheck,
  AlertTriangle,
  TrendingUp,
  BarChart3,
  Lightbulb,
  Users,
  BrainCircuit,
  Settings,
  ShieldAlert,
  Network,
} from "lucide-react";
import React from "react";

const navy = "#0B1F3A";

export default function ExecutiveDashboard({
  analyses = [],
  tasks = [],
  pendingTasks = [],
  completedTasks = [],
  selectedAnalysis = null,
  onNavigate,
}) {
  const activeTasks = tasks.filter((task) =>
    ["Approved", "In Progress"].includes(task.status)
  );
  const conflicts = pendingTasks.filter(
    (task) => task.allocationStatus === "Capacity or Skill Conflict"
  );
  const progress = tasks.length
    ? Math.round((completedTasks.length / tasks.length) * 100)
    : 0;

  
const metrics = [
  {
    label: "Active Goals",
    value: analyses.length,
    icon: Target,
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
  {
    label: "Total Tasks",
    value: tasks.length,
    icon: ListChecks,
    color: "text-indigo-600",
    bg: "bg-indigo-50",
  },
  {
    label: "Completed Tasks",
    value: completedTasks.length,
    icon: CircleCheck,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
  },
  {
    label: "At Risk",
    value: conflicts.length,
    icon: AlertTriangle,
    color: "text-rose-600",
    bg: "bg-rose-50",
  },
  {
    label: "Overall Progress",
    value: `${progress}%`,
    icon: TrendingUp,
    color: "text-teal-600",
    bg: "bg-teal-50",
  },
];


  const card = "rounded-xl border border-slate-200 bg-white p-5 shadow-sm";
  const sectionTitle = "text-sm font-bold text-[#0B1F3A]";

  return (
    <div className="space-y-5 pb-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-blue-700">
            Executive Intelligence
          </p>
          <h2 className="mt-1 text-2xl font-bold" style={{ color: navy }}>
            AI Management Command Centre
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Strategic oversight, management decisions and operational execution
          </p>
        </div>
        <button
          type="button"
          onClick={() => onNavigate("AI Management Advisor")}
          className="rounded-lg bg-[#1769D2] px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
        >
          + Analyze New Goal
        </button>
      </div>

      
<div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
  {metrics.map((metric) => {
    const Icon = metric.icon;

    return (
      <div
        key={metric.label}
        className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md"
      >
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs font-semibold text-slate-500">
            {metric.label}
          </p>

          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${metric.bg} ${metric.color}`}
          >
            <Icon size={23} strokeWidth={1.8} />
          </div>
        </div>

        <p className="mt-4 text-3xl font-bold tracking-tight text-[#0B1F3A]">
          {metric.value}
        </p>

        <div className="mt-3 h-1 w-12 rounded-full bg-gradient-to-r from-blue-600 to-violet-500" />
      </div>
    );
  })}
</div>


      <div className="grid grid-cols-1 gap-5 lg:grid-cols-5">
        <div className="min-w-0 space-y-5 lg:col-span-3">
          <section className={card}>
            <h3 className={sectionTitle}>Current Management Focus</h3>
            {selectedAnalysis ? (
              <div className="mt-3 rounded-lg border border-blue-100 bg-blue-50 p-4">
                <p className="text-sm font-semibold text-slate-900">
                  {selectedAnalysis.challenge}
                </p>
                <span className="mt-3 inline-flex rounded-full bg-white px-3 py-1 text-xs font-medium text-blue-700">
                  {selectedAnalysis.category || "Management Goal"}
                </span>
              </div>
            ) : (
              <p className="mt-3 text-sm text-slate-500">
                Analyze a management goal to populate this section.
              </p>
            )}
          </section>

          <section className={card}>
            <h3 className={sectionTitle}>AI Analysis Summary</h3>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                ["Goals Analyzed", analyses.length],
                ["Tasks Generated", tasks.length],
                ["Pending Decisions", pendingTasks.length],
                ["Resource Conflicts", conflicts.length],
              ].map(([label, value]) => (
                <div key={label} className="rounded-lg bg-slate-50 p-3 text-center">
                  <p className="text-2xl font-bold text-[#0B1F3A]">{value}</p>
                  <p className="mt-1 text-xs text-slate-500">{label}</p>
                </div>
              ))}
            </div>
          </section>

          <section className={card}>
            <div className="flex items-center justify-between gap-3">
              <h3 className={sectionTitle}>Recommended Actions</h3>
              <button
                type="button"
                onClick={() => onNavigate("Approval Center")}
                className="text-xs font-semibold text-blue-700 hover:underline"
              >
                View Approval Center →
              </button>
            </div>
            {pendingTasks.length ? (
              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b bg-slate-50 text-slate-500">
                    <tr>
                      <th className="p-3 font-semibold">Recommended Task</th>
                      <th className="p-3 font-semibold">Owner</th>
                      <th className="p-3 font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingTasks.slice(0, 5).map((task) => (
                      <tr key={task.id} className="border-b border-slate-100">
                        <td className="p-3 font-medium text-slate-800">{task.title}</td>
                        <td className="p-3 text-slate-600">{task.owner || "Unassigned"}</td>
                        <td className="p-3">
                          <span className={`rounded-full px-2 py-1 font-semibold ${
                            task.allocationStatus === "Capacity or Skill Conflict"
                              ? "bg-rose-50 text-rose-700"
                              : "bg-amber-50 text-amber-700"
                          }`}>
                            {task.allocationStatus === "Capacity or Skill Conflict"
                              ? "Conflict"
                              : "Pending Approval"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="mt-4 text-sm text-slate-500">No tasks currently awaiting approval.</p>
            )}
          </section>
        </div>

        <div className="min-w-0 space-y-5 lg:col-span-2">
          <section className={card}>
            <h3 className={sectionTitle}>Key Insights from STRATIVA</h3>
            <div className="mt-4 space-y-3">
              {[
                {
                  title: "Management Decisions",
                  detail: `${pendingTasks.length} task(s) awaiting manager approval`,
                  color: "border-blue-400 bg-blue-50",
                },
                {
                  title: "Resource Risks",
                  detail: `${conflicts.length} unresolved capacity or skill conflict(s)`,
                  color: "border-rose-400 bg-rose-50",
                },
                {
                  title: "Execution Activity",
                  detail: `${activeTasks.length} approved or in-progress task(s)`,
                  color: "border-indigo-400 bg-indigo-50",
                },
                {
                  title: "Completed Outcomes",
                  detail: `${completedTasks.length} completed task(s)`,
                  color: "border-emerald-400 bg-emerald-50",
                },
              ].map((insight) => (
                <div key={insight.title} className={`rounded-lg border-l-4 p-3 ${insight.color}`}>
                  <p className="text-xs font-bold text-[#0B1F3A]">{insight.title}</p>
                  <p className="mt-1 text-xs text-slate-600">{insight.detail}</p>
                </div>
              ))}
            </div>
          </section>

          
<section className={card}>
  <div className="flex items-center gap-3">
    <div className="rounded-xl bg-indigo-50 p-2.5 text-indigo-600">
      <Network size={22} strokeWidth={1.8} />
    </div>
    <div>
      <h3 className={sectionTitle}>Agent Coordination</h3>
      <p className="mt-1 text-xs text-slate-500">
        STRATIVA's multi-agent decision-support workflow
      </p>
    </div>
  </div>

  <div className="mt-5 space-y-1">
    {[
      {
        name: "Strategy Agent",
        role: "Strategic analysis",
        Icon: BrainCircuit,
        bg: "bg-blue-50",
        color: "text-blue-600",
      },
      {
        name: "Operations Agent",
        role: "Task and resource planning",
        Icon: Settings,
        bg: "bg-violet-50",
        color: "text-violet-600",
      },
      {
        name: "Risk Agent",
        role: "Risk assessment",
        Icon: ShieldAlert,
        bg: "bg-rose-50",
        color: "text-rose-600",
      },
      {
        name: "Coordinator Agent",
        role: "Consolidated recommendations",
        Icon: Network,
        bg: "bg-emerald-50",
        color: "text-emerald-600",
      },
    ].map(({ name, role, Icon, bg, color }, index) => (
      <div key={name}>
        <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${bg} ${color}`}
          >
            <Icon size={21} strokeWidth={1.8} />
          </div>

          <div>
            <p className="text-sm font-semibold text-[#0B1F3A]">
              {name}
            </p>
            <p className="text-xs text-slate-500">{role}</p>
          </div>
        </div>

        {index < 3 && (
          <div className="flex h-5 items-center pl-7 text-indigo-400">
            <span className="text-lg leading-none">↓</span>
          </div>
        )}
      </div>
    ))}
  </div>

  <div className="mt-4 rounded-lg border border-indigo-100 bg-indigo-50 px-3 py-2 text-xs font-medium text-indigo-700">
    Four specialized agents support management decision-making.
  </div>

  <button
    type="button"
    onClick={() => onNavigate("Agent Coordination")}
    className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-blue-700 hover:underline"
  >
    Open Agent Coordination →
  </button>
</section>

            <h3 className={sectionTitle}>Agent Coordination</h3>
            <p className="mt-2 text-xs text-slate-500">
              STRATIVA's multi-agent decision-support workflow
            </p>
            
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <section className={card}>
          <h3 className={sectionTitle}>Task Execution Status</h3>
          <div className="mt-4 flex h-3 overflow-hidden rounded-full bg-slate-100">
            <div className="bg-emerald-500" style={{ width: `${progress}%` }} />
            <div
              className="bg-blue-500"
              style={{ width: `${tasks.length ? (activeTasks.length / tasks.length) * 100 : 0}%` }}
            />
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2 text-center">
            {[
              ["Pending", pendingTasks.length],
              ["Active", activeTasks.length],
              ["Completed", completedTasks.length],
            ].map(([label, value]) => (
              <div key={label}>
                <p className="text-lg font-bold text-[#0B1F3A]">{value}</p>
                <p className="text-xs text-slate-500">{label}</p>
              </div>
            ))}
          </div>
        </section>

        <section className={card}>
          <h3 className={sectionTitle}>Management Priorities</h3>
          <div className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-600">Approval queue</span>
              <strong>{pendingTasks.length}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Resource conflicts</span>
              <strong className="text-rose-600">{conflicts.length}</strong>
            </div>
            <button
              type="button"
              onClick={() => onNavigate("Approval Center")}
              className="text-xs font-semibold text-blue-700 hover:underline"
            >
              Resolve Management Priorities →
            </button>
          </div>
        </section>

        <section className={card}>
          <h3 className={sectionTitle}>Performance Snapshot</h3>
          <p className="mt-4 text-3xl font-bold text-[#0B1F3A]">{progress}%</p>
          <p className="text-xs text-slate-500">Tasks completed across all goals</p>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
            <div className="h-full rounded-full bg-teal-500" style={{ width: `${progress}%` }} />
          </div>
          <button
            type="button"
            onClick={() => onNavigate("Execution Tracker")}
            className="mt-4 text-xs font-semibold text-blue-700 hover:underline"
          >
            Open Execution Tracker →
          </button>
        </section>
      </div>
    </div>
  );
}
