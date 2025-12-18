import React, { useEffect } from 'react';
import TableCard from '../components/TableCard';
import { columns } from '../data/columns';
import useStore from '../state/useStore';

const EntityPage = ({ title, tableKey }) => {
  const { dataCache, loading, fetchTable } = useStore();
  const rows = dataCache[tableKey] || [];

  useEffect(() => {
    fetchTable(tableKey);
  }, [tableKey, fetchTable]);

  return (
    <div className="page-content">
      <h1 className="page-title">{title}</h1>
      <p className="muted mb-3">Data derived from `{tableKey}` table in the garbhsarthi schema.</p>
      <TableCard title={title} columns={columns[tableKey]} rows={rows} loading={loading?.[tableKey]} />
    </div>
  );
};

export default EntityPage;
