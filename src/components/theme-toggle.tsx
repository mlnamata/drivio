import { Monitor, Moon, Sun, type LucideIcon } from "lucide-react";
import { useTheme, type ThemePref } from "@/lib/theme";
import { cn } from "@/lib/utils";

/** Ikona v hlavičce: ve světlém vzhledu měsíc, v tmavém slunce. Ikony přepíná CSS, takže sedí hned od načtení. */
export function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggle } = useTheme();
  const label = theme === "dark" ? "Přepnout na světlý vzhled" : "Přepnout na tmavý vzhled";
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={label}
      title={label}
      className={cn(
        "inline-flex h-10 w-10 items-center justify-center rounded-full text-foreground/75 transition-colors hover:bg-foreground/5 hover:text-foreground",
        className,
      )}
    >
      <Moon className="h-5 w-5 dark:hidden" />
      <Sun className="hidden h-5 w-5 dark:block" />
    </button>
  );
}

const options: { value: ThemePref; label: string; icon: LucideIcon }[] = [
  { value: "light", label: "Světlý", icon: Sun },
  { value: "dark", label: "Tmavý", icon: Moon },
  { value: "system", label: "Podle systému", icon: Monitor },
];

/** Volba vzhledu včetně návratu k nastavení systému (patička). */
export function ThemeSwitch({ className }: { className?: string }) {
  const { pref, setPref } = useTheme();
  return (
    <div
      role="radiogroup"
      aria-label="Vzhled webu"
      className={cn("inline-flex rounded-lg border border-border bg-background p-0.5", className)}
    >
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          role="radio"
          aria-checked={pref === o.value}
          onClick={() => setPref(o.value)}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-semibold transition-colors",
            pref === o.value
              ? "bg-card text-foreground shadow-sm ring-1 ring-border"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          <o.icon className="h-3.5 w-3.5" /> {o.label}
        </button>
      ))}
    </div>
  );
}
