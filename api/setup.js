import { neon } from '@neondatabase/serverless';
import bcrypt from 'bcryptjs';

const sql = neon(process.env.POSTGRES_URL);

export async function GET() {
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
      CREATE TABLE IF NOT EXISTS contratos (
        id SERIAL PRIMARY KEY,
        licitacao_id INTEGER,
        numero TEXT,
        ano INTEGER,
        objeto TEXT,
        fornecedor_id INTEGER,
        valor_total REAL,
        data_inicio DATE,
        data_fim DATE,
        status TEXT DEFAULT 'ativo',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    
    await sql`
      CREATE TABLE IF NOT EXISTS convenios (
        id SERIAL PRIMARY KEY,
        numero TEXT,
        ano INTEGER,
        objeto TEXT,
        entidade_conveniada TEXT,
        valor_total REAL,
        data_inicio DATE,
        data_fim DATE,
        status TEXT DEFAULT 'ativo',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    
    await sql`
      CREATE TABLE IF NOT EXISTS fornecedores (
        id SERIAL PRIMARY KEY,
        nome TEXT NOT NULL,
        cnpj TEXT,
        cpf TEXT,
        telefone TEXT,
        email TEXT,
        endereco TEXT,
        cidade TEXT,
        estado TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    
    const existingUser = await sql`SELECT * FROM usuarios WHERE email = 'admin@licitafacil.com'`;
    if (existingUser.length === 0) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await sql`INSERT INTO usuarios (nome, email, senha) VALUES ('Administrador', 'admin@licitafacil.com', ${hashedPassword})`;
    }
    
    return Response.json({ message: 'Banco de dados inicializado com sucesso!' });
  } catch (err) {
    return Response.json({ erro: err.message }, { status: 500 });
  }
}