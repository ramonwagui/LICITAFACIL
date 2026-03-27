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

export async function GET(request) {
  try {
    autenticarToken(request);
    const result = await sql`SELECT * FROM convenios ORDER BY created_at DESC`;
    return Response.json(result);
  } catch (err) {
    return Response.json({ erro: err.message }, { status: 401 });
  }
}

export async function POST(request) {
  try {
    autenticarToken(request);
    const body = await request.json();
    const keys = Object.keys(body);
    const values = Object.values(body);
    const result = await sql`INSERT INTO convenios (${sql(keys.join(', '))}) VALUES (${sql(values.join(', '))}) RETURNING *`;
    return Response.json(result[0], { status: 201 });
  } catch (err) {
    return Response.json({ erro: err.message }, { status: 500 });
  }
}