import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Edit, Globe, Calendar, DollarSign, AlertTriangle } from 'lucide-react';
import { api } from '../services/api';
import { formatarData, formatarMoeda } from '../utils/formatters';

const ConvenioDetailPage = function() {
  var _a = useParams(), id = _a.id;
  var navigate = useNavigate();
  var _b = useState(true), loading = _b[0], setLoading = _b[1];
  var _c = useState(null), convenio = _c[0], setConvenio = _c[1];

  useEffect(function() {
    api.getConvenio(id).then(function(data) {
      setConvenio(data);
    }).catch(function(err) {
      console.error(err);
    }).finally(function() {
      setLoading(false);
    });
  }, [id]);

  function getStatusColor(st) {
    var colors = { em_andamento: 'bg-blue-100 text-blue-800', prestacao: 'bg-yellow-100 text-yellow-800', encerrado: 'bg-gray-100 text-gray-800', inadimplente: 'bg-red-100 text-red-800' };
    return colors[st] || 'bg-gray-100 text-gray-800';
  }

  function getStatusLabel(st) {
    var labels = { em_andamento: 'Em Andamento', prestacao: 'Prestação de Contas', encerrado: 'Encerrado', inadimplente: 'Inadimplente' };
    return labels[st] || st;
  }

  function getVencimentoStatus(dataFim, status) {
    if (!dataFim || status !== 'em_andamento') return null;
    var hoje = new Date();
    var fim = new Date(dataFim);
    var dias = Math.ceil((fim - hoje) / (1000 * 60 * 60 * 24));
    if (dias < 0) return 'vencido';
    if (dias <= 60) return 'proximo';
    return 'normal';
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!convenio) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Convênio não encontrado</p>
        <button onClick={() => navigate('/convenios')} className="text-primary hover:underline mt-2">Voltar para Convênios</button>
      </div>
    );
  }

  var vencimento = getVencimentoStatus(convenio.data_fim,convenio.status);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button onClick={() => navigate('/convenios')} className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-800">
          <ArrowLeft className="w-4 h-4" />
          Voltar para Convênios
        </button>
        <Link to={'/convenios/' + id + '/editar'} className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition">
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
                  <Globe className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">Convênio {convenio.numero}/{convenio.ano}</h1>
                  <p className="text-gray-500">{convenio.objeto}</p>
                </div>
              </div>
            </div>
            <span className={'px-3 py-1 rounded-full text-sm font-medium ' + getStatusColor(convenio.status)}>
              {getStatusLabel(convenio.status)}
            </span>
          </div>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <p className="text-sm text-gray-500 mb-1">Concedente</p>
            <p className="text-gray-800 font-medium">{convenio.concedente}</p>
            {convenio.cnpj_concedente && <p className="text-sm text-gray-500">{convenio.cnpj_concedente}</p>}
          </div>

          <div>
            <p className="text-sm text-gray-500 mb-1">Valor Total</p>
            <p className="text-2xl font-bold text-gray-800">{formatarMoeda(convenio.valor_total)}</p>
          </div>

          <div>
            <p className="text-sm text-gray-500 mb-1">Valor Repasse</p>
            <p className="text-gray-800">{formatarMoeda(convenio.valor_repasse)}</p>
          </div>

          <div>
            <p className="text-sm text-gray-500 mb-1">Valor Contrapartida</p>
            <p className="text-gray-800">{formatarMoeda(convenio.valor_contrapartida)}</p>
          </div>

          <div>
            <p className="text-sm text-gray-500 mb-1">Data de Assinatura</p>
            <p className="text-gray-800">{formatarData(convenio.data_assinatura)}</p>
          </div>

          <div>
            <p className="text-sm text-gray-500 mb-1">Início da Vigência</p>
            <p className="text-gray-800">{formatarData(convenio.data_inicio)}</p>
          </div>

          <div>
            <p className="text-sm text-gray-500 mb-1">Fim da Vigência</p>
            <p className={'text-gray-800 ' + (vencimento === 'vencido' ? 'text-red-600 font-medium' : vencimento === 'proximo' ? 'text-yellow-600 font-medium' : '')}>
              {formatarData(convenio.data_fim)}
              {vencimento === 'vencido' && <span className="ml-2 text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded">Vencido</span>}
              {vencimento === 'proximo' && <span className="ml-2 text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded">Vence em 60 dias</span>}
            </p>
          </div>

          {convenio.observacoes && (
            <div className="md:col-span-2 lg:col-span-3">
              <p className="text-sm text-gray-500 mb-1">Observações</p>
              <p className="text-gray-800">{convenio.observacoes}</p>
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
                {convenio.data_inicio && convenio.data_fim ? 
                  Math.ceil((new Date(convenio.data_fim) - new Date(convenio.data_inicio)) / (1000 * 60 * 60 * 24)) + ' dias'
                  : '-'}
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
              <p className="text-sm text-gray-500">% Repasse</p>
              <p className="font-medium text-gray-800">
                {convenio.valor_total && convenio.valor_repasse ? 
                  Math.round((convenio.valor_repasse / convenios.valor_total) * 100) + '%'
                  : '-'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Dias Restantes</p>
              <p className="font-medium text-gray-800">
                {vencimento === 'vencido' ? 'Encerrado' : 
                  convenio.data_fim ? Math.max(0, Math.ceil((new Date(convenio.data_fim) - new Date()) / (1000 * 60 * 60 * 24))) + ' dias'
                  : '-'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConvenioDetailPage;