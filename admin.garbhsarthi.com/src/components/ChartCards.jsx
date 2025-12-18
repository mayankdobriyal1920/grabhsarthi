import React from 'react';
import { IonCard, IonCardHeader, IonCardTitle, IonCardContent } from '@ionic/react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';

const COLORS = ['#5a67d8', '#22c55e', '#f97316', '#0ea5e9'];

export const LineCard = ({ title, data, lines }) => (
  <IonCard className="chart-card">
    <IonCardHeader>
      <IonCardTitle>{title}</IonCardTitle>
    </IonCardHeader>
    <IonCardContent>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={data}>
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          {lines.map((line, idx) => (
            <Line key={line.dataKey} type="monotone" dataKey={line.dataKey} stroke={line.color ?? COLORS[idx % COLORS.length]} strokeWidth={3} dot={false} />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </IonCardContent>
  </IonCard>
);

export const PieCard = ({ title, data }) => (
  <IonCard className="chart-card">
    <IonCardHeader>
      <IonCardTitle>{title}</IonCardTitle>
    </IonCardHeader>
    <IonCardContent>
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" outerRadius={90} label>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </IonCardContent>
  </IonCard>
);

export const BarCard = ({ title, data, dataKey }) => (
  <IonCard className="chart-card">
    <IonCardHeader>
      <IonCardTitle>{title}</IonCardTitle>
    </IonCardHeader>
    <IonCardContent>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data}>
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Bar dataKey={dataKey} fill="#22c55e" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </IonCardContent>
  </IonCard>
);
