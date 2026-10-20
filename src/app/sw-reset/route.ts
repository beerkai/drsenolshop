// ═══════════════════════════════════════════════════════════════
// /sw-reset — admin servis çalışanının KAPSAMI DIŞINDA
// Eski çalışan /admin gezinmesini yarıda keser ve aynı pencerede
// unregister işe yaramaz. Bu sayfa kapsam dışıdır; kayıt burada
// silinir, sonra panel yeniden açılır.
// ═══════════════════════════════════════════════════════════════

export const dynamic = 'force-dynamic'

function safeNext(raw: string | null): string {
  if (!raw || !raw.startsWith('/admin') || raw.startsWith('//') || raw.includes('\\')) return '/admin'
  return raw
}

export function GET(request: Request) {
  const next = safeNext(new URL(request.url).searchParams.get('next'))
  const html = `<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Panel açılıyor</title>
  <style>
    body { margin: 0; min-height: 100vh; display: grid; place-items: center; background: #F3F4F1; color: #1A1916; font: 16px/1.45 system-ui, sans-serif; }
    p { margin: 0; padding: 24px; text-align: center; }
  </style>
</head>
<body>
  <p>Panel açılıyor…</p>
  <script>
    (function () {
      var next = ${JSON.stringify(next)};
      function go() { location.replace(next); }
      var jobs = [];
      try {
        if ('serviceWorker' in navigator) {
          jobs.push(navigator.serviceWorker.getRegistrations().then(function (regs) {
            return Promise.all(regs.map(function (reg) { return reg.unregister(); }));
          }));
        }
        if (window.caches) {
          jobs.push(caches.keys().then(function (keys) {
            return Promise.all(keys.filter(function (key) { return key.indexOf('drsenol-admin') === 0; }).map(function (key) { return caches.delete(key); }));
          }));
        }
      } catch (e) {}
      Promise.all(jobs).then(go).catch(go);
      setTimeout(go, 2500);
    })();
  </script>
</body>
</html>`

  return new Response(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  })
}
