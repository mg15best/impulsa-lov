import { Badge } from "@/components/ui/badge";
import { taskSourceColors, taskSourceLabels } from "@/domains/tasks/constants";

interface TaskSourceBadgeProps {
  source: string | null;
}

export function TaskSourceBadge({ source }: TaskSourceBadgeProps) {
  const normalizedSource = source || "manual";
  return (
    <Badge className={taskSourceColors[normalizedSource] || taskSourceColors.manual}>
      {taskSourceLabels[normalizedSource] || normalizedSource}
    </Badge>
  );
}
