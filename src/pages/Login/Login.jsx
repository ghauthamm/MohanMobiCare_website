import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Form, Card, Tab, Tabs, Alert } from 'react-bootstrap';
import { FaUser, FaLock, FaEnvelope, FaEye, FaEyeSlash, FaGoogle } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { useLoading } from '../../context/LoadingContext';
import './Login.css';

function Login() {
    const navigate = useNavigate();
    const { login, signup, signInWithGoogle, currentUser, userRole } = useAuth();
    const { showLoading, hideLoading } = useLoading();

    const [activeTab, setActiveTab] = useState('login');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [loginData, setLoginData] = useState({
        email: '',
        password: ''
    });

    const [signupData, setSignupData] = useState({
        email: '',
        password: '',
        confirmPassword: ''
    });

    useEffect(() => {
        if (currentUser) {
            if (userRole === 'admin') {
                navigate('/dashboard');
            } else {
                navigate('/');
            }
        }
    }, [currentUser, userRole, navigate]);

    const handleLoginChange = (e) => {
        const { name, value } = e.target;
        setLoginData(prev => ({ ...prev, [name]: value }));
        setError('');
    };

    const handleSignupChange = (e) => {
        const { name, value } = e.target;
        setSignupData(prev => ({ ...prev, [name]: value }));
        setError('');
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');

        if (!loginData.email || !loginData.password) {
            setError('Please fill in all fields');
            return;
        }

        showLoading('Signing in...');

        try {
            await login(loginData.email, loginData.password);
            // Navigation handled by useEffect
        } catch (error) {
            console.error('Login error:', error);
            if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
                setError('Invalid email or password');
            } else if (error.code === 'auth/invalid-credential') {
                setError('Invalid email or password');
            } else {
                setError('Failed to sign in. Please try again.');
            }
        }

        hideLoading();
    };

    const handleSignup = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!signupData.email || !signupData.password || !signupData.confirmPassword) {
            setError('Please fill in all fields');
            return;
        }

        if (signupData.password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        if (signupData.password !== signupData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        showLoading('Creating your account...');

        try {
            await signup(signupData.email, signupData.password, 'user');
            setSuccess('Account created successfully! Redirecting...');
            // Navigation handled by useEffect
        } catch (error) {
            console.error('Signup error:', error);
            if (error.code === 'auth/email-already-in-use') {
                setError('An account with this email already exists');
            } else if (error.code === 'auth/weak-password') {
                setError('Password is too weak');
            } else {
                setError('Failed to create account. Please try again.');
            }
        }

        hideLoading();
    };

    const handleGoogleSignIn = async () => {
        setError('');
        showLoading('Signing in with Google...');

        try {
            await signInWithGoogle();
            // Navigation handled by useEffect
        } catch (error) {
            console.error('Google sign in error:', error);
            if (error.code === 'auth/popup-closed-by-user') {
                setError('Sign in cancelled. Please try again.');
            } else if (error.code === 'auth/popup-blocked') {
                setError('Popup was blocked. Please allow popups and try again.');
            } else {
                setError('Failed to sign in with Google. Please try again.');
            }
        }

        hideLoading();
    };

    return (
        <div className="login-page">
            <div className="login-bg-elements">
                <div className="bg-circle c1"></div>
                <div className="bg-circle c2"></div>
                <div className="bg-circle c3"></div>
            </div>

            <Container>
                <Row className="justify-content-center align-items-center min-vh-100">
                    <Col lg={5} md={7}>
                        <div className="login-header">
                            <img src="/logo.png" alt="Moham MobiCare" className="login-logo-img" />
                            <h1 className="login-title">Moham MobiCare</h1>
                            <p className="login-subtitle">Smart Devices. Trusted Service.</p>
                        </div>

                        <Card className="login-card">
                            <Card.Body className="p-4 p-md-5">
                                <Tabs
                                    activeKey={activeTab}
                                    onSelect={(k) => { setActiveTab(k); setError(''); setSuccess(''); }}
                                    className="login-tabs mb-4"
                                >
                                    <Tab eventKey="login" title="Login">
                                        <Form onSubmit={handleLogin}>
                                            {error && <Alert variant="danger" className="custom-alert">{error}</Alert>}

                                            <Form.Group className="mb-4">
                                                <Form.Label>Email Address</Form.Label>
                                                <div className="input-wrapper">
                                                    <FaEnvelope className="input-icon" />
                                                    <Form.Control
                                                        type="email"
                                                        name="email"
                                                        value={loginData.email}
                                                        onChange={handleLoginChange}
                                                        placeholder="Enter your email"
                                                    />
                                                </div>
                                            </Form.Group>

                                            <Form.Group className="mb-4">
                                                <Form.Label>Password</Form.Label>
                                                <div className="input-wrapper">
                                                    <FaLock className="input-icon" />
                                                    <Form.Control
                                                        type={showPassword ? 'text' : 'password'}
                                                        name="password"
                                                        value={loginData.password}
                                                        onChange={handleLoginChange}
                                                        placeholder="Enter your password"
                                                    />
                                                    <button
                                                        type="button"
                                                        className="password-toggle"
                                                        onClick={() => setShowPassword(!showPassword)}
                                                    >
                                                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                                                    </button>
                                                </div>
                                            </Form.Group>

                                            <button type="submit" className="login-btn">
                                                Sign In
                                            </button>

                                            <div className="divider">
                                                <span>or continue with</span>
                                            </div>

                                            <button
                                                type="button"
                                                className="google-btn"
                                                onClick={handleGoogleSignIn}
                                            >
                                                <FaGoogle className="google-icon" />
                                                Sign in with Google
                                            </button>

                                            <p className="switch-text">
                                                Don't have an account?
                                                <button type="button" onClick={() => setActiveTab('signup')}>Sign Up</button>
                                            </p>
                                        </Form>
                                    </Tab>

                                    <Tab eventKey="signup" title="Sign Up">
                                        <Form onSubmit={handleSignup}>
                                            {error && <Alert variant="danger" className="custom-alert">{error}</Alert>}
                                            {success && <Alert variant="success" className="custom-alert">{success}</Alert>}

                                            <Form.Group className="mb-4">
                                                <Form.Label>Email Address</Form.Label>
                                                <div className="input-wrapper">
                                                    <FaEnvelope className="input-icon" />
                                                    <Form.Control
                                                        type="email"
                                                        name="email"
                                                        value={signupData.email}
                                                        onChange={handleSignupChange}
                                                        placeholder="Enter your email"
                                                    />
                                                </div>
                                            </Form.Group>

                                            <Form.Group className="mb-4">
                                                <Form.Label>Password</Form.Label>
                                                <div className="input-wrapper">
                                                    <FaLock className="input-icon" />
                                                    <Form.Control
                                                        type={showPassword ? 'text' : 'password'}
                                                        name="password"
                                                        value={signupData.password}
                                                        onChange={handleSignupChange}
                                                        placeholder="Create a password"
                                                    />
                                                    <button
                                                        type="button"
                                                        className="password-toggle"
                                                        onClick={() => setShowPassword(!showPassword)}
                                                    >
                                                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                                                    </button>
                                                </div>
                                            </Form.Group>

                                            <Form.Group className="mb-4">
                                                <Form.Label>Confirm Password</Form.Label>
                                                <div className="input-wrapper">
                                                    <FaLock className="input-icon" />
                                                    <Form.Control
                                                        type={showPassword ? 'text' : 'password'}
                                                        name="confirmPassword"
                                                        value={signupData.confirmPassword}
                                                        onChange={handleSignupChange}
                                                        placeholder="Confirm your password"
                                                    />
                                                </div>
                                            </Form.Group>

                                            <button type="submit" className="login-btn">
                                                Create Account
                                            </button>

                                            <div className="divider">
                                                <span>or continue with</span>
                                            </div>

                                            <button
                                                type="button"
                                                className="google-btn"
                                                onClick={handleGoogleSignIn}
                                            >
                                                <FaGoogle className="google-icon" />
                                                Sign up with Google
                                            </button>

                                            <p className="switch-text">
                                                Already have an account?
                                                <button type="button" onClick={() => setActiveTab('login')}>Sign In</button>
                                            </p>
                                        </Form>
                                    </Tab>
                                </Tabs>
                            </Card.Body>
                        </Card>

                        <div className="demo-credentials">
                            <p>Demo Admin: admin@mobicare.com / admin123</p>
                            <p>Demo User: user@mobicare.com / user123</p>
                        </div>
                    </Col>
                </Row>
            </Container>
        </div>
    );
}

export default Login;
