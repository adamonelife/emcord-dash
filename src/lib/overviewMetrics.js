import { sumByCurrency } from './currency.js';
import { ACTIVE_PROJECT_STATUSES } from './projectConstants.js';

const OPEN_STAGES = new Set(['New Lead', 'Qualified', 'Proposal Sent', 'Negotiation']);

export function buildCommercialMetrics(deals = [], invoices = []) {
  const openDeals = deals.filter((deal) => OPEN_STAGES.has(deal.stage));
  const wonDeals = deals.filter((deal) => deal.stage === 'Won');
  const outstandingInvoices = invoices.filter(
    (invoice) => invoice.status !== 'Paid' && invoice.status !== 'Void'
  );

  return {
    openPipeline: sumByCurrency(openDeals),
    wonRevenue: sumByCurrency(wonDeals),
    outstandingInvoices: sumByCurrency(outstandingInvoices)
  };
}

export function buildDeliveryMetrics(projects = [], today = new Date()) {
  const activeProjects = projects.filter((project) => ACTIVE_PROJECT_STATUSES.includes(project.status));
  const completedProjects = projects.filter((project) => project.status === 'Completed');
  const projectsAtRisk = activeProjects.filter((project) => project.status === 'At Risk');
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const deadline = new Date(todayStart);
  deadline.setDate(deadline.getDate() + 30);

  const upcomingDeadlines = activeProjects.filter((project) => {
    if (!project.target_completion_date) return false;
    const targetDate = new Date(`${project.target_completion_date}T00:00:00`);
    return targetDate >= todayStart && targetDate <= deadline;
  });

  return {
    activeCount: activeProjects.length,
    activeValue: sumByCurrency(activeProjects, 'project_value'),
    atRiskCount: projectsAtRisk.length,
    upcomingDeadlineCount: upcomingDeadlines.length,
    completedCount: completedProjects.length
  };
}
