import { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Card, Alert } from 'react-bootstrap';
import { FaMobile, FaLaptop, FaVideo, FaBatteryFull, FaCheckCircle, FaTools } from 'react-icons/fa';
import { ref, push, set } from 'firebase/database';
import { database } from '../../firebase/config';
import { useLoading } from '../../context/LoadingContext';
import { useAuth } from '../../context/AuthContext';
import './Service.css';

const deviceTypes = [
    { id: 'mobile', name: 'Mobile Phone', icon: <FaMobile /> },
    { id: 'laptop', name: 'Laptop', icon: <FaLaptop /> },
    { id: 'cctv', name: 'CCTV', icon: <FaVideo /> },
    { id: 'ups', name: 'UPS', icon: <FaBatteryFull /> }
];

const brands = {
    mobile: ['Apple', 'Samsung', 'OnePlus', 'Xiaomi', 'Google', 'Vivo', 'Oppo', 'Realme', 'Other'],
    laptop: ['Apple', 'Dell', 'HP', 'Lenovo', 'ASUS', 'Acer', 'MSI', 'Other'],
    cctv: ['Hikvision', 'Dahua', 'CP Plus', 'Bosch', 'Samsung', 'Other'],
    ups: ['APC', 'Luminous', 'Microtek', 'V-Guard', 'Exide', 'Other']
};

function Service() {
    const { showLoading, hideLoading } = useLoading();
    const { currentUser } = useAuth();

    const [formData, setFormData] = useState({
        customerName: '',
        phone: '',
        email: '',
        deviceType: '',
        brand: '',
        problemDescription: '',
        preferredDate: ''
    });

    const [errors, setErrors] = useState({});
    const [submitted, setSubmitted] = useState(false);
    const [serviceId, setServiceId] = useState('');

    useEffect(() => {
        showLoading('Loading Service Page...');
        const timer = setTimeout(() => {
            hideLoading();
        }, 600);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        if (currentUser) {
            setFormData(prev => ({
                ...prev,
                email: currentUser.email
            }));
        }
    }, [currentUser]);

    const validateForm = () => {
        const newErrors = {};

        if (!formData.customerName.trim()) {
            newErrors.customerName = 'Name is required';
        }

        if (!formData.phone.trim()) {
            newErrors.phone = 'Phone number is required';
        } else if (!/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))) {
            newErrors.phone = 'Enter a valid 10-digit phone number';
        }

        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Enter a valid email address';
        }

        if (!formData.deviceType) {
            newErrors.deviceType = 'Please select a device type';
        }

        if (!formData.brand) {
            newErrors.brand = 'Please select a brand';
        }

        if (!formData.problemDescription.trim()) {
            newErrors.problemDescription = 'Please describe the problem';
        }

        if (!formData.preferredDate) {
            newErrors.preferredDate = 'Please select a preferred date';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }

        // Reset brand when device type changes
        if (name === 'deviceType') {
            setFormData(prev => ({
                ...prev,
                brand: ''
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        showLoading('Submitting your service request...');

        try {
            const serviceRef = ref(database, 'serviceRequests');
            const newServiceRef = push(serviceRef);
            const id = `SRV-${Date.now().toString(36).toUpperCase()}`;

            await set(newServiceRef, {
                ...formData,
                serviceId: id,
                status: 'Received',
                completionDate: null,
                createdAt: new Date().toISOString(),
                userId: currentUser?.uid || null
            });

            setServiceId(id);
            setSubmitted(true);
            setFormData({
                customerName: '',
                phone: '',
                email: currentUser?.email || '',
                deviceType: '',
                brand: '',
                problemDescription: '',
                preferredDate: ''
            });
        } catch (error) {
            console.error('Error submitting service request:', error);
            alert('Failed to submit service request. Please try again.');
        }

        hideLoading();
    };

    const today = new Date().toISOString().split('T')[0];

    return (
        <div className="service-page">
            <div className="service-hero">
                <Container>
                    <h1 className="service-title">
                        <FaTools className="title-icon" />
                        Service Request
                    </h1>
                    <p className="service-subtitle">
                        Get your devices repaired by our expert technicians
                    </p>
                </Container>
            </div>

            <Container>
                <Row className="justify-content-center">
                    <Col lg={8}>
                        {submitted ? (
                            <Card className="success-card">
                                <Card.Body className="text-center py-5">
                                    <div className="success-icon">
                                        <FaCheckCircle />
                                    </div>
                                    <h2 className="success-title">Request Submitted Successfully!</h2>
                                    <p className="success-message">
                                        Your service request has been received. Our team will contact you shortly.
                                    </p>
                                    <div className="service-id-box">
                                        <span>Your Service ID</span>
                                        <strong>{serviceId}</strong>
                                    </div>
                                    <p className="success-note">
                                        Please save this ID to track your service status.
                                    </p>
                                    <button
                                        className="btn-primary-custom"
                                        onClick={() => setSubmitted(false)}
                                    >
                                        Submit Another Request
                                    </button>
                                </Card.Body>
                            </Card>
                        ) : (
                            <Card className="service-form-card">
                                <Card.Body className="p-4 p-md-5">
                                    <h2 className="form-title">Book Your Service</h2>
                                    <p className="form-subtitle">Fill in the details below and we'll take care of the rest</p>

                                    <Form onSubmit={handleSubmit}>
                                        <Row>
                                            <Col md={6}>
                                                <Form.Group className="mb-4">
                                                    <Form.Label>Customer Name *</Form.Label>
                                                    <Form.Control
                                                        type="text"
                                                        name="customerName"
                                                        value={formData.customerName}
                                                        onChange={handleChange}
                                                        placeholder="Enter your full name"
                                                        className={errors.customerName ? 'is-invalid' : ''}
                                                    />
                                                    {errors.customerName && (
                                                        <Form.Control.Feedback type="invalid">
                                                            {errors.customerName}
                                                        </Form.Control.Feedback>
                                                    )}
                                                </Form.Group>
                                            </Col>

                                            <Col md={6}>
                                                <Form.Group className="mb-4">
                                                    <Form.Label>Phone Number *</Form.Label>
                                                    <Form.Control
                                                        type="tel"
                                                        name="phone"
                                                        value={formData.phone}
                                                        onChange={handleChange}
                                                        placeholder="Enter your phone number"
                                                        className={errors.phone ? 'is-invalid' : ''}
                                                    />
                                                    {errors.phone && (
                                                        <Form.Control.Feedback type="invalid">
                                                            {errors.phone}
                                                        </Form.Control.Feedback>
                                                    )}
                                                </Form.Group>
                                            </Col>
                                        </Row>

                                        <Form.Group className="mb-4">
                                            <Form.Label>Email Address *</Form.Label>
                                            <Form.Control
                                                type="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleChange}
                                                placeholder="Enter your email"
                                                className={errors.email ? 'is-invalid' : ''}
                                            />
                                            {errors.email && (
                                                <Form.Control.Feedback type="invalid">
                                                    {errors.email}
                                                </Form.Control.Feedback>
                                            )}
                                        </Form.Group>

                                        <Form.Group className="mb-4">
                                            <Form.Label>Device Type *</Form.Label>
                                            <div className="device-type-grid">
                                                {deviceTypes.map(device => (
                                                    <div
                                                        key={device.id}
                                                        className={`device-type-card ${formData.deviceType === device.id ? 'selected' : ''}`}
                                                        onClick={() => handleChange({ target: { name: 'deviceType', value: device.id } })}
                                                    >
                                                        <span className="device-icon">{device.icon}</span>
                                                        <span className="device-name">{device.name}</span>
                                                    </div>
                                                ))}
                                            </div>
                                            {errors.deviceType && (
                                                <div className="invalid-feedback d-block">{errors.deviceType}</div>
                                            )}
                                        </Form.Group>

                                        <Row>
                                            <Col md={6}>
                                                <Form.Group className="mb-4">
                                                    <Form.Label>Brand *</Form.Label>
                                                    <Form.Select
                                                        name="brand"
                                                        value={formData.brand}
                                                        onChange={handleChange}
                                                        className={errors.brand ? 'is-invalid' : ''}
                                                        disabled={!formData.deviceType}
                                                    >
                                                        <option value="">Select brand</option>
                                                        {formData.deviceType && brands[formData.deviceType]?.map(brand => (
                                                            <option key={brand} value={brand}>{brand}</option>
                                                        ))}
                                                    </Form.Select>
                                                    {errors.brand && (
                                                        <Form.Control.Feedback type="invalid">
                                                            {errors.brand}
                                                        </Form.Control.Feedback>
                                                    )}
                                                </Form.Group>
                                            </Col>

                                            <Col md={6}>
                                                <Form.Group className="mb-4">
                                                    <Form.Label>Preferred Service Date *</Form.Label>
                                                    <Form.Control
                                                        type="date"
                                                        name="preferredDate"
                                                        value={formData.preferredDate}
                                                        onChange={handleChange}
                                                        min={today}
                                                        className={errors.preferredDate ? 'is-invalid' : ''}
                                                    />
                                                    {errors.preferredDate && (
                                                        <Form.Control.Feedback type="invalid">
                                                            {errors.preferredDate}
                                                        </Form.Control.Feedback>
                                                    )}
                                                </Form.Group>
                                            </Col>
                                        </Row>

                                        <Form.Group className="mb-4">
                                            <Form.Label>Problem Description *</Form.Label>
                                            <Form.Control
                                                as="textarea"
                                                rows={4}
                                                name="problemDescription"
                                                value={formData.problemDescription}
                                                onChange={handleChange}
                                                placeholder="Describe the issue you're facing with your device..."
                                                className={errors.problemDescription ? 'is-invalid' : ''}
                                            />
                                            {errors.problemDescription && (
                                                <Form.Control.Feedback type="invalid">
                                                    {errors.problemDescription}
                                                </Form.Control.Feedback>
                                            )}
                                        </Form.Group>

                                        <button type="submit" className="submit-btn">
                                            Submit Service Request
                                        </button>
                                    </Form>
                                </Card.Body>
                            </Card>
                        )}
                    </Col>
                </Row>

                {/* Service Info Cards */}
                <Row className="service-info-section">
                    <Col md={4}>
                        <div className="info-card">
                            <span className="info-icon">🔧</span>
                            <h4>Expert Technicians</h4>
                            <p>Certified professionals with years of experience</p>
                        </div>
                    </Col>
                    <Col md={4}>
                        <div className="info-card">
                            <span className="info-icon">⚡</span>
                            <h4>Quick Turnaround</h4>
                            <p>Most repairs completed within 24-48 hours</p>
                        </div>
                    </Col>
                    <Col md={4}>
                        <div className="info-card">
                            <span className="info-icon">✅</span>
                            <h4>Quality Guarantee</h4>
                            <p>90-day warranty on all repair services</p>
                        </div>
                    </Col>
                </Row>
            </Container>
        </div>
    );
}

export default Service;
