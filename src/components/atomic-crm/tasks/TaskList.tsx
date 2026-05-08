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

const TaskList = () => {
  const { taskTypes } = useConfigurationContext();

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
          <ExportButton />
        </TopToolbar>
      }
    >
      <TaskListContent />
    </List>
  );
};

const TaskListContent = () => {
  const { data, isPending } = useListContext<TTask>();
  const translate = useTranslate();

  if (isPending) return null;

  if (!data?.length) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-muted-foreground gap-3">
        <p className="text-base font-medium">
          {translate("resources.tasks.empty")}
        </p>
        <p className="text-sm">
          {translate("resources.tasks.empty_list_hint")}
        </p>
      </div>
    );
  }

  return (
    <Card className="p-4 space-y-2">
      {data.map((task) => (
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
