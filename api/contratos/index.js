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
    const result = await sql`SELECT * FROM contratos ORDER BY created_at DESC`;
    return Response.json(result.rows);
  } catch (err) {
    return Response.json({ erro: err.message }, { status: 401 });
  }
}

export async function POST(request) {
  try {
    autenticarToken(request);
    const body = await request.json();
    const result = await sql`INSERT INTO contratos (${sql(Object.keys(body))}) VALUES (${sql(Object.values(body))}) RETURNING *`;
    return Response.json(result.rows[0], { status: 201 });
  } catch (err) {
    return Response.json({ erro: err.message }, { status: 500 });
  }
}