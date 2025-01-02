import React, { useRef } from 'react';
import { CToaster } from '@coreui/react';
import { useToast } from './ToastContext';

const ToastContainer = () => {
  const { toast } = useToast();
  const toaster = useRef();
  return (
    <CToaster className="p-3" placement="top-end" push={toast} ref={toaster} />
  );
};

export default ToastContainer;