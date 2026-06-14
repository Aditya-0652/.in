import { useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  ListTodo,
  Sparkles,
  Sun,
  Moon,
  Menu,
  X,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/lib/theme";

const NAV = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/todos", label: "To-Do List", icon: ListTodo },
  { to: "/prompts", label: "Prompt Maker", icon: Sparkles },
] as const;

function NavItems({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <nav className="flex flex-col gap-1.5">
      {NAV.map(({ to, label, icon: Icon }) => {
        const active = pathname === to;
        return (
          <Link
            key={to}
            to={to}
            onClick={onNavigate}
            className={cn(
              "group flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-medium transition-all",
              active
                ? "bg-primary text-primary-foreground shadow-[var(--shadow-glow)]"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground",
            )}
          >
            <Icon className="h-5 w-5 shrink-0" />
            <span className="truncate">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

function Brand() {
  return (
    <Link to="/" className="flex items-center gap-2.5">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[var(--gradient-primary)] text-primary-foreground shadow-[var(--shadow-glow)]">
        <Zap className="h-5 w-5" />
      </span>
      <span className="min-w-0">
        <span className="block truncate text-base font-bold leading-tight gradient-text">
          Productivity Hub
        </span>
        <span className="block text-xs text-muted-foreground">Tasks &amp; AI prompts</span>
      </span>
    </Link>
  );
}

function ThemeButton() {
  const { theme, toggle } = useTheme();
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Toggle theme"
      className="flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
    >
      {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
      <span>{theme === "dark" ? "Light mode" : "Dark mode"}</span>
    </button>
  );
}

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex min-h-screen w-full">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col gap-6 p-4 lg:flex">
        <div className="glass flex h-full flex-col gap-6 rounded-3xl p-5">
          <Brand />
          <div className="flex-1">
            <NavItems />
          </div>
          <div className="border-t border-border pt-3">
            <ThemeButton />
          </div>
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="glass fixed inset-x-0 top-0 z-40 flex items-center justify-between px-4 py-3 lg:hidden">
        <Brand />
        <button
          type="button"
          aria-label="Open menu"
          onClick={() => setOpen(true)}
          className="grid h-10 w-10 place-items-center rounded-xl bg-secondary text-foreground"
        >
          <Menu className="h-5 w-5" />
        </button>
      </header>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            aria-label="Close menu"
            className="absolute inset-0 bg-background/60 backdrop-blur-sm animate-float-in"
            onClick={() => setOpen(false)}
          />
          <div className="glass-strong absolute left-0 top-0 flex h-full w-72 max-w-[80%] flex-col gap-6 p-5 animate-float-in">
            <div className="flex items-center justify-between">
              <Brand />
              <button
                type="button"
                aria-label="Close menu"
                onClick={() => setOpen(false)}
                className="grid h-9 w-9 place-items-center rounded-lg bg-secondary"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1">
              <NavItems onNavigate={() => setOpen(false)} />
            </div>
            <div className="border-t border-border pt-3">
              <ThemeButton />
            </div>
          </div>
        </div>
      )}

      <main className="min-w-0 flex-1 px-4 pb-12 pt-20 sm:px-6 lg:px-8 lg:pt-6">
        <div className="mx-auto w-full max-w-6xl">{children}</div>
      </main>
    </div>
  );
}
