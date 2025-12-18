import React, { useEffect } from 'react';
import { IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonGrid, IonRow, IonCol, IonChip } from '@ionic/react';
import { columns } from '../data/columns';
import TableCard from '../components/TableCard';
import useStore from '../state/useStore';

const VideoLibraryPage = () => {
  const { dataCache, fetchTable, loading } = useStore();
  const videos = dataCache.videos || [];

  useEffect(() => {
    fetchTable('videos');
  }, [fetchTable]);

  return (
    <div className="page-content">
      <h1 className="page-title">Video Library</h1>
      <p className="muted mb-3">Curated content by category, role, and trimester.</p>
      <IonGrid>
        <IonRow>
          {videos.map((video) => (
            <IonCol key={video.id} size="12" sizeMd="6" sizeLg="4">
              <IonCard className="video-card">
                <IonCardHeader>
                  <IonCardTitle>{video.title}</IonCardTitle>
                </IonCardHeader>
                <IonCardContent>
                  <div className="muted">{video.category}</div>
                  <div className="muted">Role: {video.role === '2' ? 'Women' : 'Partner'}</div>
                  <div className="muted">Trimester: {video.trimester ?? 'N/A'}</div>
                  <IonChip color="success" className="mt-2">ID: {video.id}</IonChip>
                </IonCardContent>
              </IonCard>
            </IonCol>
          ))}
        </IonRow>
        <IonRow>
          <IonCol size="12">
            <TableCard title="All videos" columns={columns.videos} rows={videos} loading={loading?.videos} />
          </IonCol>
        </IonRow>
      </IonGrid>
    </div>
  );
};

export default VideoLibraryPage;
