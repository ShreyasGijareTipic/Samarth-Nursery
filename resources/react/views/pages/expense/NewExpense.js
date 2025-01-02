import React, { useEffect, useState } from 'react';
import {
  CAlert,
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CForm,
  CFormInput,
  CFormLabel,
  CFormSelect,
  CRow,
} from '@coreui/react';
import { getAPICall, post } from '../../../util/api';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../common/toast/ToastContext';
import { useTranslation } from 'react-i18next'

const NewExpense = () => {
  const [validated, setValidated] = useState(false);
  const [expenseTypes, setExpenseTypes] = useState([]);
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { t } = useTranslation("global")
  const [state, setState] = useState({
    name: '',
    desc: '',
    expense_id: undefined,
    typeNotSet: true,
    qty: 0,
    price: 0,
    total_price: 0,
    expense_date: '',
    show: true,
  });

  const fetchExpenseTypes = async () => {
    try {
      const response = await getAPICall('/api/expenseType');
      const options = ['Select Expense Type'];
      options.push(
        ...response
          .filter((p) => p.show === 1)
          .map((p) => ({
            label: p.name,
            value: p.id,
            disabled: p.show !== 1,
          }))
      );
      setExpenseTypes(options);
    } catch (error) {
      showToast('danger', 'Error occured ' + error);
    }
  };

  useEffect(() => {
    fetchExpenseTypes();
  }, []);

  const calculateFinalAmount = (old) => {
    old.total_price = (parseFloat(old.price) || 0) * (parseInt(old.qty) || 0);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'price' || name === 'qty') {
      setState((prev) => {
        const old = { ...prev };
        old[name] = value;
        calculateFinalAmount(old);
        return { ...old };
      });
    } else if (name === 'expense_id') {
      setState((prev) => {
        const old = { ...prev };
        old[name] = value;
        old.typeNotSet = value === undefined;
        return { ...old };
      });
    } else if (name === 'name') {
      const regex = /^[A-Za-z\s]*$/;
      if (regex.test(value)) {
        setState({ ...state, [name]: value });
      }
    } else {
      setState({ ...state, [name]: value });
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    event.stopPropagation();
    setValidated(true);

    if (state.expense_id && state.price > 0 && state.qty > 0 && state.name) {
      try {
        const resp = await post('/api/expense', { ...state });
        if (resp) {
          showToast('success',t("MSG.new_expense_added_successfully_msg"));
        } else {
          showToast('danger',t("MSG.error_occured_please_try_again_later_msg"));
        }
        handleClear();
      } catch (error) {
        showToast('danger', 'Error occured ' + error);
      }
    } else {
      setState((old) => ({ ...old, typeNotSet: old.expense_id === undefined }));
    }
  };

  const today = new Date().toISOString().split('T')[0];
  const handleClear = async () => {
    setState({
      name: '',
      desc: '',
      expense_id: state.expense_id,
      qty: 0,
      price: 0,
      total_price: 0,
      expense_date: '',
      show: true,
      typeNotSet: state.expense_id === undefined,
    });
    setValidated(false);
  };

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <strong>{t("LABELS.new_expense")}</strong>
          </CCardHeader>
          <CCardBody>
            <CForm noValidate validated={validated} onSubmit={handleSubmit}>
              <div className="row">
                <div className="col-sm-4">
                  <div className="mb-3 d-flex align-items-center">
                    <CFormLabel htmlFor="expense_id">{t("LABELS.expense_type")}</CFormLabel>
                    <CButton
                      color="danger"
                      className="ms-3"
                      onClick={() => window.location.href = "/#/expense/new-type"} // Navigate to /expense/new-type
                    >
                      {t("LABELS.new_expense_type")}
                    </CButton>
                  </div>
                  <CFormSelect
                    aria-label={t("MSG.select_expense_type_msg")}
                    value={state.expense_id}
                    id="expense_id"
                    name="expense_id"
                    options={expenseTypes}
                    onChange={handleChange}
                    required
                    feedbackInvalid="Select Expense type."
                  />
                </div>
                <div className="col-sm-4">
                  <div className="mb-3">
                    <CFormLabel htmlFor="name">{t("LABELS.about_expense")}</CFormLabel>
                    <CFormInput
                      type="text"
                      id="name"
                      placeholder=""
                      name="name"
                      value={state.name}
                      onChange={handleChange}
                      required
                      feedbackInvalid="Please provide some note. Only alphabets and spaces are allowed."
                    />
                  </div>
                </div>
                <div className="col-sm-4">
                  <div className="mb-3">
                    <CFormLabel htmlFor="expense_date">{t("LABELS.expense_date")}</CFormLabel>
                    <CFormInput
                      type="date"
                      id="expense_date"
                      name="expense_date"
                      max={today}
                      value={state.expense_date}
                      onChange={handleChange}
                      required
                      feedbackInvalid="Please select date."
                    />
                  </div>
                </div>
              </div>
              <div className="row">
                <div className="col-sm-4">
                  <div className="mb-3">
                    <CFormLabel htmlFor="price">{t("LABELS.price_per_unit")}</CFormLabel>
                    <CFormInput
                      type="number"
                      min="0"
                      id="price"
                      placeholder=""
                      name="price"
                      value={state.price}
                      onChange={handleChange}
                      required
                      feedbackInvalid="Please provide price per unit. Negative numbers not allowed."
                    />
                  </div>
                </div>
                <div className="col-sm-4">
                  <div className="mb-3">
                    <CFormLabel htmlFor="qty">{t("LABELS.total_units")}</CFormLabel>
                    <CFormInput
                      type="number"
                      id="qty"
                      placeholder=""
                      name="qty"
                      min="0"
                      value={state.qty}
                      onChange={handleChange}
                      required
                      feedbackInvalid="Please provide total units. Negative numbers not allowed."
                    />
                  </div>
                </div>
                <div className="col-sm-4">
                  <div className="mb-3">
                    <CFormLabel htmlFor="total_price">{t("LABELS.total_price")}</CFormLabel>
                    <CFormInput
                      type="number"
                      min="0"
                      id="total_price"
                      placeholder=""
                      name="total_price"
                      value={state.total_price}
                      onChange={handleChange}
                      readOnly
                    />
                  </div>
                </div>
              </div>
              <div className="mb-3 mt-3">
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
  );
}  

export default NewExpense;
