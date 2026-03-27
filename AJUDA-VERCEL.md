# 🔍 GUIDE VISUEL: Criar Banco na Vercel

## Passo 1: Acesse o Dashboard

1. Vá para: https://vercel.com/dashboard
2. Clique no seu projeto (ou crie um novo projeto primeiro)

---

## Passo 2: Criar o Banco (VERSÃO ATUAL)

### Se você já tem um projeto criado:

1. No menu do projeto, procure por **"Storage"** (ícone de banco de dados)
   - Ou vá na aba **"Storage"** no menu principal do dashboard

2. Clique em **"Create Database"**

3. Escolha **"Vercel Postgres"**

4. Preencha:
   - **Name:** licitafacil
   - **Region:** São Paulo (gr1) ou closest

5. Clique em **Create**

---

### Se não tem projeto ainda:

1. No dashboard, clique em **"New Project"**
2. Dê um nome ao projeto (ex: licitafacil)
3. Ao criar, você terá a opção de Add Database → escolha Vercel Postgres
4. Siga os passos acima

---

## Onde encontrar a POSTGRES_URL

Depois de criar o banco:

1. Vá em **Settings** do projeto
2. Clique em **Environment Variables**
3. Você verá uma variável chamada `POSTGRES_URL`
4. Clique no valor para copiar

---

## Alternativa: Usar Supabase (mais fácil)

Se a Vercel Postgres estiver complexa, use Supabase:

1. Acesse https://supabase.com
2. Clique em **"Start your project"**
3. Faça login com GitHub
4. Clique em **"New project"**
5. Preencha:
   - Name: licitafacil
   - Database password: escolha uma senha
   - Region: São Paulo
6. Após criar, vá em **Settings** → **API**
7. Copie a **Connection String** (começa com `postgres://`)

---

## Precisa de ajuda?

Me envie uma captura de tela do que você está vendo no painel da Vercel que eu te guio!