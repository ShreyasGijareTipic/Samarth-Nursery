import React, { createContext, useContext, useState } from 'react';
import Spinner from './Spinner';

const SpinnerContext = createContext();

export const useSpinner = () => {
    return useContext(SpinnerContext);
};

export const SpinnerProvider = ({ children }) => {
    const [isLoading, setIsLoading] = useState(false);

    const showSpinner = () => setIsLoading(true);
    const hideSpinner = () => setIsLoading(false);

    return (
        <SpinnerContext.Provider value={{ isLoading, showSpinner, hideSpinner }}>
            {children}
            {isLoading && <Spinner />}
        </SpinnerContext.Provider>
    );
};