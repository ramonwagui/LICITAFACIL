import { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, FileText, CheckSquare, Clock, Edit, Trash2, Plus, Download, Copy, Check, Paperclip, Upload, X } from 'lucide-react';
import { api } from '../services/api';
import { formatarData, formatarMoeda, getStatusLabel, getStatusColor, getModalidadeLabel, getPrazoStatus } from '../utils/formatters';

const LicitacaoDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [licitacao, setLicitacao] = useState(null);
  const [checklist, setChecklist] = useState([]);
  const [documentos, setDocumentos] = useState([]);
  const [historico, setHistorico] = useState([]);
  const [anexos, setAnexos] = useState([]);
  const [activeTab, setActiveTab] = useState('checklist');
  const [docModal, setDocModal] = useState(null);
  const [copied, setCopied] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      const [licData, checklistData, docsData, histData, anexosData] = await Promise.all([
        api.getLicitacao(id),
        api.getChecklist(id),
        api.getDocumentos(id),
        api.getHistorico(id),
        api.getAnexos(id),
      ]);
      setLicitacao(licData);
      setChecklist(checklistData);
      setDocumentos(docsData);
      setHistorico(histData);
      setAnexos(anexosData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckItem = async (itemId, concluido) => {
    try {
      await api.updateChecklistItem(itemId, !concluido);
      loadData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleCreateDoc = async (tipo, titulo) => {
    try {
      await api.createDocumento(id, { tipo, titulo });
      loadData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleUpdateDoc = async (docId, titulo, conteudo) => {
    try {
      await api.updateDocumento(docId, { titulo, conteudo });
      loadData();
      setDocModal(null);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleUploadAnexo = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setUploading(true);
    try {
      await api.uploadAnexo(id, file);
      loadData();
    } catch (err) {
      alert(err.message);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDeleteAnexo = async (anexoId, nome) => {
    if (!window.confirm(`Excluir arquivo "${nome}"?`)) return;
    try {
      await api.deleteAnexo(anexoId);
      loadData();
    } catch (err) {
      alert(err.message);
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const getFileIcon = (tipo) => {
    if (tipo?.includes('pdf')) return '📄';
    if (tipo?.includes('word') || tipo?.includes('document')) return '📝';
    if (tipo?.includes('image')) return '🖼️';
    if (tipo?.includes('sheet') || tipo?.includes('excel')) return '📊';
    return '📎';
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadPDF = (content, filename) => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>${filename}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; white-space: pre-wrap; line-height: 1.6; }
          </style>
        </head>
        <body>${content}</body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const checklistConcluidos = checklist.filter(i => i.concluido).length;
  const checklistTotal = checklist.length;
  const checklistPercent = checklistTotal > 0 ? Math.round((checklistConcluidos / checklistTotal) * 100) : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!licitacao) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Licitação não encontrada</p>
        <button onClick={() => navigate('/licitacoes')} className="text-primary hover:underline mt-2">
          Voltar para Licitações
        </button>
      </div>
    );
  }

  const availableDocs = [
    { tipo: 'termo_referencia', titulo: 'Termo de Referência', modalidades: ['pregao', 'tomada_de_precos'] },
    { tipo: 'justificativa_dispensa', titulo: 'Justificativa de Dispensa', modalidades: ['dispensa', 'inexigibilidade'] },
    { tipo: 'edital', titulo: 'Edital', modalidades: ['pregao', 'concorrencia', 'tomada_de_precos', 'convite'] },
    { tipo: 'contrato', titulo: 'Contrato', modalidades: ['pregao', 'concorrencia', 'dispensa', 'inexigibilidade', 'tomada_de_precos', 'convite'] },
  ];

  const allowedDocs = availableDocs.filter(d => d.modalidades.includes(licitacao.modalidade));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/licitacoes')}
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-800"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar para Licitações
        </button>
        <div className="flex gap-2">
          <Link
            to={`/licitacoes/${id}/editar`}
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
                  Licitação {licitacao.numero}/{licitacao.ano}
                </h1>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(licitacao.status)}`}>
                  {getStatusLabel(licitacao.status)}
                </span>
              </div>
              <p className="text-gray-500">{getModalidadeLabel(licitacao.modalidade)}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Valor Estimado</p>
              <p className="text-2xl font-bold text-gray-800">{formatarMoeda(licitacao.valor_estimado)}</p>
            </div>
          </div>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <p className="text-sm text-gray-500 mb-1">Objeto</p>
            <p className="text-gray-800">{licitacao.objeto}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Secretaria</p>
            <p className="text-gray-800">{licitacao.secretaria || '-'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Fonte de Recurso</p>
            <p className="text-gray-800">{licitacao.fonte_recurso || '-'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Data de Publicação</p>
            <p className="text-gray-800">{formatarData(licitacao.data_publicacao)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Data da Sessão</p>
            <p className={`text-gray-800 ${getPrazoStatus(licitacao.data_sessao) === 'atrasado' ? 'text-red-600' : ''}`}>
              {formatarData(licitacao.data_sessao)}
              {licitacao.data_sessao && getPrazoStatus(licitacao.data_sessao) === 'atrasado' && (
                <span className="ml-2 text-xs text-red-600">(Atrasado)</span>
              )}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Data de Homologação</p>
            <p className="text-gray-800">{formatarData(licitacao.data_homologacao)}</p>
          </div>
          {licitacao.observacoes && (
            <div className="md:col-span-2 lg:col-span-3">
              <p className="text-sm text-gray-500 mb-1">Observações</p>
              <p className="text-gray-800">{licitacao.observacoes}</p>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="border-b border-gray-100">
          <div className="flex">
            <button
              onClick={() => setActiveTab('checklist')}
              className={`px-6 py-3 font-medium text-sm border-b-2 transition ${
                activeTab === 'checklist' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <CheckSquare className="w-4 h-4 inline mr-2" />
              Checklist ({checklistConcluidos}/{checklistTotal})
            </button>
            <button
              onClick={() => setActiveTab('documentos')}
              className={`px-6 py-3 font-medium text-sm border-b-2 transition ${
                activeTab === 'documentos' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <FileText className="w-4 h-4 inline mr-2" />
              Documentos ({documentos.length})
            </button>
            <button
              onClick={() => setActiveTab('historico')}
              className={`px-6 py-3 font-medium text-sm border-b-2 transition ${
                activeTab === 'historico' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Clock className="w-4 h-4 inline mr-2" />
              Histórico ({historico.length})
            </button>
            <button
              onClick={() => setActiveTab('anexos')}
              className={`px-6 py-3 font-medium text-sm border-b-2 transition ${
                activeTab === 'anexos' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Paperclip className="w-4 h-4 inline mr-2" />
              Anexos ({anexos.length})
            </button>
          </div>
        </div>

        <div className="p-6">
          {activeTab === 'checklist' && (
            <div>
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Progresso</span>
                  <span className="text-sm font-medium text-gray-800">{checklistPercent}%</span>
                </div>
                <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-accent transition-all duration-300"
                    style={{ width: `${checklistPercent}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-500 mt-2">{checklistConcluidos} de {checklistTotal} itens concluídos</p>
              </div>

              <div className="space-y-3">
                {checklist.map((item) => (
                  <div
                    key={item.id}
                    className={`flex items-center gap-3 p-4 rounded-lg border ${
                      item.concluido ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'
                    }`}
                  >
                    <button
                      onClick={() => handleCheckItem(item.id, item.concluido)}
                      className={`w-6 h-6 rounded border-2 flex items-center justify-center transition ${
                        item.concluido ? 'bg-accent border-accent' : 'border-gray-300 hover:border-primary'
                      }`}
                    >
                      {item.concluido && <Check className="w-4 h-4 text-white" />}
                    </button>
                    <span className={`flex-1 ${item.concluido ? 'text-gray-600 line-through' : 'text-gray-800'}`}>
                      {item.item}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'documentos' && (
            <div>
              <div className="mb-6 flex flex-wrap gap-2">
                {allowedDocs.map((doc) => (
                  <button
                    key={doc.tipo}
                    onClick={() => handleCreateDoc(doc.tipo, doc.titulo)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm rounded-lg hover:bg-primary-dark transition"
                  >
                    <Plus className="w-4 h-4" />
                    {doc.titulo}
                  </button>
                ))}
              </div>

              {documentos.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>Nenhum documento gerado ainda</p>
                  <p className="text-sm">Clique acima para criar um novo documento</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {documentos.map((doc) => (
                    <div key={doc.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium text-gray-800">{doc.titulo}</h4>
                        <div className="flex gap-2">
                          <button
                            onClick={() => copyToClipboard(doc.conteudo)}
                            className="p-2 text-gray-400 hover:text-primary transition"
                            title="Copiar"
                          >
                            {copied ? <Check className="w-4 h-4 text-accent" /> : <Copy className="w-4 h-4" />}
                          </button>
                          <button
                            onClick={() => downloadPDF(doc.conteudo, doc.titulo)}
                            className="p-2 text-gray-400 hover:text-primary transition"
                            title="Baixar PDF"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDocModal(doc)}
                            className="p-2 text-gray-400 hover:text-primary transition"
                            title="Editar"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <pre className="text-sm text-gray-600 whitespace-pre-wrap bg-gray-50 p-3 rounded-lg max-h-60 overflow-y-auto">
                        {doc.conteudo}
                      </pre>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'historico' && (
            <div>
              {historico.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Clock className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>Nenhum registro no histórico</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {historico.map((item) => (
                    <div key={item.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-2 h-2 mt-2 rounded-full bg-primary"></div>
                      <div>
                        <p className="font-medium text-gray-800">{item.acao.replace(/_/g, ' ')}</p>
                        <p className="text-sm text-gray-600">{item.descricao}</p>
                        <p className="text-xs text-gray-400 mt-1">{formatarData(item.created_at)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'anexos' && (
            <div>
              <div className="mb-6">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleUploadAnexo}
                  className="hidden"
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.zip"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm rounded-lg hover:bg-primary-dark transition disabled:opacity-50"
                >
                  {uploading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <Upload className="w-4 h-4" />
                  )}
                  {uploading ? 'Enviando...' : 'Adicionar Arquivo'}
                </button>
                <span className="ml-3 text-sm text-gray-500">PDF, Word, Excel, Imagens (máx 10MB)</span>
              </div>

              {anexos.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Paperclip className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>Nenhum arquivo anexado ainda</p>
                  <p className="text-sm">Clique acima para fazer upload de arquivos</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {anexos.map((anexo) => (
                    <div key={anexo.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                      <span className="text-2xl">{getFileIcon(anexo.tipo)}</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-800 truncate">{anexo.nome_original}</p>
                        <p className="text-sm text-gray-500">{formatFileSize(anexo.tamanho)} • {formatarData(anexo.created_at)}</p>
                      </div>
                      <div className="flex gap-2">
                        <a
                          href={api.downloadAnexo(anexo.id)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 text-gray-400 hover:text-primary transition"
                          title="Baixar"
                        >
                          <Download className="w-4 h-4" />
                        </a>
                        <button
                          onClick={() => handleDeleteAnexo(anexo.id, anexo.nome_original)}
                          className="p-2 text-gray-400 hover:text-danger transition"
                          title="Excluir"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {docModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-3xl max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-800">Editar Documento</h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
                <input
                  type="text"
                  value={docModal.titulo}
                  onChange={(e) => setDocModal({ ...docModal, titulo: e.target.value })}
                  className="w-full h-11 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Conteúdo</label>
                <textarea
                  value={docModal.conteudo}
                  onChange={(e) => setDocModal({ ...docModal, conteudo: e.target.value })}
                  rows={15}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none font-mono text-sm"
                />
              </div>
            </div>
            <div className="p-6 border-t border-gray-100 flex justify-end gap-3">
              <button
                onClick={() => setDocModal(null)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleUpdateDoc(docModal.id, docModal.titulo, docModal.conteudo)}
                className="px-4 py-2 bg-primary text-white font-medium rounded-lg hover:bg-primary-dark transition"
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LicitacaoDetailPage;