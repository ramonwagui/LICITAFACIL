import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Plus, Search, Eye, Edit, Trash2, Globe, AlertTriangle } from 'lucide-react';
import { api } from '../services/api';
import { formatarData, formatarMoeda } from '../utils/formatters';

const ConveniosPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [convenios, setConvenios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState(searchParams.get('busca') || '');
  const [status, setStatus] = useState(searchParams.get('status') || '');
  const [deleteModal, setDeleteModal] = useState(null);

  useEffect(function() {
    loadConvenios();
  }, [busca, status]);

  function loadConvenios() {
    setLoading(true);
    api.getConvenios({ busca: busca, status: status }).then(function(data) {
      setConvenios(data);
    }).catch(function(err) {
      console.error(err);
    }).finally(function() {
      setLoading(false);
    });
  }

  function handleDelete(id) {
    api.deleteConvenio(id).then(function() {
      setDeleteModal(null);
      loadConvenios();
    }).catch(function(err) {
      alert(err.message);
    });
  }

  function handleSearch(e) {
    e.preventDefault();
    var params = new URLSearchParams();
    if (busca) params.set('busca', busca);
    if (status) params.set('status', status);
    setSearchParams(params);
  }

  function getStatusColor(st) {
    var colors = {
      em_andamento: 'bg-blue-100 text-blue-800',
      prestacao: 'bg-yellow-100 text-yellow-800',
      encerrado: 'bg-gray-100 text-gray-800',
      inadimplente: 'bg-red-100 text-red-800',
    };
    return colors[st] || 'bg-gray-100 text-gray-800';
  }

  function getStatusLabel(st) {
    var labels = {
      em_andamento: 'Em Andamento',
      prestacao: 'Prestação de Contas',
      encerrado: 'Encerrado',
      inadimplente: 'Inadimplente',
    };
    return labels[st] || st;
  }

  function getVencimentoStatus(dataFim, status) {
    if (!dataFim || status !== 'em_andamento') return null;
    var hoje = new Date();
    var fim = new Date(dataFim);
    var dias = Math.ceil((fim - hoje) / (1000 * 60 * 60 * 24));
    if (dias < 0) return 'vencido';
    if (dias <= 60) return 'proximo';
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Convênios</h1>
          <p className="text-gray-500">Gerencie convênios e contratos de repasses</p>
        </div>
        <Link
          to="/convenios/novo"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-white font-medium rounded-lg hover:bg-primary-dark transition"
        >
          <Plus className="w-5 h-5" />
          Novo Convênio
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
                placeholder="Buscar por número, objeto ou concedente..."
                className="w-full h-11 pl-10 pr-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
              />
            </div>
            <div>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="h-11 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
              >
                <option value="">Todos os status</option>
                <option value="em_andamento">Em Andamento</option>
                <option value="prestacao">Prestação de Contas</option>
                <option value="encerrado">Encerrado</option>
                <option value="inadimplente">Inadimplente</option>
              </select>
            </div>
            <button
              type="submit"
              className="h-11 px-4 bg-primary text-white font-medium rounded-lg hover:bg-primary-dark transition"
            >
              Buscar
            </button>
          </div>
        </form>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : convenios.length === 0 ? (
          <div className="text-center py-12">
            <Globe className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="text-gray-500">Nenhum convênio encontrado</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Número</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Objeto</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Concedente</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Valor Total</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Vencimento</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {convenios.map(function(conv) {
                  var vencimento = getVencimentoStatus(conv.data_fim, conv.status);
                  return (
                    <tr key={conv.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <span className="font-medium text-gray-900">
                          {conv.numero}/{conv.ano}
                        </span>
                      </td>
                      <td className="px-6 py-4 max-w-xs">
                        <p className="text-sm text-gray-700 truncate" title={conv.objeto}>
                          {conv.objeto}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-800">{conv.concedente}</p>
                        {conv.cnpj_concedente && <p className="text-xs text-gray-400">{conv.cnpj_concedente}</p>}
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-medium text-gray-800">
                          {formatarMoeda(conv.valor_total)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {conv.data_fim ? (
                          <span className={'text-sm ' + (
                            vencimento === 'vencido' ? 'text-red-600 font-medium' :
                            vencimento === 'proximo' ? 'text-yellow-600 font-medium' :
                            'text-gray-600'
                          )}>
                            {formatarData(conv.data_fim)}
                            {vencimento === 'vencido' && <AlertTriangle className="w-3 h-3 inline ml-1" />}
                          </span>
                        ) : (
                          <span className="text-sm text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={'px-2.5 py-1 rounded-full text-xs font-medium ' + getStatusColor(conv.status)}>
                          {getStatusLabel(conv.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-1">
                          <Link to={'/convenios/' + conv.id} className="p-2 text-gray-400 hover:text-primary transition" title="Visualizar">
                            <Eye className="w-4 h-4" />
                          </Link>
                          <Link to={'/convenios/' + conv.id + '/editar'} className="p-2 text-gray-400 hover:text-primary transition" title="Editar">
                            <Edit className="w-4 h-4" />
                          </Link>
                          <button onClick={() => setDeleteModal(conv)} className="p-2 text-gray-400 hover:text-danger transition" title="Excluir">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
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
              Tem certeza que deseja excluir o convênio {deleteModal.numero}/{deleteModal.ano}? Esta ação não pode ser desfeita.
            </p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setDeleteModal(null)} className="px-4 py-2 text-gray-600 hover:text-gray-800">Cancelar</button>
              <button onClick={() => handleDelete(deleteModal.id)} className="px-4 py-2 bg-danger text-white font-medium rounded-lg hover:bg-red-600 transition">Excluir</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConveniosPage;