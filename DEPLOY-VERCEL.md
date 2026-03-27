# Deploy LicitaFácil na Vercel

## Estrutura do Projeto

```
LICITAFACIL/
├── frontend/     (React + Vite) → Deploy na Vercel
├── backend/       (Node.js + Vercel Postgres) → Deploy na Vercel
```

---

## Passo 1: Criar Banco de Dados na Vercel

1. Acesse https://vercel.com e faça login
2. Crie um novo projeto (New Project)
3. Clique em **"Add Database"** → selecione **Vercel Postgres**
4. Configure:
   - Database Name: `licitafacil`
   - Region: `São Paulo (gr1)`
5. Após criar, copie a variável `POSTGRES_URL` das Environment Variables

---

## Passo 2: Deploy do Backend

```bash
cd backend
npm install
```

1. No painel da Vercel, crie um novo projeto
2. Conecte este repositório (pasta `backend`)
3. Em **Environment Variables**, adicione:
   - `POSTGRES_URL` = (a URL do banco que você criou)
   - `JWT_SECRET` = (uma chave secreta qualquer, ex: `meu-segredo-123`)
4. Deploy automático!

**URL do backend** será algo como: `https://licitafacil-backend.vercel.app`

---

## Passo 3: Deploy do Frontend

1. No painel da Vercel, crie outro projeto (para o frontend)
2. Conecte a pasta `frontend`
3. Em **Environment Variables**, adicione:
   - `VITE_API_URL` = `https://seu-backend.vercel.app/api`
4. Deploy automático!

---

## Alternativa: Usando Vercel CLI

```bash
# Instalar CLI
npm i -g vercel

# Deploy Backend
cd backend
vercel --prod

# Deploy Frontend (em outro terminal)
cd frontend
vercel --prod
```

---

## Variáveis de Ambiente Necessárias

### Backend (Vercel)
| Variável | Descrição |
|----------|-----------|
| `POSTGRES_URL` | URL do banco Vercel Postgres |
| `JWT_SECRET` | Chave para assinar tokens JWT |
| `PORT` | 3001 (padrão) |

### Frontend (Vercel)
| Variável | Descrição |
|----------|-----------|
| `VITE_API_URL` | URL completa do backend |

---

## Após o Deploy

1. O sistema criará as tabelas automaticamente na primeira execução
2. Login padrão:
   - **Email:** admin@licitafacil.com.br
   - **Senha:** admin123

---

## Troubleshooting

### Erro de banco
- Verifique se o banco Postgres foi criado corretamente
- Confirme que a `POSTGRES_URL` está correta nas variáveis de ambiente

### Erro de CORS
- O backend já está configurado com CORS ativado para todas origens

### API não responding
- Verifique se o backend está online no Vercel
- Teste: `https://seu-backend.vercel.app/api/health`