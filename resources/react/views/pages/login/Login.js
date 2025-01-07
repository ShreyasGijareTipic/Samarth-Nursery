import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CButton,
  CCard,
  CCardBody,
  CCardGroup,
  CCol,
  CContainer,
  CForm,
  CFormInput,
  CInputGroup,
  CInputGroupText,
  CRow,
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilArrowThickFromTop, cilLockLocked, cilUser } from '@coreui/icons';
import { login } from '../../../util/api';
import { isLogIn, storeUserData } from '../../../util/session';

import logo from './../../../assets/brand/samarthNursuryLogo.png';
import nurseryPlant from '../../../assets/nurseryPlant.jpg'; // Import the background image
import { useToast } from '../../common/toast/ToastContext';

const Login = () => {
  const [validated, setValidated] = useState(false);
  const [showInstall, setShowInstall] = useState(false);
  const navigate = useNavigate();
  const userNameRef = useRef();
  const userPwdRef = useRef();
  const { showToast } = useToast();

  useEffect(() => {
    if (isLogIn()) {
      navigate('/dashboard');
    }
  }, []);

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    window.deferredPrompt = e;
    setShowInstall(true);
  });

  const onInstall = async() => {
    if (window.deferredPrompt) {
        window.deferredPrompt.prompt();
        const { outcome } = await window.deferredPrompt.userChoice;
        if (outcome === 'accepted') {
          window.deferredPrompt = null;
          setShowInstall(false);
        }
    }
  }

  const goToFaq = () => {
    navigate('/faq');  // Use navigate to go to /faq page
  };

  const handleLogin = async (event) => {
    const form = event.currentTarget;
    event.preventDefault();
    event.stopPropagation();
    if (form.checkValidity() !== true) {
      setValidated(true);
      return;
    }
    setValidated(true);
    const email = userNameRef.current?.value;
    const password = userPwdRef.current?.value;
    
    try {
        const resp = await login({ email, password });
        if(resp.blocked){
          showToast('danger', resp.message);
        }else{
          const user = resp?.user;
          if(user){
            storeUserData(resp);
            if(user.type > 1){
              navigate('/invoice');
            }else{
              navigate('/dashboard');
            }
          }
          else{
            showToast('danger','Please provide valid email and password');
          }
      }
    } catch (error) {
      showToast('danger','Please provide valid email and password');
    }
  };

  return (
    <div 
      className="bg-body-tertiary min-vh-100 d-flex flex-row align-items-center"
      style={{
        backgroundImage: `url(${nurseryPlant})`,  // Set background image
        backgroundSize: 'cover',  // Make the background cover the full screen
        backgroundPosition: 'center',  // Center the image
        backgroundRepeat: 'no-repeat',  // Ensure the image doesn't repeat
      }}
    >
      <CContainer>
        <CRow className="justify-content-center">
          <CCol md={6}>
            <CCardGroup>
              <CCard className="p-4">
                <CCardBody>
                  <CForm noValidate={true} validated={validated} onSubmit={handleLogin}>
                    <img src={logo} style={{ width: '100%', height: 'auto', maxHeight: '200px' }} className='object-fit-contain'/>
                    <p className="text-body-secondary">Sign In to your account</p>
                    <CInputGroup className="mb-3">
                      <CInputGroupText>
                        <CIcon icon={cilUser} />
                      </CInputGroupText>
                      <CFormInput
                        ref={userNameRef}
                        id="username"
                        placeholder="Username"
                        autoComplete="username"
                        feedbackInvalid="Please provide username."
                        required
                      />
                    </CInputGroup>
                    <CInputGroup className="mb-4">
                      <CInputGroupText>
                        <CIcon icon={cilLockLocked} />
                      </CInputGroupText>
                      <CFormInput
                        ref={userPwdRef}
                        id="password"
                        type="password"
                        placeholder="Password"
                        autoComplete="current-password"
                        feedbackInvalid="Please provide password."
                        required
                      />
                    </CInputGroup>

                    <CRow>
                      <CCol xs={6}>
                        <CButton color="primary" type="submit" className="px-4">
                          Login
                        </CButton>
                      </CCol>
                      <CCol xs={6}>
                        <CCol xs={6} className="text-right">
                        </CCol>
                      </CCol>
                    </CRow>
                  </CForm>
                </CCardBody>
              </CCard>
            </CCardGroup>
          </CCol>
        </CRow>
      </CContainer>
      {showInstall && <CButton 
        onClick={onInstall} 
        color="success" 
        style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          borderRadius: '50%',
          width: '56px',
          height: '56px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
        }}
      >
        <CIcon icon={cilArrowThickFromTop} style={{ fontSize: '24px', color: 'white' }} />
      </CButton>}
    </div>
  );
};

export default Login;
