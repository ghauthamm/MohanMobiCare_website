import { Container, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaPhone, FaEnvelope, FaMapMarkerAlt, FaFacebook, FaInstagram, FaTwitter, FaWhatsapp } from 'react-icons/fa';
import './Footer.css';

function Footer() {
    return (
        <footer className="footer">
            <div className="footer-glow"></div>
            <Container>
                <Row className="footer-main">
                    <Col lg={4} md={6} className="footer-section">
                        <div className="footer-brand">
                            <img src="/logo.png" alt="Moham MobiCare" className="footer-logo-img" />
                            <h3 className="footer-title">Moham MobiCare</h3>
                        </div>
                        <p className="footer-slogan">Smart Devices. Trusted Service.</p>
                        <p className="footer-desc">
                            Your one-stop destination for all electronics sales and repair services.
                            We believe in quality service and customer satisfaction.
                        </p>
                        <div className="social-links">
                            <a href="#" className="social-link"><FaFacebook /></a>
                            <a href="#" className="social-link"><FaInstagram /></a>
                            <a href="#" className="social-link"><FaTwitter /></a>
                            <a href="https://wa.me/+919876543210" className="social-link"><FaWhatsapp /></a>
                        </div>
                    </Col>

                    <Col lg={2} md={6} className="footer-section">
                        <h4 className="footer-heading">Quick Links</h4>
                        <ul className="footer-links">
                            <li><Link to="/">Home</Link></li>
                            <li><Link to="/sales">Sales</Link></li>
                            <li><Link to="/service">Service</Link></li>
                            <li><Link to="/login">Login</Link></li>
                        </ul>
                    </Col>

                    <Col lg={3} md={6} className="footer-section">
                        <h4 className="footer-heading">Our Services</h4>
                        <ul className="footer-links">
                            <li><Link to="/sales?category=mobiles">Mobile Sales</Link></li>
                            <li><Link to="/sales?category=laptops">Laptop Sales</Link></li>
                            <li><Link to="/service">Device Repair</Link></li>
                            <li><Link to="/service">CCTV Installation</Link></li>
                            <li><Link to="/service">UPS Service</Link></li>
                        </ul>
                    </Col>

                    <Col lg={3} md={6} className="footer-section">
                        <h4 className="footer-heading">Contact Us</h4>
                        <ul className="contact-info">
                            <li>
                                <FaMapMarkerAlt className="contact-icon" />
                                <span>123 Electronics Street<br />City, State - 600001</span>
                            </li>
                            <li>
                                <FaPhone className="contact-icon" />
                                <span>+91 98765 43210<br />+91 98765 43211</span>
                            </li>
                            <li>
                                <FaEnvelope className="contact-icon" />
                                <span>info@mohammobicare.com</span>
                            </li>
                        </ul>
                        <div className="qr-code">
                            <div className="qr-placeholder">
                                <span>📲</span>
                                <small>Scan for offers</small>
                            </div>
                        </div>
                    </Col>
                </Row>

                <div className="footer-bottom">
                    <Row className="align-items-center">
                        <Col md={6}>
                            <p className="copyright">
                                © 2025 Moham MobiCare. All rights reserved.
                            </p>
                        </Col>
                        <Col md={6} className="text-md-end">
                            <p className="footer-tagline">
                                Built with ❤️ for quality electronics service
                            </p>
                        </Col>
                    </Row>
                </div>
            </Container>
        </footer>
    );
}

export default Footer;
