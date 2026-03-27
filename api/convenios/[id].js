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
    const result = await sql`SELECT * FROM convenios WHERE id = ${params.id}`;
    return Response.json(result.rows[0]);
  } catch (err) {
    return Response.json({ erro: err.message }, { status: 401 });
  }
}

export async function PUT(request, { params }) {
  try {
    autenticarToken(request);
    const body = await request.json();
    const result = await sql`UPDATE convenios SET ${sql(body)} WHERE id=${params.id} RETURNING *`;
    return Response.json(result.rows[0]);
  } catch (err) {
    return Response.json({ erro: err.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    autenticarToken(request);
    await sql`DELETE FROM convenios WHERE id = ${params.id}`;
    return Response.json({ message: 'Convênio excluído' });
  } catch (err) {
    return Response.json({ erro: err.message }, { status: 500 });
  }
}