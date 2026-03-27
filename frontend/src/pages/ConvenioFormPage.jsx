import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { api } from '../services/api';

const ConvenioFormPage = () => {
  var _a = useParams(), id = _a.id;
  var navigate = useNavigate();
  var isEdit = Boolean(id);

  var _b = useState(false), saving = _b[0], setSaving = _b[1];
  var _c = useState(''), error = _c[0], setError = _c[1];
  var _d = useState({
    numero: '',
    ano: new Date().getFullYear(),
    objeto: '',
    concedente: '',
    cnpj_concedente: '',
    valor_repasse: '',
    valor_contrapartida: '',
    valor_total: '',
    data_inicio: '',
    data_fim: '',
    data_assinatura: '',
    status: 'em_andamento',
    observacoes: '',
  }), form = _d[0], setForm = _d[1];

  function handleChange(e) {
    var name = e.target.name, value = e.target.value;
    setForm(function(prev) { return Object.assign({}, prev, (_a = {}, _a[name] = value, _a)); });
    var _a;
  }

  function handleCurrencyChange(e, field) {
    var num = e.target.value.replace(/\D/g, '');
    setForm(function(prev) { return Object.assign({}, prev, (_a = {}, _a[field] = num ? (num / 100).toFixed(2) : '', _a)); });
    var _a;
  }

  function calculateTotal() {
    var rp = parseFloat(form.valor_repasse || 0);
    var cp = parseFloat(form.valor_contrapartida || 0);
    return (rp + cp).toFixed(2);
  }

  function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSaving(true);

    var data = Object.assign({}, form);
    data.valor_repasse = form.valor_repasse ? parseFloat(form.valor_repasse) : null;
    data.valor_contrapartida = form.valor_contrapartida ? parseFloat(form.valor_contrapartida) : null;
    data.valor_total = form.valor_total ? parseFloat(form.valor_total) : parseFloat(calculateTotal());

    (isEdit ? api.updateConvenio(id, data) : api.createConvenio(data)).then(function() {
      navigate('/convenios');
    }).catch(function(err) {
      setError(err.message);
    }).finally(function() {
      setSaving(false);
    });
  }

  var currentYear = new Date().getFullYear();
  var years = Array.from({ length: 5 }, function(_, i) { return currentYear - i; });

  return (
    <div className="max-w-4xl mx-auto">
      <button onClick={() => navigate('/convenios')} className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6">
        <ArrowLeft className="w-4 h-4" />
        Voltar para Convênios
      </button>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <h1 className="text-xl font-bold text-gray-800">{isEdit ? 'Editar Convênio' : 'Novo Convênio'}</h1>
          <p className="text-gray-500">{isEdit ? 'Atualize os dados do convênio' : 'Preencha os dados para criar um novo convênio'}</p>
        </div>

        {error && <div className="m-6 p-4 bg-red-50 text-red-700 rounded-lg">{error}</div>}

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Número <span className="text-red-500">*</span></label>
              <input type="text" name="numero" value={form.numero} onChange={handleChange} required className="w-full h-11 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none" placeholder="001" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ano <span className="text-red-500">*</span></label>
              <select name="ano" value={form.ano} onChange={handleChange} required className="w-full h-11 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none">
                {years.map(function(y) { return <option key={y} value={y}>{y}</option>; })}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select name="status" value={form.status} onChange={handleChange} className="w-full h-11 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none">
                <option value="em_andamento">Em Andamento</option>
                <option value="prestacao">Prestação de Contas</option>
                <option value="encerrado">Encerrado</option>
                <option value="inadimplente">Inadimplente</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Objeto <span className="text-red-500">*</span></label>
            <textarea name="objeto" value={form.objeto} onChange={handleChange} rows={2} required className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none resize-none" placeholder="Descreva o objeto do convênio..." />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Concedente <span className="text-red-500">*</span></label>
              <input type="text" name="concedente" value={form.concedente} onChange={handleChange} required className="w-full h-11 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none" placeholder="Órgão concedente" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">CNPJ Concedente</label>
              <input type="text" name="cnpj_concedente" value={form.cnpj_concedente} onChange={handleChange} className="w-full h-11 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none" placeholder="00.000.000/0001-00" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Valor Repasse (R$)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">R$</span>
                <input type="text" value={form.valor_repasse ? parseFloat(form.valor_repasse).toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : ''} onChange={(e) => handleCurrencyChange(e, 'valor_repasse')} className="w-full h-11 pl-10 pr-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none text-right" placeholder="0,00" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Valor Contrapartida (R$)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">R$</span>
                <input type="text" value={form.valor_contrapartida ? parseFloat(form.valor_contrapartida).toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : ''} onChange={(e) => handleCurrencyChange(e, 'valor_contrapartida')} className="w-full h-11 pl-10 pr-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none text-right" placeholder="0,00" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Valor Total (R$)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">R$</span>
                <input type="text" value={parseFloat(form.valor_total || calculateTotal()).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} readOnly className="w-full h-11 pl-10 pr-4 border border-gray-200 rounded-lg bg-gray-50 text-right" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Data de Assinatura</label>
              <input type="date" name="data_assinatura" value={form.data_assinatura} onChange={handleChange} className="w-full h-11 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Início da Vigência</label>
              <input type="date" name="data_inicio" value={form.data_inicio} onChange={handleChange} className="w-full h-11 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fim da Vigência</label>
              <input type="date" name="data_fim" value={form.data_fim} onChange={handleChange} className="w-full h-11 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Observações</label>
            <textarea name="observacoes" value={form.observacoes} onChange={handleChange} rows={2} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none resize-none" placeholder="Observações adicionais..." />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button type="button" onClick={() => navigate('/convenios')} className="px-6 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition">Cancelar</button>
            <button type="submit" disabled={saving} className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary text-white font-medium rounded-lg hover:bg-primary-dark transition disabled:opacity-50">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {saving ? 'Salvando...' : 'Salvar Convênio'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ConvenioFormPage;