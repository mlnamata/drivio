import { useState } from "react";
import { toast } from "sonner";
import { Slider } from "@/components/ui/slider";
import { CONSENT_TEXT, submitLead } from "@/lib/leads";
import { czk, DEFAULT_RATE, monthlyPayment } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const monthOptions = [24, 36, 48, 60, 72, 84, 96];

export function FinanceCalculator({
  price: initialPrice,
  vehicleId,
  editablePrice,
  className,
}: {
  price: number;
  vehicleId?: string;
  editablePrice?: boolean;
  className?: string;
}) {
  const [price, setPrice] = useState(initialPrice);
  const [down, setDown] = useState(0);
  const [months, setMonths] = useState(72);
  const [step, setStep] = useState<"calc" | "form" | "done">("calc");
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<
    Partial<Record<"name" | "email" | "phone" | "consent", string>>
  >({});
  const principal = Math.max(0, price - down);
  const pay = monthlyPayment(principal, months);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const input = {
      kind: "financing" as const,
      vehicleId,
      name: String(f.get("name") ?? ""),
      email: String(f.get("email") ?? ""),
      phone: String(f.get("phone") ?? ""),
      amount: principal,
      months,
      consent: f.get("consent") === "on",
      marketing: f.get("marketing") === "on",
    };
    const errs: Partial<Record<"name" | "email" | "phone" | "consent", string>> = {};
    if (input.name.trim().length < 2) errs.name = "Vyplňte jméno";
    if (!/^\S+@\S+\.\S+$/.test(input.email)) errs.email = "Neplatný e-mail";
    if (!/^\+?[0-9 ]{9,16}$/.test(input.phone)) errs.phone = "Neplatné telefonní číslo";
    if (!input.consent) errs.consent = "Bez souhlasu nelze žádost odeslat";
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setBusy(true);
    try {
      await submitLead({ data: { ...input, consent: true } });
      setStep("done");
    } catch {
      toast.error("Žádost se nepodařilo odeslat. Zkuste to prosím znovu.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={cn("surface-card p-5", className)}>
      {step === "done" ? (
        <div className="py-6 text-center">
          <p className="text-lg font-semibold">Děkujeme, žádost je odeslána</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Partner vás bude kontaktovat obvykle do 30 minut v pracovní době.
          </p>
        </div>
      ) : (
        <>
          <p className="font-display text-lg font-bold">Kalkulačka splátek</p>
          <div className="mt-4 space-y-5">
            {editablePrice ? (
              <label className="block text-sm">
                <span className="mb-1.5 block text-muted-foreground">Cena vozu</span>
                <input
                  type="number"
                  min={20000}
                  step={1000}
                  value={price}
                  onChange={(e) => {
                    const v = Number(e.target.value) || 0;
                    setPrice(v);
                    setDown((d) => Math.min(d, v));
                  }}
                  className="field"
                />
              </label>
            ) : null}
            <div>
              <div className="mb-2 flex justify-between text-sm">
                <span className="text-muted-foreground">Akontace</span>
                <span className="font-semibold">{czk(down)}</span>
              </div>
              <Slider
                value={[down]}
                min={0}
                max={Math.max(0, Math.round(price * 0.5))}
                step={1000}
                onValueChange={([v]) => setDown(v ?? 0)}
              />
            </div>
            <div>
              <p className="mb-2 text-sm text-muted-foreground">Doba splácení</p>
              <div className="flex flex-wrap gap-1.5">
                {monthOptions.map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMonths(m)}
                    className={cn(
                      "rounded-full border px-3 py-1 text-xs font-semibold",
                      months === m
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border hover:border-primary/40",
                    )}
                  >
                    {m} měs.
                  </button>
                ))}
              </div>
            </div>
            <div className="rounded-2xl bg-accent p-4">
              <p className="text-sm text-accent-foreground/80">Orientační měsíční splátka</p>
              <p className="font-display text-3xl font-extrabold text-accent-foreground">
                {czk(pay)}
              </p>
              <p className="mt-1 text-xs text-accent-foreground/70">
                Úvěr {czk(principal)}, úrok od {(DEFAULT_RATE * 100).toFixed(1).replace(".", ",")} %
                p.a. Nezávazný výpočet, konečnou nabídku určí poskytovatel.
              </p>
            </div>
          </div>

          {step === "calc" ? (
            <button
              type="button"
              onClick={() => setStep("form")}
              className="mt-5 w-full rounded-full bg-primary py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
            >
              Chci nezávaznou nabídku
            </button>
          ) : (
            <form onSubmit={onSubmit} className="mt-5 space-y-3" noValidate>
              {(
                [
                  ["name", "Jméno a příjmení", "text", "name"],
                  ["email", "E-mail", "email", "email"],
                  ["phone", "Telefon", "tel", "tel"],
                ] as const
              ).map(([n, l, t, ac]) => (
                <label key={n} className="block text-sm">
                  <span className="sr-only">{l}</span>
                  <input name={n} type={t} autoComplete={ac} placeholder={l} className="field" />
                  {errors[n] ? (
                    <span className="mt-1 block text-xs text-destructive">{errors[n]}</span>
                  ) : null}
                </label>
              ))}
              <label className="flex gap-2.5 text-xs text-muted-foreground">
                <input
                  type="checkbox"
                  name="consent"
                  className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--primary)]"
                />
                <span>
                  {CONSENT_TEXT}{" "}
                  <a href="/pravni/ochrana-osobnich-udaju" className="text-primary underline">
                    Zásady zpracování
                  </a>
                </span>
              </label>
              {errors.consent ? (
                <span className="block text-xs text-destructive">{errors.consent}</span>
              ) : null}
              <label className="flex gap-2.5 text-xs text-muted-foreground">
                <input
                  type="checkbox"
                  name="marketing"
                  className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--primary)]"
                />
                <span>Chci dostávat tipy na vozy a akční nabídky (nepovinné).</span>
              </label>
              <button
                disabled={busy}
                className="w-full rounded-full bg-primary py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
              >
                {busy ? "Odesílám…" : "Odeslat žádost"}
              </button>
            </form>
          )}
        </>
      )}
    </div>
  );
}
