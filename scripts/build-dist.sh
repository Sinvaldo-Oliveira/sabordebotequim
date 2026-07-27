#!/usr/bin/env bash
# Monta a pasta dist/ pronta para subir na VPS da Hostinger (build standalone + PM2).
set -e

cd "$(dirname "$0")/.."

echo "==> Limpando builds anteriores..."
rm -rf dist .next

echo "==> Rodando build de produção (next build, modo standalone)..."
BUILD_STANDALONE=true npm run build

echo "==> Montando dist/ a partir do output standalone..."
mkdir -p dist
cp -r .next/standalone/. dist/

# output: "standalone" não copia public/ nem .next/static automaticamente —
# preciso copiar na mão (comportamento documentado do Next.js). Este projeto
# não tem pasta public/ (imagens ficam no Supabase Storage), então só copia
# se ela existir.
if [ -d public ]; then
  cp -r public dist/public
fi
mkdir -p dist/.next
cp -r .next/static dist/.next/static

echo "==> dist/ pronta em: $(pwd)/dist"
echo "    Contém: server.js, node_modules (mínimo), .next/, public/, .env"
echo "    Rode com: cd dist && node server.js  (ou via PM2, ver ecosystem.config.js)"
