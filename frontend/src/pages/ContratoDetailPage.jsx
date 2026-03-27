import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Edit, Trash2, FileText, Calendar, DollarSign } from 'lucide-react';
import { api } from '../services/api';
import { formatarData, formatarMoeda } from '../utils/formatters';

const ContratoDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [contrato, setContrato] = useState(null);

  useEffect(() => {
    loadContrato();
  }, [id]);

  const loadContrato = async () => {
    try {
      const data = await api.getContrato(id);
      setContrato(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      ativo: 'bg-green-100 text-green-800',
      rescindido: 'bg-red-100 text-red-800',
      expired: 'bg-yellow-100 text-yellow-800',
      concluido: 'bg-gray-100 text-gray-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (status) => {
    const labels = {
      ativo: 'Ativo',
      rescindido: 'Rescindido',
      expired: 'Vencido',
      concluido: 'Concluído',
    };
    return labels[status] || status;
  };

  const getVencimentoStatus = (dataFim, status) => {
    if (!dataFim || status !== 'ativo') return null;
    const hoje = new Date();
    const fim = new Date(dataFim);
    const dias = Math.ceil((fim - hoje) / (1000 * 60 * 60 * 24));
    if (dias < 0) return 'vencido';
    if (dias <= 30) return 'proximo';
    return 'normal';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!contrato) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Contrato não encontrado</p>
        <button onClick={() => navigate('/contratos')} className="text-primary hover:underline mt-2">
          Voltar para Contratos
        </button>
      </div>
    );
  }

  const vencimento = getVencimentoStatus(contrato.data_fim, contrato.status);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/contratos')}
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-800"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar para Contratos
        </button>
        <div className="flex gap-2">
          <Link
            to={'/contratos/' + id + '/editar'}
            className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
          >
            <Edit className="w-4 h-4" />
            Editar
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold text-gray-800">
                  Contrato {contrato.numero}/{contrato.ano}
                </h1>
                <span className={'px-3 py-1 rounded-full text-sm font-medium ' + getStatusColor(contrato.status)}>
                  {getStatusLabel(contrato.status)}
                </span>
              </div>
              <p className="text-gray-500">{contrato.objeto}</p>
            </div>
          </div>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <p className="text-sm text-gray-500 mb-1">Contratada</p>
            <p className="text-gray-800 font-medium">{contrato.contratada || '-'}</p>
            {contrato.cnpj && <p className="text-sm text-gray-500">{contrato.cnpj}</p>}
          </div>

          <div>
            <p className="text-sm text-gray-500 mb-1">Valor do Contrato</p>
            <p className="text-2xl font-bold text-gray-800">{formatarMoeda(contrato.valor_final)}</p>
            {contrato.valor_inicial && contrato.valor_inicial !== contrato.valor_final && (
              <p className="text-sm text-gray-500">Inicial: {formatarMoeda(contrato.valor_inicial)}</p>
            )}
          </div>

          <div>
            <p className="text-sm text-gray-500 mb-1">Licitação Vinculada</p>
            {contrato.licitacao_id ? (
              <Link to={'/licitacoes/' + contrato.licitacao_id} className="text-primary hover:underline">
                {contrato.licitacao_numero}/{contrato.licitacao_ano}
              </Link>
            ) : (
              <p className="text-gray-800">-</p>
            )}
          </div>

          <div>
            <p className="text-sm text-gray-500 mb-1">Data de Assinatura</p>
            <p className="text-gray-800">{formatarData(contrato.data_assinatura)}</p>
          </div>

          <div>
            <p className="text-sm text-gray-500 mb-1">Início da Vigência</p>
            <p className="text-gray-800">{formatarData(contrato.data_inicio)}</p>
          </div>

          <div>
            <p className="text-sm text-gray-500 mb-1">Fim da Vigência</p>
            <p className={'text-gray-800 ' + (vencimento === 'vencido' ? 'text-red-600 font-medium' : vencimento === 'proximo' ? 'text-yellow-600 font-medium' : '')}>
              {formatarData(contrato.data_fim)}
              {vencimento === 'vencido' && <span className="ml-2 text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded">Vencido</span>}
              {vencimento === 'proximo' && <span className="ml-2 text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded">Vence em 30 dias</span>}
            </p>
          </div>

          {contrato.observacoes && (
            <div className="md:col-span-2 lg:col-span-3">
              <p className="text-sm text-gray-500 mb-1">Observações</p>
              <p className="text-gray-800">{contrato.observacoes}</p>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Duração</p>
              <p className="font-medium text-gray-800">
                {contrato.data_inicio && contrato.data_fim ? 
                  Math.ceil((new Date(contrato.data_fim) - new Date(contrato.data_inicio)) / (1000 * 60 * 60 * 24)) + ' dias'
                  : '-'
                }
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Valor Mensal</p>
              <p className="font-medium text-gray-800">
                {contrato.valor_final && contrato.data_inicio && contrato.data_fim ?
                  formatarMoeda(contrato.valor_final / Math.ceil((new Date(contrato.data_fim) - new Date(contrato.data_inicio)) / 30))
                  : '-'
                }
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Dias Restantes</p>
              <p className="font-medium text-gray-800">
                {vencimento === 'vencido' ? 'Encerrado' : 
                  contrato.data_fim ? Math.ceil((new Date(contrato.data_fim) - new Date()) / (1000 * 60 * 60 * 24)) + ' dias'
                  : '-'
                }
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContratoDetailPage;