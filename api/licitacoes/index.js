import { sql } from '@vercel/postgres';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'licitafacil_secret_key_2024';

function autenticarToken(request) {
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.split(' ')[1];
  if (!token) throw new Error('Acesso negado');
  return jwt.verify(token, JWT_SECRET);
}

export async function GET(request) {
  try {
    autenticarToken(request);
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (id) {
      const result = await sql`SELECT * FROM licitacoes WHERE id = ${id}`;
      if (result.rowCount === 0) {
        return Response.json({ erro: 'Licitação não encontrada' }, { status: 404 });
      }
      return Response.json(result.rows[0]);
    }
    
    const result = await sql`SELECT * FROM licitacoes ORDER BY created_at DESC`;
    return Response.json(result.rows);
  } catch (err) {
    return Response.json({ erro: err.message }, { status: 401 });
  }
}

export async function POST(request) {
  try {
    autenticarToken(request);
    const body = await request.json();
    
    const result = await sql`
      INSERT INTO licitacoes (numero, ano, modalidade, objeto, secretaria, valor_estimado, fonte_recurso, status, data_criacao, data_publicacao, data_sessao, data_homologacao, observacoes)
      VALUES (${body.numero}, ${body.ano}, ${body.modalidade}, ${body.objeto}, ${body.secretaria}, ${body.valor_estimado}, ${body.fonte_recurso}, ${body.status || 'em_elaboracao'}, ${body.data_criacao}, ${body.data_publicacao}, ${body.data_sessao}, ${body.data_homologacao}, ${body.observacoes})
      RETURNING *`;
    
    return Response.json(result.rows[0], { status: 201 });
  } catch (err) {
    return Response.json({ erro: err.message }, { status: 500 });
  }
}