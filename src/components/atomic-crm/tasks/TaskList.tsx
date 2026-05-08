import { useListContext, useTranslate } from "ra-core";
import { List } from "@/components/admin/list";
import { ExportButton } from "@/components/admin/export-button";
import { SearchInput } from "@/components/admin/search-input";
import { SelectInput } from "@/components/admin/select-input";
import { TopToolbar } from "../layout/TopToolbar";
import { useConfigurationContext } from "../root/ConfigurationContext";
import { Task } from "./Task";
import type { Task as TTask } from "../types";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useState } from "react";

const TaskList = () => {
  const { taskTypes } = useConfigurationContext();
  const [showAll, setShowAll] = useState(false);

  const taskFilters = [
    <SearchInput source="q" alwaysOn />,
    <SelectInput
      source="type"
      label="Type"
      choices={taskTypes}
      optionText="label"
      optionValue="value"
      emptyText="All Types"
    />,
  ];

  return (
    <List
      title={false}
      sort={{ field: "due_date", order: "ASC" }}
      filters={taskFilters}
      perPage={25}
      actions={
        <TopToolbar>
          <div className="flex items-center gap-2 mr-2">
            <Switch
              id="show-all"
              checked={showAll}
              onCheckedChange={setShowAll}
            />
            <Label htmlFor="show-all" className="text-sm cursor-pointer">
              Show completed
            </Label>
          </div>
          <ExportButton />
        </TopToolbar>
      }
    >
      <TaskListContent showAll={showAll} />
    </List>
  );
};

const TaskListContent = ({ showAll }: { showAll: boolean }) => {
  const { data, isPending } = useListContext<TTask>();
  const translate = useTranslate();

  if (isPending) return null;

  const filtered = showAll
    ? data
    : data?.filter((task) => !task.done_date);

  if (!filtered?.length) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-muted-foreground gap-3">
        <p className="text-base font-medium">
          {showAll
            ? translate("resources.tasks.empty")
            : "No active tasks"}
        </p>
        <p className="text-sm">
          {showAll
            ? translate("resources.tasks.empty_list_hint")
            : "All tasks are completed. Toggle \"Show completed\" to see them."}
        </p>
      </div>
    );
  }

  return (
    <Card className="p-4 space-y-2">
      {filtered.map((task) => (
        <div
          key={task.id}
          className="border-b border-border last:border-0 pb-3 last:pb-0"
        >
          <Task task={task} showContact={true} />
        </div>
      ))}
    </Card>
  );
};

export default TaskList;