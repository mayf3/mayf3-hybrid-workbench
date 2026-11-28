import { type useAgentWorkspace } from "../premium-agent/AgentWorkspaceModel";

export type WorkspaceProps = {
  workspace: ReturnType<typeof useAgentWorkspace>;
  selectedTaskId: string;
  onSelectTask: (id: string) => void;
};

// One simulated observation per day of the reference week. Each numerator
// has its own denominator, and the weekly totals come from these records.
export const weeklyOperations = [
  { day: "周一", planned: 3, delivered: 2, attempts: 20, recovered: 17 },
  { day: "周二", planned: 3, delivered: 3, attempts: 30, recovered: 29 },
  { day: "周三", planned: 3, delivered: 2, attempts: 15, recovered: 14 },
  { day: "周四", planned: 3, delivered: 3, attempts: 25, recovered: 24 },
  { day: "周五", planned: 3, delivered: 2, attempts: 20, recovered: 18 },
  { day: "周六", planned: 3, delivered: 3, attempts: 35, recovered: 34 },
  { day: "周日", planned: 3, delivered: 3, attempts: 28, recovered: 27 },
] as const;

const counts = weeklyOperations.reduce((total, record) => ({
  planned: total.planned + record.planned,
  delivered: total.delivered + record.delivered,
  attempts: total.attempts + record.attempts,
  recovered: total.recovered + record.recovered,
}), { planned: 0, delivered: 0, attempts: 0, recovered: 0 });

export const operationsTotals = { ...counts, recoveryRate: counts.recovered / counts.attempts * 100 };
