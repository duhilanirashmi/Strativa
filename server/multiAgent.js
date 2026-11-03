
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const MODEL = "gemini-3.5-flash-lite";

// Sample workforce data for academic demonstration.
// These are fictional employees, not real HR records.
const DEMO_TEAM = [
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

async function runAgent(name, instructions, context, schema) {
  const response = await ai.models.generateContent({
    model: MODEL,
    contents: `
You are the ${name} within STRATIVA, an AI-powered
midlevel management coordination system.

Your responsibilities:
${instructions}

Management context:
${JSON.stringify(context)}

Use only the provided context.
Do not invent employee availability, skills, or business data.
Provide practical recommendations for a midlevel manager.
Return concise, structured results.
`,
    config: {
      responseMimeType: "application/json",
      responseSchema: schema,
    },
  });

  if (!response.text) {
    throw new Error(`${name} returned an empty response.`);
  }

  return JSON.parse(response.text);
}

const strategySchema = {
  type: "OBJECT",
  properties: {
    objective: { type: "STRING" },
    priorities: {
      type: "ARRAY",
      items: { type: "STRING" },
    },
    successMeasures: {
      type: "ARRAY",
      items: { type: "STRING" },
    },
  },
  required: ["objective", "priorities", "successMeasures"],
};

const operationsSchema = {
  type: "OBJECT",
  properties: {
    tasks: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          title: { type: "STRING" },
          requiredSkill: { type: "STRING" },
          estimatedHours: { type: "INTEGER" },
          priority: { type: "STRING" },
        },
        required: [
          "title",
          "requiredSkill",
          "estimatedHours",
          "priority",
        ],
      },
    },
  },
  required: ["tasks"],
};

const riskSchema = {
  type: "OBJECT",
  properties: {
    risks: {
      type: "ARRAY",
      items: { type: "STRING" },
    },
    conflicts: {
      type: "ARRAY",
      items: { type: "STRING" },
    },
    resolutions: {
      type: "ARRAY",
      items: { type: "STRING" },
    },
  },
  required: ["risks", "conflicts", "resolutions"],
};

const coordinatorSchema = {
  type: "OBJECT",
  properties: {
    executiveSummary: { type: "STRING" },
    recommendedActions: {
      type: "ARRAY",
      items: { type: "STRING" },
    },
    managementDecision: { type: "STRING" },
  },
  required: [
    "executiveSummary",
    "recommendedActions",
    "managementDecision",
  ],
};

function allocateResources(tasks, team) {
  const remainingCapacity = Object.fromEntries(
    team.map((member) => [
      member.name,
      Math.max(0, member.capacityHours - member.assignedHours),
    ])
  );

  const allocations = [];
  const capacityConflicts = [];

  for (const task of tasks) {
    const estimatedHours = Math.max(
      1,
      Math.min(40, Number(task.estimatedHours) || 1)
    );

    const requiredSkill = String(task.requiredSkill || "")
      .trim()
      .toLowerCase();

    const eligible = team
      .filter((member) =>
        member.skills.some(
          (skill) =>
            skill.toLowerCase() === requiredSkill ||
            skill.toLowerCase().includes(requiredSkill) ||
            requiredSkill.includes(skill.toLowerCase())
        )
      )
      .sort(
        (a, b) =>
          remainingCapacity[b.name] -
          remainingCapacity[a.name]
      );

    const available = eligible.find(
      (member) =>
        remainingCapacity[member.name] >= estimatedHours
    );

    if (available) {
      remainingCapacity[available.name] -= estimatedHours;

      {allocations.push(
        task: task.title,
requiredSkill: task.requiredSkill,
owner: available.name,
        estimatedHours,
        status: "Proposed — Requires Manager Approval",
      });
    } else {
      allocations.push({
        task: task.title,
requiredSkill: task.requiredSkill,
owner: "Unassigned",
        estimatedHours,
        status: "Capacity or Skill Conflict",
      });

      capacityConflicts.push(
        `No team member has sufficient available capacity and matching skills for "${task.title}" (${estimatedHours} hours; required skill: ${requiredSkill}).`
      );
    }
  }

  return {
    allocations,
    capacityConflicts,
    remainingCapacity,
  };
}

export async function coordinateManagementChallenge(
  challenge,
  existingTasks = []
) {
  if (
    typeof challenge !== "string" ||
    challenge.trim().length < 15
  ) {
    throw new Error(
      "Please provide a management challenge of at least 15 characters."
    );
  }

  const handoffs = [];

  const strategy = await runAgent(
    "Strategy Agent",
    `Identify the primary business objective,
three strategic priorities, and measurable success indicators.`,
    { challenge },
    strategySchema
  );

  handoffs.push({
    from: "Strategy Agent",
    to: "Operations Agent",
    message: "Strategic priorities and success measures delivered.",
  });

  const operations = await runAgent(
    "Operations Agent",
    `Create exactly three actionable tasks aligned with the
Strategy Agent's priorities. Each task must include one
required skill, estimated hours, and a priority.
Choose required skills from the provided team skill list.`,
    {
      challenge,
      strategy,
      team: DEMO_TEAM,
    },
    operationsSchema
  );

const activeAssignments = existingTasks.filter(
  (task) =>
    ["Approved", "In Progress"].includes(task.status) &&
    DEMO_TEAM.some((member) => member.name === task.owner) &&
    Number.isFinite(Number(task.estimatedHours)) &&
    Number(task.estimatedHours) > 0
);

const updatedTeam = DEMO_TEAM.map((member) => {
  const additionalHours = activeAssignments
    .filter((task) => task.owner === member.name)
    .reduce(
      (total, task) => total + Number(task.estimatedHours),
      0
    );

  return {
    ...member,
    assignedHours: member.assignedHours + additionalHours,
  };
});

const allocation = allocateResources(
  operations.tasks,
  updatedTeam
);

  handoffs.push({
    from: "Operations Agent",
    to: "Risk Agent",
    message: "Execution tasks and proposed resource allocations delivered.",
  });

  const risk = await runAgent(
    "Risk Agent",
    `Identify operational risks, competing priorities,
and workflow conflicts. Review the resource allocations
and capacity conflicts. Recommend practical resolutions.
Do not claim a conflict exists unless supported by the context.`,
    {
      challenge,
      strategy,
      operations,
      allocation,
    },
    riskSchema
  );

  
handoffs.push({
  from: "Risk Agent",
  to: "Coordinator Agent",
  message: "Risk assessment and conflict recommendations delivered.",
});

const coordinator = await runAgent(
  "Coordinator Agent",
  `Synthesize the specialist agents' findings into
a concise executive summary, recommended actions,
and a management decision.

IMPORTANT RESOURCE ALLOCATION RULES:
The calculated allocation data is authoritative.

Only report capacity conflicts that appear in
allocation.capacityConflicts.

If allocation.capacityConflicts is empty, explicitly
state that no capacity conflicts were detected.

Do not invent employee workloads, staffing shortages,
or capacity conflicts.

Distinguish general business risks from confirmed
resource capacity conflicts.

All proposed allocations require manager approval.
Do not claim tasks have already been executed.`,
  {
    challenge,
    strategy,
    operations,
    allocation,
    risk,
  },
  coordinatorSchema
);


  return {
    source: "STRATIVA Multi-Agent Coordination",
    challenge,
    agents: {
      strategy,
      operations,
      risk,
      coordinator,
    },
    resourceAllocation: allocation,
    handoffs,
    requiresHumanApproval: true,
    demoDataNotice:
      "Resource allocations use fictional employee data. No external business systems are connected.",
  };
}
