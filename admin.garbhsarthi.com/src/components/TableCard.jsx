import React from 'react';
import { IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonChip } from '@ionic/react';

const TableCard = ({ title, columns, rows, loading }) => (
  <IonCard className="table-card">
    <IonCardHeader>
      <IonCardTitle>{title}</IonCardTitle>
    </IonCardHeader>
    <IonCardContent>
      {loading ? (
        <div className="muted">Loading...</div>
      ) : (
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                {columns.map((c) => (
                  <th key={c.key}>{c.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id ?? JSON.stringify(row)}>
                  {columns.map((c) => (
                    <td key={c.key}>
                      {typeof row[c.key] === 'boolean' ? (
                        <IonChip color={row[c.key] ? 'success' : 'medium'}>{row[c.key] ? 'Yes' : 'No'}</IonChip>
                      ) : (
                        row[c.key] ?? '-'
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </IonCardContent>
  </IonCard>
);

export default TableCard;
