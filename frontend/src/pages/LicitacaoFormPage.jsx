import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { api } from '../services/api';

const LicitacaoFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    numero: '',
    ano: new Date().getFullYear(),
    modalidade: 'pregao',
    objeto: '',
    secretaria: '',
    valor_estimado: '',
    fonte_recurso: '',
    status: 'em_elaboracao',
    data_publicacao: '',
    data_sessao: '',
    data_homologacao: '',
    observacoes: '',
  });

  useEffect(() => {
    if (isEdit) {
      loadLicitacao();
    }
  }, [id]);

  const loadLicitacao = async () => {
    try {
      const data = await api.getLicitacao(id);
      setForm({
        ...data,
        valor_estimado: data.valor_estimado || '',
        data_publicacao: data.data_publicacao || '',
        data_sessao: data.data_sessao || '',
        data_homologacao: data.data_homologacao || '',
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setInitialLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const formatCurrency = (value) => {
    const num = value.replace(/\D/g, '');
    return (num / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 });
  };

  const handleCurrencyChange = (e) => {
    const num = e.target.value.replace(/\D/g, '');
    setForm(prev => ({ ...prev, valor_estimado: num ? (num / 100).toFixed(2) : '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      const data = {
        ...form,
        valor_estimado: form.valor_estimado ? parseFloat(form.valor_estimado) : null,
      };

      if (isEdit) {
        await api.updateLicitacao(id, data);
      } else {
        await api.createLicitacao(data);
      }
      navigate('/licitacoes');
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
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  return (
    <div className="max-w-4xl mx-auto">
      <button
        onClick={() => navigate('/licitacoes')}
        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Voltar para Licitações
      </button>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <h1 className="text-xl font-bold text-gray-800">
            {isEdit ? 'Editar Licitação' : 'Nova Licitação'}
          </h1>
          <p className="text-gray-500">
            {isEdit ? 'Atualize os dados da licitação' : 'Preencha os dados para criar uma nova licitação'}
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
                type="number"
                name="numero"
                value={form.numero}
                onChange={handleChange}
                min="1"
                required
                className="w-full h-11 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
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
                {years.map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Modalidade <span className="text-red-500">*</span>
              </label>
              <select
                name="modalidade"
                value={form.modalidade}
                onChange={handleChange}
                required
                className="w-full h-11 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
              >
                <option value="pregao">Pregão</option>
                <option value="concorrencia">Concorrência</option>
                <option value="dispensa">Dispensa</option>
                <option value="inexigibilidade">Inexigibilidade</option>
                <option value="tomada_de_precos">Tomada de Preços</option>
                <option value="convite">Convite</option>
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
              rows={3}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none resize-none"
              placeholder="Descreva o objeto da licitação..."
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Secretaria Demandante
              </label>
              <select
                name="secretaria"
                value={form.secretaria}
                onChange={handleChange}
                className="w-full h-11 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
              >
                <option value="">Selecione...</option>
                <option value="Administração">Administração</option>
                <option value="Educação">Educação</option>
                <option value="Saúde">Saúde</option>
                <option value="Obras">Obras</option>
                <option value="Transporte">Transporte</option>
                <option value="Meio Ambiente">Meio Ambiente</option>
                <option value="Tecnologia">Tecnologia</option>
                <option value="Planejamento">Planejamento</option>
                <option value="Jurídico">Jurídico</option>
                <option value="Finanças">Finanças</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fonte de Recurso
              </label>
              <select
                name="fonte_recurso"
                value={form.fonte_recurso}
                onChange={handleChange}
                className="w-full h-11 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
              >
                <option value="">Selecione...</option>
                <option value="Próprio">Próprio</option>
                <option value="FNDE">FNDE</option>
                <option value="FNS">FNS</option>
                <option value="Emenda Parlamentar">Emenda Parlamentar</option>
                <option value="Federal">Federal</option>
                <option value="Estadual">Estadual</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Valor Estimado (R$)
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">R$</span>
                <input
                  type="text"
                  value={form.valor_estimado ? parseFloat(form.valor_estimado).toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : ''}
                  onChange={handleCurrencyChange}
                  className="w-full h-11 pl-10 pr-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none text-right"
                  placeholder="0,00"
                />
              </div>
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
                <option value="em_elaboracao">Em Elaboração</option>
                <option value="publicado">Publicado</option>
                <option value="em_julgamento">Em Julgamento</option>
                <option value="homologado">Homologado</option>
                <option value="concluido">Concluído</option>
                <option value="suspenso">Suspenso</option>
                <option value="cancelado">Cancelado</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data de Publicação
              </label>
              <input
                type="date"
                name="data_publicacao"
                value={form.data_publicacao}
                onChange={handleChange}
                className="w-full h-11 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data da Sessão
              </label>
              <input
                type="date"
                name="data_sessao"
                value={form.data_sessao}
                onChange={handleChange}
                className="w-full h-11 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data de Homologação
              </label>
              <input
                type="date"
                name="data_homologacao"
                value={form.data_homologacao}
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
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none resize-none"
              placeholder="Observações adicionais..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={() => navigate('/licitacoes')}
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
              {saving ? 'Salvando...' : 'Salvar Licitação'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LicitacaoFormPage;