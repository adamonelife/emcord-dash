import { createContext, useContext, useState } from 'react';
import { SERVICE_TYPES } from '../lib/deals';

const ServiceTypeContext = createContext(null);

export function ServiceTypeProvider({ children }) {
  const [serviceType, setServiceType] = useState('All');
  return (
    <ServiceTypeContext.Provider value={{ serviceType, setServiceType, options: ['All', ...SERVICE_TYPES] }}>
      {children}
    </ServiceTypeContext.Provider>
  );
}

export function useServiceType() {
  const ctx = useContext(ServiceTypeContext);
  if (!ctx) throw new Error('useServiceType must be used within ServiceTypeProvider');
  return ctx;
}
