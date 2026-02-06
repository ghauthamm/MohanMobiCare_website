import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Badge, Table, Form, Modal, Tab, Tabs, Alert } from 'react-bootstrap';
import {
    FaBox, FaShoppingCart, FaTools, FaClock, FaPlus, FaEdit, FaTrash,
    FaSearch, FaCheck, FaTimes, FaCalendarAlt, FaUserShield, FaEye,
    FaMobile, FaLaptop, FaCamera, FaHeadphones
} from 'react-icons/fa';
import { ref, get, set, push, remove, update, onValue } from 'firebase/database';
import { database } from '../../firebase/config';
import { useAuth } from '../../context/AuthContext';
import { useLoading } from '../../context/LoadingContext';
import './Dashboard.css';

function Dashboard() {
    const navigate = useNavigate();
    const { currentUser, userRole } = useAuth();
    const { showLoading, hideLoading } = useLoading();

    const [products, setProducts] = useState([]);
    const [serviceRequests, setServiceRequests] = useState([]);
    const [orders, setOrders] = useState([]);
    const [activeTab, setActiveTab] = useState('overview');
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('all');
    const [filterStatus, setFilterStatus] = useState('all');

    // Modal states
    const [showProductModal, setShowProductModal] = useState(false);
    const [showServiceModal, setShowServiceModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [editingService, setEditingService] = useState(null);
    const [viewingItem, setViewingItem] = useState(null);
    const [alert, setAlert] = useState({ show: false, message: '', type: 'success' });

    // Product form
    const [productForm, setProductForm] = useState({
        name: '',
        category: 'mobiles',
        brand: '',
        price: '',
        rating: '4.5',
        stock: '',
        description: '',
        image: '📱'
    });

    // Service form
    const [serviceForm, setServiceForm] = useState({
        customerName: '',
        phone: '',
        email: '',
        deviceType: 'mobile',
        brand: '',
        problemDescription: '',
        preferredDate: '',
        status: 'Received',
        completionDate: ''
    });

    useEffect(() => {
        if (!currentUser) {
            navigate('/login');
            return;
        }

        if (userRole !== 'admin') {
            navigate('/');
            return;
        }

        fetchData();
    }, [currentUser, userRole, navigate]);

    const fetchData = async () => {
        showLoading('Loading dashboard data...');

        try {
            // Fetch products
            const productsRef = ref(database, 'products');
            const productsSnapshot = await get(productsRef);
            if (productsSnapshot.exists()) {
                const data = productsSnapshot.val();
                setProducts(Object.entries(data).map(([id, product]) => ({ id, ...product })));
            } else {
                setProducts([]);
            }

            // Fetch service requests
            const serviceRef = ref(database, 'serviceRequests');
            const serviceSnapshot = await get(serviceRef);
            if (serviceSnapshot.exists()) {
                const data = serviceSnapshot.val();
                const requests = Object.entries(data)
                    .map(([id, request]) => ({ id, ...request }))
                    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                setServiceRequests(requests);
            } else {
                setServiceRequests([]);
            }

            // Fetch orders
            const ordersRef = ref(database, 'orders');
            const ordersSnapshot = await get(ordersRef);
            if (ordersSnapshot.exists()) {
                const data = ordersSnapshot.val();
                setOrders(Object.entries(data).map(([id, order]) => ({ id, ...order })));
            } else {
                setOrders([]);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            showAlert('Error loading data. Please refresh.', 'danger');
        }

        hideLoading();
    };

    const showAlert = (message, type = 'success') => {
        setAlert({ show: true, message, type });
        setTimeout(() => setAlert({ show: false, message: '', type: 'success' }), 3000);
    };

    const stats = {
        totalProducts: products.length,
        totalOrders: orders.length,
        serviceRequests: serviceRequests.length,
        pendingRepairs: serviceRequests.filter(s => s.status === 'Received' || s.status === 'In Progress').length,
        readyForPickup: serviceRequests.filter(s => s.status === 'Ready').length,
        lowStock: products.filter(p => p.stock <= 5).length
    };

    // ============ PRODUCT CRUD Operations ============
    const handleProductSubmit = async (e) => {
        e.preventDefault();
        showLoading(editingProduct ? 'Updating product...' : 'Adding product...');

        try {
            const productData = {
                ...productForm,
                price: parseFloat(productForm.price),
                rating: parseFloat(productForm.rating),
                stock: parseInt(productForm.stock),
                updatedAt: new Date().toISOString()
            };

            if (editingProduct) {
                await update(ref(database, `products/${editingProduct.id}`), productData);
                showAlert('Product updated successfully!');
            } else {
                productData.createdAt = new Date().toISOString();
                await push(ref(database, 'products'), productData);
                showAlert('Product added successfully!');
            }

            setShowProductModal(false);
            resetProductForm();
            fetchData();
        } catch (error) {
            console.error('Error saving product:', error);
            showAlert('Failed to save product. Please try again.', 'danger');
        }

        hideLoading();
    };

    const handleEditProduct = (product) => {
        setEditingProduct(product);
        setProductForm({
            name: product.name || '',
            category: product.category || 'mobiles',
            brand: product.brand || '',
            price: product.price?.toString() || '',
            rating: product.rating?.toString() || '4.5',
            stock: product.stock?.toString() || '',
            description: product.description || '',
            image: product.image || '📱'
        });
        setShowProductModal(true);
    };

    const handleDeleteProduct = async (productId) => {
        if (!confirm('Are you sure you want to delete this product?')) return;

        showLoading('Deleting product...');
        try {
            await remove(ref(database, `products/${productId}`));
            showAlert('Product deleted successfully!');
            fetchData();
        } catch (error) {
            console.error('Error deleting product:', error);
            showAlert('Failed to delete product.', 'danger');
        }
        hideLoading();
    };

    const resetProductForm = () => {
        setProductForm({
            name: '',
            category: 'mobiles',
            brand: '',
            price: '',
            rating: '4.5',
            stock: '',
            description: '',
            image: '📱'
        });
        setEditingProduct(null);
    };

    // ============ SERVICE CRUD Operations ============
    const handleServiceSubmit = async (e) => {
        e.preventDefault();
        showLoading(editingService ? 'Updating service request...' : 'Adding service request...');

        try {
            const serviceData = {
                ...serviceForm,
                updatedAt: new Date().toISOString()
            };

            if (editingService) {
                await update(ref(database, `serviceRequests/${editingService.id}`), serviceData);
                showAlert('Service request updated successfully!');
            } else {
                serviceData.createdAt = new Date().toISOString();
                serviceData.serviceId = 'SRV' + Date.now().toString().slice(-8);
                await push(ref(database, 'serviceRequests'), serviceData);
                showAlert('Service request added successfully!');
            }

            setShowServiceModal(false);
            resetServiceForm();
            fetchData();
        } catch (error) {
            console.error('Error saving service request:', error);
            showAlert('Failed to save service request.', 'danger');
        }

        hideLoading();
    };

    const handleEditService = (service) => {
        setEditingService(service);
        setServiceForm({
            customerName: service.customerName || '',
            phone: service.phone || '',
            email: service.email || '',
            deviceType: service.deviceType || 'mobile',
            brand: service.brand || '',
            problemDescription: service.problemDescription || '',
            preferredDate: service.preferredDate || '',
            status: service.status || 'Received',
            completionDate: service.completionDate || ''
        });
        setShowServiceModal(true);
    };

    const handleDeleteService = async (serviceId) => {
        if (!confirm('Are you sure you want to delete this service request?')) return;

        showLoading('Deleting service request...');
        try {
            await remove(ref(database, `serviceRequests/${serviceId}`));
            showAlert('Service request deleted successfully!');
            fetchData();
        } catch (error) {
            console.error('Error deleting service request:', error);
            showAlert('Failed to delete service request.', 'danger');
        }
        hideLoading();
    };

    const handleUpdateServiceStatus = async (serviceId, newStatus) => {
        showLoading('Updating status...');
        try {
            await update(ref(database, `serviceRequests/${serviceId}`), {
                status: newStatus,
                updatedAt: new Date().toISOString()
            });
            showAlert('Status updated successfully!');
            fetchData();
        } catch (error) {
            console.error('Error updating status:', error);
            showAlert('Failed to update status.', 'danger');
        }
        hideLoading();
    };

    const handleSetCompletionDate = async (serviceId, date) => {
        showLoading('Setting completion date...');
        try {
            await update(ref(database, `serviceRequests/${serviceId}`), {
                completionDate: date,
                status: date ? 'Ready' : 'In Progress',
                updatedAt: new Date().toISOString()
            });
            showAlert('Completion date set successfully!');
            fetchData();
        } catch (error) {
            console.error('Error setting completion date:', error);
            showAlert('Failed to set completion date.', 'danger');
        }
        hideLoading();
    };

    const resetServiceForm = () => {
        setServiceForm({
            customerName: '',
            phone: '',
            email: '',
            deviceType: 'mobile',
            brand: '',
            problemDescription: '',
            preferredDate: '',
            status: 'Received',
            completionDate: ''
        });
        setEditingService(null);
    };

    // View details
    const handleViewItem = (item, type) => {
        setViewingItem({ ...item, type });
        setShowViewModal(true);
    };

    // Utility functions
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(price);
    };

    const getStatusBadge = (status) => {
        const colors = {
            'Received': 'warning',
            'In Progress': 'info',
            'Ready': 'success',
            'Delivered': 'secondary'
        };
        return <Badge bg={colors[status] || 'secondary'}>{status}</Badge>;
    };

    const getCategoryIcon = (category) => {
        const icons = {
            'mobiles': <FaMobile />,
            'laptops': <FaLaptop />,
            'camera': <FaCamera />,
            'accessories': <FaHeadphones />
        };
        return icons[category] || <FaBox />;
    };

    const categoryEmojis = {
        'mobiles': '📱',
        'laptops': '💻',
        'camera': '📷',
        'accessories': '🎧'
    };

    // Filter products
    const filteredProducts = products.filter(p => {
        const matchesSearch = p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.brand?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = filterCategory === 'all' || p.category === filterCategory;
        return matchesSearch && matchesCategory;
    });

    // Filter services
    const filteredServices = serviceRequests.filter(s => {
        const matchesSearch = s.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.serviceId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.phone?.includes(searchTerm);
        const matchesStatus = filterStatus === 'all' || s.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    return (
        <div className="dashboard-page">
            <Container fluid>
                {/* Alert */}
                {alert.show && (
                    <Alert variant={alert.type} className="dashboard-alert" dismissible onClose={() => setAlert({ ...alert, show: false })}>
                        {alert.message}
                    </Alert>
                )}

                {/* Dashboard Header */}
                <div className="dashboard-header">
                    <div className="dashboard-title">
                        <FaUserShield className="dashboard-icon" />
                        <div>
                            <h1>Admin Dashboard</h1>
                            <p>Manage your products and services</p>
                        </div>
                    </div>
                    <div className="dashboard-user">
                        <span>Welcome, {currentUser?.email}</span>
                    </div>
                </div>

                <Tabs activeKey={activeTab} onSelect={setActiveTab} className="dashboard-tabs mb-4">
                    {/* ============ OVERVIEW TAB ============ */}
                    <Tab eventKey="overview" title="📊 Overview">
                        <Row className="stats-row">
                            <Col lg={2} md={4} sm={6}>
                                <Card className="stat-card products-stat">
                                    <Card.Body>
                                        <div className="stat-icon"><FaBox /></div>
                                        <div className="stat-info">
                                            <h3>{stats.totalProducts}</h3>
                                            <p>Total Products</p>
                                        </div>
                                    </Card.Body>
                                </Card>
                            </Col>
                            <Col lg={2} md={4} sm={6}>
                                <Card className="stat-card orders-stat">
                                    <Card.Body>
                                        <div className="stat-icon"><FaShoppingCart /></div>
                                        <div className="stat-info">
                                            <h3>{stats.totalOrders}</h3>
                                            <p>Total Orders</p>
                                        </div>
                                    </Card.Body>
                                </Card>
                            </Col>
                            <Col lg={2} md={4} sm={6}>
                                <Card className="stat-card service-stat">
                                    <Card.Body>
                                        <div className="stat-icon"><FaTools /></div>
                                        <div className="stat-info">
                                            <h3>{stats.serviceRequests}</h3>
                                            <p>Service Requests</p>
                                        </div>
                                    </Card.Body>
                                </Card>
                            </Col>
                            <Col lg={2} md={4} sm={6}>
                                <Card className="stat-card pending-stat">
                                    <Card.Body>
                                        <div className="stat-icon"><FaClock /></div>
                                        <div className="stat-info">
                                            <h3>{stats.pendingRepairs}</h3>
                                            <p>Pending</p>
                                        </div>
                                    </Card.Body>
                                </Card>
                            </Col>
                            <Col lg={2} md={4} sm={6}>
                                <Card className="stat-card ready-stat">
                                    <Card.Body>
                                        <div className="stat-icon"><FaCheck /></div>
                                        <div className="stat-info">
                                            <h3>{stats.readyForPickup}</h3>
                                            <p>Ready</p>
                                        </div>
                                    </Card.Body>
                                </Card>
                            </Col>
                            <Col lg={2} md={4} sm={6}>
                                <Card className="stat-card low-stock-stat">
                                    <Card.Body>
                                        <div className="stat-icon"><FaTimes /></div>
                                        <div className="stat-info">
                                            <h3>{stats.lowStock}</h3>
                                            <p>Low Stock</p>
                                        </div>
                                    </Card.Body>
                                </Card>
                            </Col>
                        </Row>

                        {/* Recent Activities */}
                        <Row>
                            <Col lg={6}>
                                <Card className="data-card">
                                    <Card.Header>
                                        <h2>Recent Service Requests</h2>
                                    </Card.Header>
                                    <Card.Body>
                                        <div className="table-responsive">
                                            <Table className="custom-table">
                                                <thead>
                                                    <tr>
                                                        <th>ID</th>
                                                        <th>Customer</th>
                                                        <th>Device</th>
                                                        <th>Status</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {serviceRequests.slice(0, 5).map(service => (
                                                        <tr key={service.id}>
                                                            <td className="service-id">{service.serviceId}</td>
                                                            <td>{service.customerName}</td>
                                                            <td>{service.brand} {service.deviceType}</td>
                                                            <td>{getStatusBadge(service.status)}</td>
                                                        </tr>
                                                    ))}
                                                    {serviceRequests.length === 0 && (
                                                        <tr><td colSpan="4" className="text-center text-muted">No service requests yet</td></tr>
                                                    )}
                                                </tbody>
                                            </Table>
                                        </div>
                                    </Card.Body>
                                </Card>
                            </Col>
                            <Col lg={6}>
                                <Card className="data-card">
                                    <Card.Header>
                                        <h2>Low Stock Products</h2>
                                    </Card.Header>
                                    <Card.Body>
                                        <div className="table-responsive">
                                            <Table className="custom-table">
                                                <thead>
                                                    <tr>
                                                        <th>Product</th>
                                                        <th>Category</th>
                                                        <th>Stock</th>
                                                        <th>Price</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {products.filter(p => p.stock <= 5).slice(0, 5).map(product => (
                                                        <tr key={product.id}>
                                                            <td>{product.name}</td>
                                                            <td>{product.category}</td>
                                                            <td><Badge bg="danger">{product.stock}</Badge></td>
                                                            <td className="price-cell">{formatPrice(product.price)}</td>
                                                        </tr>
                                                    ))}
                                                    {products.filter(p => p.stock <= 5).length === 0 && (
                                                        <tr><td colSpan="4" className="text-center text-muted">All products well stocked!</td></tr>
                                                    )}
                                                </tbody>
                                            </Table>
                                        </div>
                                    </Card.Body>
                                </Card>
                            </Col>
                        </Row>
                    </Tab>

                    {/* ============ PRODUCTS TAB ============ */}
                    <Tab eventKey="products" title="📦 Products (Sales)">
                        <Card className="data-card">
                            <Card.Header>
                                <h2>Product Management</h2>
                                <button className="add-btn" onClick={() => { resetProductForm(); setShowProductModal(true); }}>
                                    <FaPlus /> Add Product
                                </button>
                            </Card.Header>
                            <Card.Body>
                                <div className="filter-bar">
                                    <div className="search-bar">
                                        <FaSearch className="search-icon" />
                                        <Form.Control
                                            type="text"
                                            placeholder="Search products..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                    </div>
                                    <Form.Select
                                        className="category-filter"
                                        value={filterCategory}
                                        onChange={(e) => setFilterCategory(e.target.value)}
                                    >
                                        <option value="all">All Categories</option>
                                        <option value="mobiles">Mobiles</option>
                                        <option value="laptops">Laptops</option>
                                        <option value="camera">Camera</option>
                                        <option value="accessories">Accessories</option>
                                    </Form.Select>
                                </div>

                                <div className="table-responsive">
                                    <Table className="custom-table">
                                        <thead>
                                            <tr>
                                                <th>Product</th>
                                                <th>Category</th>
                                                <th>Brand</th>
                                                <th>Price</th>
                                                <th>Stock</th>
                                                <th>Rating</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredProducts.map(product => (
                                                <tr key={product.id}>
                                                    <td>
                                                        <div className="product-cell">
                                                            <span className="product-emoji">{product.image || categoryEmojis[product.category]}</span>
                                                            <span>{product.name}</span>
                                                        </div>
                                                    </td>
                                                    <td><Badge bg="secondary">{product.category}</Badge></td>
                                                    <td>{product.brand}</td>
                                                    <td className="price-cell">{formatPrice(product.price)}</td>
                                                    <td>
                                                        <Badge bg={product.stock > 5 ? 'success' : product.stock > 0 ? 'warning' : 'danger'}>
                                                            {product.stock}
                                                        </Badge>
                                                    </td>
                                                    <td>⭐ {product.rating}</td>
                                                    <td>
                                                        <div className="action-btns">
                                                            <button className="view-btn" onClick={() => handleViewItem(product, 'product')}>
                                                                <FaEye />
                                                            </button>
                                                            <button className="edit-btn" onClick={() => handleEditProduct(product)}>
                                                                <FaEdit />
                                                            </button>
                                                            <button className="delete-btn" onClick={() => handleDeleteProduct(product.id)}>
                                                                <FaTrash />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </Table>
                                </div>

                                {filteredProducts.length === 0 && (
                                    <div className="empty-state">
                                        <span className="empty-icon">📦</span>
                                        <h4>No products found</h4>
                                        <p>Add your first product to get started</p>
                                    </div>
                                )}
                            </Card.Body>
                        </Card>
                    </Tab>

                    {/* ============ SERVICES TAB ============ */}
                    <Tab eventKey="services" title="🔧 Services">
                        <Card className="data-card">
                            <Card.Header>
                                <h2>Service Management</h2>
                                <button className="add-btn" onClick={() => { resetServiceForm(); setShowServiceModal(true); }}>
                                    <FaPlus /> Add Service Request
                                </button>
                            </Card.Header>
                            <Card.Body>
                                <div className="filter-bar">
                                    <div className="search-bar">
                                        <FaSearch className="search-icon" />
                                        <Form.Control
                                            type="text"
                                            placeholder="Search by name, ID, phone..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                    </div>
                                    <Form.Select
                                        className="status-filter"
                                        value={filterStatus}
                                        onChange={(e) => setFilterStatus(e.target.value)}
                                    >
                                        <option value="all">All Status</option>
                                        <option value="Received">Received</option>
                                        <option value="In Progress">In Progress</option>
                                        <option value="Ready">Ready</option>
                                        <option value="Delivered">Delivered</option>
                                    </Form.Select>
                                </div>

                                <div className="table-responsive">
                                    <Table className="custom-table">
                                        <thead>
                                            <tr>
                                                <th>Service ID</th>
                                                <th>Customer</th>
                                                <th>Contact</th>
                                                <th>Device</th>
                                                <th>Problem</th>
                                                <th>Status</th>
                                                <th>Completion</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredServices.map(service => (
                                                <tr key={service.id}>
                                                    <td className="service-id">{service.serviceId}</td>
                                                    <td>{service.customerName}</td>
                                                    <td>
                                                        <div className="contact-cell">
                                                            <span>{service.phone}</span>
                                                            <small>{service.email}</small>
                                                        </div>
                                                    </td>
                                                    <td>{service.brand} {service.deviceType?.toUpperCase()}</td>
                                                    <td>
                                                        <div className="problem-cell" title={service.problemDescription}>
                                                            {service.problemDescription?.substring(0, 30)}...
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <Form.Select
                                                            size="sm"
                                                            value={service.status}
                                                            onChange={(e) => handleUpdateServiceStatus(service.id, e.target.value)}
                                                            className="status-select"
                                                        >
                                                            <option value="Received">Received</option>
                                                            <option value="In Progress">In Progress</option>
                                                            <option value="Ready">Ready</option>
                                                            <option value="Delivered">Delivered</option>
                                                        </Form.Select>
                                                    </td>
                                                    <td>
                                                        <Form.Control
                                                            type="date"
                                                            size="sm"
                                                            value={service.completionDate || ''}
                                                            onChange={(e) => handleSetCompletionDate(service.id, e.target.value)}
                                                            className="date-input"
                                                        />
                                                    </td>
                                                    <td>
                                                        <div className="action-btns">
                                                            <button className="view-btn" onClick={() => handleViewItem(service, 'service')}>
                                                                <FaEye />
                                                            </button>
                                                            <button className="edit-btn" onClick={() => handleEditService(service)}>
                                                                <FaEdit />
                                                            </button>
                                                            <button className="delete-btn" onClick={() => handleDeleteService(service.id)}>
                                                                <FaTrash />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </Table>
                                </div>

                                {filteredServices.length === 0 && (
                                    <div className="empty-state">
                                        <span className="empty-icon">🔧</span>
                                        <h4>No service requests found</h4>
                                        <p>Service requests will appear here</p>
                                    </div>
                                )}
                            </Card.Body>
                        </Card>
                    </Tab>
                </Tabs>
            </Container>

            {/* ============ ADD/EDIT PRODUCT MODAL ============ */}
            <Modal show={showProductModal} onHide={() => setShowProductModal(false)} centered className="dashboard-modal" size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>{editingProduct ? '✏️ Edit Product' : '➕ Add New Product'}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleProductSubmit}>
                        <Row>
                            <Col md={8}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Product Name *</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={productForm.name}
                                        onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                                        placeholder="Enter product name"
                                        required
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Category *</Form.Label>
                                    <Form.Select
                                        value={productForm.category}
                                        onChange={(e) => setProductForm({
                                            ...productForm,
                                            category: e.target.value,
                                            image: categoryEmojis[e.target.value] || '📱'
                                        })}
                                    >
                                        <option value="mobiles">📱 Mobiles</option>
                                        <option value="laptops">💻 Laptops</option>
                                        <option value="camera">📷 Camera</option>
                                        <option value="accessories">🎧 Accessories</option>
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                        </Row>

                        <Row>
                            <Col md={4}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Brand *</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={productForm.brand}
                                        onChange={(e) => setProductForm({ ...productForm, brand: e.target.value })}
                                        placeholder="e.g., Samsung, Apple"
                                        required
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Price (₹) *</Form.Label>
                                    <Form.Control
                                        type="number"
                                        value={productForm.price}
                                        onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                                        placeholder="Enter price"
                                        required
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Stock *</Form.Label>
                                    <Form.Control
                                        type="number"
                                        value={productForm.stock}
                                        onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })}
                                        placeholder="Available quantity"
                                        required
                                    />
                                </Form.Group>
                            </Col>
                        </Row>

                        <Form.Group className="mb-3">
                            <Form.Label>Description</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                value={productForm.description}
                                onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                                placeholder="Product description..."
                            />
                        </Form.Group>

                        <div className="modal-actions">
                            <button type="button" className="cancel-btn" onClick={() => setShowProductModal(false)}>
                                Cancel
                            </button>
                            <button type="submit" className="submit-btn">
                                {editingProduct ? 'Update Product' : 'Add Product'}
                            </button>
                        </div>
                    </Form>
                </Modal.Body>
            </Modal>

            {/* ============ ADD/EDIT SERVICE MODAL ============ */}
            <Modal show={showServiceModal} onHide={() => setShowServiceModal(false)} centered className="dashboard-modal" size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>{editingService ? '✏️ Edit Service Request' : '➕ Add Service Request'}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleServiceSubmit}>
                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Customer Name *</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={serviceForm.customerName}
                                        onChange={(e) => setServiceForm({ ...serviceForm, customerName: e.target.value })}
                                        placeholder="Enter customer name"
                                        required
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Phone Number *</Form.Label>
                                    <Form.Control
                                        type="tel"
                                        value={serviceForm.phone}
                                        onChange={(e) => setServiceForm({ ...serviceForm, phone: e.target.value })}
                                        placeholder="Enter phone number"
                                        required
                                    />
                                </Form.Group>
                            </Col>
                        </Row>

                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Email</Form.Label>
                                    <Form.Control
                                        type="email"
                                        value={serviceForm.email}
                                        onChange={(e) => setServiceForm({ ...serviceForm, email: e.target.value })}
                                        placeholder="Enter email address"
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={3}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Device Type *</Form.Label>
                                    <Form.Select
                                        value={serviceForm.deviceType}
                                        onChange={(e) => setServiceForm({ ...serviceForm, deviceType: e.target.value })}
                                    >
                                        <option value="mobile">Mobile</option>
                                        <option value="laptop">Laptop</option>
                                        <option value="cctv">CCTV</option>
                                        <option value="ups">UPS</option>
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                            <Col md={3}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Brand *</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={serviceForm.brand}
                                        onChange={(e) => setServiceForm({ ...serviceForm, brand: e.target.value })}
                                        placeholder="Brand name"
                                        required
                                    />
                                </Form.Group>
                            </Col>
                        </Row>

                        <Form.Group className="mb-3">
                            <Form.Label>Problem Description *</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                value={serviceForm.problemDescription}
                                onChange={(e) => setServiceForm({ ...serviceForm, problemDescription: e.target.value })}
                                placeholder="Describe the problem..."
                                required
                            />
                        </Form.Group>

                        <Row>
                            <Col md={4}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Preferred Date</Form.Label>
                                    <Form.Control
                                        type="date"
                                        value={serviceForm.preferredDate}
                                        onChange={(e) => setServiceForm({ ...serviceForm, preferredDate: e.target.value })}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Status</Form.Label>
                                    <Form.Select
                                        value={serviceForm.status}
                                        onChange={(e) => setServiceForm({ ...serviceForm, status: e.target.value })}
                                    >
                                        <option value="Received">Received</option>
                                        <option value="In Progress">In Progress</option>
                                        <option value="Ready">Ready</option>
                                        <option value="Delivered">Delivered</option>
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Completion Date</Form.Label>
                                    <Form.Control
                                        type="date"
                                        value={serviceForm.completionDate}
                                        onChange={(e) => setServiceForm({ ...serviceForm, completionDate: e.target.value })}
                                    />
                                </Form.Group>
                            </Col>
                        </Row>

                        <div className="modal-actions">
                            <button type="button" className="cancel-btn" onClick={() => setShowServiceModal(false)}>
                                Cancel
                            </button>
                            <button type="submit" className="submit-btn">
                                {editingService ? 'Update Service Request' : 'Add Service Request'}
                            </button>
                        </div>
                    </Form>
                </Modal.Body>
            </Modal>

            {/* ============ VIEW DETAILS MODAL ============ */}
            <Modal show={showViewModal} onHide={() => setShowViewModal(false)} centered className="dashboard-modal">
                <Modal.Header closeButton>
                    <Modal.Title>
                        {viewingItem?.type === 'product' ? '📦 Product Details' : '🔧 Service Details'}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {viewingItem && viewingItem.type === 'product' && (
                        <div className="view-details">
                            <div className="detail-header">
                                <span className="detail-emoji">{viewingItem.image}</span>
                                <h3>{viewingItem.name}</h3>
                            </div>
                            <div className="detail-grid">
                                <div className="detail-item">
                                    <label>Category</label>
                                    <span>{viewingItem.category}</span>
                                </div>
                                <div className="detail-item">
                                    <label>Brand</label>
                                    <span>{viewingItem.brand}</span>
                                </div>
                                <div className="detail-item">
                                    <label>Price</label>
                                    <span className="price">{formatPrice(viewingItem.price)}</span>
                                </div>
                                <div className="detail-item">
                                    <label>Stock</label>
                                    <Badge bg={viewingItem.stock > 5 ? 'success' : 'danger'}>{viewingItem.stock}</Badge>
                                </div>
                                <div className="detail-item">
                                    <label>Rating</label>
                                    <span>⭐ {viewingItem.rating}</span>
                                </div>
                                <div className="detail-item">
                                    <label>Created</label>
                                    <span>{formatDate(viewingItem.createdAt)}</span>
                                </div>
                            </div>
                            {viewingItem.description && (
                                <div className="detail-description">
                                    <label>Description</label>
                                    <p>{viewingItem.description}</p>
                                </div>
                            )}
                        </div>
                    )}

                    {viewingItem && viewingItem.type === 'service' && (
                        <div className="view-details">
                            <div className="detail-header">
                                <span className="detail-id">{viewingItem.serviceId}</span>
                                {getStatusBadge(viewingItem.status)}
                            </div>
                            <div className="detail-grid">
                                <div className="detail-item">
                                    <label>Customer Name</label>
                                    <span>{viewingItem.customerName}</span>
                                </div>
                                <div className="detail-item">
                                    <label>Phone</label>
                                    <span>{viewingItem.phone}</span>
                                </div>
                                <div className="detail-item">
                                    <label>Email</label>
                                    <span>{viewingItem.email || 'N/A'}</span>
                                </div>
                                <div className="detail-item">
                                    <label>Device</label>
                                    <span>{viewingItem.brand} {viewingItem.deviceType?.toUpperCase()}</span>
                                </div>
                                <div className="detail-item">
                                    <label>Preferred Date</label>
                                    <span>{formatDate(viewingItem.preferredDate)}</span>
                                </div>
                                <div className="detail-item">
                                    <label>Completion Date</label>
                                    <span>{formatDate(viewingItem.completionDate)}</span>
                                </div>
                            </div>
                            <div className="detail-description">
                                <label>Problem Description</label>
                                <p>{viewingItem.problemDescription}</p>
                            </div>
                        </div>
                    )}
                </Modal.Body>
            </Modal>
        </div>
    );
}

export default Dashboard;
