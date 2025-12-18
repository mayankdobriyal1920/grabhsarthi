import React, { useEffect } from 'react';
import { IonGrid, IonRow, IonCol, IonCard, IonCardHeader, IonCardTitle, IonCardContent } from '@ionic/react';
import { columns } from '../data/columns';
import TableCard from '../components/TableCard';
import useStore from '../state/useStore';

const CommunityPage = () => {
  const { dataCache, fetchTable, loading } = useStore();
  const posts = dataCache.communityPosts || [];
  const comments = dataCache.communityComments || [];

  useEffect(() => {
    fetchTable('communityPosts');
    fetchTable('communityComments');
  }, [fetchTable]);

  return (
    <div className="page-content">
      <h1 className="page-title">Community</h1>
      <p className="muted mb-3">Posts and comments created by app users.</p>
      <IonGrid>
        <IonRow>
          {posts.map((post) => (
            <IonCol key={post.id} size="12" sizeMd="6" sizeLg="4">
              <IonCard className="post-card">
                <IonCardHeader>
                  <IonCardTitle>{post.message?.slice(0, 60) ?? ''}{post.message?.length > 60 ? '...' : ''}</IonCardTitle>
                </IonCardHeader>
                <IonCardContent>
                  <div className="muted">Type: {post.object_type}</div>
                  <div className="muted">User ID: {post.created_by}</div>
                  <div className="muted">Posted: {post.created_at}</div>
                </IonCardContent>
              </IonCard>
            </IonCol>
          ))}
        </IonRow>
        <IonRow>
          <IonCol size="12" sizeLg="6">
            <TableCard title="Posts" columns={columns.communityPosts} rows={posts} loading={loading?.communityPosts} />
          </IonCol>
          <IonCol size="12" sizeLg="6">
            <TableCard title="Comments" columns={columns.communityComments} rows={comments} loading={loading?.communityComments} />
          </IonCol>
        </IonRow>
      </IonGrid>
    </div>
  );
};

export default CommunityPage;
