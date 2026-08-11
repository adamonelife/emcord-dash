import MetricCard from '../components/MetricCard';
import OverviewSection from '../components/OverviewSection';
import { useOverviewData } from '../hooks/useOverviewData';
import { formatCurrencyTotals } from '../lib/overviewMetrics';

export default function OverviewPage() {
  const { loading, commercial, unavailableSources } = useOverviewData();
  const unavailable = unavailableSources.length > 0;
  const salesUnavailable = unavailableSources.includes('sales');
  const financeUnavailable = unavailableSources.includes('finance');

  function metricDetail(totals, sourceUnavailable, emptyMessage) {
    if (loading) return 'Loading current dashboard data';
    if (sourceUnavailable) return 'Data source unavailable';
    if (Object.keys(totals).length === 0) return emptyMessage;
    return 'Live from the current dashboard data source';
  }

  return (
    <div>
      <div className="page-heading executive-heading">
        <div>
          <h2>Executive overview</h2>
          <p>EMCORD's commercial, delivery and operating position at a glance.</p>
        </div>
        <span className="overview-status">V1 operating view</span>
      </div>

      {unavailable && (
        <div className="source-warning" role="status">
          Some live metrics are unavailable: {unavailableSources.join(', ')}.
        </div>
      )}

      <OverviewSection title="Commercial" description="Pipeline, revenue and cash collection signals.">
        <div className="metric-grid metric-grid-four">
          <MetricCard
            label="Open pipeline value"
            value={loading ? '—' : formatCurrencyTotals(commercial.openPipeline)}
            detail={metricDetail(commercial.openPipeline, salesUnavailable, 'No open deals')}
            tone="brand-cyan"
          />
          <MetricCard
            label="Weighted pipeline value"
            value="—"
            detail="Stage probabilities not configured"
            tone="brand-cyan"
          />
          <MetricCard
            label="Won revenue"
            value={loading ? '—' : formatCurrencyTotals(commercial.wonRevenue)}
            detail={metricDetail(commercial.wonRevenue, salesUnavailable, 'No won deals')}
            tone="brand-green"
          />
          <MetricCard
            label="Outstanding invoices"
            value={loading ? '—' : formatCurrencyTotals(commercial.outstandingInvoices)}
            detail={metricDetail(commercial.outstandingInvoices, financeUnavailable, 'No outstanding invoices')}
            tone="warning"
          />
        </div>
      </OverviewSection>

      <OverviewSection title="Delivery" description="Project progress, risk and upcoming commitments.">
        <div className="metric-grid metric-grid-four">
          <MetricCard label="Active projects" value="0" detail="Projects data not configured" />
          <MetricCard label="Projects at risk" value="0" detail="Project health not configured" tone="warning" />
          <MetricCard label="Upcoming deadlines" value="0" detail="Milestones not configured" />
          <MetricCard label="Completed projects" value="0" detail="Projects data not configured" tone="brand-green" />
        </div>
      </OverviewSection>

      <OverviewSection title="Operations" description="Execution, blockers and resource visibility.">
        <div className="metric-grid metric-grid-three">
          <MetricCard label="Outstanding actions" value="0" detail="Actions data not configured" />
          <MetricCard label="Blocked items" value="0" detail="Blockers data not configured" tone="danger" />
          <MetricCard label="Team / resource summary" value="—" detail="Resource planning not configured" />
        </div>
      </OverviewSection>

      <OverviewSection title="Recent activity" description="A future unified feed across commercial, delivery, finance and operations.">
        <div className="card activity-card">
          <div className="activity-marker" aria-hidden="true" />
          <div>
            <h4>No activity to show yet</h4>
            <p>New leads, deals won, project changes, invoices, payments and operational events will appear here.</p>
          </div>
        </div>
      </OverviewSection>
    </div>
  );
}
