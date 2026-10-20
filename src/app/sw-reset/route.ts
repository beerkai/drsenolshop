// ═══════════════════════════════════════════════════════════════
// /sw-reset — admin servis çalışanının KAPSAMI DIŞINDA
// Yalnızca kayıt ve önbellek temizliği; yeni çalışan kurulmaz.
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
  <title>Panel sıfırlanıyor</title>
  <style>
    body { margin: 0; min-height: 100vh; display: grid; place-items: center; background: #F3F4F1; color: #1A1916; font: 16px/1.45 system-ui, sans-serif; }
    p { margin: 0; padding: 24px; text-align: center; max-width: 28rem; }
  </style>
</head>
<body>
  <p>Eski kayıt siliniyor…</p>
  <script>
    (function () {
      var next = ${JSON.stringify(next)};
      function dest() {
        var join = next.indexOf('?') === -1 ? '?' : '&';
        return next + join + '_fresh=' + Date.now();
      }
      function go() { location.replace(dest()); }
      var jobs = [];
      if ('serviceWorker' in navigator) {
        jobs.push(navigator.serviceWorker.getRegistrations().then(function (regs) {
          return Promise.all(regs.map(function (reg) { return reg.unregister(); }));
        }));
      }
      if (window.caches) {
        jobs.push(caches.keys().then(function (keys) {
          return Promise.all(keys.map(function (key) { return caches.delete(key); }));
        }));
      }
      Promise.all(jobs).then(function () { setTimeout(go, 400); }).catch(function () { setTimeout(go, 400); });
      setTimeout(go, 3000);
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
