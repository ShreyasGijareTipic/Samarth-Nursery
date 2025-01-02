import { CButton, CModal, CModalBody, CModalFooter, CModalHeader, CModalTitle } from '@coreui/react'
import { getUserData } from '../../util/session'
import { useTranslation } from 'react-i18next';

export default function QRCodeModal({ visible, setVisible}) {
  const user = getUserData();
  const { t } = useTranslation("global")
  const qr = 'img/'+user?.company_info?.paymentQRCode;
  const shareImage = async () => {
    try {
      const response = await fetch(qr);
      const blob = await response.blob();
      const file = new File([blob], 'QRCode.png', { type: 'image/png' });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: 'Check out my QR code!',
          files: [file],
        });
      } else {
        alert('Your browser does not support sharing files.');
      }
    } catch (error) {
      console.error('Error sharing the image:', error);
    }
  };
  return (
    <>
      <CModal
        backdrop="static"
        visible={visible}
        onClose={() => setVisible(false)}
        aria-labelledby="StaticBackdropExampleLabel"
      >
        <CModalHeader>
          <CModalTitle id="StaticBackdropExampleLabel">{t("LABELS.qr")}</CModalTitle>
        </CModalHeader>
        <CModalBody>
        <div className="text-center">
          <img style={{maxHeight: '350px'}} className='img-thumbnail img-fluid' src={qr}/>
        </div>
          
        </CModalBody>
        <CModalFooter>
          <CButton color="success" onClick={shareImage}>
          {t("LABELS.share")}
          </CButton>
          <CButton color="danger" onClick={() => setVisible(false)}>
          {t("LABELS.close")}
          </CButton>
        </CModalFooter>
      </CModal>
    </>
  )
}
