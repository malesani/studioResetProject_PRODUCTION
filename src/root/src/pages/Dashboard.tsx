import React, { useEffect, useState } from 'react';
import {
  MDBContainer,
  MDBRow,
  MDBCol,
  MDBCard,
  MDBCardBody,
  MDBCardTitle,
  MDBCardText,
  MDBProgress,
  MDBBtn,
  MDBListGroup,
  MDBListGroupItem,
} from 'mdb-react-ui-kit';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

// Registrazione dei componenti di Chart.js
ChartJS.register(ArcElement, Tooltip, Legend);

interface DashboardProps {
  userName: string;
  pageName: string;
}

const Dashboard: React.FC<DashboardProps> = ({ userName, pageName }) => {
  const [loading, setLoading] = useState(false);
  const [activityLog, setActivityLog] = useState<any[]>([
    { date: '2025-04-01 14:30', description: 'Accesso alla piattaforma' },
    { date: '2025-04-01 15:00', description: 'Cambio Fase progetto #123' },
    { date: '2025-04-02 10:15', description: 'Aggiornamento profilo utente' }
  ]);
  const [progress, setProgress] = useState(45); // Placeholder

  const chartData = {
    labels: [
      'Fase 1',
      'Fase 2',
      'Fase 3',
      'Fase 4',
      'Fase 5',
      'Fase 6',
      'Fase 7'
    ],
    datasets: [
      {
        data: [progress, 100 - progress, 10, 5, 3, 2, 8],
        backgroundColor: [
          'rgba(75, 192, 192, 0.2)',
          'rgba(255, 99, 132, 0.2)',
          'rgba(54, 162, 235, 0.2)',
          'rgba(153, 102, 255, 0.2)',
          'rgba(255, 159, 64, 0.2)',
          'rgba(255, 206, 86, 0.2)',
          'rgba(0, 123, 255, 0.2)'
        ],
        borderColor: [
          'rgba(75, 192, 192, 1)',
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(0, 123, 255, 1)'
        ],
        borderWidth: 1
      }
    ]
  };

  // Utilizzo di "as const" per forzare i literal types
  const chartOptions = {
    maintainAspectRatio: false,
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: 'right' as const,
        align: 'center' as const,
        labels: {
          usePointStyle: true
        }
      }
    }
  };

  const reloadSignatures = () => {
    alert('Ricarica firme cliccata!');
    // Integrazione con logica back-end
  };

  const handleChatClick = () => {
    alert('Chatta con noi cliccata!');
  };

  useEffect(() => {
    setLoading(false);
  }, []);

  return (
    <MDBContainer fluid>
      <h3>{pageName}</h3>
      <MDBRow className="mb-4">
        <MDBCol md="12">
          <MDBCard className="p-4" style={{ borderRadius: '0' }}>
            <MDBCardBody>
              <MDBCardTitle>Benvenuto {userName}</MDBCardTitle>
              <MDBCardText>Ultimo accesso: 2025-04-02 10:15</MDBCardText>
            </MDBCardBody>
          </MDBCard>
        </MDBCol>
      </MDBRow>

      {/* Numero di firme rimaste */}
      <MDBRow className="mb-4 d-flex align-items-stretch">
        <MDBCol md="4">
          <MDBCard className="p-4 h-100" style={{ borderRadius: '10px' }}>
            <MDBCardBody>
              <MDBCardTitle>Numero di Progetti</MDBCardTitle>
              <MDBProgress value={progress} max={100} />
              <MDBCardText>
                Hai completato {progress} progetti.
              </MDBCardText>
              <MDBBtn onClick={reloadSignatures}>Carica Statistiche</MDBBtn>
            </MDBCardBody>
          </MDBCard>
        </MDBCol>
        <MDBCol md="8">
          <MDBCard className="p-4 h-100" style={{ borderRadius: '10px' }}>
            <MDBCardBody>
              <MDBCardTitle>Log Attività</MDBCardTitle>
              <MDBListGroup>
                {activityLog.map((log, index) => (
                  <MDBListGroupItem key={index}>
                    {log.date} - {log.description}
                  </MDBListGroupItem>
                ))}
              </MDBListGroup>
            </MDBCardBody>
          </MDBCard>
        </MDBCol>
      </MDBRow>

      {/* Statistiche piattaforma, Info App e Chat Bot */}
      <MDBRow className="mb-4 d-flex align-items-stretch">
        {/* Blocco Statistiche Piattaforma */}
        <MDBCol md="12">
          <MDBCard className="p-4 h-100" style={{ borderRadius: '10px' }}>
            <MDBCardBody>
              <MDBCardTitle>Statistiche Piattaforma</MDBCardTitle>
              {/* Contenitore con altezza fissa per il grafico */}
              <div style={{ position: 'relative', height: '300px' }}>
                <Pie data={chartData} options={chartOptions} />
              </div>
            </MDBCardBody>
          </MDBCard>
        </MDBCol>
      </MDBRow>
    </MDBContainer>
  );
};

export default Dashboard;
