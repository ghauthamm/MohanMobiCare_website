import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Badge, Table } from 'react-bootstrap';
import { FaUser, FaTools, FaShoppingBag, FaCalendarAlt, FaClock, FaCheckCircle } from 'react-icons/fa';
import { ref, get, query, orderByChild, equalTo } from 'firebase/database';
import { database } from '../../firebase/config';
import { useAuth } from '../../context/AuthContext';
import { useLoading } from '../../context/LoadingContext';
import './Dashboard.css';

function Dashboard() {
    const navigate = useNavigate();
    const { currentUser, userRole } = useAuth();
    const { showLoading, hideLoading } = useLoading();

    const [serviceRequests, setServiceRequests] = useState([]);
    const [orders, setOrders] = useState([]);

    useEffect(() => {
        if (!currentUser) {
            navigate('/login');
            return;
        }

        if (userRole === 'admin') {
            navigate('/admin');
            return;
        }

        fetchUserData();
    }, [currentUser, userRole, navigate]);

    const fetchUserData = async () => {
        showLoading('Loading your dashboard...');

        try {
            // Fetch service requests for current user
            const serviceRef = ref(database, 'serviceRequests');
            const snapshot = await get(serviceRef);

            if (snapshot.exists()) {
                const data = snapshot.val();
                const userServices = Object.entries(data)
                    .map(([id, service]) => ({ id, ...service }))
                    .filter(service => service.userId === currentUser.uid)
                    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

                setServiceRequests(userServices);
            }

            // Fetch orders (if any)
            const ordersRef = ref(database, 'orders');
            const ordersSnapshot = await get(ordersRef);

            if (ordersSnapshot.exists()) {
                const ordersData = ordersSnapshot.val();
                const userOrders = Object.entries(ordersData)
                    .map(([id, order]) => ({ id, ...order }))
                    .filter(order => order.userId === currentUser.uid)
                    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

                setOrders(userOrders);
            }
        } catch (error) {
            console.error('Error fetching user data:', error);
        }

        hideLoading();
    };

    const getStatusBadge = (status) => {
        const statusColors = {
            'Received': 'warning',
            'In Progress': 'info',
            'Ready': 'success',
            'Delivered': 'secondary'
        };
        return <Badge bg={statusColors[status] || 'secondary'}>{status}</Badge>;
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Not set';
        return new Date(dateString).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    return (
        <div className="dashboard-page">
            <Container>
                {/* Welcome Section */}
                <div className="dashboard-header">
                    <div className="welcome-section">
                        <div className="user-avatar">
                            <FaUser />
                        </div>
                        <div className="welcome-text">
                            <h1>Welcome back!</h1>
                            <p>{currentUser?.email}</p>
                        </div>
                    </div>
                </div>

                {/* Stats Cards */}
                <Row className="stats-row">
                    <Col md={4}>
                        <Card className="stat-card">
                            <Card.Body>
                                <div className="stat-icon service-icon">
                                    <FaTools />
                                </div>
                                <div className="stat-info">
                                    <h3>{serviceRequests.length}</h3>
                                    <p>Service Requests</p>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={4}>
                        <Card className="stat-card">
                            <Card.Body>
                                <div className="stat-icon pending-icon">
                                    <FaClock />
                                </div>
                                <div className="stat-info">
                                    <h3>{serviceRequests.filter(s => s.status !== 'Ready' && s.status !== 'Delivered').length}</h3>
                                    <p>In Progress</p>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={4}>
                        <Card className="stat-card">
                            <Card.Body>
                                <div className="stat-icon complete-icon">
                                    <FaCheckCircle />
                                </div>
                                <div className="stat-info">
                                    <h3>{serviceRequests.filter(s => s.status === 'Ready' || s.status === 'Delivered').length}</h3>
                                    <p>Completed</p>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>

                {/* Service Requests */}
                <Card className="data-card">
                    <Card.Header>
                        <h2><FaTools className="section-icon" /> Your Service Requests</h2>
                    </Card.Header>
                    <Card.Body>
                        {serviceRequests.length === 0 ? (
                            <div className="empty-state">
                                <span className="empty-icon">🔧</span>
                                <h4>No service requests yet</h4>
                                <p>When you submit a service request, it will appear here</p>
                                <button className="btn-primary-custom" onClick={() => navigate('/service')}>
                                    Book a Service
                                </button>
                            </div>
                        ) : (
                            <div className="table-responsive">
                                <Table className="custom-table">
                                    <thead>
                                        <tr>
                                            <th>Service ID</th>
                                            <th>Device</th>
                                            <th>Brand</th>
                                            <th>Status</th>
                                            <th>Submitted</th>
                                            <th>Completion Date</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {serviceRequests.map(service => (
                                            <tr key={service.id}>
                                                <td className="service-id">{service.serviceId}</td>
                                                <td>{service.deviceType?.toUpperCase()}</td>
                                                <td>{service.brand}</td>
                                                <td>{getStatusBadge(service.status)}</td>
                                                <td>{formatDate(service.createdAt)}</td>
                                                <td>
                                                    {service.completionDate ? (
                                                        <div className="completion-date">
                                                            <FaCalendarAlt className="date-icon" />
                                                            <span>Ready on <strong>{formatDate(service.completionDate)}</strong></span>
                                                        </div>
                                                    ) : (
                                                        <span className="pending-date">Pending</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            </div>
                        )}
                    </Card.Body>
                </Card>

                {/* Completion Date Messages */}
                {serviceRequests.filter(s => s.completionDate && s.status !== 'Delivered').length > 0 && (
                    <Card className="notification-card">
                        <Card.Header>
                            <h2><FaCalendarAlt className="section-icon" /> Pickup Notifications</h2>
                        </Card.Header>
                        <Card.Body>
                            {serviceRequests
                                .filter(s => s.completionDate && s.status !== 'Delivered')
                                .map(service => (
                                    <div key={service.id} className="notification-item">
                                        <div className="notification-icon">📱</div>
                                        <div className="notification-content">
                                            <h5>{service.brand} {service.deviceType?.toUpperCase()}</h5>
                                            <p className="notification-message">
                                                Your product will be ready on <strong>{formatDate(service.completionDate)}</strong>
                                            </p>
                                            <span className="notification-id">Service ID: {service.serviceId}</span>
                                        </div>
                                        {getStatusBadge(service.status)}
                                    </div>
                                ))
                            }
                        </Card.Body>
                    </Card>
                )}
            </Container>
        </div>
    );
}

export default Dashboard;
