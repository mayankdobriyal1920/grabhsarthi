import React, { useEffect } from 'react';
import { IonApp } from '@ionic/react';
import { BrowserRouter as Router, Navigate, Route, Routes } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import EntityPage from './pages/EntityPage';
import CommunityPage from './pages/CommunityPage';
import VideoLibraryPage from './pages/VideoLibraryPage';
import Layout from './components/Layout';
import useStore from './state/useStore';

const ProtectedApp = () => {
  const { user, bootstrap, bootstrapped } = useStore();

  useEffect(() => {
    bootstrap();
  }, []);

  if (!bootstrapped) return null;
  if (!user) return <Navigate to="/login" replace />;

  return (
    <Layout>
      <Routes>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/users" element={<EntityPage title="App Users" tableKey="users" />} />
        <Route path="/profiles" element={<EntityPage title="Profiles" tableKey="profiles" />} />
        <Route path="/subscriptions" element={<EntityPage title="Subscription Plans" tableKey="plans" />} />
        <Route path="/payments" element={<EntityPage title="User Subscriptions" tableKey="subscriptions" />} />
        <Route path="/live-classes" element={<EntityPage title="Live Classes" tableKey="liveClasses" />} />
        <Route path="/trainers" element={<EntityPage title="Trainers" tableKey="trainers" />} />
        <Route path="/daily-tasks" element={<EntityPage title="Daily Task Progress" tableKey="tasks" />} />
        <Route path="/integrations" element={<EntityPage title="User Integrations" tableKey="integrations" />} />
        <Route path="/community" element={<CommunityPage />} />
        <Route path="/videos" element={<VideoLibraryPage />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Layout>
  );
};

const App = () => (
  <IonApp>
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/*" element={<ProtectedApp />} />
      </Routes>
    </Router>
  </IonApp>
);

export default App;
