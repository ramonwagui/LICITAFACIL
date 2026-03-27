# LicitaFácil - Sistema de Gestão de Licitações

## 1. Visão Geral do Projeto

**Nome do Projeto:** LicitaFácil  
**Tipo:** Web Application (MVP)  
**Stack Tecnológico:** React + Node.js + PostgreSQL  
**Público-alvo:** Prefeituras de pequeno e médio porte  
**Objetivo:** Organizar processos licitatórios, controlar prazos e gerar documentos automáticos

---

## 2. Especificação UI/UX

### 2.1 Design System

#### Paleta de Cores
- **Primary:** `#1E3A5F` (Azul institucional)
- **Primary Light:** `#2E5077`
- **Primary Dark:** `#0F2340`
- **Secondary:** `#3B82F6` (Azul ação)
- **Accent:** `#10B981` (Verde sucesso)
- **Warning:** `#F59E0B` (Amarelo alerta)
- **Danger:** `#EF4444` (Vermelho erro)
- **Background:** `#F8FAFC`
- **Surface:** `#FFFFFF`
- **Text Primary:** `#1E293B`
- **Text Secondary:** `#64748B`
- **Border:** `#E2E8F0`

#### Tipografia
- **Font Family:** `"Inter", system-ui, sans-serif`
- **Headings:**
  - H1: 32px/700
  - H2: 24px/600
  - H3: 20px/600
  - H4: 16px/600
- **Body:** 14px/400
- **Small:** 12px/400

#### Espaçamento
- Base: 4px
- Padding cards: 24px
- Gap entre elementos: 16px
- Border radius: 8px (cards), 6px (inputs), 4px (buttons small)

#### Sombras
- Card: `0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)`
- Dropdown: `0 10px 15px -3px rgba(0,0,0,0.1)`

### 2.2 Layout

#### Estrutura
- **Sidebar:** 260px fixo (esquerda), colapso em mobile
- **Header:** 64px fixo (topo)
- **Content:** Flexível com padding 24px
- **Responsivo:** Mobile < 768px, Tablet 768-1024px, Desktop > 1024px

#### Navegação Lateral
- Logo + nome no topo
- Menu com ícones + texto
- Itens: Dashboard, Licitações, Relatórios (futuro), Configurações (futuro)
- Footer com versão

### 2.3 Componentes

#### Cards
- Fundo branco
- Border radius 8px
- Sombra suave
- Padding 24px

#### Botões
- **Primary:** Fundo azul, texto branco, hover darker
- **Secondary:** Fundo transparente, borda, texto azul
- **Danger:** Fundo vermelho, texto branco
- **Success:** Fundo verde, texto branco
- Altura: 40px, padding horizontal 16px

#### Inputs
- Altura: 40px
- Border: 1px solid #E2E8F0
- Focus: border azul + ring
- Labels acima do input

#### Tabelas
- Header com fundo cinza claro
- Rows com hover
- Paginação abaixo
- Actions column com ícones

#### Status Badges
- Em elaboração: azul
- Publicado: verde
- Em julgamento: amarelo
- Homologado: roxo
- Concluído: verde escuro
- Suspenso: cinza
- Cancelado: vermelho

---

## 3. Especificação Funcional

### 3.1 Autenticação

#### Login
- Campos: email, senha
- Validação básica de email
- Armazenar token JWT em localStorage
- Redirect para dashboard após login

### 3.2 Dashboard

#### Cards de Estatísticas
1. Total de Licitações (número grande + label)
2. Em Elaboração (azul)
3. Publicadas (verde)
4. Concluídas (verde escuro)
5. Atrasadas (vermelho)

#### Lista de Recentes
- Título: "Licitações Recentes"
- Listar últimas 5 cadastradas
- Colunas: Número, Objeto (truncado), Status, Data
- Link para ver detalhes

#### Alertas de Prazos
- Título: "Prazos Próximos"
- Lista de licitações com sessão marcada nos próximos 7 dias
- Badge de aviso amarelo

### 3.3 Gestão de Licitações

#### Listagem
- Busca por número ou objeto
- Filtros: Modalidade, Status
- Ordenação: Data criação (ASC/DESC)
- Paginação: 10 por página
- Ações: Visualizar, Editar, Excluir

#### Formulário de Cadastro/Edição
Campos:
- Número (número)
- Ano (select: ano atual e anteriores)
- Modalidade (select das 6 opções)
- Objeto (textarea)
- Secretaria (select)
- Valor estimado (input com máscara R$)
- Fonte de recurso (select)
- Status (select)
- Data de publicação (date)
- Data da sessão (date)
- Data de homologação (date)
- Observações (textarea)

Validação:
- Número e ano obrigatórios
- Objeto obrigatório
- Modalidade obrigatória

### 3.4 Checklist Automático

#### Itens por Modalidade

**Pregão Eletrônico/Presencial:**
1. Termo de Referência
2. Pesquisa de Preços
3. Dotação Orçamentária
4. Parecer Jurídico
5. Edital Publicado
6. Ata da Sessão
7. Homologação

**Concorrência:**
1. Projeto Básico
2. Pesquisa de Preços
3. Dotação Orçamentária
4. Parecer Técnico
5. Parecer Jurídico
6. Edital Publicado
7. Ata de Julgamento
8. Homologação

**Dispensa:**
1. Justificativa
2. Cotação de Preços
3. Parecer Jurídico
4. Ratificação
5. Contrato/ARP

**Inexigibilidade:**
1. Justificativa de Inexigibilidade
2. Pesquisa de Preços
3. Parecer Jurídico
4. Ratificação
5. Contrato

**Tomada de Preços:**
1. Edital
2. Pesquisa de Preços
3. Dotação Orçamentária
4. Parecer Jurídico
5. Ata de Registro
6. Homologação

**Convite:**
1. Convite
2. Pesquisa de Preços
3. Dotação Orçamentária
4. Parecer Jurídico
5. Ata de Julgamento
6. Homologação

#### Interface do Checklist
- Checkbox para cada item
- Barra de progresso percentual
- Texto: "X de Y concluídos (Z%)"

### 3.5 Gerador de Documentos

#### Tipos de Documentos
1. **Termo de Referência** - para Pregão
2. **Justificativa de Dispensa** - para Dispensa/Inexigibilidade
3. **Edital Simples** - genérico
4. **Contrato Básico** - genérico

#### Template Automático
Cada documento gera texto com placeholders:
- {{numero}}
- {{ano}}
- {{modalidade}}
- {{objeto}}
- {{secretaria}}
- {{valor}}
- {{data}}

#### Editor
- Textarea com conteúdo editável
- Botão "Copiar" para clipboard
- Botão "Baixar PDF"

### 3.6 Controle de Prazos

#### Lógica de Cores
- **Verde:** Mais de 7 dias para sessão
- **Amarelo:** Entre 3 e 7 dias para sessão
- **Vermelho:** Menos de 3 dias ou data passou

#### Exibição
- Badge de cor ao lado do status
- Lista no dashboard de atrasados

### 3.7 Histórico

#### Eventos Registrados
- "Licitação criada"
- "Licitação atualizada"
- "Checklist atualizado"
- "Documento gerado: [tipo]"
- "Status alterado para [status]"

---

## 4. Estrutura de Dados

### Tabelas

```sql
-- Usuários
CREATE TABLE usuarios (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  senha VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Licitações
CREATE TABLE licitacoes (
  id SERIAL PRIMARY KEY,
  numero INTEGER NOT NULL,
  ano INTEGER NOT NULL,
  modalidade VARCHAR(50) NOT NULL,
  objeto TEXT NOT NULL,
  secretaria VARCHAR(100),
  valor_estimado DECIMAL(15,2),
  fonte_recurso VARCHAR(100),
  status VARCHAR(50) DEFAULT 'em_elaboracao',
  data_criacao DATE DEFAULT CURRENT_DATE,
  data_publicacao DATE,
  data_sessao DATE,
  data_homologacao DATE,
  observacoes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Checklist
CREATE TABLE checklist_itens (
  id SERIAL PRIMARY KEY,
  licitacao_id INTEGER REFERENCES licitacoes(id) ON DELETE CASCADE,
  item VARCHAR(255) NOT NULL,
  concluido BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Documentos
CREATE TABLE documentos (
  id SERIAL PRIMARY KEY,
  licitacao_id INTEGER REFERENCES licitacoes(id) ON DELETE CASCADE,
  tipo VARCHAR(50) NOT NULL,
  titulo VARCHAR(255) NOT NULL,
  conteudo TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Histórico
CREATE TABLE historico (
  id SERIAL PRIMARY KEY,
  licitacao_id INTEGER REFERENCES licitacoes(id) ON DELETE CASCADE,
  acao VARCHAR(100) NOT NULL,
  descricao TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 5. API Endpoints

### Autenticação
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user

### Licitações
- `GET /api/licitacoes` - Listar (com filtros)
- `GET /api/licitacoes/:id` - Detalhes
- `POST /api/licitacoes` - Criar
- `PUT /api/licitacoes/:id` - Atualizar
- `DELETE /api/licitacoes/:id` - Excluir
- `GET /api/licitacoes/dashboard` - Dados para dashboard

### Checklist
- `GET /api/licitacoes/:id/checklist` - Get checklist
- `PUT /api/checklist/:id` - Atualizar item
- `POST /api/licitacoes/:id/checklist/gerar` - Gerar checklist automático

### Documentos
- `GET /api/licitacoes/:id/documentos` - Listar documentos
- `POST /api/licitacoes/:id/documentos` - Criar documento
- `PUT /api/documentos/:id` - Atualizar documento
- `GET /api/documentos/:id` - Get documento

### Histórico
- `GET /api/licitacoes/:id/historico` - Get histórico

---

## 6. Acceptance Criteria

1. ✅ Login funcional com email/senha
2. ✅ Dashboard mostra estatísticas corretas
3. ✅ CRUD de licitações completo
4. ✅ Checklist gera automaticamente conforme modalidade
5. ✅ Checklist atualizável com progresso visual
6. ✅ Gerador de documentos cria textos automáticos
7. ✅ Documentos editáveis antes de salvar
8. ✅ Controle de prazos com cores corretas
9. ✅ Histórico registra ações
10. ✅ Interface responsiva
11. ✅ Dados de exemplo incluídos
12. ✅ Formatação de moeda BRL
13. ✅ Datas no formato brasileiro

---

## 7. Stack Final

- **Frontend:** React 18 + Vite + Tailwind CSS
- **Backend:** Node.js + Express
- **Database:** SQLite (para simplicidade no MVP)
- **Auth:** JWT
- **Icons:** Lucide React