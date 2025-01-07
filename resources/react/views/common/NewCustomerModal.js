import { CAlert, CButton, CForm, CFormInput, CFormLabel, CFormTextarea, CModal, CModalBody, CModalFooter, CModalHeader, CModalTitle, CRow } from '@coreui/react'
import { getUserData } from '../../util/session'
import { useEffect, useState } from 'react'
import { post } from '../../util/api'
import { useToast } from '../common/toast/ToastContext'
import { useTranslation } from 'react-i18next'

export default function NewCustomerModal({ visible, hint, setVisible, onSuccess }) {
  const user = getUserData()
  const { showToast } = useToast();
  const { t } = useTranslation("global")
  
  const [state, setState] = useState({
    name: hint,
    mobile: '',
    discount: 0,
    company_id: user?.company_id,
    show: true,
    address: '',
  })

  useEffect(()=>{
    if(visible){
      const regex = /^\d+$/;
      if(regex.test(hint?.trim())){
        setState({ ...state, mobile: hint.trim() })
      }else{
        setState({ ...state, name: hint?.trim() })
      }
    }
  },[hint, visible])
  const handleChange = (e) => {
    const { name, value } = e.target
    setState({ ...state, [name]: value })
  }
  
  const handleSubmit = async (e) => {
    e.preventDefault()
    const form = e.target
    if (!form.checkValidity()) {
      form.classList.add('was-validated')
      return
    }

    let data = { ...state }
    if(!data.discount){
      data.discount = 0;
    }
    try {
      const resp = await post('/api/customer', data)
      if (resp?.id) {
        showToast('success',t("MSG.data_saved_successfully_msg"));
        onSuccess(resp)
        setVisible(false)
        handleClear()
      } else {
        showToast('danger', t("MSG.failed_to_create"));
      }
    } catch (error) {
      showToast('danger', 'Error occured ' + error);
    }
  }

  const handleClear = () => {
    setState({
      name: '',
      mobile: '',
      discount: 0,
      company_id: state.company_id,
      show: true,
      address:''
    })
  }
  
  return (
    <>
      <CModal
        backdrop="static"
        visible={visible}
        onClose={() => {handleClear();setVisible(false);}}
        aria-labelledby="StaticBackdropExampleLabel"
      >
        <CModalHeader>
          <CModalTitle id="StaticBackdropExampleLabel">{t("LABELS.new_customer")}</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CForm className="needs-validation" noValidate onSubmit={handleSubmit}>
                <div className="mb-3">
                  <CFormLabel htmlFor="pname">{t("LABELS.customer_name")}</CFormLabel>
                  <CFormInput
                    type="text"
                    id="pname"
                    placeholder={t('MSG.enter_customer_name_msg')}
                    name="name"
                    value={state.name}
                    onChange={handleChange}
                    required
                    feedbackInvalid={t('MSG.please_provide_name')}
                    feedbackValid={t('MSG.looks_good_msg')}
                  />
                  <div className="invalid-feedback">{t("MSG.name_is_required_msg")}</div>
                </div>
                <div className="mb-3">
                  <CFormLabel htmlFor="plmobile">{t("LABELS.mobile_number")}</CFormLabel>
                  <CFormInput
                    type="text"
                    id="plmobile"
                    placeholder={t("MSG.enter_mob_no_msg")}
                    name="mobile"
                    value={state.mobile}
                    minLength={10}
                    maxLength={10}
                    onChange={handleChange}
                    required
                    pattern="\d{10}"
                    autoComplete='off'
                    feedbackInvalid={t("MSG.please_provide_mobile_number_msg")}
                    feedbackValid={t('MSG.looks_good_msg')}
                  />
                  <div className="invalid-feedback">{t("MSG.mobile_number_is_required_msg")}</div>
                </div>
                <div className="mb-3">
                  <CFormLabel htmlFor="address">{t("LABELS.address")}</CFormLabel>
                  <CFormTextarea
                    id="address"
                    rows={2}
                    name="address"
                    value={state.address}
                    onChange={handleChange}
                  ></CFormTextarea>
                </div>
                <div className="mb-3">
                <CButton color="success" type="submit">
                {t("LABELS.submit")}
                </CButton>
                &nbsp;
                <CButton color="danger" onClick={() => {handleClear();setVisible(false);}}>
                {t("LABELS.close")}
                </CButton>
              </div>
            </CForm>
        </CModalBody>
        {/* <CModalFooter>
          <CButton color="secondary" onClick={() => {handleClear();setVisible(false);}}>
            Close
          </CButton>
          <CButton color="primary" onClick={handleSubmit}>
            Yes
          </CButton>
        </CModalFooter> */}
      </CModal>
    </>
  )
}
