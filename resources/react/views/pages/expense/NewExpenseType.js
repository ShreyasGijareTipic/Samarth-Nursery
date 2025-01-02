import React, { useState } from 'react'
import {
  CAlert,
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CForm,
  CFormCheck,
  CFormInput,
  CFormLabel,
  CFormTextarea,
  CRow,
} from '@coreui/react'
import { post } from '../../../util/api'
import { useToast } from '../../common/toast/ToastContext';
import { useTranslation } from 'react-i18next'

const NewExpenseType = () => {
  const [validated, setValidated] = useState(false)
  const { showToast } = useToast();
  const { t } = useTranslation("global")
  const [state, setState] = useState({
    name: '',
    slug: '',
    localName: '',
    desc: '',
    show: true,
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setState({ ...state, [name]: value })
  }

  const handleCBChange = (e) => {
    const { name, checked } = e.target
    setState({ ...state, [name]: checked })
  }

  const handleSubmit = async (event) => {
    const form = event.currentTarget
    event.preventDefault()
    event.stopPropagation()
    setValidated(true)
    if (form.checkValidity() !== true) {
      return
    }
    let data = { ...state }
    data.slug = data.name.replace(/[^\w]/g, '_')
    try {
      const resp = await post('/api/expenseType', data)
      if (resp?.id) {
        showToast('success',t("MSG.expense_type_added_successfully_msg"));
      } else {
        showToast('danger', t("MSG.failed_to_add_expense_type_msg"));
      }
      handleClear()
    } catch (error) {
      showToast('danger', 'Error occured ' + error);
    }
  }

  const handleClear = async () => {
    setState({
      name: '',
      slug: '',
      localName: '',
      desc: '',
      show: true,
    })
    setValidated(false)
  }
  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <strong>{t("LABELS.create_new_expense_type")}</strong>
          </CCardHeader>
          <CCardBody>
            <CForm noValidate={true} validated={validated} onSubmit={handleSubmit}>
              <div className="mb-3">
                <CFormLabel htmlFor="pname">{t("LABELS.expense_type_name")}</CFormLabel>
                <CFormInput
                  type="text"
                  id="pname"
                  placeholder=""
                  name="name"
                  value={state.name}
                  onChange={handleChange}
                  required
                  feedbackInvalid="Please provide name."
                />
              </div>
              <div className="mb-3">
                <CFormLabel htmlFor="pname">{t("LABELS.expense_type_local_name")}</CFormLabel>
                <CFormInput
                  type="text"
                  id="plname"
                  placeholder=""
                  name="localName"
                  value={state.localName}
                  onChange={handleChange}
                  required
                  feedbackInvalid="Please provide local name."
                />
              </div>
              <div className="mb-3">
                <CFormLabel htmlFor="desc">{t("LABELS.short_description")}</CFormLabel>
                <CFormTextarea
                  id="desc"
                  rows={3}
                  name="desc"
                  value={state.desc}
                  onChange={handleChange}
                  required
                  feedbackInvalid="Please provide description."
                ></CFormTextarea>
              </div>
              <div className="mb-3">
                <CFormCheck
                  id="flexCheckDefault"
                  label={t("LABELS.show_for_expense_records")}
                  name="show"
                  checked={state.show}
                  onChange={handleCBChange}
                />
              </div>
              <div className="mb-3">
                <CButton color="success" type="submit">
                {t("LABELS.submit")}
                </CButton>
                &nbsp;
                <CButton color="secondary" onClick={handleClear}>
                {t("LABELS.clear")}
                </CButton>
              </div>
            </CForm>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  )
}

export default NewExpenseType
