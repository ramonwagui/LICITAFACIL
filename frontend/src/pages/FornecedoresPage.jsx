import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Plus, Search, Eye, Edit, Trash2, Users, Building2, Phone, Mail } from 'lucide-react';
import { api } from '../services/api';

const FornecedoresPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [fornecedores, setFornecedores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState(searchParams.get('busca') || '');
  const [status, setStatus] = useState(searchParams.get('status') || '');
  const [deleteModal, setDeleteModal] = useState(null);

  useEffect(function() {
    loadFornecedores();
  }, [busca, status]);

  function loadFornecedores() {
    setLoading(true);
    api.getFornecedores({ busca: busca, status: status }).then(function(data) {
      setFornecedores(data);
    }).catch(function(err) {
      console.error(err);
    }).finally(function() {
      setLoading(false);
    });
  }

  function handleDelete(id) {
    api.deleteFornecedor(id).then(function() {
      setDeleteModal(null);
      loadFornecedores();
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

  function getStatusColor(status) {
    var colors = {
      ativo: 'bg-green-100 text-green-800',
      inativo: 'bg-gray-100 text-gray-800',
      bloqueado: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  }

  function getStatusLabel(status) {
    var labels = {
      ativo: 'Ativo',
      inativo: 'Inativo',
      bloqueado: 'Bloqueado',
    };
    return labels[status] || status;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Fornecedores</h1>
          <p className="text-gray-500">Gerencie o cadastro de fornecedores</p>
        </div>
        <Link
          to="/fornecedores/novo"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-white font-medium rounded-lg hover:bg-primary-dark transition"
        >
          <Plus className="w-5 h-5" />
          Novo Fornecedor
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
                placeholder="Buscar por razão social, CNPJ ou nome fantasia..."
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
                <option value="ativo">Ativo</option>
                <option value="inativo">Inativo</option>
                <option value="bloqueado">Bloqueado</option>
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
        ) : fornecedores.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="text-gray-500">Nenhum fornecedor encontrado</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Fornecedor</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">CNPJ/CPF</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Contato</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Categoria</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {fornecedores.map(function(fornecedor) {
                  return (
                    <tr key={fornecedor.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-gray-900">{fornecedor.razao_social}</p>
                          {fornecedor.nome_fantasia && (
                            <p className="text-sm text-gray-500">{fornecedor.nome_fantasia}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-800">{fornecedor.cnpj || fornecedor.cpf || '-'}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          {fornecedor.email && (
                            <p className="text-sm text-gray-600 flex items-center gap-1">
                              <Mail className="w-3 h-3" /> {fornecedor.email}
                            </p>
                          )}
                          {fornecedor.telefone && (
                            <p className="text-sm text-gray-600 flex items-center gap-1">
                              <Phone className="w-3 h-3" /> {fornecedor.telefone}
                            </p>
                          )}
                          {!fornecedor.email && !fornecedor.telefone && <span className="text-sm text-gray-400">-</span>}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-600">{fornecedor.categoria || '-'}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={'px-2.5 py-1 rounded-full text-xs font-medium ' + getStatusColor(fornecedor.status)}>
                          {getStatusLabel(fornecedor.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-1">
                          <Link
                            to={'/fornecedores/' + fornecedor.id}
                            className="p-2 text-gray-400 hover:text-primary transition"
                            title="Visualizar"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          <Link
                            to={'/fornecedores/' + fornecedor.id + '/editar'}
                            className="p-2 text-gray-400 hover:text-primary transition"
                            title="Editar"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => setDeleteModal(fornecedor)}
                            className="p-2 text-gray-400 hover:text-danger transition"
                            title="Excluir"
                          >
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
              Tem certeza que deseja excluir o fornecedor "{deleteModal.razao_social}"? Esta ação não pode ser desfeita.
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

export default FornecedoresPage;