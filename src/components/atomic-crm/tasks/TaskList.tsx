import {
  useGetIdentity,
  useListContext,
  useTranslate,
} from "ra-core";
import { List } from "@/components/admin/list";
import { CreateButton } from "@/components/admin/create-button";
import { ExportButton } from "@/components/admin/export-button";
import { SearchInput } from "@/components/admin/search-input";
import { SelectInput } from "@/components/admin/select-input";
import { ReferenceField } from "@/components/admin/reference-field";
import { DateField } from "@/components/admin/date-field";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { TopToolbar } from "../layout/TopToolbar";
import { useConfigurationContext } from "../root/ConfigurationContext";
import { TaskCreateSheet } from "./TaskCreateSheet";
import { TaskEditSheet } from "./TaskEditSheet";
import type { Task } from "../types";
import { useState } from "react";
import { cn } from "@/lib/utils";

const TaskList = () => {
  const { identity } = useGetIdentity();
  const { taskTypes } = useConfigurationContext();
  const translate = useTranslate();

  if (!identity) return null;

  const taskFilters = [
    <SearchInput source="q" alwaysOn />,
    <SelectInput
      source="type"
      label="resources.tasks.fields.type"
      choices={taskTypes}
      optionText="label"
      optionValue="value"
      emptyText="All Types"
    />,
    <SelectInput
      source="done"
      label="resources.tasks.fields.status"
      choices={[
        { value: "false", label: translate("resources.tasks.status.pending") },
        { value: "true", label: translate("resources.tasks.status.done") },
      ]}
      optionText="label"
      optionValue="value"
      emptyText="All Statuses"
    />,
  ];

  return (
    <List
      title={false}
      sort={{ field: "due_date", order: "ASC" }}
      filters={taskFilters}
      perPage={25}
      actions={<TaskListActions />}
    >
      <TaskListContent />
    </List>
  );
};

const TaskListContent = () => {
  const { data, isPending } = useListContext<Task>();
  const { taskTypes } = useConfigurationContext();
  const translate = useTranslate();
  const [editTaskId, setEditTaskId] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  if (isPending) return null;

  if (!data?.length) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-muted-foreground gap-3">
        <p className="text-base font-medium">No tasks yet</p>
        <p className="text-sm">Create your first task to get started.</p>
      </div>
    );
  }

  return (
    <>
      <Card className="py-0 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40">
              <TableHead className="w-8" />
              <TableHead>{translate("resources.tasks.fields.text")}</TableHead>
              <TableHead>{translate("resources.tasks.fields.contact_id")}</TableHead>
              <TableHead>{translate("resources.tasks.fields.type")}</TableHead>
              <TableHead>{translate("resources.tasks.fields.due_date")}</TableHead>
              <TableHead>{translate("resources.tasks.fields.status")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((task) => {
              const taskType = taskTypes.find((t) => t.value === task.type);
              const isDone = !!task.done_date;

              return (
                <TableRow
                  key={task.id}
                  className="cursor-pointer hover:bg-muted/30 transition-colors"
                  onClick={() => setEditTaskId(String(task.id))}
                >
                  {/* Status indicator dot */}
                  <TableCell className="w-8">
                    <span
                      className={cn(
                        "inline-block w-2 h-2 rounded-full",
                        isDone
                          ? "bg-green-500"
                          : new Date(task.due_date) < new Date()
                          ? "bg-red-500"
                          : "bg-amber-400"
                      )}
                    />
                  </TableCell>

                  {/* Description */}
                  <TableCell
                    className={cn(
                      "font-medium max-w-xs truncate",
                      isDone && "line-through text-muted-foreground"
                    )}
                  >
                    {task.text}
                  </TableCell>

                  {/* Contact */}
                  <TableCell>
                    {task.contact_id ? (
                      <ReferenceField
                        source="contact_id"
                        reference="contacts"
                        record={task}
                        link="show"
                        className="text-sm"
                      />
                    ) : (
                      <span className="text-muted-foreground text-sm">—</span>
                    )}
                  </TableCell>

                  {/* Type */}
                  <TableCell>
                    {taskType ? (
                      <Badge variant="secondary" className="text-xs">
                        {taskType.label}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground text-sm">—</span>
                    )}
                  </TableCell>

                  {/* Due Date */}
                  <TableCell className="text-sm">
                    <DateField
                      source="due_date"
                      record={task}
                      showDate
                      className={cn(
                        !isDone &&
                          new Date(task.due_date) < new Date() &&
                          "text-red-500 font-medium"
                      )}
                    />
                  </TableCell>

                  {/* Status Badge */}
                  <TableCell>
                    <Badge
                      variant={isDone ? "default" : "outline"}
                      className={cn(
                        "text-xs",
                        isDone
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 border-0"
                          : "text-muted-foreground"
                      )}
                    >
                      {isDone
                        ? translate("resources.tasks.status.done")
                        : translate("resources.tasks.status.pending")}
                    </Badge>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>

      {/* Edit sheet */}
      {editTaskId && (
        <TaskEditSheet
          taskId={editTaskId}
          open={!!editTaskId}
          onOpenChange={(open) => !open && setEditTaskId(null)}
        />
      )}

      {/* Create sheet */}
      <TaskCreateSheet open={createOpen} onOpenChange={setCreateOpen} />
    </>
  );
};

const TaskListActions = () => (
  <TopToolbar>
    <ExportButton />
    <CreateButton label="resources.tasks.action.new" />
  </TopToolbar>
);

export default TaskList;