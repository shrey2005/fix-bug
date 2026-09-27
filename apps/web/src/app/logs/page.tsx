'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { LogsTable } from '../../components/logs/LogsTable';
import { LogFilters } from '../../components/logs/LogFilters';
import { Pagination } from '../../components/ui/Pagination';
import { Spinner } from '../../components/ui/Spinner';
import { Card } from '../../components/ui/Card';
import { api } from '../../lib/api';

export default function LogsPage() {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({});
  const limit = 10;

  const servicesQuery = useQuery({
    queryKey: ['services'],
    queryFn: async () => {
      const response = await api.get('/services');
      return response.data.data || [];
    },
  });

  const logsQuery = useQuery({
    queryKey: ['logs', page, limit, filters],
    queryFn: async () => {
      const response = await api.get('/logs', {
        params: { page, limit, ...filters },
      });
      return response.data;
    },
  });

  const logs = logsQuery.data?.logs || [];
  console.log({logs})
  const meta = logsQuery.data?.meta || { page: 1, limit: 10, total: 0, pages: 1 };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-white mb-8">API Logs</h1>

      {servicesQuery.isLoading ? (
        <Spinner />
      ) : (
        <>
          <LogFilters onFilterChange={setFilters} services={servicesQuery.data || []} />
          
          {logsQuery.isLoading ? (
            <Spinner />
          ) : (
            <>
              <LogsTable logs={logs} isLoading={logsQuery.isLoading} />
              <Card className="mt-6 flex items-center justify-between">
                <div className="text-slate-400">
                  Page {meta.page} of {meta.pages} | Showing {logs.length} of {meta.total} records
                </div>
                <Pagination page={meta.page} pages={meta.pages} onPageChange={setPage} />
              </Card>
            </>
          )}
        </>
      )}
    </div>
  );
}
