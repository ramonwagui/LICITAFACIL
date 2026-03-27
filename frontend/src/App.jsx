import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import LicitacoesPage from './pages/LicitacoesPage';
import LicitacaoFormPage from './pages/LicitacaoFormPage';
import LicitacaoDetailPage from './pages/LicitacaoDetailPage';
import RelatoriosPage from './pages/RelatoriosPage';
import ContratosPage from './pages/ContratosPage';
import ContratoFormPage from './pages/ContratoFormPage';
import ContratoDetailPage from './pages/ContratoDetailPage';
import FornecedoresPage from './pages/FornecedoresPage';
import FornecedorFormPage from './pages/FornecedorFormPage';
import FornecedorDetailPage from './pages/FornecedorDetailPage';
import ConveniosPage from './pages/ConveniosPage';
import ConvenioFormPage from './pages/ConvenioFormPage';
import ConvenioDetailPage from './pages/ConvenioDetailPage';

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  return user ? children : <Navigate to="/login" />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/"
        element={
          <PrivateRoute>
            <Layout />
          </PrivateRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="licitacoes" element={<LicitacoesPage />} />
        <Route path="licitacoes/novo" element={<LicitacaoFormPage />} />
        <Route path="licitacoes/:id" element={<LicitacaoDetailPage />} />
        <Route path="licitacoes/:id/editar" element={<LicitacaoFormPage />} />
        <Route path="relatorios" element={<RelatoriosPage />} />
        <Route path="contratos" element={<ContratosPage />} />
        <Route path="contratos/novo" element={<ContratoFormPage />} />
        <Route path="contratos/:id" element={<ContratoDetailPage />} />
        <Route path="contratos/:id/editar" element={<ContratoFormPage />} />
        <Route path="fornecedores" element={<FornecedoresPage />} />
        <Route path="fornecedores/novo" element={<FornecedorFormPage />} />
        <Route path="fornecedores/:id" element={<FornecedorDetailPage />} />
        <Route path="fornecedores/:id/editar" element={<FornecedorFormPage />} />
        <Route path="convenios" element={<ConveniosPage />} />
        <Route path="convenios/novo" element={<ConvenioFormPage />} />
        <Route path="convenios/:id" element={<ConvenioDetailPage />} />
        <Route path="convenios/:id/editar" element={<ConvenioFormPage />} />
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;