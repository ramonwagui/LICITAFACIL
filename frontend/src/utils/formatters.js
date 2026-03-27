export function formatarData(data) {
  if (!data) return '-';
  const d = new Date(data);
  return d.toLocaleDateString('pt-BR');
}

export function formatarMoeda(valor) {
  if (valor === null || valor === undefined) return 'R$ 0,00';
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);
}

export function getStatusLabel(status) {
  const labels = {
    em_elaboracao: 'Em Elaboração',
    publicado: 'Publicado',
    em_julgamento: 'Em Julgamento',
    homologado: 'Homologado',
    concluido: 'Concluído',
    suspenso: 'Suspenço',
    cancelado: 'Cancelado',
  };
  return labels[status] || status;
}

export function getStatusColor(status) {
  const colors = {
    em_elaboracao: 'bg-blue-100 text-blue-800',
    publicado: 'bg-green-100 text-green-800',
    em_julgamento: 'bg-yellow-100 text-yellow-800',
    homologado: 'bg-purple-100 text-purple-800',
    concluido: 'bg-emerald-100 text-emerald-800',
    suspenso: 'bg-gray-100 text-gray-800',
    cancelado: 'bg-red-100 text-red-800',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
}

export function getModalidadeLabel(modalidade) {
  const labels = {
    pregao: 'Pregão',
    concorrencia: 'Concorrência',
    dispensa: 'Dispensa',
    inexigibilidade: 'Inexigibilidade',
    tomada_de_precos: 'Tomada de Preços',
    convite: 'Convite',
  };
  return labels[modalidade] || modalidade;
}

export function getPrazoColor(dataSessao) {
  if (!dataSessao) return 'text-gray-500';
  const hoje = new Date();
  const sessao = new Date(dataSessao);
  const dias = Math.ceil((sessao - hoje) / (1000 * 60 * 60 * 24));
  
  if (dias < 0) return 'text-red-600';
  if (dias <= 3) return 'text-red-600';
  if (dias <= 7) return 'text-yellow-600';
  return 'text-green-600';
}

export function getPrazoStatus(dataSessao) {
  if (!dataSessao) return 'sem-prazo';
  const hoje = new Date();
  const sessao = new Date(dataSessao);
  const dias = Math.ceil((sessao - hoje) / (1000 * 60 * 60 * 24));
  
  if (dias < 0) return 'atrasado';
  if (dias <= 3) return 'proximo';
  if (dias <= 7) return 'aviso';
  return 'normal';
}