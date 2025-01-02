import React, { useEffect, useRef, useState } from 'react'
import {
  CAlert,
  CButton,
  CCard,
  CCardBody,
  CCol,
  CContainer,
  CForm,
  CFormInput,
  CInputGroup,
  CInputGroupText,
  CRow,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilLockLocked, cilUser, cilMobile } from '@coreui/icons'
import { register } from '../../../util/api'
import { isLogIn, storeUserData } from '../../../util/session'
import { useNavigate } from 'react-router-dom'

const Register = () => {
  const [errorMessage, setErrorMessage] = useState()
  const [validated, setValidated] = useState(false)
  const navigate = useNavigate()
  const nameRef = useRef()
  const emailRef = useRef()
  const mobileRef = useRef()
  const pwdRef = useRef()
  const cPwdRef = useRef()

  useEffect(() => {
    if (isLogIn()) {
      navigate('/')
    }
  }, [])

  const handleSubmit = async (event) => {
    const form = event.currentTarget
    event.preventDefault()
    event.stopPropagation()
    setValidated(true)
    if (form.checkValidity() !== true) {
      return
    }
    const name = nameRef.current?.value
    const email = emailRef.current?.value
    const mobile = mobileRef.current?.value
    const type = 0
    const password = pwdRef.current?.value
    const password_confirmation = cPwdRef.current?.value

    try {
      const resp = await register({ name, email, mobile, type, password, password_confirmation })
      storeUserData(resp)
      navigate('/')
    } catch (error) {
      setErrorMessage(error.message ?? 'Please provide valid data')
    }
  }
  return (
    <div className="bg-body-tertiary min-vh-100 d-flex flex-row align-items-center">
      <CContainer>
        <CRow className="justify-content-center">
          <CCol md={9} lg={7} xl={6}>
            <CCard className="mx-4">
              <CCardBody className="p-4">
                <CForm noValidate={true} validated={validated} onSubmit={handleSubmit}>
                  <h1>Register</h1>
                  <p className="text-body-secondary">Create your account</p>
                  <CInputGroup className="mb-3">
                    <CInputGroupText>
                      <CIcon icon={cilUser} />
                    </CInputGroupText>
                    <CFormInput
                      ref={nameRef}
                      placeholder="Username"
                      autoComplete="name"
                      required
                      feedbackInvalid="Please provide name."
                    />
                  </CInputGroup>
                  <CInputGroup className="mb-3">
                    <CInputGroupText>@</CInputGroupText>
                    <CFormInput
                      ref={emailRef}
                      placeholder="Email"
                      autoComplete="email"
                      required
                      feedbackInvalid="Please provide email."
                    />
                  </CInputGroup>
                  <CInputGroup className="mb-3">
                    <CInputGroupText>
                      <CIcon icon={cilMobile} />
                    </CInputGroupText>
                    <CFormInput
                      ref={mobileRef}
                      placeholder="Mobile"
                      autoComplete="phone"
                      required
                      feedbackInvalid="Please provide mobile number."
                    />
                  </CInputGroup>
                  <CInputGroup className="mb-3">
                    <CInputGroupText>
                      <CIcon icon={cilLockLocked} />
                    </CInputGroupText>
                    <CFormInput
                      type="password"
                      ref={pwdRef}
                      placeholder="Password"
                      autoComplete="new-password"
                      required
                      feedbackInvalid="Please provide password."
                    />
                  </CInputGroup>
                  <CInputGroup className="mb-4">
                    <CInputGroupText>
                      <CIcon icon={cilLockLocked} />
                    </CInputGroupText>
                    <CFormInput
                      ref={cPwdRef}
                      type="password"
                      placeholder="Repeat password"
                      autoComplete="new-password"
                      required
                      feedbackInvalid="Please provide confirm password."
                    />
                  </CInputGroup>
                  {errorMessage && (
                    <CRow>
                      <CAlert color="danger">{errorMessage}</CAlert>
                    </CRow>
                  )}
                  <div className="d-grid">
                    <CButton color="success" type="submit">
                      Create Account
                    </CButton>
                  </div>
                </CForm>
              </CCardBody>
            </CCard>
          </CCol>
        </CRow>
      </CContainer>
    </div>
  )
}

export default Register
