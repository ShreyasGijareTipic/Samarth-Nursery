import React from 'react';
import { CSpinner } from '@coreui/react'; // Assuming you're using CoreUI for the spinner

const Spinner = () => {
    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '100vh',
            backgroundColor: 'rgba(128, 128, 128, 0.5)', // Gray backdrop
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 1000
        }}>
            <CSpinner color="primary" variant="border" />
        </div>
    );
};

export default Spinner;