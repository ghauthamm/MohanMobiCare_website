import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col } from 'react-bootstrap';
import { FaMobile, FaTools, FaShieldAlt, FaClock, FaStar, FaHeadset } from 'react-icons/fa';
import { useLoading } from '../../context/LoadingContext';
import './Home.css';

function Home() {
    const { showLoading, hideLoading } = useLoading();

    useEffect(() => {
        showLoading('Loading MobiCare...');
        const timer = setTimeout(() => {
            hideLoading();
        }, 800);
        return () => clearTimeout(timer);
    }, []);

    const features = [
        { icon: <FaShieldAlt />, title: 'Warranty', desc: 'All products with genuine warranty' },
        { icon: <FaClock />, title: 'Quick Service', desc: 'Same day repair available' },
        { icon: <FaStar />, title: 'Quality', desc: 'Premium products & service' },
        { icon: <FaHeadset />, title: 'Support', desc: '24/7 customer support' }
    ];

    return (
        <div className="home-page">
            {/* Hero Section */}
            <section className="hero-section">
                <div className="hero-bg-elements">
                    <div className="floating-element el-1">📱</div>
                    <div className="floating-element el-2">💻</div>
                    <div className="floating-element el-3">🔧</div>
                    <div className="floating-element el-4">📷</div>
                </div>
                <Container>
                    <div className="hero-content">
                        <img src="/logo.png" alt="Moham MobiCare" className="hero-logo-img" />
                        <h1 className="hero-title">
                            Moham Electrical & Electronics
                            <span className="hero-highlight">Service Center</span>
                        </h1>
                        <p className="hero-slogan">Smart Devices. Trusted Service.</p>
                        <p className="hero-desc">
                            Your trusted partner for premium electronics sales and expert repair services.
                            We bring you the latest gadgets with guaranteed quality and support.
                        </p>
                        <div className="hero-buttons">
                            <Link to="/sales" className="btn-primary-custom">Explore Products</Link>
                            <Link to="/service" className="btn-secondary-custom">Book Service</Link>
                        </div>
                    </div>
                </Container>
                <div className="hero-wave">
                    <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="#0d0d0d" />
                    </svg>
                </div>
            </section>

            {/* Main Service Cards */}
            <section className="services-section">
                <Container>
                    <Row className="justify-content-center">
                        <Col lg={5} md={6}>
                            <Link to="/sales" className="service-card sales-card">
                                <div className="card-glow"></div>
                                <div className="card-icon">
                                    <FaMobile />
                                </div>
                                <h2 className="card-title">Sales</h2>
                                <p className="card-subtitle">Mobiles, Laptops, Accessories</p>
                                <ul className="card-features">
                                    <li>Latest Smartphones</li>
                                    <li>Premium Laptops</li>
                                    <li>Cameras & Accessories</li>
                                    <li>Best Prices Guaranteed</li>
                                </ul>
                                <span className="card-btn">Shop Now →</span>
                            </Link>
                        </Col>
                        <Col lg={5} md={6}>
                            <Link to="/service" className="service-card repair-card">
                                <div className="card-glow"></div>
                                <div className="card-icon">
                                    <FaTools />
                                </div>
                                <h2 className="card-title">Service</h2>
                                <p className="card-subtitle">Device Repair & Maintenance</p>
                                <ul className="card-features">
                                    <li>Mobile Phone Repair</li>
                                    <li>Laptop Service</li>
                                    <li>CCTV Installation</li>
                                    <li>UPS Maintenance</li>
                                </ul>
                                <span className="card-btn">Book Now →</span>
                            </Link>
                        </Col>
                    </Row>
                </Container>
            </section>

            {/* Features Section */}
            <section className="features-section">
                <Container>
                    <h2 className="section-title">Why Choose Us?</h2>
                    <Row>
                        {features.map((feature, index) => (
                            <Col lg={3} md={6} key={index}>
                                <div className="feature-card">
                                    <div className="feature-icon">{feature.icon}</div>
                                    <h3 className="feature-title">{feature.title}</h3>
                                    <p className="feature-desc">{feature.desc}</p>
                                </div>
                            </Col>
                        ))}
                    </Row>
                </Container>
            </section>

            {/* CTA Section */}
            <section className="cta-section">
                <Container>
                    <div className="cta-content">
                        <h2 className="cta-title">Need Help with Your Device?</h2>
                        <p className="cta-desc">Our expert technicians are ready to help you with any device issue</p>
                        <Link to="/service" className="btn-primary-custom">Get Service Quote</Link>
                    </div>
                </Container>
            </section>
        </div>
    );
}

export default Home;
