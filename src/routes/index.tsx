import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import {
  ListTodo,
  CheckCircle2,
  Circle,
  Flame,
  Sparkles,
  ArrowRight,
  Quote,
  Target,
} from "lucide-react";
import type { Priority, SavedPrompt, Task } from "@/lib/types";
import { useLocalStorage } from "@/lib/storage";
import { useStreak } from "@/lib/streak";
import { quoteOfTheDay } from "@/lib/quotes";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Productivity Hub — Dashboard" },
      {
        name: "description",
        content:
          "Your productivity dashboard: track tasks, completion rate, daily streak and create AI prompts — all in one beautiful glassmorphism workspace.",
      },
      { property: "og:title", content: "Productivity Hub — Dashboard" },
      {
        property: "og:description",
        content: "Track tasks and craft AI prompts from one modern dashboard.",
      },
    ],
  }),
  component: Dashboard,
});

const PRIORITY_COLORS: Record<Priority, string> = {
  high: "var(--chart-5)",
  medium: "var(--chart-4)",
  low: "var(--chart-2)",
};

function Dashboard() {
  const [tasks] = useLocalStorage<Task[]>("ph-tasks", []);
  const [prompts] = useLocalStorage<SavedPrompt[]>("ph-prompts", []);
  const streak = useStreak();
  const quote = quoteOfTheDay();

  const stats = useMemo(() => {
    const completed = tasks.filter((t) => t.completed).length;
    const total = tasks.length;
    const rate = total === 0 ? 0 : Math.round((completed / total) * 100);
    return { total, completed, pending: total - completed, rate };
  }, [tasks]);

  const priorityData = useMemo(() => {
    const pending = tasks.filter((t) => !t.completed);
    return (["high", "medium", "low"] as Priority[])
      .map((p) => ({
        name: p[0].toUpperCase() + p.slice(1),
        value: pending.filter((t) => t.priority === p).length,
        color: PRIORITY_COLORS[p],
      }))
      .filter((d) => d.value > 0);
  }, [tasks]);

  const weekData = useMemo(() => {
    const days = [...Array(7)].map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      const key = d.toDateString();
      const count = tasks.filter(
        (t) => t.completed && t.completedAt && new Date(t.completedAt).toDateString() === key,
      ).length;
      return { day: d.toLocaleDateString(undefined, { weekday: "short" }), count };
    });
    return days;
  }, [tasks]);

  return (
    <div className="space-y-6">
      {/* Hero */}
      <section className="glass-strong relative overflow-hidden rounded-3xl p-6 animate-float-in sm:p-8">
        <div className="relative z-10 max-w-xl">
          <p className="text-sm font-medium text-primary">Welcome back 👋</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">
            Your <span className="gradient-text">Productivity Hub</span>
          </h1>
          <p className="mt-2 text-muted-foreground">
            Manage your tasks and craft powerful AI prompts — all in one place.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              to="/todos"
              className="flex items-center gap-2 rounded-xl bg-[var(--gradient-primary)] px-4 py-2.5 text-sm font-semibold text-primary-foreground transition hover-lift"
            >
              <ListTodo className="h-4 w-4" /> Open tasks
            </Link>
            <Link
              to="/prompts"
              className="flex items-center gap-2 rounded-xl bg-secondary px-4 py-2.5 text-sm font-semibold transition hover:bg-secondary/70"
            >
              <Sparkles className="h-4 w-4" /> Make a prompt
            </Link>
          </div>
        </div>
        <div className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-[var(--gradient-primary)] opacity-30 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-12 right-16 h-40 w-40 rounded-full bg-[var(--gradient-accent)] opacity-30 blur-3xl" />
      </section>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatCard icon={ListTodo} label="Total tasks" value={stats.total} tint="primary" />
        <StatCard icon={CheckCircle2} label="Completed" value={stats.completed} tint="success" />
        <StatCard icon={Circle} label="Pending" value={stats.pending} tint="accent" />
        <StatCard icon={Flame} label="Day streak" value={streak} tint="warning" suffix="🔥" />
      </div>

      {/* Charts + quote */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Completion ring */}
        <div className="glass rounded-2xl p-5">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
            <Target className="h-4 w-4 text-primary" /> Completion rate
          </h3>
          <div className="relative mx-auto mt-2 h-44 w-44">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { name: "done", value: stats.completed },
                    { name: "left", value: Math.max(stats.pending, stats.total === 0 ? 1 : 0) },
                  ]}
                  dataKey="value"
                  innerRadius={58}
                  outerRadius={75}
                  startAngle={90}
                  endAngle={-270}
                  stroke="none"
                >
                  <Cell fill="var(--chart-1)" />
                  <Cell fill="var(--muted)" />
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 grid place-items-center">
              <div className="text-center">
                <div className="text-3xl font-bold">{stats.rate}%</div>
                <div className="text-xs text-muted-foreground">done</div>
              </div>
            </div>
          </div>
        </div>

        {/* Weekly bar */}
        <div className="glass rounded-2xl p-5 lg:col-span-2">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
            <CheckCircle2 className="h-4 w-4 text-success" /> Tasks completed this week
          </h3>
          <div className="mt-3 h-44">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weekData} margin={{ top: 8, right: 4, left: -24, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis
                  dataKey="day"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                />
                <Tooltip
                  cursor={{ fill: "var(--muted)", opacity: 0.4 }}
                  contentStyle={{
                    background: "var(--popover)",
                    border: "1px solid var(--border)",
                    borderRadius: 12,
                    color: "var(--popover-foreground)",
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]} fill="var(--chart-1)" maxBarSize={36} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Quote */}
        <div className="glass relative overflow-hidden rounded-2xl p-6 lg:col-span-2">
          <Quote className="h-7 w-7 text-primary/60" />
          <p className="mt-2 text-lg font-medium leading-relaxed">“{quote.text}”</p>
          <p className="mt-2 text-sm text-muted-foreground">— {quote.author}</p>
        </div>

        {/* Pending priorities */}
        <div className="glass rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-muted-foreground">Pending by priority</h3>
          {priorityData.length === 0 ? (
            <p className="mt-6 text-center text-sm text-muted-foreground">
              No pending tasks. Great job! 🎉
            </p>
          ) : (
            <div className="mt-2 flex items-center gap-3">
              <div className="h-28 w-28 shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={priorityData} dataKey="value" innerRadius={32} outerRadius={52} stroke="none">
                      {priorityData.map((d) => (
                        <Cell key={d.name} fill={d.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <ul className="space-y-1.5 text-sm">
                {priorityData.map((d) => (
                  <li key={d.name} className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: d.color }} />
                    <span className="text-muted-foreground">{d.name}</span>
                    <span className="font-semibold">{d.value}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Quick links */}
      <div className="grid gap-4 sm:grid-cols-2">
        <QuickLink to="/todos" icon={ListTodo} title="To-Do List" desc={`${stats.pending} pending tasks`} />
        <QuickLink
          to="/prompts"
          icon={Sparkles}
          title="AI Prompt Maker"
          desc={`${prompts.length} saved prompts`}
        />
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  tint,
  suffix,
}: {
  icon: typeof ListTodo;
  label: string;
  value: number;
  tint: "primary" | "success" | "accent" | "warning";
  suffix?: string;
}) {
  const tintCls = {
    primary: "text-primary bg-primary/15",
    success: "text-success bg-success/15",
    accent: "text-accent bg-accent/15",
    warning: "text-warning bg-warning/15",
  }[tint];
  return (
    <div className="glass rounded-2xl p-4 hover-lift">
      <span className={cn("grid h-10 w-10 place-items-center rounded-xl", tintCls)}>
        <Icon className="h-5 w-5" />
      </span>
      <div className="mt-3 text-3xl font-bold">
        {value}
        {suffix && value > 0 && <span className="ml-1 text-xl">{suffix}</span>}
      </div>
      <div className="text-sm text-muted-foreground">{label}</div>
    </div>
  );
}

function QuickLink({
  to,
  icon: Icon,
  title,
  desc,
}: {
  to: string;
  icon: typeof ListTodo;
  title: string;
  desc: string;
}) {
  return (
    <Link to={to} className="glass group flex items-center gap-4 rounded-2xl p-5 transition hover-lift">
      <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-[var(--gradient-primary)] text-primary-foreground">
        <Icon className="h-6 w-6" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="font-semibold">{title}</div>
        <div className="text-sm text-muted-foreground">{desc}</div>
      </div>
      <ArrowRight className="h-5 w-5 text-muted-foreground transition group-hover:translate-x-1 group-hover:text-primary" />
    </Link>
  );
}
