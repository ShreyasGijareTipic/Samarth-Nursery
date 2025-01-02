import { CToast, CToastBody, CToastClose } from '@coreui/react';
import React, { createContext, useContext, useState } from 'react';

const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
  const [toast, addToast] = useState(0)

  return (
    <ToastContext.Provider value={{ toast, addToast }}>
      {children}
    </ToastContext.Provider>
  );
};

const createToast = (addToast,type, body) => {
  addToast(<CToast autohide={true} visible={true} color={type} className="text-white align-items-center">
      <div className="d-flex">
        <CToastBody>{body}</CToastBody>
        <CToastClose className="me-2 m-auto" white />
      </div>
  </CToast>)
};

export const useToast = () => {
  const context = useContext(ToastContext);
  
  const showToast = (type,body) => {
    createToast(context.addToast,type,body);
  };

  return {
    ...context,
    showToast,
  };
};