import React, { useEffect, useState } from 'react';
import { CAlert } from '@coreui/react';
import { useToast } from '../common/toast/ToastContext';
import { useTranslation } from 'react-i18next';

const NetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const {showToast} = useToast();
  const { t } = useTranslation("global")

  useEffect(() => {
    const updateNetworkStatus = () => {
      setIsOnline(navigator.onLine);
      if(navigator.onLine){
        showToast('primary', t("MSG.network_online"));
      }else{
        showToast('dark', t("MSG.network_offline"));
      }
    };

    window.addEventListener('online', updateNetworkStatus);
    window.addEventListener('offline', updateNetworkStatus);

    // Cleanup event listeners on component unmount
    return () => {
      window.removeEventListener('online', updateNetworkStatus);
      window.removeEventListener('offline', updateNetworkStatus);
    };
  }, []);

  return (
    <>
      {!isOnline && (
        <CAlert color="danger text-center">
          {t("MSG.network_issue")}
        </CAlert>
      )}
    </>
  );
};

export default NetworkStatus;