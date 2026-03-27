import { sql } from '@vercel/postgres';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'licitafacil_secret_key_2024';

function autenticarToken(request) {
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.split(' ')[1];
  if (!token) throw new Error('Acesso negado');
  return jwt.verify(token, JWT_SECRET);
}

export async function GET(request, { params }) {
  try {
    autenticarToken(request);
    const { id } = params;
    const result = await sql`SELECT * FROM licitacoes WHERE id = ${id}`;
    if (result.rowCount === 0) {
      return Response.json({ erro: 'Licitação não encontrada' }, { status: 404 });
    }
    return Response.json(result.rows[0]);
  } catch (err) {
    return Response.json({ erro: err.message }, { status: 401 });
  }
}

export async function PUT(request, { params }) {
  try {
    autenticarToken(request);
    const { id } = params;
    const body = await request.json();
    
    const result = await sql`
      UPDATE licitacoes SET 
        numero=${body.numero}, ano=${body.ano}, modalidade=${body.modalidade}, objeto=${body.objeto},
        secretaria=${body.secretaria}, valor_estimado=${body.valor_estimado}, fonte_recurso=${body.fonte_recurso},
        status=${body.status}, data_criacao=${body.data_criacao}, data_publicacao=${body.data_publicacao},
        data_sessao=${body.data_sessao}, data_homologacao=${body.data_homologacao}, observacoes=${body.observacoes},
        updated_at=CURRENT_TIMESTAMP
      WHERE id=${id} RETURNING *`;
    
    return Response.json(result.rows[0]);
  } catch (err) {
    return Response.json({ erro: err.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    autenticarToken(request);
    const { id } = params;
    await sql`DELETE FROM licitacoes WHERE id = ${id}`;
    return Response.json({ message: 'Licitação excluída' });
  } catch (err) {
    return Response.json({ erro: err.message }, { status: 500 });
  }
}