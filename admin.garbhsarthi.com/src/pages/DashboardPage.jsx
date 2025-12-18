import React, { useEffect, useMemo } from 'react';
import { IonGrid, IonRow, IonCol } from '@ionic/react';
import StatCard from '../components/StatCard';
import TableCard from '../components/TableCard';
import { LineCard, PieCard, BarCard } from '../components/ChartCards';
import { columns } from '../data/columns';
import useStore from '../state/useStore';

const DashboardPage = () => {
  const { metrics, dataCache, fetchMetrics, fetchTable } = useStore();

  useEffect(() => {
    fetchMetrics();
    fetchTable('liveClasses');
    fetchTable('subscriptions');
    fetchTable('users');
  }, [fetchMetrics, fetchTable]);

  const statCards = useMemo(() => {
    if (!metrics) return [];
    return [
      { label: 'Total Users', value: metrics.totalUsers, trend: '', tone: 'positive' },
      { label: 'Pregnant Moms', value: metrics.pregnant, trend: '', tone: 'positive' },
      { label: 'Trying to Conceive', value: metrics.ttc, trend: '', tone: 'positive' },
      { label: 'Active Subscriptions', value: metrics.activeSubs, trend: '', tone: 'positive' }
    ];
  }, [metrics]);

  // Basic derived chart placeholders from current data
  const roleSplit = useMemo(() => {
    const users = dataCache.users || [];
    const counts = users.reduce(
      (acc, u) => {
        if (u.role === 2) acc.pregnant += 1;
        else if (u.role === 3) acc.ttc += 1;
        else acc.admin += 1;
        return acc;
      },
      { pregnant: 0, ttc: 0, admin: 0 }
    );
    return [
      { name: 'Pregnant', value: counts.pregnant },
      { name: 'TTC', value: counts.ttc },
      { name: 'Admin', value: counts.admin }
    ];
  }, [dataCache.users]);

  const taskCompletion = [
    { name: 'Yoga', value: 80 },
    { name: 'Meditation', value: 72 },
    { name: 'Hydration', value: 65 },
    { name: 'Mood', value: 60 }
  ];

  const subsTrend = useMemo(() => {
    const subs = dataCache.subscriptions || [];
    // fallback mock trend: count per month for last 6 months
    const now = new Date();
    const months = Array.from({ length: 6 }).map((_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
      return { key: `${d.getFullYear()}-${d.getMonth()}`, label: d.toLocaleString('en', { month: 'short' }) };
    });
    return months.map((m) => {
      const count = subs.filter((s) => {
        const d = new Date(s.start_date);
        return d.getFullYear() === Number(m.key.split('-')[0]) && d.getMonth() === Number(m.key.split('-')[1]);
      }).length;
      return { month: m.label, standard: count, premium: Math.max(0, count - 1) };
    });
  }, [dataCache.subscriptions]);

  const liveClasses = dataCache.liveClasses || [];
  const subs = (dataCache.subscriptions || []).slice(0, 5);

  return (
    <div className="page-content">
      <h1 className="page-title">Dashboard Overview</h1>
      <p className="muted mb-3">Glance over users, subscriptions, live classes and engagement.</p>
      <IonGrid>
        <IonRow>
          {statCards.map((item) => (
            <IonCol key={item.label} size="12" sizeMd="6" sizeLg="3">
              <StatCard {...item} />
            </IonCol>
          ))}
        </IonRow>
        <IonRow>
          <IonCol size="12" sizeLg="6">
            <LineCard
              title="Subscriptions trend"
              data={subsTrend}
              lines={[
                { dataKey: 'standard', color: '#5a67d8' },
                { dataKey: 'premium', color: '#22c55e' }
              ]}
            />
          </IonCol>
          <IonCol size="12" sizeLg="3">
            <PieCard title="User role split" data={roleSplit} />
          </IonCol>
          <IonCol size="12" sizeLg="3">
            <BarCard title="Task completion %" data={taskCompletion} dataKey="value" />
          </IonCol>
        </IonRow>
        <IonRow>
          <IonCol size="12" sizeLg="6">
            <TableCard title="Upcoming live classes" columns={columns.liveClasses} rows={liveClasses} />
          </IonCol>
          <IonCol size="12" sizeLg="6">
            <TableCard title="Recent subscriptions" columns={columns.subscriptions} rows={subs} />
          </IonCol>
        </IonRow>
      </IonGrid>
    </div>
  );
};

export default DashboardPage;
