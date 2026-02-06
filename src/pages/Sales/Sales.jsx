import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Container, Row, Col, Form, Card, Badge, Offcanvas } from 'react-bootstrap';
import { FaStar, FaHeart, FaShoppingCart, FaFilter, FaTimes, FaPlus, FaMinus, FaTrash } from 'react-icons/fa';
import { ref, get } from 'firebase/database';
import { database } from '../../firebase/config';
import { useLoading } from '../../context/LoadingContext';
import { useCart } from '../../context/CartContext';
import './Sales.css';

// Sample products data
const sampleProducts = [
    { id: 1, name: 'iPhone 15 Pro Max', category: 'mobiles', brand: 'Apple', price: 159900, rating: 4.8, image: '📱', stock: 10 },
    { id: 2, name: 'Samsung Galaxy S24 Ultra', category: 'mobiles', brand: 'Samsung', price: 134999, rating: 4.7, image: '📱', stock: 15 },
    { id: 3, name: 'OnePlus 12', category: 'mobiles', brand: 'OnePlus', price: 69999, rating: 4.6, image: '📱', stock: 20 },
    { id: 4, name: 'Google Pixel 8 Pro', category: 'mobiles', brand: 'Google', price: 106999, rating: 4.5, image: '📱', stock: 8 },
    { id: 5, name: 'MacBook Pro 16"', category: 'laptops', brand: 'Apple', price: 249900, rating: 4.9, image: '💻', stock: 5 },
    { id: 6, name: 'Dell XPS 15', category: 'laptops', brand: 'Dell', price: 189990, rating: 4.6, image: '💻', stock: 12 },
    { id: 7, name: 'HP Spectre x360', category: 'laptops', brand: 'HP', price: 159990, rating: 4.5, image: '💻', stock: 7 },
    { id: 8, name: 'Lenovo ThinkPad X1 Carbon', category: 'laptops', brand: 'Lenovo', price: 179990, rating: 4.7, image: '💻', stock: 9 },
    { id: 9, name: 'Sony Alpha A7 IV', category: 'camera', brand: 'Sony', price: 248990, rating: 4.8, image: '📷', stock: 4 },
    { id: 10, name: 'Canon EOS R6 Mark II', category: 'camera', brand: 'Canon', price: 232990, rating: 4.7, image: '📷', stock: 6 },
    { id: 11, name: 'AirPods Pro 2', category: 'accessories', brand: 'Apple', price: 24900, rating: 4.6, image: '🎧', stock: 25 },
    { id: 12, name: 'Samsung Galaxy Watch 6', category: 'accessories', brand: 'Samsung', price: 32999, rating: 4.4, image: '⌚', stock: 18 },
    { id: 13, name: 'Logitech MX Master 3S', category: 'accessories', brand: 'Logitech', price: 9995, rating: 4.8, image: '🖱️', stock: 30 },
    { id: 14, name: 'Xiaomi 14 Ultra', category: 'mobiles', brand: 'Xiaomi', price: 99999, rating: 4.5, image: '📱', stock: 14 },
    { id: 15, name: 'ASUS ROG Zephyrus G14', category: 'laptops', brand: 'ASUS', price: 149990, rating: 4.6, image: '💻', stock: 8 },
    { id: 16, name: 'Nikon Z8', category: 'camera', brand: 'Nikon', price: 339990, rating: 4.9, image: '📷', stock: 3 },
];

const categories = [
    { id: 'all', name: 'All Products', icon: '🏪' },
    { id: 'mobiles', name: 'Mobiles', icon: '📱' },
    { id: 'laptops', name: 'Laptops', icon: '💻' },
    { id: 'camera', name: 'Camera', icon: '📷' },
    { id: 'accessories', name: 'Accessories', icon: '🎧' }
];

const brands = ['All', 'Apple', 'Samsung', 'OnePlus', 'Google', 'Dell', 'HP', 'Lenovo', 'Sony', 'Canon', 'Logitech', 'Xiaomi', 'ASUS', 'Nikon'];

const priceRanges = [
    { id: 'all', label: 'All Prices', min: 0, max: Infinity },
    { id: '0-25000', label: 'Under ₹25,000', min: 0, max: 25000 },
    { id: '25000-50000', label: '₹25,000 - ₹50,000', min: 25000, max: 50000 },
    { id: '50000-100000', label: '₹50,000 - ₹1,00,000', min: 50000, max: 100000 },
    { id: '100000-200000', label: '₹1,00,000 - ₹2,00,000', min: 100000, max: 200000 },
    { id: '200000+', label: 'Above ₹2,00,000', min: 200000, max: Infinity }
];

function Sales() {
    const [searchParams] = useSearchParams();
    const { showLoading, hideLoading } = useLoading();
    const { cart, wishlist, addToCart, removeFromCart, updateQuantity, addToWishlist, removeFromWishlist, isInWishlist, cartTotal } = useCart();

    const [products, setProducts] = useState(sampleProducts);
    const [filteredProducts, setFilteredProducts] = useState(sampleProducts);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [selectedBrand, setSelectedBrand] = useState('All');
    const [selectedPriceRange, setSelectedPriceRange] = useState('all');
    const [selectedRating, setSelectedRating] = useState(0);
    const [showFilters, setShowFilters] = useState(false);
    const [showCart, setShowCart] = useState(false);
    const [showWishlist, setShowWishlist] = useState(false);

    useEffect(() => {
        const fetchProducts = async () => {
            showLoading('Loading Products...');
            try {
                const productsRef = ref(database, 'products');
                const snapshot = await get(productsRef);
                if (snapshot.exists()) {
                    const data = snapshot.val();
                    const productsArray = Object.entries(data).map(([id, product]) => ({
                        id,
                        ...product
                    }));
                    setProducts(productsArray);
                    setFilteredProducts(productsArray);
                }
            } catch (error) {
                console.log('Using sample products');
            }
            hideLoading();
        };

        fetchProducts();
    }, []);

    useEffect(() => {
        const view = searchParams.get('view');
        if (view === 'cart') setShowCart(true);
        if (view === 'wishlist') setShowWishlist(true);

        const category = searchParams.get('category');
        if (category) setSelectedCategory(category);

        const search = searchParams.get('search');
        if (search) {
            const searchLower = search.toLowerCase();
            setFilteredProducts(products.filter(p =>
                p.name.toLowerCase().includes(searchLower) ||
                p.brand.toLowerCase().includes(searchLower)
            ));
        }
    }, [searchParams, products]);

    useEffect(() => {
        let filtered = [...products];

        if (selectedCategory !== 'all') {
            filtered = filtered.filter(p => p.category === selectedCategory);
        }

        if (selectedBrand !== 'All') {
            filtered = filtered.filter(p => p.brand === selectedBrand);
        }

        const priceRange = priceRanges.find(r => r.id === selectedPriceRange);
        if (priceRange) {
            filtered = filtered.filter(p => p.price >= priceRange.min && p.price <= priceRange.max);
        }

        if (selectedRating > 0) {
            filtered = filtered.filter(p => p.rating >= selectedRating);
        }

        setFilteredProducts(filtered);
    }, [selectedCategory, selectedBrand, selectedPriceRange, selectedRating, products]);

    const formatPrice = (price) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(price);
    };

    const renderStars = (rating) => {
        return Array.from({ length: 5 }, (_, i) => (
            <FaStar key={i} className={i < Math.floor(rating) ? 'star-filled' : 'star-empty'} />
        ));
    };

    return (
        <div className="sales-page">
            <Container fluid>
                <Row>
                    {/* Sidebar Filters - Desktop */}
                    <Col lg={3} className="d-none d-lg-block">
                        <div className="filters-sidebar">
                            <h3 className="filters-title">
                                <FaFilter /> Filters
                            </h3>

                            {/* Categories */}
                            <div className="filter-section">
                                <h4 className="filter-heading">Categories</h4>
                                {categories.map(cat => (
                                    <div
                                        key={cat.id}
                                        className={`category-item ${selectedCategory === cat.id ? 'active' : ''}`}
                                        onClick={() => setSelectedCategory(cat.id)}
                                    >
                                        <span className="category-icon">{cat.icon}</span>
                                        <span>{cat.name}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Brand Filter */}
                            <div className="filter-section">
                                <h4 className="filter-heading">Brand</h4>
                                <Form.Select
                                    value={selectedBrand}
                                    onChange={(e) => setSelectedBrand(e.target.value)}
                                    className="filter-select"
                                >
                                    {brands.map(brand => (
                                        <option key={brand} value={brand}>{brand}</option>
                                    ))}
                                </Form.Select>
                            </div>

                            {/* Price Range */}
                            <div className="filter-section">
                                <h4 className="filter-heading">Price Range</h4>
                                {priceRanges.map(range => (
                                    <div
                                        key={range.id}
                                        className={`price-item ${selectedPriceRange === range.id ? 'active' : ''}`}
                                        onClick={() => setSelectedPriceRange(range.id)}
                                    >
                                        <span>{range.label}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Rating Filter */}
                            <div className="filter-section">
                                <h4 className="filter-heading">Rating</h4>
                                {[4, 3, 2, 1].map(rating => (
                                    <div
                                        key={rating}
                                        className={`rating-item ${selectedRating === rating ? 'active' : ''}`}
                                        onClick={() => setSelectedRating(selectedRating === rating ? 0 : rating)}
                                    >
                                        {renderStars(rating)}
                                        <span>& Up</span>
                                    </div>
                                ))}
                            </div>

                            {/* Clear Filters */}
                            <button
                                className="clear-filters-btn"
                                onClick={() => {
                                    setSelectedCategory('all');
                                    setSelectedBrand('All');
                                    setSelectedPriceRange('all');
                                    setSelectedRating(0);
                                }}
                            >
                                Clear All Filters
                            </button>
                        </div>
                    </Col>

                    {/* Products Grid */}
                    <Col lg={9}>
                        <div className="products-header">
                            <h2 className="products-title">
                                {categories.find(c => c.id === selectedCategory)?.name || 'All Products'}
                            </h2>
                            <div className="products-actions">
                                <Badge bg="warning" className="products-count">
                                    {filteredProducts.length} Products
                                </Badge>
                                <button className="filter-toggle-btn d-lg-none" onClick={() => setShowFilters(true)}>
                                    <FaFilter /> Filters
                                </button>
                            </div>
                        </div>

                        <Row>
                            {filteredProducts.map(product => (
                                <Col xl={4} md={6} key={product.id}>
                                    <Card className="product-card">
                                        <div className="product-image">
                                            <span className="product-emoji">{product.image}</span>
                                            <button
                                                className={`wishlist-btn ${isInWishlist(product.id) ? 'active' : ''}`}
                                                onClick={() => isInWishlist(product.id) ? removeFromWishlist(product.id) : addToWishlist(product)}
                                            >
                                                <FaHeart />
                                            </button>
                                        </div>
                                        <Card.Body>
                                            <Badge className="product-category">{product.category}</Badge>
                                            <h5 className="product-name">{product.name}</h5>
                                            <p className="product-brand">{product.brand}</p>
                                            <div className="product-rating">
                                                {renderStars(product.rating)}
                                                <span className="rating-value">{product.rating}</span>
                                            </div>
                                            <div className="product-footer">
                                                <span className="product-price">{formatPrice(product.price)}</span>
                                                <button className="add-to-cart-btn" onClick={() => addToCart(product)}>
                                                    <FaShoppingCart /> Add
                                                </button>
                                            </div>
                                        </Card.Body>
                                    </Card>
                                </Col>
                            ))}
                        </Row>

                        {filteredProducts.length === 0 && (
                            <div className="no-products">
                                <span className="no-products-icon">📦</span>
                                <h3>No products found</h3>
                                <p>Try adjusting your filters</p>
                            </div>
                        )}
                    </Col>
                </Row>
            </Container>

            {/* Mobile Filters Offcanvas */}
            <Offcanvas show={showFilters} onHide={() => setShowFilters(false)} placement="start" className="filters-offcanvas">
                <Offcanvas.Header closeButton>
                    <Offcanvas.Title><FaFilter /> Filters</Offcanvas.Title>
                </Offcanvas.Header>
                <Offcanvas.Body>
                    {/* Same filter content as sidebar */}
                    <div className="filter-section">
                        <h4 className="filter-heading">Categories</h4>
                        {categories.map(cat => (
                            <div
                                key={cat.id}
                                className={`category-item ${selectedCategory === cat.id ? 'active' : ''}`}
                                onClick={() => { setSelectedCategory(cat.id); setShowFilters(false); }}
                            >
                                <span className="category-icon">{cat.icon}</span>
                                <span>{cat.name}</span>
                            </div>
                        ))}
                    </div>

                    <div className="filter-section">
                        <h4 className="filter-heading">Brand</h4>
                        <Form.Select
                            value={selectedBrand}
                            onChange={(e) => setSelectedBrand(e.target.value)}
                            className="filter-select"
                        >
                            {brands.map(brand => (
                                <option key={brand} value={brand}>{brand}</option>
                            ))}
                        </Form.Select>
                    </div>

                    <div className="filter-section">
                        <h4 className="filter-heading">Price Range</h4>
                        {priceRanges.map(range => (
                            <div
                                key={range.id}
                                className={`price-item ${selectedPriceRange === range.id ? 'active' : ''}`}
                                onClick={() => setSelectedPriceRange(range.id)}
                            >
                                <span>{range.label}</span>
                            </div>
                        ))}
                    </div>
                </Offcanvas.Body>
            </Offcanvas>

            {/* Cart Offcanvas */}
            <Offcanvas show={showCart} onHide={() => setShowCart(false)} placement="end" className="cart-offcanvas">
                <Offcanvas.Header closeButton>
                    <Offcanvas.Title><FaShoppingCart /> Your Cart</Offcanvas.Title>
                </Offcanvas.Header>
                <Offcanvas.Body>
                    {cart.length === 0 ? (
                        <div className="empty-cart">
                            <span className="empty-icon">🛒</span>
                            <h4>Your cart is empty</h4>
                            <p>Add some products to get started!</p>
                        </div>
                    ) : (
                        <>
                            {cart.map(item => (
                                <div key={item.id} className="cart-item">
                                    <span className="cart-item-image">{item.image}</span>
                                    <div className="cart-item-info">
                                        <h6>{item.name}</h6>
                                        <p>{formatPrice(item.price)}</p>
                                    </div>
                                    <div className="cart-item-actions">
                                        <button onClick={() => updateQuantity(item.id, item.quantity - 1)}><FaMinus /></button>
                                        <span>{item.quantity}</span>
                                        <button onClick={() => updateQuantity(item.id, item.quantity + 1)}><FaPlus /></button>
                                        <button className="delete-btn" onClick={() => removeFromCart(item.id)}><FaTrash /></button>
                                    </div>
                                </div>
                            ))}
                            <div className="cart-total">
                                <span>Total:</span>
                                <strong>{formatPrice(cartTotal)}</strong>
                            </div>
                            <button className="checkout-btn">Proceed to Checkout</button>
                        </>
                    )}
                </Offcanvas.Body>
            </Offcanvas>

            {/* Wishlist Offcanvas */}
            <Offcanvas show={showWishlist} onHide={() => setShowWishlist(false)} placement="end" className="cart-offcanvas">
                <Offcanvas.Header closeButton>
                    <Offcanvas.Title><FaHeart /> Your Wishlist</Offcanvas.Title>
                </Offcanvas.Header>
                <Offcanvas.Body>
                    {wishlist.length === 0 ? (
                        <div className="empty-cart">
                            <span className="empty-icon">❤️</span>
                            <h4>Your wishlist is empty</h4>
                            <p>Save products you love!</p>
                        </div>
                    ) : (
                        wishlist.map(item => (
                            <div key={item.id} className="cart-item">
                                <span className="cart-item-image">{item.image}</span>
                                <div className="cart-item-info">
                                    <h6>{item.name}</h6>
                                    <p>{formatPrice(item.price)}</p>
                                </div>
                                <div className="cart-item-actions">
                                    <button onClick={() => addToCart(item)}><FaShoppingCart /></button>
                                    <button className="delete-btn" onClick={() => removeFromWishlist(item.id)}><FaTimes /></button>
                                </div>
                            </div>
                        ))
                    )}
                </Offcanvas.Body>
            </Offcanvas>

            {/* Floating Cart/Wishlist Buttons */}
            <div className="floating-buttons">
                <button className="floating-btn wishlist-float" onClick={() => setShowWishlist(true)}>
                    <FaHeart />
                    {wishlist.length > 0 && <Badge className="float-badge">{wishlist.length}</Badge>}
                </button>
                <button className="floating-btn cart-float" onClick={() => setShowCart(true)}>
                    <FaShoppingCart />
                    {cart.length > 0 && <Badge className="float-badge">{cart.reduce((t, i) => t + i.quantity, 0)}</Badge>}
                </button>
            </div>
        </div>
    );
}

export default Sales;
