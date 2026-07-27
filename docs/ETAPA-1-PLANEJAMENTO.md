# Etapa 1 — Planejamento e Arquitetura

## Sistema SaaS de Votação Online — Festival Sabor de Botequim

> Documento de arquitetura produzido a partir do [prd.md](../prd.md). Serve como referência para todas as etapas de desenvolvimento.

---

## 1. Resumo do entendimento do projeto

Plataforma web para o **Festival Gastronômico e Cultural de Ribeirão das Neves — Sabor de Botequim**, com três frentes:

1. **Público (visitante)** — landing page do festival, catálogo de restaurantes com busca/filtros, página pública individual de cada restaurante (`/restaurantes/[slug]`) e votação via modal com nome + CPF, sem criação de conta.
2. **Restaurante** — dashboard privada com edição do próprio perfil (com fluxo de aprovação opcional), métricas de visitas/cliques/votos e materiais de divulgação. Isolamento total entre restaurantes.
3. **Administração** — gestão completa: conteúdo da landing page, restaurantes, categorias, regras e período de votação, moderação de votos (estados: válido/em análise/suspeito/invalidado/cancelado), relatórios, patrocinadores, usuários/permissões e logs de auditoria.

Requisitos transversais: segurança antifraude (CPF validado + hash único, rate limiting, CAPTCHA configurável, risk score), LGPD (CPF nunca em texto puro, mascaramento, consentimento versionado, retenção/anonimização), analytics interno de eventos, responsividade, acessibilidade, SEO e deploy na Hostinger (VPS) com Supabase como backend. Arquitetura **multi-festival** desde o início (tabela `festivals` na raiz do modelo).

---

## 2. Arquitetura proposta

```
┌────────────────────────────────────────────────────────────┐
│                    HOSTINGER (VPS)                         │
│  Next.js 15 (App Router, standalone) atrás de Nginx + SSL  │
│                                                            │
│  ┌──────────────┐  ┌───────────────┐  ┌────────────────┐   │
│  │ Rotas        │  │ Server        │  │ Middleware      │  │
│  │ públicas SSR │  │ Actions       │  │ (auth + roles)  │  │
│  │ + ISR        │  │ (mutações)    │  │                 │  │
│  └──────┬───────┘  └──────┬────────┘  └────────┬───────┘   │
└─────────┼─────────────────┼────────────────────┼───────────┘
          │ anon key (RLS)  │ service role       │ session
          ▼                 ▼ (só no servidor)   ▼
┌────────────────────────────────────────────────────────────┐
│                        SUPABASE                            │
│  PostgreSQL + RLS │ Auth │ Storage │ Funções SQL (RPC)     │
│  - register_vote() SECURITY DEFINER (única via de voto)    │
│  - métricas agregadas para dashboards                      │
└────────────────────────────────────────────────────────────┘
```

Decisões-chave:

- **Server Components por padrão**; Client Components apenas onde há interatividade (modal de votação, formulários, gráficos, filtros).
- **Server Actions** para todas as mutações autenticadas (admin e restaurante). **API Routes** apenas para: registro de voto público (`POST /api/votos` — precisa de rate limiting por IP e verificação de CAPTCHA), ingestão de eventos de analytics (`POST /api/eventos`) e exportações CSV.
- **Voto nunca é INSERT direto do cliente.** O endpoint chama a função SQL `register_vote()` (SECURITY DEFINER), que revalida tudo no banco: período ativo, restaurante ativo, categoria ativa, regra de duplicidade via índice único sobre `voter_cpf_hash`.
- **Três clientes Supabase**: browser (anon, apenas leitura pública), server (sessão do usuário via cookies, respeitando RLS) e admin (service role, usado exclusivamente dentro de Server Actions/API Routes com verificação prévia de permissão).
- **Middleware** protege `/admin/*` e `/painel-restaurante/*` verificando sessão + role no JWT (custom claim), com redirecionamento para o login correto.
- **Cache**: páginas públicas com ISR (`revalidate` curto, ex. 60s) + `revalidateTag` acionado pelo admin ao publicar alterações; dashboards sempre dinâmicas.
- **Tema**: tokens de cor como CSS variables (`--color-primary` etc.) definidos no Tailwind config e sobrescritos em runtime a partir de `system_settings`, permitindo o admin alterar a identidade visual.

Stack: Next.js 15 (App Router) · TypeScript strict · Tailwind CSS · Supabase (PostgreSQL, Auth, Storage) · React Hook Form + Zod · Recharts · Lucide Icons · Cloudflare Turnstile (CAPTCHA, configurável).

---

## 3. Estrutura de pastas

```
sabor-de-botequim/
├── docs/                          # Documentação (este arquivo, guia de deploy)
├── public/
├── supabase/
│   ├── migrations/                # Migrations SQL versionadas
│   └── seed.sql                   # Dados demonstrativos
├── src/
│   ├── app/
│   │   ├── (public)/              # Layout público (header/footer do festival)
│   │   │   ├── page.tsx           # Landing page
│   │   │   ├── restaurantes/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [slug]/page.tsx
│   │   │   ├── como-votar/ · regulamento/ · politica-de-privacidade/
│   │   │   └── termos-de-uso/ · contato/
│   │   ├── admin/
│   │   │   ├── login/
│   │   │   ├── (protected)/       # Layout com sidebar + guard
│   │   │   │   ├── page.tsx       # Visão geral
│   │   │   │   ├── landing-page/ · restaurantes/ · categorias/
│   │   │   │   ├── votacao/ · votos/ · relatorios/
│   │   │   │   └── patrocinadores/ · usuarios/ · configuracoes/ · logs/
│   │   ├── painel-restaurante/
│   │   │   ├── login/
│   │   │   └── (protected)/
│   │   │       ├── page.tsx       # Visão geral
│   │   │       ├── perfil/ · prato/ · galeria/
│   │   │       └── relatorios/ · divulgacao/ · configuracoes/
│   │   └── api/
│   │       ├── votos/route.ts     # POST voto (rate limit + captcha + RPC)
│   │       ├── eventos/route.ts   # POST analytics
│   │       └── exportacoes/       # CSV/Excel (admin)
│   ├── components/
│   │   ├── ui/                    # Botões, inputs, modal, card, table, skeleton…
│   │   ├── landing/ · restaurante/ · votacao/
│   │   ├── admin/ · painel/
│   │   └── charts/
│   ├── lib/
│   │   ├── supabase/              # client.ts, server.ts, admin.ts, middleware.ts
│   │   ├── validators/            # Schemas Zod (cpf.ts, voto.ts, restaurante.ts…)
│   │   ├── security/              # rate-limit.ts, captcha.ts, hash.ts, risk-score.ts
│   │   ├── analytics/             # track.ts (cliente) + tipos de eventos
│   │   └── utils/                 # slug, máscaras, datas, formatadores
│   ├── actions/                   # Server Actions por domínio
│   ├── types/                     # database.types.ts (gerado) + tipos de domínio
│   └── middleware.ts
├── .env.example
└── ecosystem.config.js            # PM2 (deploy VPS)
```

---

## 4. Diagrama textual do banco de dados

```
festivals 1──N restaurants 1──N dishes
    │              │  1──N restaurant_gallery
    │              │  1──N restaurant_change_requests
    │              └──N votes ──1 voting_categories
    │ 1──N voting_categories
    │ 1──N landing_sections · sponsors · system_settings · analytics_events
profiles (extensão de auth.users; role: superadmin|admin|moderator|analyst|restaurant)
    └── restaurants.owner_user_id → profiles.id
audit_logs (usuário, ação, entidade, old/new values)
```

Tabelas conforme §14 do PRD, com os seguintes reforços:

- **`votes`** — CPF em três formas: `voter_cpf_hash` (SHA-256 + salt secreto do servidor, usado nos índices únicos de duplicidade), `voter_cpf_encrypted` (pgcrypto/pgp_sym_encrypt, acesso só via função restrita a superadmin) e `voter_cpf_last_digits` (2 dígitos para exibir `***.***.***-12`). Campos de risco: `risk_score`, `risk_reasons`, `ip_hash`, `user_agent`. Estados: `valid | under_review | suspicious | invalidated | cancelled`.
- **Índices únicos parciais** (aplicam a regra de duplicidade no banco, criados/trocados conforme a regra ativa):
  - Regra 1: `UNIQUE (festival_id, voter_cpf_hash) WHERE status IN ('valid','under_review')`
  - Regra 2: `UNIQUE (festival_id, category_id, voter_cpf_hash) …`
  - Regra 4: `UNIQUE (festival_id, restaurant_id, voter_cpf_hash) …`
  - Regra 3 (por período): validação dentro de `register_vote()` com janela configurável.
- **Índices de consulta**: `restaurants(festival_id, status)`, `restaurants(slug)`, `votes(restaurant_id, status, created_at)`, `analytics_events(festival_id, event_name, created_at)`, `analytics_events(restaurant_id, created_at)`.
- **Soft delete** em `restaurants` (`deleted_at`); votos nunca são apagados, apenas mudam de status com trilha em `audit_logs`.
- **Funções SQL (RPC)**: `register_vote()`, `get_restaurant_metrics(restaurant_id)` (agregados sem dados pessoais), `get_admin_dashboard_stats()`, `generate_protocol()`, `anonymize_festival_votes(festival_id)` (pós-festival, LGPD).

---

## 5. Fluxo completo de votação

```
Visitante clica "Votar" (card, perfil ou header)
  → evento vote_button_click → abre modal (vote_modal_open)
  → preenche nome + CPF (máscara e validação de dígitos no cliente — só UX)
  → aceita regulamento + privacidade → resolve CAPTCHA (se ativo)
  → POST /api/votos
       1. Rate limit por ip_hash (ex.: 5 tentativas/10min) → 429 se exceder
       2. Verifica token do CAPTCHA no servidor
       3. Zod: nome, CPF (dígitos verificadores), consentimentos, IDs
       4. Normaliza CPF → calcula cpf_hash (salt do servidor)
       5. Chama RPC register_vote(...)
            a. Votação ativa? (festival + categoria + janela de tempo)
            b. Restaurante ativo e pertencente ao festival?
            c. Duplicidade: INSERT protegido pelos índices únicos
               → violação = "CPF já votou" (erro de negócio, não 500)
            d. Calcula risk_score (repetição de IP, velocidade, user agent)
               → score alto grava como under_review, não bloqueia silenciosamente
            e. Gera protocolo (ex.: SBQ-2026-XXXXXX) e grava consentimentos
       6. Evento vote_completed
  → Modal de sucesso: restaurante, data/hora, protocolo, botão compartilhar
```

Erros de negócio retornam mensagens claras (§22 do PRD): CPF inválido, CPF já utilizado, votação encerrada/não iniciada, restaurante indisponível, limite de tentativas. Nunca detalhes técnicos.

---

## 6. Perfis e permissões

| Capacidade | Visitante | Restaurante | Analyst | Moderator | Admin | Superadmin |
|---|---|---|---|---|---|---|
| Ver conteúdo público | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Votar | ✅ | — | — | — | — | — |
| Editar o próprio perfil/prato/galeria | — | ✅ | — | — | ✅ | ✅ |
| Ver métricas próprias (agregadas) | — | ✅ | — | — | ✅ | ✅ |
| Ver relatórios gerais | — | — | ✅ | ✅ | ✅ | ✅ |
| Moderar votos (status) | — | — | — | ✅ | ✅ | ✅ |
| Gerenciar restaurantes/categorias/landing | — | — | — | — | ✅ | ✅ |
| Configurar votação (abrir/encerrar/regras) | — | — | — | — | ✅ | ✅ |
| Gerenciar usuários e permissões | — | — | — | — | — | ✅ |
| Acessar CPF completo (função auditada) | — | — | — | — | — | ✅ |
| Ver logs de auditoria | — | — | — | — | ✅ | ✅ |

Implementação: `role` em `profiles`, replicado como custom claim no JWT (hook de auth) para o middleware; RLS usa função `current_user_role()`. Restaurante vinculado por `restaurants.owner_user_id` — toda policy do painel filtra por esse vínculo.

RLS essencial:
- `restaurants`/`dishes`/`landing_sections`/`sponsors`: SELECT público apenas com `status = 'active'` e festival ativo; UPDATE pelo dono (campos permitidos) ou admin.
- `votes`: **nenhuma** policy de SELECT/INSERT/UPDATE para anon e restaurante; INSERT só via `register_vote()` (SECURITY DEFINER); SELECT para moderator+ (sempre com CPF mascarado na view usada pela UI).
- `analytics_events`: INSERT via API route (service role); SELECT agregado por RPC.
- `audit_logs`: INSERT via trigger/função; SELECT admin+; sem UPDATE/DELETE para ninguém.

---

## 7. Proteção de dados pessoais (LGPD)

- CPF nunca em texto puro: hash com salt secreto (duplicidade) + criptografia simétrica pgcrypto (acesso administrativo excepcional, via RPC que registra em `audit_logs` quem acessou e por quê) + últimos 2 dígitos (mascaramento `***.***.***-12`).
- IP nunca em texto puro: apenas `ip_hash` (para rate limiting e correlação de fraude).
- Consentimento versionado: `consent_privacy`, `consent_regulation`, `terms_version`, data/hora — gravados no próprio voto.
- Restaurantes veem somente agregados (contagens, gráficos); nenhuma rota do painel retorna nome, CPF ou IP de votantes.
- Views para a UI admin já mascaradas; CPF completo só por RPC restrita a superadmin.
- Retenção configurável em `system_settings` + função `anonymize_festival_votes()` que apaga nome e CPF criptografado após o festival, preservando contagens.
- Páginas de Política de Privacidade e Termos de Uso com versão; exportações administrativas sempre com CPF mascarado.

## 8. Estratégia contra votos duplicados e fraude

Camadas (nenhuma decisão crítica no navegador):

1. **Banco (fonte da verdade)**: índices únicos parciais por regra ativa — corrida/duplicidade é impossível mesmo com requisições concorrentes.
2. **RPC `register_vote()`**: revalida período, status e regra; trata violação de unicidade como erro de negócio.
3. **API**: rate limit por `ip_hash` e por sessão; verificação de CAPTCHA (Turnstile) quando ativado; honeypot no formulário.
4. **Risk score**: pontos por IP repetido em janela curta, cadência anormal, user agent suspeito → voto entra como `under_review` para moderação (IP compartilhado não bloqueia indevidamente — atende §9 do PRD).
5. **Moderação**: fila de votos suspeitos no admin; invalidação lógica com trilha de auditoria; apenas `valid` entra na apuração.

## 9. Estratégia de hospedagem (Hostinger)

Next.js com Server Actions/API Routes **não roda em hospedagem compartilhada** → alvo: **VPS Hostinger** (KVM 1/2 é suficiente).

- Build `output: 'standalone'`, processo gerenciado por **PM2** (`ecosystem.config.js`), **Nginx** como reverse proxy (80/443 → 3000) com **SSL Let's Encrypt (certbot)**.
- Supabase permanece como serviço externo (nada de banco na VPS); configurar Site URL/Redirect URLs do Supabase Auth para o domínio final.
- `.env` só na VPS (nunca no repositório); deploy via git pull + build (script `deploy.sh`).
- Guia completo em `docs/DEPLOY.md` (Etapa 11): provisionamento, Node LTS, domínio, SSL, variáveis, primeiro admin, backup (Supabase: PITR/backup diário) e atualizações.

## 10. Cronograma técnico

| Etapa | Escopo | Estimativa |
|---|---|---|
| 1 | Planejamento e arquitetura (este documento) | ✅ |
| 2 | Fundação: Next.js + TS + Tailwind + tema + clientes Supabase + auth + middleware + UI base | 1 sessão |
| 3 | Banco: migrations, índices, funções, RLS, seed demonstrativo | 1–2 sessões |
| 4 | Landing page completa (seções configuráveis) | 1–2 sessões |
| 5 | Página pública do restaurante | 1 sessão |
| 6 | Sistema de votação (modal, API, RPC, antifraude) | 1–2 sessões |
| 7 | Dashboard administrativa (módulos em sub-etapas) | 2–3 sessões |
| 8 | Dashboard do restaurante | 1–2 sessões |
| 9 | Analytics e relatórios | 1 sessão |
| 10 | Testes (unitários de CPF/regras, permissões/RLS, E2E do fluxo de voto) | 1 sessão |
| 11 | Deploy: docs, scripts, checklist de lançamento | 1 sessão |

Cada etapa termina com: resumo do que foi criado, arquivos alterados, migrations executadas, como testar e pendências (§24 do PRD).

## 11. Riscos e recomendações

| Risco | Mitigação |
|---|---|
| Hospedagem compartilhada não suportar Next.js | Assumir VPS desde já (decisão da §9 acima) |
| Pico de votos (fim da votação) | Índices únicos suportam concorrência; rate limit; ISR nas páginas públicas |
| IP compartilhado (mesma rede votando legitimamente) | Nunca bloquear só por IP; risk score + moderação manual |
| Vazamento de CPF | Hash+criptografia+mascaramento; RLS negando tudo em `votes`; testes específicos (§23) |
| Regra de votação trocada com votos já registrados | Troca de regra bloqueada com votação ativa; exige votação pausada + confirmação |
| Chave salt/criptografia perdida | Documentar no guia de deploy; sem a chave o CPF criptografado é irrecuperável (backup seguro) |
| Admin editar landing e quebrar página | Rascunho vs. publicado + pré-visualização antes de publicar |
| Supabase free tier limites (storage/egress) | Monitorar; plano Pro recomendado para o período do evento |

Recomendações: usar Cloudflare Turnstile (gratuito, sem fricção) como CAPTCHA; ativar CAPTCHA somente se houver sinais de abuso; congelar migrations 1 semana antes do evento; teste de carga simples no endpoint de voto antes do lançamento.

## 12. Variáveis de ambiente

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=            # URL do projeto
NEXT_PUBLIC_SUPABASE_ANON_KEY=       # chave pública (RLS aplica)
SUPABASE_SERVICE_ROLE_KEY=           # somente servidor — NUNCA exposta

# Segurança
CPF_HASH_SALT=                       # salt secreto p/ hash de CPF (aleatório, 32+ chars)
CPF_ENCRYPTION_KEY=                  # chave pgcrypto p/ CPF criptografado
IP_HASH_SALT=                        # salt p/ anonimização de IP
RATE_LIMIT_MAX_ATTEMPTS=5            # tentativas de voto por janela
RATE_LIMIT_WINDOW_MINUTES=10

# CAPTCHA (Cloudflare Turnstile)
NEXT_PUBLIC_TURNSTILE_SITE_KEY=
TURNSTILE_SECRET_KEY=

# Aplicação
NEXT_PUBLIC_APP_URL=                 # https://dominio-do-festival.com.br
NODE_ENV=production
```

---

**Próximo passo:** Etapa 2 — Fundação do projeto (scaffold Next.js, Tailwind com tema em CSS variables, clientes Supabase, autenticação, middleware e componentes de UI base).
