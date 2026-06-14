import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  Plus,
  Search,
  Trash2,
  Pencil,
  Check,
  X,
  CalendarDays,
  Flag,
  ListTodo,
  CheckCircle2,
  Circle,
} from "lucide-react";
import type { Priority, Task } from "@/lib/types";
import { useLocalStorage } from "@/lib/storage";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/todos")({
  head: () => ({
    meta: [
      { title: "To-Do List — Productivity Hub" },
      {
        name: "description",
        content:
          "Add, edit and prioritize tasks with due dates. Search, filter and track your progress — all saved locally in your browser.",
      },
      { property: "og:title", content: "To-Do List — Productivity Hub" },
      {
        property: "og:description",
        content: "Organize tasks with priorities, due dates and live statistics.",
      },
    ],
  }),
  component: TodosPage,
});

const PRIORITY_META: Record<Priority, { label: string; cls: string; dot: string }> = {
  low: { label: "Low", cls: "text-muted-foreground bg-secondary", dot: "bg-muted-foreground" },
  medium: { label: "Medium", cls: "text-warning-foreground bg-warning/25", dot: "bg-warning" },
  high: { label: "High", cls: "text-destructive-foreground bg-destructive/20", dot: "bg-destructive" },
};

type FilterKey = "all" | "pending" | "completed";

function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function TodosPage() {
  const [tasks, setTasks, hydrated] = useLocalStorage<Task[]>("ph-tasks", []);
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState<Priority>("medium");
  const [dueDate, setDueDate] = useState("");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<FilterKey>("all");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");

  const stats = useMemo(() => {
    const completed = tasks.filter((t) => t.completed).length;
    return { total: tasks.length, completed, pending: tasks.length - completed };
  }, [tasks]);

  const visible = useMemo(() => {
    return tasks
      .filter((t) =>
        filter === "all" ? true : filter === "completed" ? t.completed : !t.completed,
      )
      .filter((t) => t.title.toLowerCase().includes(query.trim().toLowerCase()))
      .sort((a, b) => {
        if (a.completed !== b.completed) return a.completed ? 1 : -1;
        const rank: Record<Priority, number> = { high: 0, medium: 1, low: 2 };
        if (rank[a.priority] !== rank[b.priority]) return rank[a.priority] - rank[b.priority];
        return b.createdAt - a.createdAt;
      });
  }, [tasks, filter, query]);

  function addTask(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Please enter a task title");
      return;
    }
    const task: Task = {
      id: uid(),
      title: title.trim(),
      priority,
      dueDate: dueDate || undefined,
      completed: false,
      createdAt: Date.now(),
    };
    setTasks((prev) => [task, ...prev]);
    setTitle("");
    setDueDate("");
    setPriority("medium");
    toast.success("Task added");
  }

  function toggle(id: string) {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id
          ? { ...t, completed: !t.completed, completedAt: !t.completed ? Date.now() : undefined }
          : t,
      ),
    );
  }

  function remove(id: string) {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    toast("Task deleted");
  }

  function saveEdit(id: string) {
    if (!editTitle.trim()) {
      toast.error("Title can't be empty");
      return;
    }
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, title: editTitle.trim() } : t)));
    setEditingId(null);
    toast.success("Task updated");
  }

  function setTaskPriority(id: string, p: Priority) {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, priority: p } : t)));
  }

  return (
    <div className="space-y-6">
      <header className="animate-float-in">
        <h1 className="text-3xl font-bold tracking-tight">To-Do List</h1>
        <p className="mt-1 text-muted-foreground">Plan, prioritize and finish what matters.</p>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        <StatChip icon={ListTodo} label="Total" value={stats.total} tint="primary" />
        <StatChip icon={CheckCircle2} label="Completed" value={stats.completed} tint="success" />
        <StatChip icon={Circle} label="Pending" value={stats.pending} tint="accent" />
      </div>

      {/* Add form */}
      <form onSubmit={addTask} className="glass animate-float-in space-y-3 rounded-2xl p-4 sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What needs to be done?"
            className="min-w-0 flex-1 rounded-xl border border-input bg-background/60 px-4 py-3 text-sm outline-none ring-ring transition focus:ring-2"
          />
          <button
            type="submit"
            className="flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[var(--gradient-primary)] px-5 py-3 text-sm font-semibold text-primary-foreground transition hover-lift"
          >
            <Plus className="h-4 w-4" /> Add task
          </button>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <label className="flex flex-1 items-center gap-2 rounded-xl border border-input bg-background/60 px-3 py-2.5 text-sm">
            <Flag className="h-4 w-4 text-muted-foreground" />
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as Priority)}
              className="w-full bg-transparent outline-none"
            >
              <option value="low">Low priority</option>
              <option value="medium">Medium priority</option>
              <option value="high">High priority</option>
            </select>
          </label>
          <label className="flex flex-1 items-center gap-2 rounded-xl border border-input bg-background/60 px-3 py-2.5 text-sm">
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full bg-transparent outline-none"
            />
          </label>
        </div>
      </form>

      {/* Search + filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search tasks…"
            className="w-full rounded-xl border border-input bg-background/60 py-2.5 pl-9 pr-3 text-sm outline-none ring-ring focus:ring-2"
          />
        </div>
        <div className="flex gap-1 rounded-xl bg-secondary p-1">
          {(["all", "pending", "completed"] as FilterKey[]).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={cn(
                "flex-1 rounded-lg px-3 py-2 text-sm font-medium capitalize transition sm:flex-none",
                filter === f
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="space-y-2.5">
        {!hydrated ? null : visible.length === 0 ? (
          <div className="glass rounded-2xl p-10 text-center text-muted-foreground">
            <ListTodo className="mx-auto mb-3 h-10 w-10 opacity-50" />
            <p>No tasks here yet. Add your first one above!</p>
          </div>
        ) : (
          visible.map((task) => {
            const overdue =
              !task.completed && task.dueDate && new Date(task.dueDate) < new Date(new Date().toDateString());
            return (
              <div
                key={task.id}
                className="glass group flex items-center gap-3 rounded-2xl p-3.5 transition hover:border-primary/40 sm:p-4"
              >
                <button
                  type="button"
                  aria-label="Toggle complete"
                  onClick={() => toggle(task.id)}
                  className={cn(
                    "grid h-6 w-6 shrink-0 place-items-center rounded-full border-2 transition",
                    task.completed
                      ? "border-success bg-success text-success-foreground"
                      : "border-muted-foreground/50 hover:border-primary",
                  )}
                >
                  {task.completed && <Check className="h-3.5 w-3.5" />}
                </button>

                <div className="min-w-0 flex-1">
                  {editingId === task.id ? (
                    <div className="flex items-center gap-2">
                      <input
                        autoFocus
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && saveEdit(task.id)}
                        className="min-w-0 flex-1 rounded-lg border border-input bg-background/60 px-2 py-1.5 text-sm outline-none ring-ring focus:ring-2"
                      />
                      <button
                        onClick={() => saveEdit(task.id)}
                        className="grid h-8 w-8 place-items-center rounded-lg bg-success text-success-foreground"
                        aria-label="Save"
                      >
                        <Check className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="grid h-8 w-8 place-items-center rounded-lg bg-secondary"
                        aria-label="Cancel"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <p
                        className={cn(
                          "truncate text-sm font-medium",
                          task.completed && "text-muted-foreground line-through",
                        )}
                      >
                        {task.title}
                      </p>
                      <div className="mt-1.5 flex flex-wrap items-center gap-2">
                        <select
                          value={task.priority}
                          onChange={(e) => setTaskPriority(task.id, e.target.value as Priority)}
                          className={cn(
                            "cursor-pointer rounded-full px-2 py-0.5 text-xs font-semibold outline-none",
                            PRIORITY_META[task.priority].cls,
                          )}
                        >
                          <option value="low">Low</option>
                          <option value="medium">Medium</option>
                          <option value="high">High</option>
                        </select>
                        {task.dueDate && (
                          <span
                            className={cn(
                              "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs",
                              overdue
                                ? "bg-destructive/20 text-destructive-foreground"
                                : "bg-secondary text-muted-foreground",
                            )}
                          >
                            <CalendarDays className="h-3 w-3" />
                            {new Date(task.dueDate).toLocaleDateString(undefined, {
                              month: "short",
                              day: "numeric",
                            })}
                            {overdue && " · overdue"}
                          </span>
                        )}
                      </div>
                    </>
                  )}
                </div>

                {editingId !== task.id && (
                  <div className="flex shrink-0 items-center gap-1 opacity-70 transition group-hover:opacity-100">
                    <button
                      type="button"
                      aria-label="Edit"
                      onClick={() => {
                        setEditingId(task.id);
                        setEditTitle(task.title);
                      }}
                      className="grid h-8 w-8 place-items-center rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      aria-label="Delete"
                      onClick={() => remove(task.id)}
                      className="grid h-8 w-8 place-items-center rounded-lg text-muted-foreground hover:bg-destructive/15 hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

function StatChip({
  icon: Icon,
  label,
  value,
  tint,
}: {
  icon: typeof ListTodo;
  label: string;
  value: number;
  tint: "primary" | "success" | "accent";
}) {
  const tintCls = {
    primary: "text-primary",
    success: "text-success",
    accent: "text-accent",
  }[tint];
  return (
    <div className="glass rounded-2xl p-3 text-center sm:p-4">
      <Icon className={cn("mx-auto mb-1 h-5 w-5", tintCls)} />
      <div className="text-2xl font-bold sm:text-3xl">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}
