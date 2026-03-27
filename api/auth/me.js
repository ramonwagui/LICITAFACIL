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
    const user = autenticarToken(request);
    const result = await sql`SELECT id, nome, email FROM usuarios WHERE id = ${user.id}`;
    return Response.json(result.rows[0]);
  } catch (err) {
    return Response.json({ erro: err.message }, { status: err.message === 'Acesso negado' ? 401 : 403 });
  }
}