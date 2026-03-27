import { neon } from '@neondatabase/serverless';
import jwt from 'jsonwebtoken';

const sql = neon(process.env.POSTGRES_URL);
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
    const result = await sql`SELECT * FROM fornecedores WHERE id = ${params.id}`;
    return Response.json(result[0]);
  } catch (err) {
    return Response.json({ erro: err.message }, { status: 401 });
  }
}

export async function PUT(request, { params }) {
  try {
    autenticarToken(request);
    const body = await request.json();
    const keys = Object.keys(body);
    const setClause = keys.map(k => `${k} = ${sql(body[k])}`).join(', ');
    const result = await sql`UPDATE fornecedores SET ${setClause} WHERE id=${params.id} RETURNING *`;
    return Response.json(result[0]);
  } catch (err) {
    return Response.json({ erro: err.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    autenticarToken(request);
    await sql`DELETE FROM fornecedores WHERE id = ${params.id}`;
    return Response.json({ message: 'Fornecedor excluído' });
  } catch (err) {
    return Response.json({ erro: err.message }, { status: 500 });
  }
}