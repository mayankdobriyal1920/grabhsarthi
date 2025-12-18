import React from 'react';
import { IonCard, IonCardContent, IonIcon } from '@ionic/react';
import { trendingUpOutline, trendingDownOutline } from 'ionicons/icons';
import clsx from 'clsx';

const StatCard = ({ label, value, trend, tone = 'positive' }) => (
  <IonCard className="stat-card">
    <IonCardContent>
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
      <div className={clsx('stat-trend', tone === 'positive' ? 'positive' : 'negative')}>
        <IonIcon icon={tone === 'positive' ? trendingUpOutline : trendingDownOutline} />
        <span>{trend}</span>
      </div>
    </IonCardContent>
  </IonCard>
);

export default StatCard;
