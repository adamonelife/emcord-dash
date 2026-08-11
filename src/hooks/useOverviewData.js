import { useEffect, useState } from 'react';
import { getDeals } from '../lib/deals';
import { getInvoices } from '../lib/finance';
import { buildCommercialMetrics } from '../lib/overviewMetrics';

const emptyCommercial = buildCommercialMetrics();

export function useOverviewData() {
  const [state, setState] = useState({
    loading: true,
    commercial: emptyCommercial,
    unavailableSources: []
  });

  useEffect(() => {
    let active = true;

    Promise.allSettled([getDeals(), getInvoices()]).then(([dealsResult, invoicesResult]) => {
      if (!active) return;

      const unavailableSources = [];
      if (dealsResult.status === 'rejected') unavailableSources.push('sales');
      if (invoicesResult.status === 'rejected') unavailableSources.push('finance');

      setState({
        loading: false,
        commercial: buildCommercialMetrics(
          dealsResult.status === 'fulfilled' ? dealsResult.value : [],
          invoicesResult.status === 'fulfilled' ? invoicesResult.value : []
        ),
        unavailableSources
      });
    });

    return () => { active = false; };
  }, []);

  return state;
}
