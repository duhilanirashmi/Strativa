
    import { useState } from "react";
import ExecutiveDashboard from "./ExecutiveDashboard";
import {
  House,
  Search,
  BrainCircuit,
  ClipboardCheck,
  ListChecks,
  Network,
  Clock3,
CircleCheck,
Square,
TrendingUp,
TriangleAlert,
} from "lucide-react";
    const NAV_ITEMS = [
      "Executive Overview",
      "AI Management Advisor",
      "Decision Intelligence",
      "Approval Center",
      "Execution Tracker",
      "Agent Coordination",
    ];

    const STORAGE_KEY = "strativa-phase1-data";

    function loadData() {
      try {
        const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");

        return {
          analyses: saved.analyses || [],
          tasks: (saved.tasks || []).filter(
            (task, index, allTasks) =>
              allTasks.findIndex((existing) => existing.id === task.id) === index
          ),
        };
      } catch {
        return { analyses: [], tasks: [] };
      }
    }

    function analyzeChallenge(challenge) {
      const text = challenge.toLowerCase();

      let category = "Operational Performance";
      let recommendations = [
        "Establish a measurable baseline for the current challenge.",
        "Identify process bottlenecks and assign accountable owners.",
        "Launch a focused improvement initiative with weekly reviews.",
      ];

      if (
        text.includes("customer") ||
        text.includes("service") ||
        text.includes("satisfaction")
      ) {
        category = "Customer Experience";
        recommendations = [
          "Review customer feedback and identify recurring service issues.",
          "Analyze service quality, resolution time, and escalation patterns.",
          "Introduce targeted coaching and monitor customer outcomes.",
        ];
      } else if (
        text.includes("employee") ||
        text.includes("staff") ||
        text.includes("team") ||
        text.includes("productivity")
      ) {
        category = "Workforce Performance";
        recommendations = [
          "Assess workload distribution and productivity trends.",
          "Identify capability gaps and create a targeted coaching plan.",
          "Introduce weekly performance reviews and employee feedback.",
        ];
      } else if (
        text.includes("cost") ||
        text.includes("budget") ||
        text.includes("expense")
      ) {
        category = "Cost Optimization";
        recommendations = [
          "Review spending patterns and identify avoidable expenses.",
          "Prioritize process improvements that reduce operating costs.",
          "Track cost savings alongside quality and service outcomes.",
        ];
      }

      return {
        category,
        recommendations,
        risks: [
          "Insufficient data may lead to inaccurate assumptions.",
          "Changes may face resistance without clear communication.",
          "Execution may be delayed without assigned ownership.",
        ],
        metrics: [
          "Progress against the primary business objective",
          "Task completion rate",
          "Operational quality and stakeholder feedback",
        ],
      };
    }

    function createTasks(analysis) {
      return analysis.recommendations.map((recommendation, index) => ({
        id: `${analysis.id}-task-${index}`,
        analysisId: analysis.id,
        title: recommendation,
        category: analysis.category,
        status: "Pending Approval",
        owner: "Unassigned",
        createdAt: new Date().toISOString(),
      }));
    }

    function Panel({ title, children }) {
      return (
        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold text-[#0B1F3A]">
            {title}
          </h2>
          {children}
        </section>
      );
    }

    function Badge({ status }) {
      const colors = {
        "Pending Approval": "bg-amber-100 text-amber-800",
        Approved: "bg-blue-100 text-blue-800",
        Rejected: "bg-red-100 text-red-800",
        "In Progress": "bg-indigo-100 text-indigo-800",
        Completed: "bg-green-100 text-green-800",
      };

      return (
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            colors[status] || "bg-slate-100 text-slate-700"
          }`}
        >
          {status}
        </span>
      );
    }

    function BulletList({ items }) {
      if (!Array.isArray(items) || items.length === 0) {
        return (
          <p className="mt-2 text-sm text-slate-500">
            No items reported.
          </p>
        );
      }

      return (
        <ul className="mt-2 list-disc space-y-2 pl-5 text-sm text-slate-700">
          {items.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      );
    }

    export default function App() {
      const [activePage, setActivePage] = useState("Executive Overview");
      const [data, setData] = useState(loadData);
      const [challenge, setChallenge] = useState("");
      const [selectedAnalysisId, setSelectedAnalysisId] = useState(null);
      const [notice, setNotice] = useState("");
      const [isAnalyzing, setIsAnalyzing] = useState(false);

      const [coordinationResult, setCoordinationResult] = useState(null);
      const [isCoordinating, setIsCoordinating] = useState(false);
      const [coordinationError, setCoordinationError] = useState("");
      const [reassignmentChoices, setReassignmentChoices] = useState({});
      const [requiredSkillChoices, setRequiredSkillChoices] = useState({});
      const [conflictFeedback, setConflictFeedback] = useState({});
      const analyses = data.analyses;
      const tasks = data.tasks;

      const selectedAnalysis =
        analyses.find((item) => item.id === selectedAnalysisId) ||
        analyses[0] ||
        null;

      function saveData(updated) {
        setData(updated);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      }

      function downloadBackup() {
        const savedData = localStorage.getItem(STORAGE_KEY);

        if (!savedData) {
          alert("No STRATIVA data found to back up.");
          return;
        }

        const blob = new Blob([savedData], {
          type: "application/json",
        });

        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");

        link.href = url;
        link.download = "STRATIVA-backup.json";

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        URL.revokeObjectURL(url);
      }

      async function restoreBackup(event) {
        const file = event.target.files?.[0];
        if (!file) return;

        try {
          const text = await file.text();
          const imported = JSON.parse(text);

          if (
            !imported ||
            !Array.isArray(imported.analyses) ||
            !Array.isArray(imported.tasks)
          ) {
            throw new Error("Invalid STRATIVA backup format.");
          }

          const validAnalyses = imported.analyses.every(
            (analysis) =>
              analysis &&
              typeof analysis.id === "string" &&
              typeof analysis.challenge === "string" &&
              Array.isArray(analysis.recommendations)
          );

          const validTasks = imported.tasks.every(
            (task) =>
              task &&
              typeof task.id === "string" &&
              typeof task.analysisId === "string" &&
              typeof task.title === "string" &&
              [
                "Pending Approval",
                "Approved",
                "Rejected",
                "In Progress",
                "Completed",
              ].includes(task.status)
          );

          const analysisIds = new Set(
            imported.analyses.map((analysis) => analysis.id)
          );

          const linkedTasks = imported.tasks.every((task) =>
            analysisIds.has(task.analysisId)
          );

          const uniqueAnalysisIds =
            analysisIds.size === imported.analyses.length;

          const uniqueTaskIds =
            new Set(imported.tasks.map((task) => task.id)).size ===
            imported.tasks.length;

          if (
            !validAnalyses ||
            !validTasks ||
            !linkedTasks ||
            !uniqueAnalysisIds ||
            !uniqueTaskIds
          ) {
            throw new Error(
              "Backup contains invalid records, duplicate IDs, or unlinked tasks."
            );
          }

          const confirmed = window.confirm(
            `Restore ${imported.analyses.length} management goals and ` +
              `${imported.tasks.length} tasks?\n\n` +
              "This will replace STRATIVA's current saved data."
          );

          if (!confirmed) return;

          saveData({
            analyses: imported.analyses,
            tasks: imported.tasks,
          });

          setSelectedAnalysisId(imported.analyses[0]?.id || null);
          setCoordinationResult(null);
          setNotice("Backup restored successfully.");
          window.alert("STRATIVA backup restored successfully.");
        } catch (error) {
          window.alert(`Restore failed: ${error.message}`);
        } finally {
          event.target.value = "";
        }
      }

      async function submitChallenge() {
        if (isAnalyzing) return;

        const value = challenge.trim();

        if (value.length < 15) {
          setNotice(
            "Please enter a management challenge of at least 15 characters."
          );
          return;
        }

        const normalizeChallenge = (text) =>
          text
            .toLowerCase()
            .replace(/[^\w\s]/g, "")
            .replace(/\s+/g, " ")
            .trim();

        const existing = analyses.find(
          (item) =>
            normalizeChallenge(item.challenge) === normalizeChallenge(value)
        );

        if (existing) {
          setSelectedAnalysisId(existing.id);
          setNotice(
            "This challenge has already been analyzed. Existing results opened."
          );
          return;
        }

        setIsAnalyzing(true);
        setNotice("Analyzing management challenge...");

        let result;
        let usedGemini = false;

        try {
          const response = await fetch("/api/analyze", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
  challenge: value,
  existingTasks: tasks,
}),
          });

          if (!response.ok) {
            throw new Error(
              `AI service returned HTTP ${response.status}`
            );
          }

          const aiResult = await response.json();

          const validList = (items) =>
            Array.isArray(items) &&
            items.length === 3 &&
            items.every(
              (item) =>
                typeof item === "string" && item.trim().length > 0
            );

          if (
            typeof aiResult.category !== "string" ||
            !aiResult.category.trim() ||
            !validList(aiResult.recommendations) ||
            !validList(aiResult.risks) ||
            !validList(aiResult.metrics)
          ) {
            throw new Error("AI returned an incomplete analysis.");
          }

          result = aiResult;
          usedGemini = true;
        } catch (error) {
          console.warn(
            "Gemini unavailable; using rule-based analysis:",
            error
          );

          result = analyzeChallenge(value);
        }

        try {
          const analysis = {
            id: crypto.randomUUID(),
            challenge: value,
            ...result,
            analysisSource: usedGemini
              ? "Gemini AI"
              : "Rule-based fallback",
            createdAt: new Date().toISOString(),
          };

          const newTasks = createTasks(analysis).filter(
            (newTask) =>
              !tasks.some(
                (existingTask) => existingTask.id === newTask.id
              )
          );

          saveData({
            analyses: [analysis, ...analyses],
            tasks: [...newTasks, ...tasks],
          });

          setSelectedAnalysisId(analysis.id);
          setCoordinationResult(null);
          setChallenge("");

          setNotice(
            usedGemini
              ? "Gemini AI analysis created. Proposed tasks are awaiting management approval."
              : "Gemini AI was unavailable. Rule-based analysis created successfully; proposed tasks are awaiting management approval."
          );
        } catch (error) {
          console.error("Unable to save analysis:", error);
          setNotice("Unable to save analysis. Please try again.");
        } finally {
          setIsAnalyzing(false);
        }
      }

      async function runCoordination() {
        if (isCoordinating) return;

        if (!selectedAnalysis) {
          setCoordinationError(
            "Please analyze a management challenge first."
          );
          return;
        }

        const managementChallenge =
          selectedAnalysis.challenge ||
          selectedAnalysis.goal ||
          selectedAnalysis.title;

        if (
          typeof managementChallenge !== "string" ||
          managementChallenge.trim().length < 15
        ) {
          setCoordinationError(
            "The selected analysis does not contain a valid management challenge."
          );
          return;
        }

        setIsCoordinating(true);
        setCoordinationError("");
        setCoordinationResult(null);

        try {
          const response = await fetch("/api/coordinate", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              challenge: managementChallenge,
            }),
          });

          const result = await response.json();

          if (!response.ok) {
            throw new Error(
              result.error || "Multi-agent coordination failed."
            );
          }

          if (
            !result?.agents?.strategy ||
            !result?.agents?.operations ||
            !result?.agents?.risk ||
            !result?.agents?.coordinator ||
            !result?.resourceAllocation
          ) {
            throw new Error(
              "The coordination service returned incomplete results."
            );
          }

          setCoordinationResult(result);
        } catch (error) {
          setCoordinationError(
            error.message || "Unable to run multi-agent coordination."
          );
        } finally {
          setIsCoordinating(false);
        }
      }


function saveCoordinatedTasks() {
  if (!coordinationResult || !selectedAnalysis) return;

  const allocations =
    coordinationResult.resourceAllocation?.allocations || [];

  if (allocations.length === 0) {
    setNotice("No coordinated tasks are available to save.");
    return;
  }

  const newTasks = allocations
    .filter((allocation) => {
      return !tasks.some(
        (task) =>
          task.analysisId === selectedAnalysis.id &&
          task.title.trim().toLowerCase() ===
            allocation.task.trim().toLowerCase()
      );
    })
    .map((allocation) => ({
      id: crypto.randomUUID(),
      analysisId: selectedAnalysis.id,
      title: allocation.task,
      category: selectedAnalysis.category,
      status: "Pending Approval",
      owner: allocation.owner || "Unassigned",
estimatedHours: allocation.estimatedHours,
requiredSkill: allocation.requiredSkill || "",
allocationStatus: allocation.status,
      createdAt: new Date().toISOString(),
    }));

  if (newTasks.length === 0) {
    setNotice("These coordinated tasks have already been saved.");
    return;
  }

  saveData({
    ...data,
    tasks: [...newTasks, ...tasks],
  });

  setNotice(
    `${newTasks.length} coordinated task(s) sent to the Approval Center.`
  );
}

      
function updateTask(taskId, status) {
  const task = tasks.find((item) => item.id === taskId);

  if (!task) {
    setNotice("Task not found.");
    return;
  }

  const hasConflict =
    task.allocationStatus === "Capacity or Skill Conflict" ||
    (task.allocationStatus && task.owner === "Unassigned");

  if (
    hasConflict &&
    ["Approved", "In Progress", "Completed"].includes(status)
  ) {
    setNotice(
      "Approval blocked: Resolve the resource allocation conflict first."
    );
    return;
  }

  saveData({
    ...data,
    tasks: tasks.map((item) =>
      item.id === taskId ? { ...item, status } : item
    ),
  });

  setNotice(`Task status updated to ${status}.`);
}
function showConflictFeedback(taskId, message) {
  setConflictFeedback((previous) => ({
    ...previous,
    [taskId]: message,
  }));
}
function resolveTaskConflict(taskId) {
  const task = tasks.find((item) => item.id === taskId);
  const employeeName = reassignmentChoices[taskId];

  if (!task || !employeeName) {
    showConflictFeedback(taskId, "Please select an employee first.");
    return;
  }

  const team = [
    {
      name: "Alex",
      skills: ["operations", "process improvement", "logistics"],
      capacityHours: 12,
      assignedHours: 7,
    },
    {
      name: "Jordan",
      skills: ["sales", "customer service", "training"],
      capacityHours: 15,
      assignedHours: 8,
    },
    {
      name: "Taylor",
      skills: ["analytics", "reporting", "technology"],
      capacityHours: 12,
      assignedHours: 10,
    },
  ];

  const employee = team.find((member) => member.name === employeeName);

  if (!employee) {
showConflictFeedback(taskId, "Invalid employee selection.");
    return;
  }

  const requiredSkill = String(
  task.requiredSkill || requiredSkillChoices[taskId] || ""
)
  .trim()
  .toLowerCase();

  if (!requiredSkill) {
    showConflictFeedback(
  taskId,
      "Required skill information is missing. Re-run coordination before reassignment."
    );
    return;
  }

  const hasSkill = employee.skills.some(
    (skill) =>
      skill === requiredSkill ||
      skill.includes(requiredSkill) ||
      requiredSkill.includes(skill)
  );

  if (!hasSkill) {
    showConflictFeedback(
  taskId,
      `${employeeName} does not have the required skill: ${requiredSkill}.`
    );
    return;
  }

  const committedHours = tasks
  .filter(
    (item) =>
      item.id !== taskId &&
      item.owner === employeeName &&
      ["Pending Approval", "Approved", "In Progress"].includes(item.status)
  )
  .reduce(
    (total, item) => total + Number(item.estimatedHours || 0),
    0
  );

  const availableHours = Math.max(
    0,
    employee.capacityHours -
      employee.assignedHours -
      committedHours
  );

  const requiredHours = Number(task.estimatedHours);

  if (
    !Number.isFinite(requiredHours) ||
    requiredHours <= 0 ||
    requiredHours > availableHours
  ) {
    showConflictFeedback(
  taskId,
      `Reassignment blocked: ${employeeName} has ${availableHours} hours available, but this task requires ${task.estimatedHours} hours.`
    );
    return;
  }

  saveData({
    ...data,
    tasks: tasks.map((item) =>
      item.id === taskId
        ? {
            ...item,
            owner: employeeName,
                requiredSkill: requiredSkill,
            allocationStatus: "Manager Reassigned — Pending Approval",
          }
        : item
    ),
  });

  showConflictFeedback(
  taskId,
    `Conflict resolved. ${employeeName} assigned to the task. Manager approval is still required.`
  );
}
      const pendingTasks = tasks.filter(
        (task) => task.status === "Pending Approval"
      );


const pendingTasksByGoal = analyses
  .map((analysis) => ({
    analysis,
    tasks: pendingTasks.filter(
      (task) => task.analysisId === analysis.id
    ),
  }))
  .filter((group) => group.tasks.length > 0);

      const approvedTasks = tasks.filter((task) =>
        ["Approved", "In Progress", "Completed"].includes(task.status)
      );

      const completedTasks = tasks.filter(
        (task) => task.status === "Completed"
      );

      const handoffs = approvedTasks.map((task) => ({
        ...task,
        destination:
          task.category === "Workforce Performance"
            ? "Workforce Operations Agent"
            : task.category === "Customer Experience"
              ? "Customer Experience Agent"
              : task.category === "Cost Optimization"
                ? "Financial Operations Agent"
                : "Operational Execution Agent",
      }));

      return (
        <div className="flex min-h-screen bg-[#F4F7FB]">
          {/* SIDEBAR */}
<aside className="flex w-64 shrink-0 flex-col bg-[#0B1F3A] p-4 text-white">
              <img
              src="/branding/strativa_logo.png"
              alt="STRATIVA"
              className="mb-8 w-full"
            />


<nav className="space-y-1.5">
  {NAV_ITEMS.map((item) => {
    const icons = {
      "Executive Overview": House,
      "AI Management Advisor": Search,
      "Decision Intelligence": BrainCircuit,
      "Approval Center": ClipboardCheck,
      "Execution Tracker": ListChecks,
      "Agent Coordination": Network,
    };

    const Icon = icons[item];

    return (
      <button
        key={item}
        type="button"
        onClick={() => {
          setActivePage(item);
          setNotice("");
        }}
        className={`flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-sm transition-all ${
          activePage === item
            ? "bg-gradient-to-r from-[#4338CA] to-[#2563EB] font-semibold text-white shadow-md"
            : "text-slate-300 hover:bg-white/10 hover:text-white"
        }`}
      >
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/10">
          <Icon size={18} strokeWidth={1.8} />
        </span>

        <span className="flex-1">{item}</span>

        {item === "Approval Center" && pendingTasks.length > 0 && (
          <span className="rounded-full bg-violet-500 px-2 py-0.5 text-xs font-bold text-white">
            {pendingTasks.length}
          </span>
        )}
      </button>
    );
  })}
</nav>
            



            <div className="mt-auto border-t border-white/10 pt-6">
              <button
                type="button"
                onClick={downloadBackup}
                className="mb-4 w-full rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700"
              >
                Download Backup
              </button>

              <label
                htmlFor="restore-backup"
                className="mb-4 flex w-full cursor-pointer items-center justify-center rounded-lg border border-white/30 px-4 py-3 text-sm font-semibold text-white hover:bg-white/10"
              >
                Restore Backup
              </label>

              <input
                id="restore-backup"
                type="file"
                accept=".json,application/json"
                onChange={restoreBackup}
                className="hidden"
              />

              <p className="text-xs text-slate-400">
                STRATIVA • AI Management Platform
              </p>
            </div>
          </aside>

          {/* MAIN CONTENT */}
          <main className="min-w-0 flex-1 p-8">
            <header className="mb-8">
              <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-blue-600">
                AI Management Command Center
              </p>

              <h1 className="text-3xl font-bold text-[#0B1F3A]">
                {activePage}
              </h1>

              <p className="mt-2 text-slate-500">
                Connecting management strategy, human decisions, and
                operational execution.
              </p>
            </header>

            {notice && (
              <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800">
                {notice}
              </div>
            )}

            
{/* EXECUTIVE OVERVIEW */}
{activePage === "Executive Overview OLD" && (
    <div className="space-y-6">
    <section className="rounded-2xl bg-gradient-to-r from-[#0B1F3A] via-[#123C70] to-[#1769D2] p-7 text-white shadow-lg">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-200">
        STRATIVA • Executive Intelligence
      </p>
      <h2 className="mt-3 text-2xl font-bold">
        Management Command Center
      </h2>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-blue-100">
        Monitor strategic priorities, management approvals,
        workforce execution, and operational risks from one
        centralized workspace.
      </p>
      <div className="mt-6 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => setActivePage("AI Management Advisor")}
          className="rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-[#0B1F3A] hover:bg-blue-50"
        >
          Analyze New Goal
        </button>
        <button
          type="button"
          onClick={() => setActivePage("Approval Center")}
          className="rounded-lg border border-white/40 px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/10"
        >
          Review Approvals
        </button>
      </div>
    </section>

    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {[
        {
          label: "Strategic Goals",
          value: analyses.length,
          detail: "Management challenges analyzed",
          color: "text-blue-700",
          background: "bg-blue-50",
        },
        {
          label: "Pending Approvals",
          value: pendingTasks.length,
          detail: "Awaiting management decisions",
          color: "text-amber-700",
          background: "bg-amber-50",
        },
        {
          label: "In Execution",
          value: tasks.filter(
            (task) =>
              task.status === "Approved" ||
              task.status === "In Progress"
          ).length,
          detail: "Approved or underway",
          color: "text-indigo-700",
          background: "bg-indigo-50",
        },
        {
          label: "Completed Tasks",
          value: completedTasks.length,
          detail: "Execution milestones achieved",
          color: "text-emerald-700",
          background: "bg-emerald-50",
        },
      ].map((metric) => (
        <div
          key={metric.label}
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
        >
          <div className={`inline-flex rounded-lg px-3 py-1.5 text-xs font-semibold ${metric.background} ${metric.color}`}>
            {metric.label}
          </div>
          <p className="mt-4 text-4xl font-bold text-[#0B1F3A]">
            {metric.value}
          </p>
          <p className="mt-2 text-xs text-slate-500">
            {metric.detail}
          </p>
        </div>
      ))}
    </section>

    <section className="grid gap-6 xl:grid-cols-2">
      <Panel title="Operational Execution Health">
        {(() => {
          const tracked = tasks.filter((task) =>
            ["Approved", "In Progress", "Completed"].includes(
              task.status
            )
          );
          const rate = tracked.length
            ? Math.round(
                (completedTasks.length / tracked.length) * 100
              )
            : 0;

          return (
            <div>
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-sm text-slate-500">
                    Completion Rate
                  </p>
                  <p className="mt-1 text-4xl font-bold text-[#0B1F3A]">
                    {rate}%
                  </p>
                </div>
                <p className="text-sm text-slate-500">
                  {completedTasks.length} of {tracked.length} tracked tasks
                </p>
              </div>
              <div className="mt-5 h-3 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-emerald-500 transition-all"
                  style={{ width: `${rate}%` }}
                />
              </div>
              <div className="mt-6 grid grid-cols-3 gap-3 text-center">
                {[
                  ["Approved", tasks.filter((t) => t.status === "Approved").length],
                  ["In Progress", tasks.filter((t) => t.status === "In Progress").length],
                  ["Completed", completedTasks.length],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-xl bg-slate-50 p-3">
                    <p className="text-xl font-bold text-[#0B1F3A]">
                      {value}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          );
        })()}
      </Panel>

      <Panel title="Management Attention Required">
        {(() => {
          const conflicts = tasks.filter(
            (task) =>
              task.status === "Pending Approval" &&
              task.allocationStatus === "Capacity or Skill Conflict"
          );

          return (
            <div className="space-y-4">
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                <p className="text-sm font-semibold text-amber-900">
                  {conflicts.length} Unresolved Resource Conflict(s)
                </p>
                <p className="mt-1 text-xs text-amber-800">
                  Conflicted assignments require manager intervention
                  before approval.
                </p>
              </div>
              <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
                <p className="text-sm font-semibold text-blue-900">
                  {pendingTasks.length} Task(s) Awaiting Approval
                </p>
                <p className="mt-1 text-xs text-blue-800">
                  Human authorization remains required before execution.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActivePage("Approval Center")}
                className="text-sm font-semibold text-blue-700 hover:underline"
              >
                Open Approval Center →
              </button>
            </div>
          );
        })()}
      </Panel>
    </section>

    <Panel title="Strategic Management Portfolio">
      {analyses.length === 0 ? (
        <p className="text-slate-500">
          No management challenges analyzed yet.
        </p>
      ) : (
        <div className="space-y-3">
          {analyses.slice(0, 5).map((analysis) => {
            const goalTasks = tasks.filter(
              (task) => task.analysisId === analysis.id
            );
            const done = goalTasks.filter(
              (task) => task.status === "Completed"
            ).length;
            const progress = goalTasks.length
              ? Math.round((done / goalTasks.length) * 100)
              : 0;

            return (
              <div
                key={analysis.id}
                className="rounded-xl border border-slate-200 bg-white p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-[#0B1F3A]">
                      {analysis.challenge}
                    </p>
                    <p className="mt-2 text-xs text-slate-500">
                      {analysis.category}
                    </p>
                  </div>
                  <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                    {progress}% complete
                  </span>
                </div>
                <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-blue-600"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="mt-2 text-xs text-slate-500">
                  {done} of {goalTasks.length} tasks completed
                </p>
              </div>
            );
          })}
        </div>
      )}
    </Panel>
  </div>
)}
{activePage === "Executive Overview" && (
  <ExecutiveDashboard
    analyses={analyses}
    tasks={tasks}
    pendingTasks={pendingTasks}
    completedTasks={completedTasks}
    selectedAnalysis={selectedAnalysis}
    onNavigate={setActivePage}
  />
)}
{/* AI MANAGEMENT ADVISOR */}
{activePage === "AI Management Advisor" && (
  <div className="space-y-6">
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5">
        <h2 className="text-xl font-bold text-[#0B1F3A]">
          AI Management Advisor
        </h2>
        <p className="mt-2 text-sm text-slate-500">
          Describe a management challenge to generate actionable
          recommendations, identify risks, and define success metrics.
        </p>
      </div>

      <label
        htmlFor="management-challenge"
        className="mb-2 block text-sm font-semibold text-slate-700"
      >
        Management Challenge
      </label>

      <textarea
        id="management-challenge"
        value={challenge}
        onChange={(event) => setChallenge(event.target.value)}
        placeholder="Example: Our customer support team is experiencing increased response times and declining customer satisfaction. We need to improve service quality while managing workload."
        rows={6}
        className="w-full resize-y rounded-xl border border-slate-300 bg-slate-50 p-4 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
      />

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-slate-500">
          Enter at least 15 characters to begin analysis.
        </p>

        <button
          type="button"
          onClick={submitChallenge}
          disabled={isAnalyzing || challenge.trim().length < 15}
          className="rounded-lg bg-[#0B1F3A] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#123C70] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isAnalyzing ? "Analyzing Goal..." : "Analyze Management Goal"}
        </button>
      </div>
    </section>

    {selectedAnalysis && (
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
              Management Analysis
            </p>
            <h2 className="mt-2 text-xl font-bold text-[#0B1F3A]">
              {selectedAnalysis.category}
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              {selectedAnalysis.challenge}
            </p>
            <p className="mt-2 text-xs text-slate-500">
              Analysis source: {selectedAnalysis.analysisSource || "Not specified"}
            </p>
          </div>
          <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
            Analysis Available
          </span>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div>
            <h3 className="mb-3 font-semibold text-[#0B1F3A]">
              Recommended Actions
            </h3>
            <BulletList items={selectedAnalysis.recommendations} />
          </div>

          <div>
            <h3 className="mb-3 font-semibold text-[#0B1F3A]">
              Potential Risks
            </h3>
            <BulletList items={selectedAnalysis.risks} />
          </div>
        </div>

        <div className="mt-6 border-t border-slate-200 pt-5">
          <h3 className="mb-3 font-semibold text-[#0B1F3A]">
            Suggested Success Metrics
          </h3>
          <BulletList items={selectedAnalysis.metrics} />
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => setActivePage("Decision Intelligence")}
            className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
          >
            View Decision Intelligence
          </button>

          <button
            type="button"
            onClick={() => setActivePage("Approval Center")}
            className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-semibold text-[#0B1F3A] hover:bg-slate-50"
          >
            Review Proposed Tasks
          </button>

          <button
            type="button"
            onClick={() => setActivePage("Agent Coordination")}
            className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-semibold text-[#0B1F3A] hover:bg-slate-50"
          >
            Agent Coordination
          </button>
        </div>
      </section>
    )}

    {analyses.length > 0 && (
      <Panel title="Previous Management Goals">
        <div className="space-y-3">
          {analyses.map((analysis) => (
            <button
              key={analysis.id}
              type="button"
              onClick={() => {
                setSelectedAnalysisId(analysis.id);
                setNotice("");
              }}
              className={`w-full rounded-lg border p-4 text-left transition hover:border-blue-400 ${
                selectedAnalysis?.id === analysis.id
                  ? "border-blue-400 bg-blue-50"
                  : "border-slate-200 bg-white"
              }`}
            >
              <p className="text-sm font-semibold text-[#0B1F3A]">
                {analysis.challenge}
              </p>
              <p className="mt-2 text-xs text-slate-500">
                {analysis.category}
              </p>
            </button>
          ))}
        </div>
      </Panel>
    )}
  </div>
)}
            {/* DECISION INTELLIGENCE */}
            {activePage === "Decision Intelligence" && (
              <div className="space-y-6">
                {analyses.length === 0 ? (
                  <Panel title="Decision Intelligence">
                    <p className="text-slate-500">
                      Analyze a management challenge to view
                      recommendations, risks, and performance indicators.
                    </p>
                  </Panel>
                ) : (
                  analyses.map((analysis) => (
                    <Panel
                      key={analysis.id}
                      title={analysis.category}
                    >
                      <p className="mb-5 font-semibold">
                        {analysis.challenge}
                      </p>

                      <h3 className="mb-2 font-semibold text-[#0B1F3A]">
                        Recommendations
                      </h3>

                      <div className="mb-6 space-y-4">
                        {analysis.recommendations.map(
                          (item, index) => (
                            <div
                              key={index}
                              className="rounded-lg border border-slate-200 bg-slate-50 p-4"
                            >
                              <p className="font-semibold text-[#0B1F3A]">
                                {index + 1}. {item}
                              </p>

                              {analysis.reasoning?.[index] && (
                                <div className="mt-3">
                                  <p className="text-sm font-semibold text-slate-700">
                                    Business Reasoning
                                  </p>
                                  <p className="mt-1 text-sm text-slate-600">
                                    {analysis.reasoning[index]}
                                  </p>
                                </div>
                              )}

                              {analysis.expectedImpact?.[index] && (
                                <div className="mt-3">
                                  <p className="text-sm font-semibold text-slate-700">
                                    Potential Business Impact
                                  </p>
                                  <p className="mt-1 text-sm text-slate-600">
                                    {analysis.expectedImpact[index]}
                                  </p>
                                </div>
                              )}
                            </div>
                          )
                        )}
                      </div>

                      <h3 className="mb-2 font-semibold text-[#0B1F3A]">
                        Potential Risks
                      </h3>
                      <BulletList items={analysis.risks} />

                      <h3 className="mb-2 mt-5 font-semibold text-[#0B1F3A]">
                        Suggested Success Metrics
                      </h3>
                      <BulletList items={analysis.metrics} />
                    </Panel>
                  ))
                )}
              </div>
            )}

            
{/* APPROVAL CENTER */}
{activePage === "Approval Center" && (
  <div className="space-y-6">
    {pendingTasksByGoal.length === 0 ? (
      <Panel title="Pending Management Approvals">
        <p className="text-slate-500">
          No tasks are currently awaiting approval.
        </p>
      </Panel>
    ) : (
      pendingTasksByGoal.map(({ analysis, tasks: goalTasks }) => (
        <Panel
          key={analysis.id}
          title="Management Goal"
        >
          <div className="mb-5 rounded-lg bg-slate-50 p-4">
            <p className="font-semibold text-[#0B1F3A]">
              {analysis.challenge}
            </p>
            <p className="mt-2 text-sm text-slate-500">
              {analysis.category}
            </p>
            <p className="mt-2 text-sm text-blue-700">
              {goalTasks.length} task(s) awaiting approval
            </p>
          </div>

          <div className="space-y-4">
            {goalTasks.map((task) => {
              const hasConflict =
                task.allocationStatus ===
                  "Capacity or Skill Conflict" ||
                (task.allocationStatus &&
                  task.owner === "Unassigned");

              return (
                <div
                  key={task.id}
                  className="rounded-lg border border-slate-200 p-5"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-[#0B1F3A]">
                        {task.title}
                      </p>

                      <p className="mt-2 text-sm text-slate-500">
                        {task.category}
                      </p>

                      <div className="mt-3 space-y-1 text-sm text-slate-700">
                        <p>
                          <strong>Proposed owner:</strong>{" "}
                          {task.owner || "Unassigned"}
                        </p>

                        {task.estimatedHours != null && (
                          <p>
                            <strong>Estimated effort:</strong>{" "}
                            {task.estimatedHours} hours
                          </p>
                        )}

                        {task.allocationStatus && (
                          <p>
                            <strong>Allocation status:</strong>{" "}
                            {task.allocationStatus}
                          </p>
                        )}
                      </div>

                      <div className="mt-3">
                        <Badge status={task.status} />
                      </div>

                      
{hasConflict && (
  <div className="mt-4 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
    <TriangleAlert
      size={20}
      strokeWidth={1.8}
      className="mt-0.5 shrink-0 text-red-600"
    />
    <div>
      <p className="text-sm font-bold text-red-700">
        Approval Blocked
      </p>
      <p className="mt-1 text-xs text-red-600">
        Resolve the resource allocation conflict
        before execution.
      </p>
    </div>
  </div>
)}

                      {hasConflict && (
  <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4">
    <p className="mb-2 text-sm font-semibold text-slate-800">
      Manager Conflict Resolution
    </p>

    {task.requiredSkill ? (
  <p className="mb-3 text-sm text-slate-600">
    Required skill: {task.requiredSkill}
  </p>
) : (
  <div className="mb-3">
    <label className="mb-2 block text-sm font-medium text-slate-700">
      Required Skill (Manager Confirmation)
    </label>

    <select
      value={requiredSkillChoices[task.id] || ""}
      onChange={(event) =>
        setRequiredSkillChoices((previous) => ({
          ...previous,
          [task.id]: event.target.value,
        }))
      }
      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
    >
      <option value="">Select required skill</option>
      <option value="operations">Operations</option>
      <option value="process improvement">Process Improvement</option>
      <option value="logistics">Logistics</option>
      <option value="sales">Sales</option>
      <option value="customer service">Customer Service</option>
      <option value="training">Training</option>
      <option value="analytics">Analytics</option>
      <option value="reporting">Reporting</option>
      <option value="technology">Technology</option>
    </select>
  </div>
)}

    <div className="flex flex-wrap items-center gap-3">
      <select
        value={reassignmentChoices[task.id] || ""}
        onChange={(event) =>
          setReassignmentChoices((previous) => ({
            ...previous,
            [task.id]: event.target.value,
          }))
        }
        className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
      >
        <option value="">Select employee</option>
        <option value="Alex">Alex</option>
        <option value="Jordan">Jordan</option>
        <option value="Taylor">Taylor</option>
      </select>

      <button
        type="button"
        onClick={() => resolveTaskConflict(task.id)}
        className="rounded-lg bg-[#0B1F3A] px-4 py-2 text-sm font-semibold text-white"
      >
        Resolve Conflict
      </button>
    </div>

    <p className="mt-2 text-xs text-slate-600">
      Reassignment requires matching skills and sufficient
      capacity. Final task approval remains a separate decision.
    </p>
    {conflictFeedback[task.id] && (
  <p
    role="status"
    className="mt-3 rounded-lg border border-slate-200 bg-white p-3 text-sm font-medium text-slate-800"
  >
    {conflictFeedback[task.id]}
  </p>
)}
  </div>
)}
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        disabled={Boolean(hasConflict)}
                        onClick={() =>
                          updateTask(task.id, "Approved")
                        }
                        className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        Approve
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          updateTask(task.id, "Rejected")
                        }
                        className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Panel>
      ))
    )}
  </div>
)}

            
{/* EXECUTION TRACKER */}
{activePage === "Execution Tracker" && (
  <div className="space-y-5">
    {(() => {
      const executionTasks = approvedTasks;
      const inProgress = executionTasks.filter(
        (task) => task.status === "In Progress"
      ).length;
      const completed = executionTasks.filter(
        (task) => task.status === "Completed"
      ).length;
      const notStarted = executionTasks.filter(
        (task) => task.status === "Approved"
      ).length;
      const completionRate = executionTasks.length
        ? Math.round((completed / executionTasks.length) * 100)
        : 0;

      
const summary = [
  ["Total Tasks", executionTasks.length, "text-blue-700", "bg-blue-50", ListChecks],
  ["In Progress", inProgress, "text-indigo-700", "bg-indigo-50", Clock3],
  ["Completed", completed, "text-emerald-700", "bg-emerald-50", CircleCheck],
  ["Not Started", notStarted, "text-red-600", "bg-red-50", Square],
  ["Overall Progress", `${completionRate}%`, "text-teal-700", "bg-teal-50", TrendingUp],
];


      return (
        <>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold text-[#0B1F3A]">
                Operational Execution Tracker
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Monitor approved tasks, update execution status,
                and track completed work.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
            {summary.map(([label, value, color, background, Icon]) => (
              <div
                key={label}
                className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
              >
                
<div className="flex items-center justify-between gap-2">
  <span className="text-xs font-semibold text-slate-500">
    {label}
  </span>
  <span
    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${color} ${background}`}
  >
    <Icon size={23} strokeWidth={1.8} />
  </span>
</div>

                <p className="mt-4 text-3xl font-bold text-[#0B1F3A]">
                  {value}
                </p>
              </div>
            ))}
          </div>

          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-5 py-4">
              <h3 className="font-bold text-[#0B1F3A]">
                Approved Task Execution
              </h3>
              <p className="mt-1 text-xs text-slate-500">
                Only manager-approved tasks appear in this tracker.
              </p>
            </div>

            {executionTasks.length === 0 ? (
              <p className="p-6 text-sm text-slate-500">
                No approved tasks yet. Approve tasks in the Approval Center
                to begin tracking execution.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[850px] text-left text-sm">
                  <thead className="bg-slate-50 text-xs text-slate-500">
                    <tr>
                      <th className="p-4 font-semibold">Task</th>
                      <th className="p-4 font-semibold">Owner</th>
                      <th className="p-4 font-semibold">Hours</th>
                      <th className="p-4 font-semibold">Management Goal</th>
                      <th className="p-4 font-semibold">Status</th>
                      <th className="p-4 font-semibold">Progress</th>
                    </tr>
                  </thead>
                  <tbody>
                    {executionTasks.map((task) => {
                      const goal = analyses.find(
                        (analysis) => analysis.id === task.analysisId
                      );
                      const isCompleted = task.status === "Completed";
                      const isInProgress = task.status === "In Progress";

                      return (
                        <tr
                          key={task.id}
                          className="border-t border-slate-100 align-top"
                        >
                          <td className="max-w-xs p-4 font-medium text-[#0B1F3A]">
                            {task.title}
                          </td>
                          <td className="p-4 text-slate-600">
                            {task.owner || "Unassigned"}
                          </td>
                          <td className="p-4 text-slate-600">
                            {task.estimatedHours != null
                              ? `${task.estimatedHours} h`
                              : "—"}
                          </td>
                          <td className="max-w-xs p-4 text-xs text-slate-600">
                            <span title={goal?.challenge || "Not linked"}>
  {goal?.category || "Management Goal"}
</span>
                          </td>
                          <td className="p-4">
                            <select
                              value={task.status}
                              onChange={(event) =>
                                updateTask(task.id, event.target.value)
                              }
                              className="rounded-lg border border-slate-200 bg-white px-2 py-2 text-xs font-medium text-[#0B1F3A]"
                              aria-label={`Status for ${task.title}`}
                            >
                              <option value="Approved">Approved</option>
                              <option value="In Progress">In Progress</option>
                              <option value="Completed">Completed</option>
                            </select>
                          </td>
                          <td className="min-w-32 p-4">
                            <div className="flex items-center gap-2">
                              <div className="h-2 w-24 overflow-hidden rounded-full bg-slate-100">
                                <div
                                  className={`h-full ${
                                    isCompleted
                                      ? "bg-emerald-500"
                                      : isInProgress
                                        ? "bg-blue-500"
                                        : "bg-slate-300"
                                  }`}
                                  style={{
                                    width: isCompleted
                                      ? "100%"
                                      : isInProgress
                                        ? "50%"
                                        : "0%",
                                  }}
                                />
                              </div>
                              <span className="text-xs text-slate-500">
                                {isCompleted
                                  ? "100%"
                                  : isInProgress
                                    ? "In progress"
                                    : "Not started"}
                              </span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          <p className="text-xs text-slate-500">
            Progress bars represent task status, not measured percentage
            completion. Detailed milestone tracking is a planned enhancement.
          </p>
        </>
      );
    })()}
  </div>
)}


            {/* AGENT COORDINATION */}
            {activePage === "Agent Coordination" && (
              <Panel title="Structured Agent Handoffs">
                <div className="mb-5 rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <h3 className="font-semibold text-[#0B1F3A]">
                    AI Multi-Agent Coordination
                  </h3>

                  <p className="mt-2 text-sm text-slate-600">
                    Run the Strategy, Operations, Risk, and Coordinator
                    agents to develop a coordinated management plan
                    using sample workforce data.
                  </p>

                  {selectedAnalysis && (
                    <div className="mt-4">
                      <label
                        htmlFor="coordination-goal"
                        className="mb-2 block text-sm font-semibold text-slate-700"
                      >
                        Management Challenge
                      </label>

                      <select
                        id="coordination-goal"
                        value={
                          selectedAnalysisId ||
                          selectedAnalysis.id
                        }
                        onChange={(event) => {
                          setSelectedAnalysisId(event.target.value);
                          setCoordinationResult(null);
                          setCoordinationError("");
                        }}
                        className="w-full rounded-lg border border-slate-300 bg-white p-3 text-sm"
                      >
                        {analyses.map((analysis) => (
                          <option
                            key={analysis.id}
                            value={analysis.id}
                          >
                            {analysis.challenge}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={runCoordination}
                    disabled={
                      isCoordinating || !selectedAnalysis
                    }
                    className="mt-4 rounded-lg bg-[#0B1F3A] px-5 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isCoordinating
                      ? "AI Agents Working..."
                      : "Run Multi-Agent Coordination"}
                  </button>

                  {!selectedAnalysis && (
                    <p className="mt-3 text-sm text-slate-500">
                      Analyze a management challenge in the
                      AI Management Advisor to begin.
                    </p>
                  )}

                  {coordinationError && (
                    <p className="mt-3 text-sm text-red-600">
                      {coordinationError}
                    </p>
                  )}

                  {/* RESULTS APPEAR ONLY AFTER COORDINATION SUCCEEDS */}
                  {coordinationResult && (
                    <div className="mt-6 space-y-5">
                      {/* STRATEGY AGENT */}
                      <div className="rounded-lg bg-white p-5 shadow-sm">
                        <h4 className="font-semibold text-[#0B1F3A]">
                          Strategy Agent — Business Priorities
                        </h4>

                        <p className="mt-3 text-sm text-slate-700">
                          <strong>Objective:</strong>{" "}
                          {coordinationResult.agents.strategy.objective}
                        </p>

                        <h5 className="mt-4 text-sm font-semibold">
                          Strategic Priorities
                        </h5>

                        <BulletList
                          items={
                            coordinationResult.agents.strategy.priorities
                          }
                        />

                        <h5 className="mt-4 text-sm font-semibold">
                          Success Measures
                        </h5>

                        <BulletList
                          items={
                            coordinationResult.agents.strategy.successMeasures
                          }
                        />
                      </div>

                      {/* OPERATIONS AGENT */}
                      <div className="rounded-lg bg-white p-5 shadow-sm">
                        <h4 className="font-semibold text-[#0B1F3A]">
                          Operations Agent — Execution Planning
                        </h4>

                        <p className="mt-2 text-sm text-slate-600">
                          Converts strategic priorities into proposed
                          operational tasks.
                        </p>

                        <div className="mt-4 space-y-3">
                          {(
                            coordinationResult.agents.operations.tasks || []
                          ).map((task, index) => (
                            <div
                              key={index}
                              className="rounded-lg border border-slate-200 p-4 text-sm"
                            >
                              <p className="font-semibold text-[#0B1F3A]">
                                {task.title}
                              </p>

                              <p className="mt-2">
                                Required skill: {task.requiredSkill}
                              </p>
                              <p>
                                Estimated effort: {task.estimatedHours} hours
                              </p>
                              <p>Priority: {task.priority}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* RISK AGENT */}
                      <div className="rounded-lg bg-white p-5 shadow-sm">
                        <h4 className="font-semibold text-[#0B1F3A]">
                          Risk Agent — Risk Assessment
                        </h4>

                        <h5 className="mt-4 text-sm font-semibold">
                          Business Risks
                        </h5>

                        <BulletList
                          items={
                            coordinationResult.agents.risk.risks
                          }
                        />

                        <h5 className="mt-4 text-sm font-semibold">
                          Potential Operational Conflicts
                        </h5>

                        <BulletList
                          items={
                            coordinationResult.agents.risk.conflicts
                          }
                        />

                        <h5 className="mt-4 text-sm font-semibold">
                          Recommended Resolutions
                        </h5>

                        <BulletList
                          items={
                            coordinationResult.agents.risk.resolutions
                          }
                        />

                        <p className="mt-4 text-xs text-slate-500">
                          Agent-identified risks are advisory.
                          Confirmed capacity conflicts are calculated
                          separately using sample workforce data.
                        </p>
                      </div>

                      {/* COORDINATOR AGENT */}
                      <div className="rounded-lg bg-white p-5 shadow-sm">
                        <h4 className="font-semibold text-[#0B1F3A]">
                          Coordinator Agent — Executive Summary
                        </h4>

                        <p className="mt-3 text-sm leading-relaxed text-slate-700">
                          {
                            coordinationResult.agents.coordinator
                              .executiveSummary
                          }
                        </p>

                        <h5 className="mt-4 text-sm font-semibold">
                          Recommended Management Actions
                        </h5>

                        <BulletList
                          items={
                            coordinationResult.agents.coordinator
                              .recommendedActions
                          }
                        />

                        <h5 className="mt-4 text-sm font-semibold">
                          Management Decision
                        </h5>

                        <p className="mt-2 text-sm text-slate-700">
                          {
                            coordinationResult.agents.coordinator
                              .managementDecision
                          }
                        </p>
                      </div>

                      {/* AGENT HANDOFF HISTORY */}
                      <div className="rounded-lg bg-white p-5 shadow-sm">
                        <h4 className="font-semibold text-[#0B1F3A]">
                          Multi-Agent Handoff History
                        </h4>

                        <p className="mt-2 text-sm text-slate-600">
                          Information transfers between STRATIVA's
                          specialized AI agents.
                        </p>

                        <div className="mt-4 space-y-3">
                          {(coordinationResult.handoffs || []).map(
                            (handoff, index) => (
                              <div
                                key={index}
                                className="rounded-lg border border-slate-200 p-4"
                              >
                                <p className="text-sm font-semibold text-[#0B1F3A]">
                                  {handoff.from} → {handoff.to}
                                </p>

                                <p className="mt-2 text-sm text-slate-600">
                                  {handoff.message}
                                </p>
                              </div>
                            )
                          )}
                        </div>
                      </div>


{/* SEND COORDINATED TASKS FOR APPROVAL */}
<div className="rounded-lg border border-blue-200 bg-blue-50 p-5">
  <h4 className="font-semibold text-[#0B1F3A]">
    Management Approval Required
  </h4>

  <p className="mt-2 text-sm text-slate-600">
    Review the proposed tasks and resource assignments before
    authorizing execution.
  </p>

  <button
    type="button"
    onClick={() => {
      saveCoordinatedTasks();
      setActivePage("Approval Center");
    }}
    className="mt-4 rounded-lg bg-[#1769D2] px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700"
  >
    Send Coordinated Tasks for Approval
  </button>
</div>

                      {/* RESOURCE ALLOCATION */}
                      <div className="rounded-lg bg-white p-5 shadow-sm">
                        <h4 className="font-semibold text-[#0B1F3A]">
                          Proposed Resource Allocation
                        </h4>

                        <p className="mt-2 text-xs text-slate-500">
                          Proposed assignments use fictional workforce
                          data and require human approval.
                        </p>

                        {(
                          coordinationResult.resourceAllocation.allocations ||
                          []
                        ).map((allocation, index) => (
                          <div
                            key={index}
                            className="mt-4 border-t border-slate-200 pt-4 text-sm"
                          >
                            <p className="font-semibold text-[#0B1F3A]">
                              {allocation.task}
                            </p>

                            <p className="mt-2">
                              Proposed owner: {allocation.owner}
                            </p>

                            <p>
                              Estimated effort: {allocation.estimatedHours} hours
                            </p>

                            <p>Status: {allocation.status}</p>
                          </div>
                        ))}
                      </div>
{/* WORKFORCE CAPACITY OVERVIEW */}
<div className="rounded-lg bg-white p-5 shadow-sm">
  <h4 className="font-semibold text-[#0B1F3A]">
    Workforce Capacity Overview
  </h4>

  <p className="mt-2 text-sm text-slate-600">
    Remaining employee capacity after existing assignments
    and proposed task allocations.
  </p>

  <div className="mt-3 space-y-2">
    {Object.entries(
      coordinationResult.resourceAllocation.remainingCapacity || {}
    ).map(([employee, hours]) => (
      <div
        key={employee}
        className="flex justify-between rounded-md bg-slate-50 p-3 text-sm"
      >
        <span className="font-medium">{employee}</span>
        <span>{hours} hours remaining</span>
      </div>
    ))}
  </div>
</div>
                      {/* CAPACITY CONFLICTS */}
                      <div className="rounded-lg bg-white p-5 shadow-sm">
                        <h4 className="font-semibold text-[#0B1F3A]">
                          Capacity Conflicts
                        </h4>

                        <p className="mt-3 text-sm font-medium text-slate-700">
                          Verified capacity status:{" "}
                          {(
                            coordinationResult.resourceAllocation
                              .capacityConflicts || []
                          ).length === 0
                            ? "No capacity conflicts detected"
                            : `${
                                coordinationResult.resourceAllocation
                                  .capacityConflicts.length
                              } capacity conflict(s) detected`}
                        </p>

                        {(
                          coordinationResult.resourceAllocation
                            .capacityConflicts || []
                        ).length === 0 ? (
                          <p className="mt-2 text-sm text-slate-600">
                            No capacity conflicts detected in the
                            sample team.
                          </p>
                        ) : (
                          <BulletList
                            items={
                              coordinationResult.resourceAllocation
                                .capacityConflicts
                            }
                          />
                        )}
                      </div>

                      <p className="text-xs text-slate-500">
                        {coordinationResult.demoDataNotice}
                      </p>
                    </div>
                  )}
                </div>

                {/* EXISTING APPROVED TASK HANDOFFS */}
                <h3 className="mb-3 font-semibold text-[#0B1F3A]">
                  Operational Handoff Tracking
                </h3>

                <p className="mb-5 text-sm text-slate-500">
                  Previously approved tasks are listed below for
                  operational handoff tracking. These tasks have not
                  been dispatched to external business systems.
                </p>

                {handoffs.length === 0 ? (
                  <p className="text-slate-500">
                    No approved tasks are available for agent handoff.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {handoffs.map((handoff) => (
                      <div
                        key={handoff.id}
                        className="rounded-lg border border-slate-200 p-5"
                      >
                        <p className="font-semibold text-[#0B1F3A]">
                          {handoff.title}
                        </p>

                        <p className="mt-2 text-sm text-slate-600">
                          Destination: {handoff.destination}
                        </p>

                        <p className="mt-2 text-sm text-slate-600">
                          Handoff status: Prepared — not dispatched
                        </p>

                        <div className="mt-3">
                          <Badge status={handoff.status} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Panel>
            )}
          </main>
        </div>
      );
    }
