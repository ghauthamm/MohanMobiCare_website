import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Navbar, Container, Nav, Form, FormControl, Badge, Dropdown } from 'react-bootstrap';
import { FaShoppingCart, FaHeart, FaUser, FaSearch, FaSignOutAlt } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import './Header.css';

function Header() {
    const [searchQuery, setSearchQuery] = useState('');
    const { currentUser, userRole, logout } = useAuth();
    const { cartCount, wishlist } = useCart();
    const navigate = useNavigate();
    const location = useLocation();

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/sales?search=${encodeURIComponent(searchQuery)}`);
        }
    };

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/');
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    const isActive = (path) => location.pathname === path;

    return (
        <Navbar expand="lg" className="header-navbar" sticky="top">
            <Container fluid className="px-4">
                <Navbar.Brand as={Link} to="/" className="brand-logo">
                    <img src="/logo.png" alt="Moham MobiCare" className="brand-logo-img" />
                    <span className="brand-text">Moham MobiCare</span>
                </Navbar.Brand>

                <Navbar.Toggle aria-controls="navbar-nav" className="custom-toggler" />

                <Navbar.Collapse id="navbar-nav">
                    <Nav className="me-auto main-nav">
                        <Nav.Link as={Link} to="/" className={isActive('/') ? 'active' : ''}>
                            Home
                        </Nav.Link>
                        <Nav.Link as={Link} to="/sales" className={isActive('/sales') ? 'active' : ''}>
                            Sales
                        </Nav.Link>
                        <Nav.Link as={Link} to="/service" className={isActive('/service') ? 'active' : ''}>
                            Service
                        </Nav.Link>
                        {currentUser && userRole === 'admin' && (
                            <Nav.Link as={Link} to="/admin" className={isActive('/admin') ? 'active' : ''}>
                                Admin Panel
                            </Nav.Link>
                        )}
                        {currentUser && userRole === 'user' && (
                            <Nav.Link as={Link} to="/dashboard" className={isActive('/dashboard') ? 'active' : ''}>
                                Dashboard
                            </Nav.Link>
                        )}
                    </Nav>

                    <Form className="search-form d-flex me-3" onSubmit={handleSearch}>
                        <div className="search-wrapper">
                            <FormControl
                                type="search"
                                placeholder="Search products..."
                                className="search-input"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            <button type="submit" className="search-btn">
                                <FaSearch />
                            </button>
                        </div>
                    </Form>

                    <div className="nav-icons">
                        <Link to="/sales?view=wishlist" className="nav-icon-link">
                            <FaHeart />
                            {wishlist.length > 0 && (
                                <Badge className="icon-badge">{wishlist.length}</Badge>
                            )}
                        </Link>

                        <Link to="/sales?view=cart" className="nav-icon-link">
                            <FaShoppingCart />
                            {cartCount > 0 && (
                                <Badge className="icon-badge">{cartCount}</Badge>
                            )}
                        </Link>

                        {currentUser ? (
                            <Dropdown align="end">
                                <Dropdown.Toggle as="div" className="nav-icon-link user-dropdown">
                                    <FaUser />
                                </Dropdown.Toggle>
                                <Dropdown.Menu className="user-menu">
                                    <Dropdown.Header>{currentUser.email}</Dropdown.Header>
                                    <Dropdown.Divider />
                                    {userRole === 'admin' ? (
                                        <Dropdown.Item as={Link} to="/admin">Admin Panel</Dropdown.Item>
                                    ) : (
                                        <Dropdown.Item as={Link} to="/dashboard">Dashboard</Dropdown.Item>
                                    )}
                                    <Dropdown.Item onClick={handleLogout}>
                                        <FaSignOutAlt className="me-2" /> Logout
                                    </Dropdown.Item>
                                </Dropdown.Menu>
                            </Dropdown>
                        ) : (
                            <Link to="/login" className="nav-icon-link login-btn">
                                Login
                            </Link>
                        )}
                    </div>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
}

export default Header;
