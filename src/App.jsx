import { HashRouter, Routes, Route } from 'react-router-dom';
import Nav from './components/Nav';
import OverviewPage from './pages/OverviewPage';
import SalesPage from './pages/SalesPage';
import ProjectsPage from './pages/ProjectsPage';
import ProjectCreatePage from './pages/ProjectCreatePage';
import ProjectDetailPage from './pages/ProjectDetailPage';
import FinancePage from './pages/FinancePage';
import OperationsPage from './pages/OperationsPage';
import CompanyPage from './pages/CompanyPage';
import { ServiceTypeProvider } from './context/ServiceTypeContext';
import { isSupabaseConfigured, missingSupabaseVariables } from './lib/supabaseClient';

export default function App() {
  return (
    <HashRouter>
      <ServiceTypeProvider>
        <div className="app-shell">
          <Nav />
          <main className="app-main">
            {!isSupabaseConfigured && (
              <div className="config-warning" role="alert">
                <strong>Supabase is not configured.</strong>
                <span>
                  The dashboard is running in read-only preview mode. Add{' '}
                  <code>{missingSupabaseVariables.join(' and ')}</code> to enable data.
                </span>
              </div>
            )}
            <Routes>
              <Route path="/" element={<OverviewPage />} />
              <Route path="/sales" element={<SalesPage />} />
              <Route path="/projects" element={<ProjectsPage />} />
              <Route path="/projects/new" element={<ProjectCreatePage />} />
              <Route path="/projects/:projectId" element={<ProjectDetailPage />} />
              <Route path="/finance" element={<FinancePage />} />
              <Route path="/operations" element={<OperationsPage />} />
              <Route path="/company" element={<CompanyPage />} />
            </Routes>
          </main>
        </div>
      </ServiceTypeProvider>
    </HashRouter>
  );
}
