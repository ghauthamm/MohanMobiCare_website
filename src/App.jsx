import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { LoadingProvider } from './context/LoadingContext';
import { CartProvider } from './context/CartContext';

import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import Loader from './components/Loader/Loader';

import Home from './pages/Home/Home';
import Sales from './pages/Sales/Sales';
import Service from './pages/Service/Service';
import Login from './pages/Login/Login';
import Dashboard from './pages/Dashboard/Dashboard';

import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <LoadingProvider>
          <CartProvider>
            <div className="app">
              <Loader />
              <Header />
              <main className="main-content">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/sales" element={<Sales />} />
                  <Route path="/service" element={<Service />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                </Routes>
              </main>
              <Footer />
            </div>
          </CartProvider>
        </LoadingProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
