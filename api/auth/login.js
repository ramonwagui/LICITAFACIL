import { sql } from '@vercel/postgres';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'licitafacil_secret_key_2024';

function autenticarToken(req) {
  const authHeader = req.headers.get('authorization');
  const token = authHeader?.split(' ')[1];
  if (!token) throw new Error('Acesso negado');
  return jwt.verify(token, JWT_SECRET);
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, senha } = body;
    
    const result = await sql`SELECT * FROM usuarios WHERE email = ${email}`;
    if (result.rowCount === 0) {
      return Response.json({ erro: 'Usuário não encontrado' }, { status: 400 });
    }
    
    const usuario = result.rows[0];
    const senhaValida = await bcrypt.compare(senha, usuario.senha);
    if (!senhaValida) {
      return Response.json({ erro: 'Senha incorreta' }, { status: 400 });
    }
    
    const token = jwt.sign(
      { id: usuario.id, nome: usuario.nome, email: usuario.email },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    return Response.json({
      token,
      usuario: { id: usuario.id, nome: usuario.nome, email: usuario.email }
    });
  } catch (err) {
    return Response.json({ erro: err.message }, { status: 500 });
  }
}