# TaskFlow — Sistema de Organização de Tarefas

Sistema web para delegação e acompanhamento de tarefas com notificações via WhatsApp e Telegram.

## Stack

- **Frontend/Backend:** Next.js 16 (App Router) + TypeScript
- **Banco de Dados:** PostgreSQL + Prisma ORM
- **Autenticação:** NextAuth v5 (JWT)
- **E-mail:** Resend
- **Armazenamento:** MinIO
- **Notificações:** Evolution API (WhatsApp) + Telegram Bot API
- **Deploy:** Docker Swarm + Traefik + Let's Encrypt

## Desenvolvimento Local

```bash
npm install
docker compose up -d        # Postgres + MinIO
cp .env.example .env        # Configure o .env
npx prisma migrate dev
npm run dev
```

Acesse: http://localhost:3000

## Deploy (VPS Docker Swarm)

Faça push para `main` — o GitHub Actions faz o resto automaticamente.

Secrets necessários no repositório:
- `VPS_HOST`, `VPS_USER`, `VPS_SSH_KEY`

## Funcionalidades

- Multi-tenant (múltiplas empresas isoladas)
- Tarefas com prioridade e prazo
- Status: Aberta → Em Andamento → Concluída / Falhou
- Chat por tarefa com @menções
- Histórico de alterações com timeline
- Ranking semanal de produtividade
- Notificações WhatsApp (Evolution API) + Telegram
- Convite de colaboradores por e-mail
- Controle de acesso por role (Admin / Gerente / Colaborador)
