import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from 'recharts';
import { api } from '../services/api';
import { formatarMoeda, getStatusLabel, getModalidadeLabel } from '../utils/formatters';

const RelatoriosPage = () => {
  const [loading, setLoading] = useState(true);
  const [licitacoes, setLicitacoes] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const data = await api.getLicitacoes();
      setLicitacoes(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const coresStatus = {
    em_elaboracao: '#3B82F6',
    publicado: '#10B981',
    em_julgamento: '#F59E0B',
    homologado: '#8B5CF6',
    concluido: '#059669',
    suspenso: '#6B7280',
    cancelado: '#EF4444',
  };

  const coresModalidade = {
    pregao: '#1E3A5F',
    concorrencia: '#3B82F6',
    dispensa: '#10B981',
    inexigibilidade: '#F59E0B',
    tomada_de_precos: '#8B5CF6',
    convite: '#EC4899',
  };

  const dadosPorStatus = Object.entries(
    licitacoes.reduce((acc, lic) => {
      acc[lic.status] = (acc[lic.status] || 0) + 1;
      return acc;
    }, {})
  ).map(([status, total]) => ({
    name: getStatusLabel(status),
    value: total,
    color: coresStatus[status],
  }));

  const dadosPorModalidade = Object.entries(
    licitacoes.reduce((acc, lic) => {
      acc[lic.modalidade] = (acc[lic.modalidade] || 0) + 1;
      return acc;
    }, {})
  ).map(([modalidade, total]) => ({
    name: getModalidadeLabel(modalidade),
    value: total,
    color: coresModalidade[modalidade],
  }));

  const dadosPorSecretaria = Object.entries(
    licitacoes.reduce((acc, lic) => {
      const sec = lic.secretaria || 'Não informada';
      acc[sec] = (acc[sec] || 0) + 1;
      return acc;
    }, {})
  ).map(([secretaria, total]) => ({
    name: secretaria,
    value: total,
  })).sort((a, b) => b.value - a.value).slice(0, 8);

  const dadosPorAno = Object.entries(
    licitacoes.reduce((acc, lic) => {
      acc[lic.ano] = (acc[lic.ano] || 0) + 1;
      return acc;
    }, {})
  ).map(([ano, total]) => ({
    ano: parseInt(ano),
    total,
  })).sort((a, b) => a.ano - b.ano);

  const totalValor = licitacoes.reduce((acc, lic) => acc + (lic.valor_estimado || 0), 0);
  const mediaValor = licitacoes.length > 0 ? totalValor / licitacoes.length : 0;
  const valorPorModalidade = Object.entries(
    licitacoes.reduce((acc, lic) => {
      acc[lic.modalidade] = (acc[lic.modalidade] || 0) + (lic.valor_estimado || 0);
      return acc;
    }, {})
  ).map(([modalidade, valor]) => ({
    modalidade: getModalidadeLabel(modalidade),
    valor,
  })).sort((a, b) => b.valor - a.valor);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Relatórios</h1>
        <p className="text-gray-500">Estatísticas e análises das suas licitações</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500 mb-1">Total de Licitações</p>
          <p className="text-3xl font-bold text-gray-800">{licitacoes.length}</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500 mb-1">Valor Total Estimado</p>
          <p className="text-3xl font-bold text-gray-800">{formatarMoeda(totalValor)}</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500 mb-1">Valor Médio por Licitação</p>
          <p className="text-3xl font-bold text-gray-800">{formatarMoeda(mediaValor)}</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500 mb-1">Modalidades Utilizadas</p>
          <p className="text-3xl font-bold text-gray-800">{dadosPorModalidade.length}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Licitações por Status</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={dadosPorStatus}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                  labelLine={false}
                >
                  {dadosPorStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-3 mt-4 justify-center">
            {dadosPorStatus.map((item) => (
              <div key={item.name} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                <span className="text-sm text-gray-600">{item.name}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Licitações por Modalidade</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dadosPorModalidade} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis type="category" dataKey="name" width={100} />
                <Tooltip />
                <Bar dataKey="value" fill="#1E3A5F" radius={[0, 4, 4, 0]}>
                  {dadosPorModalidade.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Licitações por Secretaria</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dadosPorSecretaria}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Valor por Modalidade (R$)</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={valorPorModalidade}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="modalidade" />
                <YAxis tickFormatter={(v) => `R$ ${(v/1000).toFixed(0)}k`} />
                <Tooltip formatter={(value) => formatarMoeda(value)} />
                <Bar dataKey="valor" fill="#10B981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {dadosPorAno.length > 1 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Evolução de Licitações por Ano</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dadosPorAno}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="ano" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="total" stroke="#1E3A5F" strokeWidth={2} dot={{ fill: '#1E3A5F' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Tabela Consolidada</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Modalidade</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">Quantidade</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">Valor Total</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">Valor Médio</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {valorPorModalidade.map((item, idx) => {
                const qtd = dadosPorModalidade.find(d => d.name === item.modalidade)?.value || 0;
                const media = qtd > 0 ? item.valor / qtd : 0;
                return (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-800">{item.modalidade}</td>
                    <td className="px-4 py-3 text-sm text-gray-800 text-right">{qtd}</td>
                    <td className="px-4 py-3 text-sm text-gray-800 text-right">{formatarMoeda(item.valor)}</td>
                    <td className="px-4 py-3 text-sm text-gray-800 text-right">{formatarMoeda(media)}</td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot className="bg-gray-50 font-medium">
              <tr>
                <td className="px-4 py-3 text-sm text-gray-800">Total</td>
                <td className="px-4 py-3 text-sm text-gray-800 text-right">{licitacoes.length}</td>
                <td className="px-4 py-3 text-sm text-gray-800 text-right">{formatarMoeda(totalValor)}</td>
                <td className="px-4 py-3 text-sm text-gray-800 text-right">{formatarMoeda(mediaValor)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};

export default RelatoriosPage;