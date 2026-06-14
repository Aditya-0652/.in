import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import {
  Sparkles,
  Copy,
  Save,
  Download,
  Trash2,
  Wand2,
  History,
  PenLine,
  Code2,
  Megaphone,
  Briefcase,
  GraduationCap,
  Image as ImageIcon,
  Share2,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { PromptCategory, SavedPrompt } from "@/lib/types";
import { CATEGORIES, generatePrompt } from "@/lib/prompts";
import { useLocalStorage } from "@/lib/storage";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/prompts")({
  head: () => ({
    meta: [
      { title: "AI Prompt Maker — Productivity Hub" },
      {
        name: "description",
        content:
          "Generate professional prompts for ChatGPT, Gemini, Claude and Midjourney. Pick a category, enter your details and copy, save or export ready-to-use prompts.",
      },
      { property: "og:title", content: "AI Prompt Maker — Productivity Hub" },
      {
        property: "og:description",
        content: "Build professional AI prompts for any tool in seconds.",
      },
    ],
  }),
  component: PromptsPage,
});

const ICONS: Record<string, LucideIcon> = {
  PenLine,
  Code2,
  Megaphone,
  Briefcase,
  GraduationCap,
  Image: ImageIcon,
  Share2,
};

function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function PromptsPage() {
  const [history, setHistory] = useLocalStorage<SavedPrompt[]>("ph-prompts", []);
  const [category, setCategory] = useState<PromptCategory>("content");
  const [topic, setTopic] = useState("");
  const [goal, setGoal] = useState("");
  const [audience, setAudience] = useState("");
  const [style, setStyle] = useState("");
  const [result, setResult] = useState("");

  function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    if (!topic.trim()) {
      toast.error("Please enter a topic");
      return;
    }
    const text = generatePrompt({ category, topic, goal, audience, style });
    setResult(text);
    toast.success("Prompt generated");
  }

  async function copy(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Copied to clipboard");
    } catch {
      toast.error("Couldn't copy");
    }
  }

  function save() {
    if (!result) return;
    const item: SavedPrompt = {
      id: uid(),
      category,
      topic: topic.trim(),
      goal: goal.trim(),
      audience: audience.trim(),
      style: style.trim(),
      text: result,
      createdAt: Date.now(),
    };
    setHistory((prev) => [item, ...prev].slice(0, 100));
    toast.success("Prompt saved to history");
  }

  function exportTxt(text: string, name = "prompt") {
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${name}-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Exported as TXT");
  }

  function exportAll() {
    if (history.length === 0) {
      toast.error("No saved prompts to export");
      return;
    }
    const content = history
      .map(
        (p, i) =>
          `# Prompt ${i + 1} — ${CATEGORIES.find((c) => c.id === p.category)?.label}\nTopic: ${p.topic}\nSaved: ${new Date(p.createdAt).toLocaleString()}\n\n${p.text}\n\n${"=".repeat(60)}\n`,
      )
      .join("\n");
    exportTxt(content, "all-prompts");
  }

  function removeSaved(id: string) {
    setHistory((prev) => prev.filter((p) => p.id !== id));
    toast("Prompt removed");
  }

  return (
    <div className="space-y-6">
      <header className="animate-float-in">
        <h1 className="text-3xl font-bold tracking-tight">AI Prompt Maker</h1>
        <p className="mt-1 text-muted-foreground">
          Craft professional prompts for ChatGPT, Gemini, Claude &amp; Midjourney.
        </p>
      </header>

      {/* Category picker */}
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 lg:grid-cols-7">
        {CATEGORIES.map((c) => {
          const Icon = ICONS[c.icon] ?? Sparkles;
          const active = category === c.id;
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => setCategory(c.id)}
              className={cn(
                "glass flex flex-col items-center gap-1.5 rounded-2xl p-3 text-center transition hover-lift",
                active && "border-primary bg-primary/10 ring-1 ring-primary",
              )}
            >
              <Icon className={cn("h-5 w-5", active ? "text-primary" : "text-muted-foreground")} />
              <span className="text-xs font-medium leading-tight">{c.label}</span>
            </button>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Form */}
        <form onSubmit={handleGenerate} className="glass space-y-4 rounded-2xl p-5">
          <Field label="Topic" required value={topic} onChange={setTopic} placeholder="e.g. Sustainable fashion" />
          <Field label="Goal" value={goal} onChange={setGoal} placeholder="What should the output achieve?" />
          <Field label="Audience" value={audience} onChange={setAudience} placeholder="Who is it for?" />
          <Field label="Style / Tone" value={style} onChange={setStyle} placeholder="e.g. Friendly, persuasive, formal" />
          <button
            type="submit"
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--gradient-primary)] px-5 py-3 text-sm font-semibold text-primary-foreground transition hover-lift"
          >
            <Wand2 className="h-4 w-4" /> Generate prompt
          </button>
        </form>

        {/* Result */}
        <div className="glass flex flex-col rounded-2xl p-5">
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-muted-foreground">
            <Sparkles className="h-4 w-4 text-primary" /> Generated prompt
          </div>
          <div className="min-h-[200px] flex-1 whitespace-pre-wrap rounded-xl border border-border bg-background/50 p-4 text-sm leading-relaxed">
            {result || (
              <span className="text-muted-foreground">
                Fill in the details and hit “Generate prompt” to see your professional AI prompt here.
              </span>
            )}
          </div>
          {result && (
            <div className="mt-3 flex flex-wrap gap-2">
              <ActionBtn icon={Copy} label="Copy" onClick={() => copy(result)} />
              <ActionBtn icon={Save} label="Save" onClick={save} />
              <ActionBtn icon={Download} label="Export TXT" onClick={() => exportTxt(result, "prompt")} />
            </div>
          )}
        </div>
      </div>

      {/* History */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-lg font-bold">
            <History className="h-5 w-5 text-primary" /> Prompt History
          </h2>
          {history.length > 0 && (
            <button
              onClick={exportAll}
              className="flex items-center gap-1.5 rounded-lg bg-secondary px-3 py-2 text-xs font-medium transition hover:bg-secondary/70"
            >
              <Download className="h-3.5 w-3.5" /> Export all
            </button>
          )}
        </div>

        {history.length === 0 ? (
          <div className="glass rounded-2xl p-8 text-center text-muted-foreground">
            <History className="mx-auto mb-3 h-9 w-9 opacity-50" />
            <p>Your saved prompts will appear here.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {history.map((p) => (
              <div key={p.id} className="glass rounded-2xl p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-primary/15 px-2 py-0.5 text-xs font-semibold text-primary">
                        {CATEGORIES.find((c) => c.id === p.category)?.label}
                      </span>
                      <span className="truncate text-sm font-medium">{p.topic}</span>
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {new Date(p.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <IconBtn icon={Copy} label="Copy" onClick={() => copy(p.text)} />
                    <IconBtn icon={Download} label="Export" onClick={() => exportTxt(p.text, p.topic || "prompt")} />
                    <IconBtn icon={Trash2} label="Delete" danger onClick={() => removeSaved(p.id)} />
                  </div>
                </div>
                <p className="mt-3 line-clamp-3 whitespace-pre-wrap text-sm text-muted-foreground">
                  {p.text}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium">
        {label}
        {required && <span className="text-primary"> *</span>}
      </span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-input bg-background/60 px-4 py-2.5 text-sm outline-none ring-ring transition focus:ring-2"
      />
    </label>
  );
}

function ActionBtn({
  icon: Icon,
  label,
  onClick,
}: {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-secondary px-3 py-2.5 text-sm font-medium transition hover:bg-secondary/70"
    >
      <Icon className="h-4 w-4" /> {label}
    </button>
  );
}

function IconBtn({
  icon: Icon,
  label,
  onClick,
  danger,
}: {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={cn(
        "grid h-8 w-8 place-items-center rounded-lg text-muted-foreground transition",
        danger ? "hover:bg-destructive/15 hover:text-destructive" : "hover:bg-secondary hover:text-foreground",
      )}
    >
      <Icon className="h-4 w-4" />
    </button>
  );
}
