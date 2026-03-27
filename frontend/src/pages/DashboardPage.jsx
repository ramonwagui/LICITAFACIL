import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Clock, CheckCircle, AlertTriangle, TrendingUp, Eye, BarChart3 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { api } from '../services/api';
import { formatarData, formatarMoeda, getStatusLabel, getStatusColor, getModalidadeLabel, getPrazoStatus } from '../utils/formatters';

const DashboardPage = () => {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const data = await api.getDashboard();
      setDashboard(data);
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

  const stats = dashboard?.stats || {};
  const atrasadas = dashboard?.atrasados?.filter(l => l.status !== 'concluido' && l.status !== 'cancelado').length || 0;

  const coresStatus = {
    em_elaboracao: '#3B82F6',
    publicado: '#10B981',
    em_julgamento: '#F59E0B',
    homologado: '#8B5CF6',
    concluido: '#059669',
    suspenso: '#6B7280',
    cancelado: '#EF4444',
  };

  const dadosGraficoStatus = Object.entries(stats)
    .filter(([k]) => k !== 'total')
    .map(([status, total]) => ({
      name: getStatusLabel(status),
      value: total,
      color: coresStatus[status],
    }));

  const dadosGraficoModalidade = (dashboard?.recentes || []).reduce((acc, lic) => {
    const mod = getModalidadeLabel(lic.modalidade);
    acc[mod] = (acc[mod] || 0) + 1;
    return acc;
  }, {});

  const dadosModalidade = Object.entries(dadosGraficoModalidade).map(([name, value]) => ({ name, value }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-500">Visão geral das suas licitações</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-primary" />
            </div>
            <span className="text-3xl font-bold text-gray-800">{stats.total || 0}</span>
          </div>
          <p className="text-sm text-gray-500">Total de Licitações</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-blue-600" />
            </div>
            <span className="text-3xl font-bold text-gray-800">{stats.em_elaboracao || 0}</span>
          </div>
          <p className="text-sm text-gray-500">Em Elaboração</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <span className="text-3xl font-bold text-gray-800">{stats.publicado || 0}</span>
          </div>
          <p className="text-sm text-gray-500">Publicadas</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-emerald-600" />
            </div>
            <span className="text-3xl font-bold text-gray-800">{stats.concluido || 0}</span>
          </div>
          <p className="text-sm text-gray-500">Concluídas</p>
        </div>
      </div>

      {atrasadas > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
          <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0" />
          <div>
            <p className="font-medium text-red-800">Atenção: {atrasadas} licitação(s) atrasada(s)</p>
            <p className="text-sm text-red-600">Verifique as licitações com prazo de sessão vencido</p>
          </div>
          <Link to="/licitacoes?status=publicado" className="ml-auto text-sm text-red-700 hover:underline">
            Ver →
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-semibold text-gray-800">Licitações Recentes</h3>
            <Link to="/licitacoes" className="text-sm text-primary hover:underline">
              Ver todas →
            </Link>
          </div>
          <div className="divide-y divide-gray-100">
            {dashboard?.recentes?.length > 0 ? (
              dashboard.recentes.map((licitacao) => (
                <Link
                  key={licitacao.id}
                  to={`/licitacoes/${licitacao.id}`}
                  className="p-4 hover:bg-gray-50 flex items-center justify-between transition"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-800 truncate">
                      {licitacao.numero}/{licitacao.ano} - {getModalidadeLabel(licitacao.modalidade)}
                    </p>
                    <p className="text-sm text-gray-500 truncate">{licitacao.objeto}</p>
                  </div>
                  <div className="flex items-center gap-3 ml-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(licitacao.status)}`}>
                      {getStatusLabel(licitacao.status)}
                    </span>
                    <Eye className="w-4 h-4 text-gray-400" />
                  </div>
                </Link>
              ))
            ) : (
              <div className="p-8 text-center text-gray-500">Nenhuma licença encontrada</div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="font-semibold text-gray-800 mb-4">Por Status</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={dadosGraficoStatus}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={70}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {dadosGraficoStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-2 mt-2 justify-center">
            {dadosGraficoStatus.map((item) => (
              <div key={item.name} className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }}></div>
                <span className="text-xs text-gray-500">{item.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="font-semibold text-gray-800 mb-4">Modalidades</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dadosModalidade}>
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="value" fill="#1E3A5F" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="font-semibold text-gray-800 mb-4">Prazos Próximos</h3>
          <div className="space-y-3">
            {dashboard?.proximosPrazos?.length > 0 ? (
              dashboard.proximosPrazos.map((licitacao) => (
                <Link
                  key={licitacao.id}
                  to={`/licitacoes/${licitacao.id}`}
                  className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-800">{licitacao.numero}/{licitacao.ano}</span>
                    <span className={`text-sm ${
                      getPrazoStatus(licitacao.data_sessao) === 'proximo' ? 'text-red-600' : 'text-yellow-600'
                    }`}>
                      {formatarData(licitacao.data_sessao)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 truncate">{licitacao.objeto}</p>
                </Link>
              ))
            ) : (
              <div className="text-center py-4 text-gray-500">
                Nenhum prazo próximo
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-800">Resumo por Status</h3>
          <Link to="/relatorios" className="text-sm text-primary hover:underline flex items-center gap-1">
            <BarChart3 className="w-4 h-4" />
            Ver relatórios completos →
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {Object.entries(stats).filter(([k]) => k !== 'total').map(([key, value]) => (
            <div key={key} className="text-center p-3 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-gray-800">{value || 0}</p>
              <p className="text-xs text-gray-500">{getStatusLabel(key)}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;