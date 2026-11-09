export function renderErrorPage(): string {
  return `<!doctype html>
<html lang="cs">
  <head>
    <meta charset="utf-8" />
    <title>Stránku se nepodařilo načíst | Drivio</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>
      body { font: 15px/1.5 system-ui, -apple-system, sans-serif; background: #f7f8fa; color: #1f1e1d; display: grid; place-items: center; min-height: 100vh; margin: 0; padding: 1.5rem; }
      .card { max-width: 28rem; width: 100%; text-align: center; padding: 2rem; }
      h1 { font-size: 1.25rem; margin: 0 0 0.5rem; }
      p { color: #4b5563; margin: 0 0 1.5rem; }
      .actions { display: flex; gap: 0.5rem; justify-content: center; flex-wrap: wrap; }
      a, button { padding: 0.5rem 1rem; border-radius: 0.375rem; font: inherit; cursor: pointer; text-decoration: none; border: 1px solid transparent; }
      .primary { background: #ea7930; color: #1f1e1d; font-weight: 600; }
      .secondary { background: #fff; color: #1f1e1d; border-color: #d1d5db; }
    </style>
  </head>
  <body>
    <div class="card">
      <h1>Stránku se nepodařilo načíst</h1>
      <p>Chyba je na naší straně. Zkuste stránku načíst znovu, nebo se vraťte na úvod.</p>
      <div class="actions">
        <button class="primary" onclick="location.reload()">Načíst znovu</button>
        <a class="secondary" href="/">Na úvod</a>
      </div>
    </div>
  </body>
</html>`;
}
