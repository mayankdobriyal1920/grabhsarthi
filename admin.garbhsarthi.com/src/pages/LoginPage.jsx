import React, { useEffect, useState } from 'react';
import {
  IonButton,
  IonCard,
  IonCardContent,
  IonContent,
  IonHeader,
  IonInput,
  IonItem,
  IonLabel,
  IonPage,
  IonTitle,
  IonToolbar
} from '@ionic/react';
import useStore from '../state/useStore';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login, loginError, user } = useStore();
  const [form, setForm] = useState({ email: '', otp: '' });

  useEffect(() => {
    if (user) navigate('/dashboard');
  }, [user, navigate]);

  const onSubmit = (e) => {
    e.preventDefault();
    login(form);
  };

  return (
    <IonPage>
      <IonHeader translucent>
        <IonToolbar>
          <IonTitle>GarbhSarthi Admin</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen className="login-bg">
        <div className="login-shell">
          <IonCard className="login-card">
            <IonCardContent>
              <h2>Welcome back</h2>
              <p className="muted">Manage users, subscriptions, classes, and content in one console.</p>
              <form onSubmit={onSubmit} className="login-form">
                <IonItem fill="outline">
                  <IonLabel position="stacked">Email</IonLabel>
                  <IonInput
                    type="email"
                    required
                    value={form.email}
                    onIonChange={(e) => setForm({ ...form, email: e.detail.value })}
                    placeholder="admin@garbhsarthi.com"
                  />
                </IonItem>
                <IonItem fill="outline">
                  <IonLabel position="stacked">OTP</IonLabel>
                  <IonInput
                    type="text"
                    required
                    value={form.otp}
                    onIonChange={(e) => setForm({ ...form, otp: e.detail.value })}
                    placeholder="Enter the OTP"
                  />
                </IonItem>
                {loginError && <div className="error-text">{loginError}</div>}
                <IonButton expand="block" type="submit" className="mt-3">
                  Login
                </IonButton>
              </form>
            </IonCardContent>
          </IonCard>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default LoginPage;
