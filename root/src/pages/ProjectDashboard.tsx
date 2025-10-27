import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
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
    MDBListGroupItem
} from 'mdb-react-ui-kit';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

import General_Loading from '../app_components/General_Loading';

import { fetchProject, APIProjectInfo } from '../api_module/ProjectRequests';
import { getCustomerB2BInfo, APICustomerB2BInfo } from '../api_module/CustomerB2BRequest';
import { getCustomerTeamMembersList, APICustTeamMemberInfo } from '../api_module/CustomerTeamMemberRequest';

ChartJS.register(ArcElement, Tooltip, Legend);



export const ProjectDashboard: React.FC = () => {
    const { project_uid: project_uid } = useParams<{ project_uid: string }>();
    if (!project_uid) {
        return (<div className="alert alert-danger">
            UID del progetto mancante in URL!
        </div>);  // o qualsiasi fallback
    }


    const [project, setProject] = useState<APIProjectInfo | null>(null);
    const [customer, setCustomer] = useState<APICustomerB2BInfo | null>(null);
    const [team, setTeam] = useState<APICustTeamMemberInfo[]>([]);
    const [loadingMode, setLoadingMode] = useState(true);

    // mock activity log
    const [activityLog] = useState([
        { date: '2025-04-01 14:30', description: 'Project loaded' },
        { date: '2025-04-01 15:00', description: 'Customer info fetched' },
        { date: '2025-04-02 10:15', description: 'Team members loaded' }
    ]);

    useEffect(() => {
        async function loadAll() {
            setLoadingMode(true);
            try {
                const projRes = await fetchProject({ project_uid: project_uid! });
                if (projRes.data) {
                    setProject(projRes.data);
                    const custRes = await getCustomerB2BInfo({ customer_uid: projRes.data.customer_uid });
                    if (custRes.data) setCustomer(custRes.data);
                    const teamRes = await getCustomerTeamMembersList({ customer_uid: projRes.data.customer_uid });
                    if (teamRes.data) setTeam(teamRes.data);
                }
            } finally {
                setLoadingMode(false);
            }
        }
        loadAll();
    }, [project_uid]);

    // SET LOADING
    if (loadingMode || !project || !customer) {
        return (<General_Loading theme="pageLoading" title='Dashboard Progetto' />);
    }

    // Statistiche
    const totalMembers = team.length;
    const daysSpan = project.start_date && project.end_date
        ? Math.floor((new Date(project.end_date).getTime() - new Date(project.start_date).getTime()) / (1000 * 60 * 60 * 24))
        : 0;
    const completionPct = customer.estimate_count && project.stand
        ? Math.min(100, Math.round((customer.estimate_count / parseInt(project.stand)) * 100))
        : 0;

    const chartData = {
        labels: ['Team', 'Rimanenti'],
        datasets: [{
            data: [totalMembers, Math.max(0, 10 - totalMembers)],
            backgroundColor: ['rgba(0,123,255,0.2)', 'rgba(108,117,125,0.2)'],
            borderColor: ['rgba(0,123,255,1)', 'rgba(108,117,125,1)'],
            borderWidth: 1
        }]
    };
    const chartOptions = {
        maintainAspectRatio: false,
        responsive: true,
        plugins: { legend: { position: 'right' as const } }
    };

    return (
        <MDBContainer fluid className="py-4">
            <h3 className="mb-3">Dashboard Progetto: {project.title}</h3>

            <MDBRow className="mb-4">
                <MDBCol md="12">
                    <MDBCard className="p-4" style={{ borderRadius: 0 }}>
                        <MDBCardBody>
                            <MDBCardTitle>Cliente: {customer.business_name}</MDBCardTitle>
                            <MDBCardText>
                                {customer.city} – P.IVA {customer.vat_number}
                            </MDBCardText>
                        </MDBCardBody>
                    </MDBCard>
                </MDBCol>
            </MDBRow>

            <MDBRow className="mb-4 d-flex align-items-stretch">
                <MDBCol md="4">
                    <MDBCard className="p-4 h-100" style={{ borderRadius: 10 }}>
                        <MDBCardBody>
                            <MDBCardTitle>Durata Evento</MDBCardTitle>
                            <MDBProgress value={daysSpan} max={365} className="mb-2" />
                            <MDBCardText>
                                {daysSpan} giorni ({project.start_date} → {project.end_date})
                            </MDBCardText>
                        </MDBCardBody>
                    </MDBCard>
                </MDBCol>
                <MDBCol md="4">
                    <MDBCard className="p-4 h-100" style={{ borderRadius: 10 }}>
                        <MDBCardBody>
                            <MDBCardTitle>Team Members</MDBCardTitle>
                            <MDBProgress value={totalMembers} max={10} className="mb-2" />
                            <MDBCardText>
                                {totalMembers} membri registrati
                            </MDBCardText>
                        </MDBCardBody>
                    </MDBCard>
                </MDBCol>
                <MDBCol md="4">
                    <MDBCard className="p-4 h-100" style={{ borderRadius: 10 }}>
                        <MDBCardBody>
                            <MDBCardTitle>Preventivi</MDBCardTitle>
                            <MDBProgress value={completionPct} max={100} className="mb-2" />
                            <MDBCardText>
                                {completionPct}% completato
                            </MDBCardText>
                        </MDBCardBody>
                    </MDBCard>
                </MDBCol>
            </MDBRow>

            <MDBRow className="mb-4">
                <MDBCol md="12">
                    <MDBCard className="p-4" style={{ borderRadius: 10 }}>
                        <MDBCardBody>
                            <MDBCardTitle>Log Attività</MDBCardTitle>
                            <MDBListGroup flush>
                                {activityLog.map((log, i) => (
                                    <MDBListGroupItem key={i}>
                                        <strong>{log.date}</strong> — {log.description}
                                    </MDBListGroupItem>
                                ))}
                            </MDBListGroup>
                        </MDBCardBody>
                    </MDBCard>
                </MDBCol>
            </MDBRow>

            <MDBRow>
                <MDBCol md="12">
                    <MDBCard className="p-4" style={{ borderRadius: 10 }}>
                        <MDBCardBody>
                            <MDBCardTitle>Team Composition</MDBCardTitle>
                            <div style={{ position: 'relative', height: 250 }}>
                                <Pie data={chartData} options={chartOptions} />
                            </div>
                        </MDBCardBody>
                    </MDBCard>
                </MDBCol>
            </MDBRow>
        </MDBContainer>
    );
};

export default ProjectDashboard;
