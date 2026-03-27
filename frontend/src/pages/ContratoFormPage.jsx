import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { api } from '../services/api';

const ContratoFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [licitacoes, setLicitacoes] = useState([]);

  const [form, setForm] = useState({
    licitacao_id: '',
    numero: '',
    ano: new Date().getFullYear(),
    objeto: '',
    contratada: '',
    cnpj: '',
    valor_inicial: '',
    valor_final: '',
    data_inicio: '',
    data_fim: '',
    data_assinatura: '',
    status: 'ativo',
    observacoes: '',
  });

  useEffect(() => {
    loadLicitacoes();
    if (isEdit) {
      loadContrato();
    }
  }, [id]);

  const loadLicitacoes = async () => {
    try {
      const data = await api.getLicitacoes({ status: 'homologado' });
      setLicitacoes(data);
    } catch (err) {
      console.error(err);
    }
  };

  const loadContrato = async () => {
    try {
      const data = await api.getContrato(id);
      setForm({
        ...data,
        valor_inicial: data.valor_inicial || '',
        valor_final: data.valor_final || '',
        licitacao_id: data.licitacao_id || '',
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setInitialLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCurrencyChange = (e, field) => {
    const num = e.target.value.replace(/\D/g, '');
    setForm((prev) => ({ ...prev, [field]: num ? (num / 100).toFixed(2) : '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      const data = {
        ...form,
        valor_inicial: form.valor_inicial ? parseFloat(form.valor_inicial) : null,
        valor_final: form.valor_final ? parseFloat(form.valor_final) : null,
        licitacao_id: form.licitacao_id || null,
      };

      if (isEdit) {
        await api.updateContrato(id, data);
      } else {
        await api.createContrato(data);
      }
      navigate('/contratos');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, function(_, i) { return currentYear - i; });

  return (
    <div className="max-w-4xl mx-auto">
      <button
        onClick={() => navigate('/contratos')}
        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Voltar para Contratos
      </button>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <h1 className="text-xl font-bold text-gray-800">
            {isEdit ? 'Editar Contrato' : 'Novo Contrato'}
          </h1>
          <p className="text-gray-500">
            {isEdit ? 'Atualize os dados do contrato' : 'Preencha os dados para criar um novo contrato'}
          </p>
        </div>

        {error && (
          <div className="m-6 p-4 bg-red-50 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Número <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="numero"
                value={form.numero}
                onChange={handleChange}
                required
                className="w-full h-11 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                placeholder="001"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ano <span className="text-red-500">*</span>
              </label>
              <select
                name="ano"
                value={form.ano}
                onChange={handleChange}
                required
                className="w-full h-11 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
              >
                {years.map(function(y) {
                  return <option key={y} value={y}>{y}</option>;
                })}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className="w-full h-11 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
              >
                <option value="ativo">Ativo</option>
                <option value="concluido">Concluído</option>
                <option value="rescindido">Rescindido</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Objeto <span className="text-red-500">*</span>
            </label>
            <textarea
              name="objeto"
              value={form.objeto}
              onChange={handleChange}
              rows={2}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none resize-none"
              placeholder="Descreva o objeto do contrato..."
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Empresa Contratada
              </label>
              <input
                type="text"
                name="contratada"
                value={form.contratada}
                onChange={handleChange}
                className="w-full h-11 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                placeholder="Razão social"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                CNPJ
              </label>
              <input
                type="text"
                name="cnpj"
                value={form.cnpj}
                onChange={handleChange}
                className="w-full h-11 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                placeholder="00.000.000/0001-00"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Licitação Vinculada
            </label>
            <select
              name="licitacao_id"
              value={form.licitacao_id}
              onChange={handleChange}
              className="w-full h-11 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
            >
              <option value="">Nenhuma</option>
              {licitacoes.map(function(lic) {
                return <option key={lic.id} value={lic.id}>{lic.numero}/{lic.ano} - {lic.objeto.substring(0, 50)}...</option>;
              })}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Valor Inicial (R$)
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">R$</span>
                <input
                  type="text"
                  value={form.valor_inicial ? parseFloat(form.valor_inicial).toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : ''}
                  onChange={(e) => handleCurrencyChange(e, 'valor_inicial')}
                  className="w-full h-11 pl-10 pr-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none text-right"
                  placeholder="0,00"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Valor Final (R$)
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">R$</span>
                <input
                  type="text"
                  value={form.valor_final ? parseFloat(form.valor_final).toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : ''}
                  onChange={(e) => handleCurrencyChange(e, 'valor_final')}
                  className="w-full h-11 pl-10 pr-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none text-right"
                  placeholder="0,00"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data de Assinatura
              </label>
              <input
                type="date"
                name="data_assinatura"
                value={form.data_assinatura}
                onChange={handleChange}
                className="w-full h-11 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Início da Vigência
              </label>
              <input
                type="date"
                name="data_inicio"
                value={form.data_inicio}
                onChange={handleChange}
                className="w-full h-11 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fim da Vigência
              </label>
              <input
                type="date"
                name="data_fim"
                value={form.data_fim}
                onChange={handleChange}
                className="w-full h-11 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Observações
            </label>
            <textarea
              name="observacoes"
              value={form.observacoes}
              onChange={handleChange}
              rows={2}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none resize-none"
              placeholder="Observações adicionais..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={() => navigate('/contratos')}
              className="px-6 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary text-white font-medium rounded-lg hover:bg-primary-dark transition disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {saving ? 'Salvando...' : 'Salvar Contrato'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ContratoFormPage;