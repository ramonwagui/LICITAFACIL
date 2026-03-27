# 🚀 PASSO A PASSO: Deploy LicitaFácil na Vercel

## O que você precisa fazer (em 8 minutos):

### 📋 Pré-requisito
- Conta no site https://vercel.com (gratuito)

---

### PASSO 1: Criar o Banco de Dados

1. Acesse https://vercel.com/dashboard
2. Clique no seu projeto (ou crie um novo)
3. No menu, clique em **Storage** (ícone de banco)
4. Clique em **Create Database**
5. Selecione **Vercel Postgres**
6. Configure:
   - **Name:** `licitafacil`
   - **Region:** São Paulo (gr1)
7. Clique em **Create**

**⚠️ IMPORTANTE:** Copie a URL que aparece (começa com `postgres://...`) - você vai precisar!

---

### PASSO 2: Deploy do Backend

1. No menu do Vercel, clique em **Deployments**
2. Clique em **New Deployment** (botão verde)
3. Na seção "Connect a Repository":
   - Escolha **GitHub** (ou o repositório onde está o código)
   - Selecione a pasta **`backend`**
   - **NÃO SELECIONE A PASTA TODO, SÓ A PASTA `backend`!**
4. Em **Environment Variables**, adicione:
   - `POSTGRES_URL` = cole a URL do banco que você copiou
   - `JWT_SECRET` = qualquer texto, ex: `licitafacil2024`
5. Clique em **Deploy**

Aguarde ~2 minutos. Quando terminar, você terá uma URL como:
`https://licitafacil-backend-xxxxx.vercel.app`

---

### PASSO 3: Deploy do Frontend

1. Clique em **New Deployment** novamente
2. Selecione a pasta **`frontend`** (não o projeto todo!)
3. Em **Environment Variables**, adicione:
   - `VITE_API_URL` = cole a URL do backend + `/api`
   
   **Exemplo:** `https://licitafacil-backend-xxxxx.vercel.app/api`
4. Clique em **Deploy**

Aguarde ~2 minutos. Quando terminar, você terá uma URL como:
`https://licitafacil-frontend-xxxxx.vercel.app`

---

### 🎉 PRONTO!

Acesse a URL do frontend e faça login com:
- **Email:** admin@licitafacil.com.br
- **Senha:** admin123

---

### Se der erro:

**Erro no banco:**
- Verifique se criou o banco na etapa 1
- Confirme que copiou a POSTGRES_URL corretamente

**Erro no frontend:**
- Verifique se a VITE_API_URL termina com `/api`

**Erro 404:**
- Aguarde mais 1-2 minutos para o deploy finalizar