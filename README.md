# LicitaFácil - Sistema de Gestão de Licitações

Sistema web completo para gestão de processos licitatórios de prefeituras brasileiras.

## 🚀 Quick Start

### Pré-requisitos
- Node.js 18+ instalado

### Instalação e Execução

1. **Instalar dependências do backend:**
```bash
cd backend
npm install
```

2. **Instalar dependências do frontend:**
```bash
cd frontend
npm install
```

3. **Construir o frontend:**
```bash
npm run build
```

4. **Iniciar o servidor:**
```bash
cd ../backend
node server.js
```

5. **Acessar o sistema:**
Abra o navegador em: http://localhost:3001

## 🔐 Dados de Acesso (Demo)

- **E-mail:** admin@licitafacil.com.br
- **Senha:** admin123

## 📋 Funcionalidades

- ✅ Login com autenticação JWT
- ✅ Dashboard com estatísticas
- ✅ CRUD completo de licitações
- ✅ Checklist automático por modalidade
- ✅ Gerador de documentos
- ✅ Controle de prazos
- ✅ Histórico de alterações
- ✅ Interface responsiva

## 🛠️ Tecnologias

- **Frontend:** React + Vite + Tailwind CSS
- **Backend:** Node.js + Express
- **Banco de Dados:** SQLite

## 📁 Estrutura

```
LICITAFACIL/
├── backend/
│   ├── server.js          # Servidor principal
│   ├── package.json
│   └── licitafacil.db     # Banco SQLite (criado automaticamente)
├── frontend/
│   ├── src/
│   │   ├── components/   # Componentes React
│   │   ├── pages/        # Páginas
│   │   ├── context/       # Contextos (Auth)
│   │   ├── services/     # API calls
│   │   └── utils/        # Utilitários
│   ├── package.json
│   └── dist/              # Build de produção
├── SPEC.md                # Documentação técnica
└── README.md
```

## 📄 License

MIT License