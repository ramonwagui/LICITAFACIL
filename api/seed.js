import { neon } from '@neondatabase/serverless';
import bcrypt from 'bcryptjs';

const sql = neon(process.env.POSTGRES_URL);

function randomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

const modalidades = ['Pregão Eletrônico', 'Tomada de Preços', 'Concorrência', 'Convite', 'Inexigibilidade', 'Dispensada'];
const secretarias = ['Educação', 'Saúde', 'Obras', 'Administrativo', 'Assistência Social', 'Cultura', 'Esportes', 'Meio Ambiente'];
const statuses = ['em_elaboracao', 'em_andamento', 'homologada', 'encerrada', 'cancelada'];
const statusContrato = ['ativo', 'encerrado', 'suspenso', 'rescindido'];
const statusConvenio = ['ativo', 'encerrado', 'em_prestacao', 'inadimplente'];

export async function GET() {
  try {
    const fornecedorData = [
      { nome: 'Construtora Alpha Ltda', cnpj: '12.345.678/0001-90', telefone: '(11) 99999-0001', email: 'alpha@constru.com.br', cidade: 'São Paulo', estado: 'SP' },
      { nome: 'Materiais Beta Ltda', cnpj: '23.456.789/0001-01', telefone: '(11) 99999-0002', email: 'beta@materiais.com.br', cidade: 'São Paulo', estado: 'SP' },
      { nome: 'Serviços Gamma Ltda', cnpj: '34.567.890/0001-12', telefone: '(21) 99999-0003', email: 'gamma@servicos.com.br', cidade: 'Rio de Janeiro', estado: 'RJ' },
      { nome: 'Equipamentos Delta S/A', cnpj: '45.678.901/0001-23', telefone: '(31) 99999-0004', email: 'delta@equip.com.br', cidade: 'Belo Horizonte', estado: 'MG' },
      { nome: 'Informática Epsilon Ltda', cnpj: '56.789.012/0001-34', telefone: '(41) 99999-0005', email: 'epsilon@info.com.br', cidade: 'Curitiba', estado: 'PR' },
      { nome: 'Alimentação Zeta Ltda', cnpj: '67.890.123/0001-45', telefone: '(51) 99999-0006', email: 'zeta@alimentacao.com.br', cidade: 'Porto Alegre', estado: 'RS' },
      { nome: 'Limpeza Eta Serviços Ltda', cnpj: '78.901.234/0001-56', telefone: '(61) 99999-0007', email: 'eta@limpeza.com.br', cidade: 'Brasília', estado: 'DF' },
      { nome: 'Transportes Theta Ltda', cnpj: '89.012.345/0001-67', telefone: '(62) 99999-0008', email: 'theta@transporte.com.br', cidade: 'Goiânia', estado: 'GO' },
      { nome: 'Móveis Iota Ltda', cnpj: '90.123.456/0001-78', telefone: '(71) 99999-0009', email: 'iota@moveis.com.br', cidade: 'Salvador', estado: 'BA' },
      { nome: 'Papelaria Kappa Ltda', cnpj: '01.234.567/0001-89', telefone: '(81) 99999-0010', email: 'kappa@papel.com.br', cidade: 'Recife', estado: 'PE' },
    ];

    const fornecedorIds = [];
    for (const f of fornecedorData) {
      const result = await sql`INSERT INTO fornecedores (nome, cnpj, telefone, email, cidade, estado) VALUES (${f.nome}, ${f.cnpj}, ${f.telefone}, ${f.email}, ${f.cidade}, ${f.estado}) RETURNING id`;
      fornecedorIds.push(result[0].id);
    }

    const licitacaoData = [];
    for (let i = 1; i <= 15; i++) {
      const num = Math.floor(Math.random() * 100) + 1;
      const ano = 2024 + Math.floor(Math.random() * 2);
      const mod = modalidades[Math.floor(Math.random() * modalidades.length)];
      const sec = secretarias[Math.floor(Math.random() * secretarias.length)];
      const sta = statuses[Math.floor(Math.random() * statuses.length)];
      const valor = Math.floor(Math.random() * 500000) + 10000;
      
      const result = await sql`
        INSERT INTO licitacoes (numero, ano, modalidade, objeto, secretaria, valor_estimado, fonte_recurso, status, data_criacao, data_publicacao, data_sessao, data_homologacao, observacoes)
        VALUES (${num}, ${ano}, ${mod}, 'Contratação de ' + ${sec.toLowerCase()} + ' - Processo Licitatório ' + ${num}, ${sec}, ${valor}, 'Recursos Próprios', ${sta}, ${randomDate(new Date(2024, 0, 1), new Date(2024, 6, 30)).toISOString().split('T')[0]}, ${randomDate(new Date(2024, 3, 1), new Date(2024, 8, 30)).toISOString().split('T')[0]}, ${randomDate(new Date(2024, 5, 1), new Date(2024, 11, 31)).toISOString().split('T')[0]}, ${randomDate(new Date(2024, 8, 1), new Date(2025, 2, 31)).toISOString().split('T')[0]}, 'Licitação referente à contratação de serviços para ' + ${sec.toLowerCase()})
        RETURNING id`;
      licitacaoData.push({ id: result[0].id, valor });
    }

    for (let i = 1; i <= 10; i++) {
      const lic = licitacaoData[Math.floor(Math.random() * licitacaoData.length)];
      const forn = fornecedorIds[Math.floor(Math.random() * fornecedorIds.length)];
      const sta = statusContrato[Math.floor(Math.random() * statusContrato.length)];
      const dataIni = randomDate(new Date(2024, 6, 1), new Date(2024, 9, 30));
      const dataFim = new Date(dataIni);
      dataFim.setFullYear(dataFim.getFullYear() + 1);
      
      await sql`
        INSERT INTO contratos (licitacao_id, numero, ano, objeto, fornecedor_id, valor_total, data_inicio, data_fim, status)
        VALUES (${lic.id}, ${'CTR-' + String(i).padStart(4, '0')}, ${2024}, 'Contrato de prestação de serviços - ' + ${i}, ${forn}, ${Math.floor(lic.valor * 0.9)}, ${dataIni.toISOString().split('T')[0]}, ${dataFim.toISOString().split('T')[0]}, ${sta})`;
    }

    const entidadeData = [
      'Associação Comunitária', 'Instituto Social', 'Fundação Cultural', 'Centro de Educação', 'Casa de Assistência', 'Clube de Mães', 'Entidade Filantrópica', 'Associação de Pais', 'Instituto Ambiental', 'Fundação Educacional'
    ];

    for (let i = 1; i <= 8; i++) {
      const ent = entidadeData[Math.floor(Math.random() * entidadeData.length)];
      const sta = statusConvenio[Math.floor(Math.random() * statusConvenio.length)];
      const valor = Math.floor(Math.random() * 200000) + 50000;
      const dataIni = randomDate(new Date(2024, 0, 1), new Date(2024, 6, 30));
      const dataFim = new Date(dataIni);
      dataFim.setFullYear(dataFim.getFullYear() + 2);
      
      await sql`
        INSERT INTO convenios (numero, ano, objeto, entidade_conveniada, valor_total, data_inicio, data_fim, status)
        VALUES (${String(i).padStart(3, '0')}, ${2024}, 'Convênio de cooperação - ' + ${ent}, ${ent} + ' Municipal', ${valor}, ${dataIni.toISOString().split('T')[0]}, ${dataFim.toISOString().split('T')[0]}, ${sta})`;
    }

    return Response.json({ 
      message: 'Dados de teste inseridos com sucesso!',
      fornecedores: fornecedorIds.length,
      licitacoes: licitacaoData.length,
      contratos: 10,
      convenios: 8
    });
  } catch (err) {
    return Response.json({ erro: err.message }, { status: 500 });
  }
}