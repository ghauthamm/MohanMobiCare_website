import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Badge, Table, Form, Modal, Tab, Tabs } from 'react-bootstrap';
import {
    FaBox, FaShoppingCart, FaTools, FaClock, FaPlus, FaEdit, FaTrash,
    FaSearch, FaCheck, FaTimes, FaCalendarAlt, FaUserShield
} from 'react-icons/fa';
import { ref, get, set, push, remove, update } from 'firebase/database';
import { database } from '../../firebase/config';
import { useAuth } from '../../context/AuthContext';
import { useLoading } from '../../context/LoadingContext';
import './Admin.css';

function Admin() {
    const navigate = useNavigate();
    const { currentUser, userRole } = useAuth();
    const { showLoading, hideLoading } = useLoading();

    const [products, setProducts] = useState([]);
    const [serviceRequests, setServiceRequests] = useState([]);
    const [orders, setOrders] = useState([]);
    const [activeTab, setActiveTab] = useState('dashboard');
    const [searchTerm, setSearchTerm] = useState('');

    // Modal states
    const [showProductModal, setShowProductModal] = useState(false);
    const [showServiceModal, setShowServiceModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [editingService, setEditingService] = useState(null);

    // Product form
    const [productForm, setProductForm] = useState({
        name: '',
        category: 'mobiles',
        brand: '',
        price: '',
        rating: '4.5',
        stock: '',
        image: '📱'
    });

    useEffect(() => {
        if (!currentUser) {
            navigate('/login');
            return;
        }

        if (userRole !== 'admin') {
            navigate('/dashboard');
            return;
        }

        fetchData();
    }, [currentUser, userRole, navigate]);

    const fetchData = async () => {
        showLoading('Loading admin data...');

        try {
            // Fetch products
            const productsRef = ref(database, 'products');
            const productsSnapshot = await get(productsRef);
            if (productsSnapshot.exists()) {
                const data = productsSnapshot.val();
                setProducts(Object.entries(data).map(([id, product]) => ({ id, ...product })));
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
            }

            // Fetch orders
            const ordersRef = ref(database, 'orders');
            const ordersSnapshot = await get(ordersRef);
            if (ordersSnapshot.exists()) {
                const data = ordersSnapshot.val();
                setOrders(Object.entries(data).map(([id, order]) => ({ id, ...order })));
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        }

        hideLoading();
    };

    const stats = {
        totalProducts: products.length,
        totalOrders: orders.length,
        serviceRequests: serviceRequests.length,
        pendingRepairs: serviceRequests.filter(s => s.status === 'Received' || s.status === 'In Progress').length
    };

    // Product CRUD Operations
    const handleProductSubmit = async (e) => {
        e.preventDefault();
        showLoading(editingProduct ? 'Updating product...' : 'Adding product...');

        try {
            const productData = {
                ...productForm,
                price: parseFloat(productForm.price),
                rating: parseFloat(productForm.rating),
                stock: parseInt(productForm.stock)
            };

            if (editingProduct) {
                await update(ref(database, `products/${editingProduct.id}`), productData);
            } else {
                await push(ref(database, 'products'), productData);
            }

            setShowProductModal(false);
            resetProductForm();
            fetchData();
        } catch (error) {
            console.error('Error saving product:', error);
            alert('Failed to save product');
        }

        hideLoading();
    };

    const handleEditProduct = (product) => {
        setEditingProduct(product);
        setProductForm({
            name: product.name,
            category: product.category,
            brand: product.brand,
            price: product.price.toString(),
            rating: product.rating.toString(),
            stock: product.stock.toString(),
            image: product.image
        });
        setShowProductModal(true);
    };

    const handleDeleteProduct = async (productId) => {
        if (!confirm('Are you sure you want to delete this product?')) return;

        showLoading('Deleting product...');
        try {
            await remove(ref(database, `products/${productId}`));
            fetchData();
        } catch (error) {
            console.error('Error deleting product:', error);
            alert('Failed to delete product');
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
            image: '📱'
        });
        setEditingProduct(null);
    };

    // Service Management
    const handleUpdateServiceStatus = async (serviceId, newStatus) => {
        showLoading('Updating status...');
        try {
            await update(ref(database, `serviceRequests/${serviceId}`), { status: newStatus });
            fetchData();
        } catch (error) {
            console.error('Error updating status:', error);
        }
        hideLoading();
    };

    const handleSetCompletionDate = async (serviceId, date) => {
        showLoading('Setting completion date...');
        try {
            await update(ref(database, `serviceRequests/${serviceId}`), {
                completionDate: date,
                status: date ? 'Ready' : 'In Progress'
            });
            fetchData();
        } catch (error) {
            console.error('Error setting completion date:', error);
        }
        hideLoading();
    };

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

    const categoryIcons = {
        'mobiles': '📱',
        'laptops': '💻',
        'camera': '📷',
        'accessories': '🎧'
    };

    return (
        <div className="admin-page">
            <Container fluid>
                <div className="admin-header">
                    <div className="admin-title">
                        <FaUserShield className="admin-icon" />
                        <div>
                            <h1>Admin Panel</h1>
                            <p>Manage your products and services</p>
                        </div>
                    </div>
                </div>

                <Tabs activeKey={activeTab} onSelect={setActiveTab} className="admin-tabs mb-4">
                    <Tab eventKey="dashboard" title="Dashboard">
                        {/* Stats Cards */}
                        <Row className="stats-row">
                            <Col lg={3} md={6}>
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
                            <Col lg={3} md={6}>
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
                            <Col lg={3} md={6}>
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
                            <Col lg={3} md={6}>
                                <Card className="stat-card pending-stat">
                                    <Card.Body>
                                        <div className="stat-icon"><FaClock /></div>
                                        <div className="stat-info">
                                            <h3>{stats.pendingRepairs}</h3>
                                            <p>Pending Repairs</p>
                                        </div>
                                    </Card.Body>
                                </Card>
                            </Col>
                        </Row>

                        {/* Recent Service Requests */}
                        <Card className="data-card">
                            <Card.Header>
                                <h2>Recent Service Requests</h2>
                            </Card.Header>
                            <Card.Body>
                                <div className="table-responsive">
                                    <Table className="custom-table">
                                        <thead>
                                            <tr>
                                                <th>Service ID</th>
                                                <th>Customer</th>
                                                <th>Device</th>
                                                <th>Status</th>
                                                <th>Date</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {serviceRequests.slice(0, 5).map(service => (
                                                <tr key={service.id}>
                                                    <td className="service-id">{service.serviceId}</td>
                                                    <td>{service.customerName}</td>
                                                    <td>{service.brand} {service.deviceType?.toUpperCase()}</td>
                                                    <td>{getStatusBadge(service.status)}</td>
                                                    <td>{formatDate(service.createdAt)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </Table>
                                </div>
                            </Card.Body>
                        </Card>
                    </Tab>

                    <Tab eventKey="products" title="Products">
                        <Card className="data-card">
                            <Card.Header>
                                <h2>Product Management</h2>
                                <button className="add-btn" onClick={() => { resetProductForm(); setShowProductModal(true); }}>
                                    <FaPlus /> Add Product
                                </button>
                            </Card.Header>
                            <Card.Body>
                                <div className="search-bar">
                                    <FaSearch className="search-icon" />
                                    <Form.Control
                                        type="text"
                                        placeholder="Search products..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
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
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {products
                                                .filter(p => p.name?.toLowerCase().includes(searchTerm.toLowerCase()))
                                                .map(product => (
                                                    <tr key={product.id}>
                                                        <td>
                                                            <div className="product-cell">
                                                                <span className="product-image">{product.image}</span>
                                                                <span>{product.name}</span>
                                                            </div>
                                                        </td>
                                                        <td>{product.category}</td>
                                                        <td>{product.brand}</td>
                                                        <td className="price-cell">{formatPrice(product.price)}</td>
                                                        <td>
                                                            <Badge bg={product.stock > 5 ? 'success' : product.stock > 0 ? 'warning' : 'danger'}>
                                                                {product.stock}
                                                            </Badge>
                                                        </td>
                                                        <td>
                                                            <div className="action-btns">
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

                                {products.length === 0 && (
                                    <div className="empty-state">
                                        <span className="empty-icon">📦</span>
                                        <h4>No products yet</h4>
                                        <p>Add your first product to get started</p>
                                    </div>
                                )}
                            </Card.Body>
                        </Card>
                    </Tab>

                    <Tab eventKey="services" title="Services">
                        <Card className="data-card">
                            <Card.Header>
                                <h2>Service Management</h2>
                            </Card.Header>
                            <Card.Body>
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
                                                <th>Completion Date</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {serviceRequests.map(service => (
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
                                                            {service.problemDescription?.substring(0, 50)}...
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
                                                        {service.completionDate && (
                                                            <Badge bg="success" className="ready-badge">
                                                                <FaCalendarAlt /> {formatDate(service.completionDate)}
                                                            </Badge>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </Table>
                                </div>

                                {serviceRequests.length === 0 && (
                                    <div className="empty-state">
                                        <span className="empty-icon">🔧</span>
                                        <h4>No service requests</h4>
                                        <p>Service requests will appear here</p>
                                    </div>
                                )}
                            </Card.Body>
                        </Card>
                    </Tab>
                </Tabs>
            </Container>

            {/* Add/Edit Product Modal */}
            <Modal show={showProductModal} onHide={() => setShowProductModal(false)} centered className="admin-modal">
                <Modal.Header closeButton>
                    <Modal.Title>{editingProduct ? 'Edit Product' : 'Add New Product'}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleProductSubmit}>
                        <Form.Group className="mb-3">
                            <Form.Label>Product Name</Form.Label>
                            <Form.Control
                                type="text"
                                value={productForm.name}
                                onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                                placeholder="Enter product name"
                                required
                            />
                        </Form.Group>

                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Category</Form.Label>
                                    <Form.Select
                                        value={productForm.category}
                                        onChange={(e) => setProductForm({
                                            ...productForm,
                                            category: e.target.value,
                                            image: categoryIcons[e.target.value] || '📱'
                                        })}
                                    >
                                        <option value="mobiles">Mobiles</option>
                                        <option value="laptops">Laptops</option>
                                        <option value="camera">Camera</option>
                                        <option value="accessories">Accessories</option>
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Brand</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={productForm.brand}
                                        onChange={(e) => setProductForm({ ...productForm, brand: e.target.value })}
                                        placeholder="Enter brand"
                                        required
                                    />
                                </Form.Group>
                            </Col>
                        </Row>

                        <Row>
                            <Col md={4}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Price (₹)</Form.Label>
                                    <Form.Control
                                        type="number"
                                        value={productForm.price}
                                        onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                                        placeholder="Price"
                                        required
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Rating</Form.Label>
                                    <Form.Control
                                        type="number"
                                        step="0.1"
                                        min="1"
                                        max="5"
                                        value={productForm.rating}
                                        onChange={(e) => setProductForm({ ...productForm, rating: e.target.value })}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Stock</Form.Label>
                                    <Form.Control
                                        type="number"
                                        value={productForm.stock}
                                        onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })}
                                        placeholder="Stock"
                                        required
                                    />
                                </Form.Group>
                            </Col>
                        </Row>

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
        </div>
    );
}

export default Admin;
