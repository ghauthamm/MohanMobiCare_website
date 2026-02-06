import { createContext, useContext, useState } from 'react';

const LoadingContext = createContext();

export function useLoading() {
    return useContext(LoadingContext);
}

export function LoadingProvider({ children }) {
    const [isLoading, setIsLoading] = useState(false);
    const [loadingText, setLoadingText] = useState('Loading MobiCare...');

    const showLoading = (text = 'Loading MobiCare...') => {
        setLoadingText(text);
        setIsLoading(true);
    };

    const hideLoading = () => {
        setIsLoading(false);
    };

    const value = {
        isLoading,
        loadingText,
        showLoading,
        hideLoading
    };

    return (
        <LoadingContext.Provider value={value}>
            {children}
        </LoadingContext.Provider>
    );
}
