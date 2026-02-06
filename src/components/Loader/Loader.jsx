import { useLoading } from '../../context/LoadingContext';
import './Loader.css';

function Loader() {
    const { isLoading, loadingText } = useLoading();

    if (!isLoading) return null;

    return (
        <div className="loader-overlay">
            <div className="loader-container">
                <div className="loader-spinner">
                    <div className="spinner-ring"></div>
                    <div className="spinner-ring"></div>
                    <div className="spinner-ring"></div>
                    <img src="/logo.png" alt="Loading" className="spinner-logo" />
                </div>
                <p className="loader-text">{loadingText}</p>
                <div className="loader-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        </div>
    );
}

export default Loader;
