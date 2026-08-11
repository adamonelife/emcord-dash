import { useEffect, useState } from 'react';
import { getDeals } from '../lib/deals';
import { getInvoices } from '../lib/finance';
import { getProjects } from '../lib/projects';
import { buildCommercialMetrics, buildDeliveryMetrics } from '../lib/overviewMetrics';

const emptyCommercial = buildCommercialMetrics();
const emptyDelivery = buildDeliveryMetrics();

export function useOverviewData() {
  const [state, setState] = useState({
    loading: true,
    commercial: emptyCommercial,
    delivery: emptyDelivery,
    unavailableSources: []
  });

  useEffect(() => {
    let active = true;

    Promise.allSettled([getDeals(), getInvoices(), getProjects()]).then(([dealsResult, invoicesResult, projectsResult]) => {
      if (!active) return;

      const unavailableSources = [];
      if (dealsResult.status === 'rejected') unavailableSources.push('sales');
      if (invoicesResult.status === 'rejected') unavailableSources.push('finance');
      if (projectsResult.status === 'rejected') unavailableSources.push('projects');

      setState({
        loading: false,
        commercial: buildCommercialMetrics(
          dealsResult.status === 'fulfilled' ? dealsResult.value : [],
          invoicesResult.status === 'fulfilled' ? invoicesResult.value : []
        ),
        delivery: buildDeliveryMetrics(
          projectsResult.status === 'fulfilled' ? projectsResult.value : []
        ),
        unavailableSources
      });
    });

    return () => { active = false; };
  }, []);

  return state;
}
