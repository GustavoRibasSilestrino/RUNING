// Copia os arquivos do site para www/ (a pasta que o Capacitor empacota no app)
const fs = require('fs'), path = require('path');
const root = path.join(__dirname, '..'), out = path.join(root, 'www');
fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(out, { recursive: true });
for (const f of ['index.html', 'style.css', 'script.js', 'hero.jpg', 'logo.png', 'manifest.webmanifest']) {
  fs.copyFileSync(path.join(root, f), path.join(out, f));
}
console.log('www/ atualizado');

