import { HashRouter, Routes, Route } from 'react-router-dom';
import Nav from './components/Nav';
import OverviewPage from './pages/OverviewPage';
import PipelinePage from './pages/PipelinePage';
import FinancePage from './pages/FinancePage';
import { ServiceTypeProvider } from './context/ServiceTypeContext';

export default function App() {
  return (
    <HashRouter>
      <ServiceTypeProvider>
        <div className="app-shell">
          <Nav />
          <main style={{ flex: 1, padding: '28px 32px', maxWidth: 1200 }}>
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
