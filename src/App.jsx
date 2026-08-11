import { HashRouter, Routes, Route } from 'react-router-dom';
import Nav from './components/Nav';
import OverviewPage from './pages/OverviewPage';
import PipelinePage from './pages/PipelinePage';
import FinancePage from './pages/FinancePage';
import { ServiceTypeProvider } from './context/ServiceTypeContext';
import { isSupabaseConfigured, missingSupabaseVariables } from './lib/supabaseClient';

export default function App() {
  return (
    <HashRouter>
      <ServiceTypeProvider>
        <div className="app-shell">
          <Nav />
          <main style={{ flex: 1, padding: '28px 32px', maxWidth: 1200 }}>
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
              <Route path="/pipeline" element={<PipelinePage />} />
              <Route path="/finance" element={<FinancePage />} />
            </Routes>
          </main>
        </div>
      </ServiceTypeProvider>
    </HashRouter>
  );
}
