import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Plus, Search, Filter, Eye, Edit, Trash2, ChevronDown } from 'lucide-react';
import { api } from '../services/api';
import { formatarData, formatarMoeda, getStatusLabel, getStatusColor, getModalidadeLabel, getPrazoStatus } from '../utils/formatters';

const LicitacoesPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [licitacoes, setLicitacoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState(searchParams.get('busca') || '');
  const [modalidade, setModalidade] = useState(searchParams.get('modalidade') || '');
  const [status, setStatus] = useState(searchParams.get('status') || '');
  const [ordenar, setOrdenar] = useState('data_desc');
  const [showFilters, setShowFilters] = useState(false);
  const [deleteModal, setDeleteModal] = useState(null);

  useEffect(() => {
    loadLicitacoes();
  }, [busca, modalidade, status, ordenar]);

  const loadLicitacoes = async () => {
    setLoading(true);
    try {
      const data = await api.getLicitacoes({ busca, modalidade, status, ordenar });
      setLicitacoes(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.deleteLicitacao(id);
      setDeleteModal(null);
      loadLicitacoes();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (busca) params.set('busca', busca);
    if (modalidade) params.set('modalidade', modalidade);
    if (status) params.set('status', status);
    setSearchParams(params);
  };

  const limparFiltros = () => {
    setBusca('');
    setModalidade('');
    setStatus('');
    setSearchParams({});
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Licitações</h1>
          <p className="text-gray-500">Gerencie seus processos licitatórios</p>
        </div>
        <Link
          to="/licitacoes/novo"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-white font-medium rounded-lg hover:bg-primary-dark transition"
        >
          <Plus className="w-5 h-5" />
          Nova Licitação
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <form onSubmit={handleSearch} className="p-4 border-b border-gray-100">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Buscar por número ou objeto..."
                className="w-full h-11 pl-10 pr-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
              />
            </div>
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className="inline-flex items-center gap-2 px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
            >
              <Filter className="w-5 h-5" />
              Filtros
              <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {showFilters && (
            <div className="mt-4 flex flex-wrap gap-4 pt-4 border-t border-gray-100">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Modalidade</label>
                <select
                  value={modalidade}
                  onChange={(e) => setModalidade(e.target.value)}
                  className="h-10 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                >
                  <option value="">Todas</option>
                  <option value="pregao">Pregão</option>
                  <option value="concorrencia">Concorrência</option>
                  <option value="dispensa">Dispensa</option>
                  <option value="inexigibilidade">Inexigibilidade</option>
                  <option value="tomada_de_precos">Tomada de Preços</option>
                  <option value="convite">Convite</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="h-10 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                >
                  <option value="">Todos</option>
                  <option value="em_elaboracao">Em Elaboração</option>
                  <option value="publicado">Publicado</option>
                  <option value="em_julgamento">Em Julgamento</option>
                  <option value="homologado">Homologado</option>
                  <option value="concluido">Concluído</option>
                  <option value="suspenso">Suspenso</option>
                  <option value="cancelado">Cancelado</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ordenar</label>
                <select
                  value={ordenar}
                  onChange={(e) => setOrdenar(e.target.value)}
                  className="h-10 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                >
                  <option value="data_desc">Mais recentes</option>
                  <option value="data_asc">Mais antigas</option>
                </select>
              </div>

              <div className="flex items-end gap-2">
                <button
                  type="submit"
                  className="h-10 px-4 bg-primary text-white font-medium rounded-lg hover:bg-primary-dark transition"
                >
                  Aplicar
                </button>
                <button
                  type="button"
                  onClick={limparFiltros}
                  className="h-10 px-4 text-gray-600 hover:text-gray-800"
                >
                  Limpar
                </button>
              </div>
            </div>
          )}
        </form>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : licitacoes.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Nenhuma licença encontrada</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Número</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Objeto</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Modalidade</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Valor</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Prazo</th>
                  <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {licitacoes.map((licitacao) => (
                  <tr key={licitacao.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <span className="font-medium text-gray-900">
                        {licitacao.numero}/{licitacao.ano}
                      </span>
                    </td>
                    <td className="px-6 py-4 max-w-xs">
                      <p className="text-sm text-gray-700 truncate" title={licitacao.objeto}>
                        {licitacao.objeto}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600">
                        {getModalidadeLabel(licitacao.modalidade)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-gray-800">
                        {formatarMoeda(licitacao.valor_estimado)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(licitacao.status)}`}>
                        {getStatusLabel(licitacao.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {licitacao.data_sessao ? (
                        <span className={`text-sm ${
                          getPrazoStatus(licitacao.data_sessao) === 'atrasado' ? 'text-red-600' :
                          getPrazoStatus(licitacao.data_sessao) === 'proximo' ? 'text-red-600' :
                          getPrazoStatus(licitacao.data_sessao) === 'aviso' ? 'text-yellow-600' : 'text-green-600'
                        }`}>
                          {formatarData(licitacao.data_sessao)}
                        </span>
                      ) : (
                        <span className="text-sm text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          to={`/licitacoes/${licitacao.id}`}
                          className="p-2 text-gray-400 hover:text-primary transition"
                          title="Visualizar"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <Link
                          to={`/licitacoes/${licitacao.id}/editar`}
                          className="p-2 text-gray-400 hover:text-primary transition"
                          title="Editar"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => setDeleteModal(licitacao)}
                          className="p-2 text-gray-400 hover:text-danger transition"
                          title="Excluir"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {deleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Confirmar Exclusão</h3>
            <p className="text-gray-600 mb-4">
              Tem certeza que deseja excluir a licitação {deleteModal.numero}/{deleteModal.ano}? Esta ação não pode ser desfeita.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteModal(null)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleDelete(deleteModal.id)}
                className="px-4 py-2 bg-danger text-white font-medium rounded-lg hover:bg-red-600 transition"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LicitacoesPage;