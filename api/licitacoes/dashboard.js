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
    const total = await sql`SELECT COUNT(*) as total FROM licitacoes`;
    const porStatus = await sql`SELECT status, COUNT(*) as total FROM licitacoes GROUP BY status`;
    const porModalidade = await sql`SELECT modalidade, COUNT(*) as total FROM licitacoes GROUP BY modalidade`;
    const valorTotal = await sql`SELECT SUM(valor_estimado) as total FROM licitacoes`;
    return Response.json({
      total: parseInt(total[0].total),
      porStatus,
      porModalidade,
      valorTotal: valorTotal[0]?.total || 0
    });
  } catch (err) {
    return Response.json({ erro: err.message }, { status: 401 });
  }
}