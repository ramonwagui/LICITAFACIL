# Deploy do LicitaFácil na Vercel

## Opção 1: Frontend-only (Recomendado para teste)

O frontend React já está pronto na pasta `frontend/dist`.

### Passos para deploy do frontend:

1. **Crie uma conta na Vercel** (https://vercel.com)

2. **Instale a CLI da Vercel**:
```bash
npm i -g vercel
```

3. **Faça o deploy**:
```bash
cd frontend
vercel
```

4. **Siga as instruções na tela**:
   - Link to existing project? → Não
   - What's your project's name? → licitafacil
   - Which framework? → Vite
   - Output directory? → dist

---

## Opção 2: Deploy Completo (Frontend + Backend)

Para deploy completo com backend, você precisa de:
- **Vercel** para frontend
- **Supabase** ou **Vercel Postgres** para banco de dados

### Passos:

1. **Crie uma conta no Supabase** (https://supabase.com)
   - Novo projeto → nome: licitafacil
   - Senha do banco: guarde bem

2. **Atualize o backend** para usar Supabase em vez de SQLite

3. **Deploy o frontend** na Vercel

---

## Configuração Atual

O projeto está configurado com:
- Frontend: React + Vite + Tailwind (pronto para deploy)
- Backend: Node.js + Express + SQLite (necessita servidor)

## Variáveis de Ambiente Necessárias (para backend)

Se você migrar para Supabase, o backend precisará de:
```
DATABASE_URL=postgres://...
JWT_SECRET=sua_chave_secreta
```

---

## Para Testar Local

```bash
cd backend
node server.js
```

Acesse: http://localhost:3001

Login: admin@licitafacil.com.br / admin123