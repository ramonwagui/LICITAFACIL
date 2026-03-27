const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { sql } = require('@vercel/postgres');

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'licitafacil_secret_key_2024';

app.use(cors());
app.use(express.json());

async function initDatabase() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS usuarios (
        id SERIAL PRIMARY KEY,
        nome TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        senha TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    
    await sql`
      CREATE TABLE IF NOT EXISTS licitacoes (
        id SERIAL PRIMARY KEY,
        numero INTEGER NOT NULL,
        ano INTEGER NOT NULL,
        modalidade TEXT NOT NULL,
        objeto TEXT NOT NULL,
        secretaria TEXT,
        valor_estimado REAL,
        fonte_recurso TEXT,
        status TEXT DEFAULT 'em_elaboracao',
        data_criacao DATE DEFAULT CURRENT_DATE,
        data_publicacao DATE,
        data_sessao DATE,
        data_homologacao DATE,
        observacoes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS checklist_itens (
        id SERIAL PRIMARY KEY,
        licitacao_id INTEGER NOT NULL,
        item TEXT NOT NULL,
        concluido BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (licitacao_id) REFERENCES licitacoes(id) ON DELETE CASCADE
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS documentos (
        id SERIAL PRIMARY KEY,
        licitacao_id INTEGER NOT NULL,
        tipo TEXT NOT NULL,
        titulo TEXT NOT NULL,
        conteudo TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (licitacao_id) REFERENCES licitacoes(id) ON DELETE CASCADE
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS historico (
        id SERIAL PRIMARY KEY,
        licitacao_id INTEGER NOT NULL,
        acao TEXT NOT NULL,
        descricao TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (licitacao_id) REFERENCES licitacoes(id) ON DELETE CASCADE
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS contratos (
        id SERIAL PRIMARY KEY,
        licitacao_id INTEGER,
        numero TEXT NOT NULL,
        ano INTEGER NOT NULL,
        objeto TEXT NOT NULL,
        contratada TEXT,
        cnpj TEXT,
        valor_inicial REAL,
        valor_final REAL,
        data_inicio DATE,
        data_fim DATE,
        data_assinatura DATE,
        status TEXT DEFAULT 'ativo',
        observacoes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (licitacao_id) REFERENCES licitacoes(id) ON DELETE SET NULL
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS convenios (
        id SERIAL PRIMARY KEY,
        numero TEXT NOT NULL,
        ano INTEGER NOT NULL,
        objeto TEXT NOT NULL,
        concedente TEXT NOT NULL,
        cnpj_concedente TEXT,
        valor_repasse REAL,
        valor_contrapartida REAL,
        valor_total REAL,
        data_inicio DATE,
        data_fim DATE,
        data_assinatura DATE,
        status TEXT DEFAULT 'em_andamento',
        observacoes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS fornecedores (
        id SERIAL PRIMARY KEY,
        razao_social TEXT NOT NULL,
        nome_fantasia TEXT,
        cnpj TEXT UNIQUE,
        cpf TEXT,
        telefone TEXT,
        email TEXT,
        endereco TEXT,
        cidade TEXT,
        uf TEXT,
        cep TEXT,
        contato TEXT,
        categoria TEXT,
        status TEXT DEFAULT 'ativo',
        observacoes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    const users = await sql`SELECT COUNT(*) as count FROM usuarios`;
    if (users[0].count === 0) {
      const hash = bcrypt.hashSync('admin123', 10);
      await sql`INSERT INTO usuarios (nome, email, senha) VALUES ('Admin Sistema', 'admin@licitafacil.com.br', ${hash})`;
      console.log('✅ Usuário admin criado');
    }
    
    console.log('✅ Banco de dados inicializado');
  } catch (err) {
    console.error('Erro ao inicializar banco:', err.message);
  }
}

function autenticarToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ erro: 'Token não fornecido' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ erro: 'Token inválido' });
    req.user = user;
    next();
  });
}

// Auth routes
app.post('/api/auth/login', async (req, res) => {
  const { email, senha } = req.body;
  try {
    const users = await sql`SELECT * FROM usuarios WHERE email = ${email}`;
    const usuario = users[0];
    if (!usuario || !bcrypt.compareSync(senha, usuario.senha)) {
      return res.status(401).json({ erro: 'Email ou senha incorretos' });
    }
    const token = jwt.sign({ id: usuario.id, nome: usuario.nome, email: usuario.email }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ token, usuario: { id: usuario.id, nome: usuario.nome, email: usuario.email } });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

app.get('/api/auth/me', autenticarToken, async (req, res) => {
  const users = await sql`SELECT id, nome, email FROM usuarios WHERE id = ${req.user.id}`;
  res.json(users[0]);
});

// Dashboard
app.get('/api/licitacoes/dashboard', autenticarToken, async (req, res) => {
  const stats = { total: 0, em_elaboracao: 0, publicado: 0, em_julgamento: 0, homologado: 0, concluido: 0, suspenso: 0, cancelado: 0 };
  const rows = await sql`SELECT status, COUNT(*) as total FROM licitacoes GROUP BY status`;
  stats.total = rows.reduce((acc, r) => acc + Number(r.total), 0);
  rows.forEach(r => { stats[r.status] = Number(r.total); });
  
  const recentes = await sql`SELECT * FROM licitacoes ORDER BY created_at DESC LIMIT 5`;
  res.json({ stats, recentes });
});

// Licitações CRUD
app.get('/api/licitacoes', autenticarToken, async (req, res) => {
  const { busca, modalidade, status } = req.query;
  let sqlQuery = 'SELECT * FROM licitacoes WHERE 1=1';
  const params = [];
  
  if (busca) { sqlQuery += " AND (objeto LIKE $1 OR CAST(numero AS TEXT) LIKE $1)"; params.push('%' + busca + '%'); }
  if (modalidade) { sqlQuery += ' AND modalidade = $' + (params.length + 1); params.push(modalidade); }
  if (status) { sqlQuery += ' AND status = $' + (params.length + 1); params.push(status); }
  sqlQuery += ' ORDER BY created_at DESC';
  
  const rows = await sql`${sqlQuery}`.withParams(params);
  res.json(rows);
});

app.get('/api/licitacoes/:id', autenticarToken, async (req, res) => {
  const rows = await sql`SELECT * FROM licitacoes WHERE id = ${req.params.id}`;
  if (!rows[0]) return res.status(404).json({ erro: 'Licitação não encontrada' });
  res.json(rows[0]);
});

app.post('/api/licitacoes', autenticarToken, async (req, res) => {
  const { numero, ano, modalidade, objeto, secretaria, valor_estimado, fonte_recurso, status, data_publicacao, data_sessao, data_homologacao, observacoes } = req.body;
  try {
    const result = await sql`
      INSERT INTO licitacoes (numero, ano, modalidade, objeto, secretaria, valor_estimado, fonte_recurso, status, data_publicacao, data_sessao, data_homologacao, observacoes)
      VALUES (${numero}, ${ano}, ${modalidade}, ${objeto}, ${secretaria}, ${valor_estimado}, ${fonte_recurso}, ${status || 'em_elaboracao'}, ${data_publicacao}, ${data_sessao}, ${data_homologacao}, ${observacoes})
      RETURNING id
    `;
    res.status(201).json({ id: result[0].id, message: 'Licitação criada com sucesso' });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

app.put('/api/licitacoes/:id', autenticarToken, async (req, res) => {
  const { numero, ano, modalidade, objeto, secretaria, valor_estimado, fonte_recurso, status, data_publicacao, data_sessao, data_homologacao, observacoes } = req.body;
  await sql`
    UPDATE licitacoes SET numero=${numero}, ano=${ano}, modalidade=${modalidade}, objeto=${objeto}, secretaria=${secretaria}, valor_estimado=${valor_estimado}, fonte_recurso=${fonte_recurso}, status=${status}, data_publicacao=${data_publicacao}, data_sessao=${data_sessao}, data_homologacao=${data_homologacao}, observacoes=${observacoes}, updated_at=CURRENT_TIMESTAMP
    WHERE id=${req.params.id}
  `;
  res.json({ message: 'Licitação atualizada com sucesso' });
});

app.delete('/api/licitacoes/:id', autenticarToken, async (req, res) => {
  await sql`DELETE FROM licitacoes WHERE id = ${req.params.id}`;
  res.json({ message: 'Licitação excluída com sucesso' });
});

// Checklist
app.get('/api/licitacoes/:id/checklist', autenticarToken, async (req, res) => {
  const rows = await sql`SELECT * FROM checklist_itens WHERE licitacao_id = ${req.params.id} ORDER BY id`;
  res.json(rows);
});

app.put('/api/checklist/:id', autenticarToken, async (req, res) => {
  const { concluido } = req.body;
  await sql`UPDATE checklist_itens SET concluido = ${concluido}, updated_at = CURRENT_TIMESTAMP WHERE id = ${req.params.id}`;
  res.json({ message: 'Item atualizado' });
});

// Documentos
app.get('/api/licitacoes/:id/documentos', autenticarToken, async (req, res) => {
  const rows = await sql`SELECT * FROM documentos WHERE licitacao_id = ${req.params.id} ORDER BY created_at DESC`;
  res.json(rows);
});

app.get('/api/licitacoes/:id/historico', autenticarToken, async (req, res) => {
  const rows = await sql`SELECT * FROM historico WHERE licitacao_id = ${req.params.id} ORDER BY created_at DESC`;
  res.json(rows);
});

// Contratos
app.get('/api/contratos', autenticarToken, async (req, res) => {
  const { busca, status } = req.query;
  let sqlQuery = 'SELECT c.*, l.numero as licitacao_numero, l.ano as licitacao_ano FROM contratos c LEFT JOIN licitacoes l ON c.licitacao_id = l.id WHERE 1=1';
  const params = [];
  if (busca) { sqlQuery += " AND (c.objeto LIKE $1 OR c.numero LIKE $1 OR c.contratada LIKE $1)"; params.push('%' + busca + '%'); }
  if (status) { sqlQuery += ' AND c.status = $' + (params.length + 1); params.push(status); }
  sqlQuery += ' ORDER BY c.created_at DESC';
  const rows = await sql`${sqlQuery}`.withParams(params);
  res.json(rows);
});

app.get('/api/contratos/:id', autenticarToken, async (req, res) => {
  const rows = await sql`SELECT c.*, l.numero as licitacao_numero, l.ano as licitacao_ano FROM contratos c LEFT JOIN licitacoes l ON c.licitacao_id = l.id WHERE c.id = ${req.params.id}`;
  if (!rows[0]) return res.status(404).json({ erro: 'Contrato não encontrado' });
  res.json(rows[0]);
});

app.post('/api/contratos', autenticarToken, async (req, res) => {
  const { licitacao_id, numero, ano, objeto, contratada, cnpj, valor_inicial, valor_final, data_inicio, data_fim, data_assinatura, status, observacoes } = req.body;
  const result = await sql`
    INSERT INTO contratos (licitacao_id, numero, ano, objeto, contratada, cnpj, valor_inicial, valor_final, data_inicio, data_fim, data_assinatura, status, observacoes)
    VALUES (${licitacao_id || null}, ${numero}, ${ano}, ${objeto}, ${contratada}, ${cnpj}, ${valor_inicial}, ${valor_final}, ${data_inicio}, ${data_fim}, ${data_assinatura}, ${status || 'ativo'}, ${observacoes})
    RETURNING id
  `;
  res.status(201).json({ id: result[0].id });
});

app.put('/api/contratos/:id', autenticarToken, async (req, res) => {
  const { licitacao_id, numero, ano, objeto, contratada, cnpj, valor_inicial, valor_final, data_inicio, data_fim, data_assinatura, status, observacoes } = req.body;
  await sql`
    UPDATE contratos SET licitacao_id=${licitacao_id || null}, numero=${numero}, ano=${ano}, objeto=${objeto}, contratada=${contratada}, cnpj=${cnpj}, valor_inicial=${valor_inicial}, valor_final=${valor_final}, data_inicio=${data_inicio}, data_fim=${data_fim}, data_assinatura=${data_assinatura}, status=${status}, observacoes=${observacoes}, updated_at=CURRENT_TIMESTAMP
    WHERE id=${req.params.id}
  `;
  res.json({ message: 'Contrato atualizado' });
});

app.delete('/api/contratos/:id', autenticarToken, async (req, res) => {
  await sql`DELETE FROM contratos WHERE id = ${req.params.id}`;
  res.json({ message: 'Contrato excluído' });
});

// Convênios
app.get('/api/convenios', autenticarToken, async (req, res) => {
  const { busca, status } = req.query;
  let sqlQuery = 'SELECT * FROM convenios WHERE 1=1';
  const params = [];
  if (busca) { sqlQuery += " AND (objeto LIKE $1 OR numero LIKE $1 OR concedente LIKE $1)"; params.push('%' + busca + '%'); }
  if (status) { sqlQuery += ' AND status = $' + (params.length + 1); params.push(status); }
  sqlQuery += ' ORDER BY created_at DESC';
  const rows = await sql`${sqlQuery}`.withParams(params);
  res.json(rows);
});

app.get('/api/convenios/:id', autenticarToken, async (req, res) => {
  const rows = await sql`SELECT * FROM convenios WHERE id = ${req.params.id}`;
  if (!rows[0]) return res.status(404).json({ erro: 'Convênio não encontrado' });
  res.json(rows[0]);
});

app.post('/api/convenios', autenticarToken, async (req, res) => {
  const { numero, ano, objeto, concedente, cnpj_concedente, valor_repasse, valor_contrapartida, valor_total, data_inicio, data_fim, data_assinatura, status, observacoes } = req.body;
  const result = await sql`
    INSERT INTO convenios (numero, ano, objeto, concedente, cnpj_concedente, valor_repasse, valor_contrapartida, valor_total, data_inicio, data_fim, data_assinatura, status, observacoes)
    VALUES (${numero}, ${ano}, ${objeto}, ${concedente}, ${cnpj_concedente}, ${valor_repasse}, ${valor_contrapartida}, ${valor_total}, ${data_inicio}, ${data_fim}, ${data_assinatura}, ${status || 'em_andamento'}, ${observacoes})
    RETURNING id
  `;
  res.status(201).json({ id: result[0].id });
});

app.put('/api/convenios/:id', autenticarToken, async (req, res) => {
  const { numero, ano, objeto, concedente, cnpj_concedente, valor_repasse, valor_contrapartida, valor_total, data_inicio, data_fim, data_assinatura, status, observacoes } = req.body;
  await sql`
    UPDATE convenios SET numero=${numero}, ano=${ano}, objeto=${objeto}, concedente=${concedente}, cnpj_concedente=${cnpj_concedente}, valor_repasse=${valor_repasse}, valor_contrapartida=${valor_contrapartida}, valor_total=${valor_total}, data_inicio=${data_inicio}, data_fim=${data_fim}, data_assinatura=${data_assinatura}, status=${status}, observacoes=${observacoes}, updated_at=CURRENT_TIMESTAMP
    WHERE id=${req.params.id}
  `;
  res.json({ message: 'Convênio atualizado' });
});

app.delete('/api/convenios/:id', autenticarToken, async (req, res) => {
  await sql`DELETE FROM convenios WHERE id = ${req.params.id}`;
  res.json({ message: 'Convênio excluído' });
});

// Fornecedores
app.get('/api/fornecedores', autenticarToken, async (req, res) => {
  const { busca, status } = req.query;
  let sqlQuery = 'SELECT * FROM fornecedores WHERE 1=1';
  const params = [];
  if (busca) { sqlQuery += " AND (razao_social LIKE $1 OR nome_fantasia LIKE $1 OR cnpj LIKE $1)"; params.push('%' + busca + '%'); }
  if (status) { sqlQuery += ' AND status = $' + (params.length + 1); params.push(status); }
  sqlQuery += ' ORDER BY razao_social ASC';
  const rows = await sql`${sqlQuery}`.withParams(params);
  res.json(rows);
});

app.get('/api/fornecedores/:id', autenticarToken, async (req, res) => {
  const rows = await sql`SELECT * FROM fornecedores WHERE id = ${req.params.id}`;
  if (!rows[0]) return res.status(404).json({ erro: 'Fornecedor não encontrado' });
  res.json(rows[0]);
});

app.post('/api/fornecedores', autenticarToken, async (req, res) => {
  const { razao_social, nome_fantasia, cnpj, cpf, telefone, email, endereco, cidade, uf, cep, contato, categoria, status, observacoes } = req.body;
  const result = await sql`
    INSERT INTO fornecedores (razao_social, nome_fantasia, cnpj, cpf, telefone, email, endereco, cidade, uf, cep, contato, categoria, status, observacoes)
    VALUES (${razao_social}, ${nome_fantasia}, ${cnpj}, ${cpf}, ${telefone}, ${email}, ${endereco}, ${cidade}, ${uf}, ${cep}, ${contato}, ${categoria}, ${status || 'ativo'}, ${observacoes})
    RETURNING id
  `;
  res.status(201).json({ id: result[0].id });
});

app.put('/api/fornecedores/:id', autenticarToken, async (req, res) => {
  const { razao_social, nome_fantasia, cnpj, cpf, telefone, email, endereco, cidade, uf, cep, contato, categoria, status, observacoes } = req.body;
  await sql`
    UPDATE fornecedores SET razao_social=${razao_social}, nome_fantasia=${nome_fantasia}, cnpj=${cnpj}, cpf=${cpf}, telefone=${telefone}, email=${email}, endereco=${endereco}, cidade=${cidade}, uf=${uf}, cep=${cep}, contato=${contato}, categoria=${categoria}, status=${status}, observacoes=${observacoes}, updated_at=CURRENT_TIMESTAMP
    WHERE id=${req.params.id}
  `;
  res.json({ message: 'Fornecedor atualizado' });
});

app.delete('/api/fornecedores/:id', autenticarToken, async (req, res) => {
  await sql`DELETE FROM fornecedores WHERE id = ${req.params.id}`;
  res.json({ message: 'Fornecedor excluído' });
});

initDatabase().then(() => {
  app.listen(PORT, () => {
    console.log('✅ Servidor rodando na porta ' + PORT);
  });
});

module.exports = app;