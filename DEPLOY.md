# Deploy — Sabor de Botequim (VPS Hostinger)

Este projeto é um app **Next.js 15 com App Router**, usando Server Actions, rotas de API e
middleware. Ele **precisa de um processo Node.js rodando** no servidor — não funciona em
hospedagem compartilhada de arquivos estáticos (`public_html`).

**Requisito:** VPS Hostinger (ou qualquer VPS) com Node.js 20+ instalado.

---

## 1. Gerar o pacote de deploy

Na sua máquina, na raiz do projeto:

```bash
npm run build:dist
```

Isso cria a pasta `dist/` (~65 MB) contendo:

- `server.js` — servidor Node autossuficiente
- `node_modules/` — apenas as dependências realmente usadas (build standalone)
- `.next/` — build de produção + assets estáticos
- `.env` — variáveis de ambiente (cópia da sua `.env` local)

> A pasta `dist/` está no `.gitignore` porque contém a `.env` com credenciais reais.
> Ela nunca deve ir para o Git.

## 2. Ajustar a `.env` de produção

Antes de subir, edite `dist/.env` e confira:

| Variável | Valor em produção |
| --- | --- |
| `NEXT_PUBLIC_APP_URL` | O domínio real, ex.: `https://sabordebotequim.com.br` |
| `OTP_MAX_SENDS_PER_WINDOW` | `3` (proteção anti-abuso; valores altos são só para teste) |
| `WHATSAPP_PROVIDER` | `n8n` (ou `meta` / `evolution`) |
| `N8N_WEBHOOK_URL` | URL do webhook de produção do n8n |

As demais chaves (Supabase, salts, chaves de criptografia) devem ser as mesmas do ambiente
já em uso — **se `WHATSAPP_HASH_SALT` mudar, a detecção de votos duplicados é perdida**.

## 3. Enviar para o servidor

```bash
# da sua máquina
scp -r dist ecosystem.config.js usuario@SEU_IP:/var/www/sabordebotequim/
```

Estrutura esperada no servidor:

```
/var/www/sabordebotequim/
├── dist/
│   ├── server.js
│   ├── .env
│   └── ...
└── ecosystem.config.js
```

## 4. Subir a aplicação com PM2

```bash
# no servidor
npm install -g pm2
cd /var/www/sabordebotequim
pm2 start ecosystem.config.js
pm2 save
pm2 startup          # faz o app subir sozinho após reboot
```

Comandos úteis:

```bash
pm2 logs sabor-de-botequim    # ver logs
pm2 restart sabor-de-botequim # reiniciar após novo deploy
pm2 status                    # ver se está rodando
```

O app fica escutando em `localhost:3000` (configurável em `ecosystem.config.js`).

## 5. Configurar o Nginx (proxy reverso + HTTPS)

```nginx
server {
    listen 80;
    server_name sabordebotequim.com.br www.sabordebotequim.com.br;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Depois ative o HTTPS com Certbot:

```bash
sudo certbot --nginx -d sabordebotequim.com.br -d www.sabordebotequim.com.br
```

## 6. Atualizações futuras

```bash
# na sua máquina
npm run build:dist
scp -r dist usuario@SEU_IP:/var/www/sabordebotequim/

# no servidor
pm2 restart sabor-de-botequim
```

---

## Banco de dados (Supabase)

As migrações ficam em `supabase/migrations/`. Para aplicá-las no banco remoto:

```bash
npx supabase db push --db-url "postgresql://postgres.<REF>:<SENHA>@<HOST_POOLER>:5432/postgres" --include-all
```

> Use sempre o **connection pooler** do Supabase (`aws-*.pooler.supabase.com`), não o host
> direto — a conexão direta usa IPv6 e falha em boa parte das redes.

## Contas de demonstração

Os scripts em `scripts/` usam contas de teste cujo e-mail está no código e cuja senha vem da
variável `DEMO_PASSWORD` (nunca versionada). **Antes de ir ao ar, troque ou remova essas
contas demonstrativas do Supabase** — elas têm acesso ao painel administrativo.
