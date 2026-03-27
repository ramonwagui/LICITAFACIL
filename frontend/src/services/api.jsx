const API_URL = import.meta.env.VITE_API_URL || '/api';

async function request(endpoint, options = {}) {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: 'Bearer ' + token }),
    ...options.headers,
  };

  const response = await fetch(API_URL + endpoint, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ erro: 'Erro na requisição' }));
    throw new Error(error.erro || 'Erro na requisição');
  }

  return response.json();
}

export const api = {
  login: function(email, senha) {
    return request('/auth/login', { method: 'POST', body: JSON.stringify({ email, senha }) });
  },
  getMe: function() {
    return request('/auth/me');
  },
  
  getDashboard: function() {
    return request('/licitacoes/dashboard');
  },
  getLicitacoes: function(params) {
    params = params || {};
    var query = new URLSearchParams(params).toString();
    return request('/licitacoes' + (query ? '?' + query : ''));
  },
  getLicitacao: function(id) {
    return request('/licitacoes/' + id);
  },
  createLicitacao: function(data) {
    return request('/licitacoes', { method: 'POST', body: JSON.stringify(data) });
  },
  updateLicitacao: function(id, data) {
    return request('/licitacoes/' + id, { method: 'PUT', body: JSON.stringify(data) });
  },
  deleteLicitacao: function(id) {
    return request('/licitacoes/' + id, { method: 'DELETE' });
  },
  
  getChecklist: function(id) {
    return request('/licitacoes/' + id + '/checklist');
  },
  updateChecklistItem: function(id, concluido) {
    return request('/checklist/' + id, { method: 'PUT', body: JSON.stringify({ concluido }) });
  },
  
  getDocumentos: function(id) {
    return request('/licitacoes/' + id + '/documentos');
  },
  createDocumento: function(id, data) {
    return request('/licitacoes/' + id + '/documentos', { method: 'POST', body: JSON.stringify(data) });
  },
  updateDocumento: function(id, data) {
    return request('/documentos/' + id, { method: 'PUT', body: JSON.stringify(data) });
  },
  getDocumento: function(id) {
    return request('/documentos/' + id);
  },
  
  getHistorico: function(id) {
    return request('/licitacoes/' + id + '/historico');
  },
  
  getAnexos: function(id) {
    return request('/licitacoes/' + id + '/anexos');
  },
  uploadAnexo: function(id, file) {
    var token = localStorage.getItem('token');
    var formData = new FormData();
    formData.append('arquivo', file);
    
    return fetch(API_URL + '/licitacoes/' + id + '/anexos', {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + token },
      body: formData,
    }).then(function(response) {
      if (!response.ok) {
        return response.json().catch(function() { return { erro: 'Erro no upload' }; }).then(function(error) {
          throw new Error(error.erro || 'Erro no upload');
        });
      }
      return response.json();
    });
  },
  deleteAnexo: function(id) {
    return request('/anexos/' + id, { method: 'DELETE' });
  },
  downloadAnexo: function(id) {
    return API_URL + '/anexos/' + id + '/download';
  },
  
  getContratos: function(params) {
    params = params || {};
    var query = new URLSearchParams(params).toString();
    return request('/contratos' + (query ? '?' + query : ''));
  },
  getContratosDashboard: function() {
    return request('/contratos/dashboard');
  },
  getContrato: function(id) {
    return request('/contratos/' + id);
  },
  createContrato: function(data) {
    return request('/contratos', { method: 'POST', body: JSON.stringify(data) });
  },
  updateContrato: function(id, data) {
    return request('/contratos/' + id, { method: 'PUT', body: JSON.stringify(data) });
  },
  deleteContrato: function(id) {
    return request('/contratos/' + id, { method: 'DELETE' });
  },
  
  getFornecedores: function(params) {
    params = params || {};
    var query = new URLSearchParams(params).toString();
    return request('/fornecedores' + (query ? '?' + query : ''));
  },
  getFornecedor: function(id) {
    return request('/fornecedores/' + id);
  },
  createFornecedor: function(data) {
    return request('/fornecedores', { method: 'POST', body: JSON.stringify(data) });
  },
  updateFornecedor: function(id, data) {
    return request('/fornecedores/' + id, { method: 'PUT', body: JSON.stringify(data) });
  },
  deleteFornecedor: function(id) {
    return request('/fornecedores/' + id, { method: 'DELETE' });
  },
  
  getConvenios: function(params) {
    params = params || {};
    var query = new URLSearchParams(params).toString();
    return request('/convenios' + (query ? '?' + query : ''));
  },
  getConveniosDashboard: function() {
    return request('/convenios/dashboard');
  },
  getConvenio: function(id) {
    return request('/convenios/' + id);
  },
  createConvenio: function(data) {
    return request('/convenios', { method: 'POST', body: JSON.stringify(data) });
  },
  updateConvenio: function(id, data) {
    return request('/convenios/' + id, { method: 'PUT', body: JSON.stringify(data) });
  },
  deleteConvenio: function(id) {
    return request('/convenios/' + id, { method: 'DELETE' });
  },
};