// ═══════════════════════════════════════════════════════════════
// /sw-reset — admin servis çalışanının KAPSAMI DIŞINDA
// iOS, kontrollü sayfada unregister'ı yok sayar. Buradan yeni
// çalışan kurulur; o çalışan isteği yakalamaz, kaydı kendi siler.
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
  <p>Eski kayıt siliniyor. Panel birazdan açılacak.</p>
  <script>
    (function () {
      var next = ${JSON.stringify(next)};
      var gone = false;
      function dest() {
        var join = next.indexOf('?') === -1 ? '?' : '&';
        return next + join + 'swgone=' + Date.now();
      }
      function go() {
        if (gone) return;
        gone = true;
        location.replace(dest());
      }
      var jobs = [];
      if (window.caches) {
        jobs.push(caches.keys().then(function (keys) {
          return Promise.all(keys.map(function (key) { return caches.delete(key); }));
        }));
      }
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.addEventListener('message', function (event) {
          if (event.data && event.data.type === 'reloaded') go();
        });
        jobs.push(navigator.serviceWorker.getRegistrations().then(function (regs) {
          regs.forEach(function (reg) {
            if (reg.update) reg.update().catch(function () {});
          });
          return navigator.serviceWorker.register('/admin-sw.js', { scope: '/admin', updateViaCache: 'none' });
        }));
      }
      Promise.all(jobs).then(function () { setTimeout(go, 1500); }).catch(function () { setTimeout(go, 1500); });
      setTimeout(go, 5000);
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
