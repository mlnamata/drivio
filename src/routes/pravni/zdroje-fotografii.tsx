import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/legal-page";
import { photoCredits } from "@/lib/demo-photos";

export const Route = createFileRoute("/pravni/zdroje-fotografii")({
  head: () => ({
    meta: [{ title: "Zdroje fotografií | Drivio" }, { name: "robots", content: "noindex" }],
  }),
  component: () => (
    <LegalPage title="Zdroje fotografií" updated="12. 10. 2026">
      <p>
        Ukázkové inzeráty používají fotografie z Wikimedia Commons pod svobodnými licencemi. Snímky
        jsme ořízli a zmenšili. U každé fotografie uvádíme autora, licenci a odkaz na originál.
      </p>
      <ul>
        {photoCredits.map((c) => (
          <li key={c.file}>
            <a href={c.source} target="_blank" rel="noreferrer">
              {c.title}
            </a>{" "}
            – {c.author}, {c.license}
          </li>
        ))}
      </ul>
    </LegalPage>
  ),
});
