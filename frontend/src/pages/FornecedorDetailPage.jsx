import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Edit, Building2, Phone, Mail, MapPin, User } from 'lucide-react';
import { api } from '../services/api';
import { formatarData } from '../utils/formatters';

const FornecedorDetailPage = function() {
  var _a = useParams(), id = _a.id;
  var navigate = useNavigate();
  var _b = useState(true), loading = _b[0], setLoading = _b[1];
  var _c = useState(null), fornecedor = _c[0], setFornecedor = _c[1];

  useEffect(function() {
    api.getFornecedor(id).then(function(data) {
      setFornecedor(data);
    }).catch(function(err) {
      console.error(err);
    }).finally(function() {
      setLoading(false);
    });
  }, [id]);

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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!fornecedor) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Fornecedor não encontrado</p>
        <button onClick={() => navigate('/fornecedores')} className="text-primary hover:underline mt-2">
          Voltar para Fornecedores
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/fornecedores')}
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-800"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar para Fornecedores
        </button>
        <Link
          to={'/fornecedores/' + id + '/editar'}
          className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
        >
          <Edit className="w-4 h-4" />
          Editar
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">{fornecedor.razao_social}</h1>
                  {fornecedor.nome_fantasia && (
                    <p className="text-gray-500">{fornecedor.nome_fantasia}</p>
                  )}
                </div>
              </div>
            </div>
            <span className={'px-3 py-1 rounded-full text-sm font-medium ' + getStatusColor(fornecedor.status)}>
              {getStatusLabel(fornecedor.status)}
            </span>
          </div>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <p className="text-sm text-gray-500 mb-1">CNPJ</p>
            <p className="text-gray-800">{fornecedor.cnpj || '-'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">CPF</p>
            <p className="text-gray-800">{fornecedor.cpf || '-'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Categoria</p>
            <p className="text-gray-800">{fornecedor.categoria || '-'}</p>
          </div>

          <div>
            <p className="text-sm text-gray-500 mb-1 flex items-center gap-1">
              <Mail className="w-4 h-4" /> E-mail
            </p>
            <p className="text-gray-800">{fornecedor.email || '-'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1 flex items-center gap-1">
              <Phone className="w-4 h-4" /> Telefone
            </p>
            <p className="text-gray-800">{fornecedor.telefone || '-'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1 flex items-center gap-1">
              <User className="w-4 h-4" /> Contato
            </p>
            <p className="text-gray-800">{fornecedor.contato || '-'}</p>
          </div>

          <div className="md:col-span-2">
            <p className="text-sm text-gray-500 mb-1 flex items-center gap-1">
              <MapPin className="w-4 h-4" /> Endereço
            </p>
            <p className="text-gray-800">
              {fornecedor.endereco ? fornecedor.endereco + ', ' : ''}
              {fornecedor.cidade ? fornecedor.cidade + ' - ' : ''}
              {fornecedor.uf || ''}
              {fornecedor.cep ? ' • CEP: ' + fornecedor.cep : ''}
            </p>
          </div>

          {fornecedor.observacoes && (
            <div className="md:col-span-3">
              <p className="text-sm text-gray-500 mb-1">Observações</p>
              <p className="text-gray-800">{fornecedor.observacoes}</p>
            </div>
          )}

          <div>
            <p className="text-sm text-gray-500 mb-1">Cadastrado em</p>
            <p className="text-gray-800">{formatarData(fornecedor.created_at)}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FornecedorDetailPage;