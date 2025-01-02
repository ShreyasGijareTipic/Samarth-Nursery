import React, { useEffect, useState } from 'react';
import {
  CBadge,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
} from '@coreui/react';
import { MantineReactTable } from 'mantine-react-table';
import { deleteAPICall, getAPICall } from '../../../util/api';
import ConfirmationModal from '../../common/ConfirmationModal';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../common/toast/ToastContext';
import { useTranslation } from 'react-i18next'

const AllExpenseType = () => {
  const navigate = useNavigate();
  const [expenseType, setExpenseType] = useState([]);
  const [deleteResource, setDeleteResource] = useState();
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const { showToast } = useToast();
  const { t } = useTranslation("global")

  const fetchExpenseType = async () => {
    try {
      const response = await getAPICall('/api/expenseType');
      setExpenseType(response);
    } catch (error) {
      showToast('danger', 'Error occured ' + error);
    }
  };

  useEffect(() => {
    fetchExpenseType();
  }, []);

  const handleDelete = (p) => {
    setDeleteResource(p);
    setDeleteModalVisible(true);
  };

  const onDelete = async () => {
    try {
      await deleteAPICall('/api/expenseType/' + deleteResource.id);
      setDeleteModalVisible(false);
      fetchExpenseType();
    } catch (error) {
      showToast('danger', 'Error occured ' + error);
    }
  };

  const handleEdit = (p) => {
    navigate('/expense/edit-type/' + p.id);
  };

  const columns = [
    { accessorKey: 'id', header: t("LABELS.id") },
    { accessorKey: 'name', header: t("LABELS.name") },
    { accessorKey: 'localName', header: t("LABELS.local_name") },
    { accessorKey: 'desc', header: t("LABELS.short_desc") },
    {
      accessorKey: 'show',
      header: t("LABELS.status"),
      Cell: ({ cell }) => (
        <CBadge color={cell.row.original.show === 1 ? 'success' : 'danger'}>
          {cell.row.original.show === 1 ? 'Visible' : 'Hidden'}
        </CBadge>
      ),
    },
    {
      accessorKey: 'actions',
      header: t("LABELS.actions"),
      Cell: ({ cell }) => (
        <div>
          <CBadge
            color="info"
            onClick={() => handleEdit(cell.row.original)}
            role="button"
          >
            {t("LABELS.edit")}
          </CBadge>{' '}
          &nbsp;
          <CBadge
            color="danger"
            onClick={() => handleDelete(cell.row.original)}
            role="button"
          >
            {t("LABELS.delete")}
          </CBadge>
        </div>
      ),
    },
  ];

  const data = expenseType.map((type, index) => ({
    ...type,
    id: index + 1,
  }));

  return (
    <CRow>
      <ConfirmationModal
        visible={deleteModalVisible}
        setVisible={setDeleteModalVisible}
        onYes={onDelete}
        resource={'Delete expense type - ' + deleteResource?.name}
      />
      <CCol xs={12}>
            <MantineReactTable columns={columns} data={data}  enableFullScreenToggle={false}/>
      </CCol>
    </CRow>
  );
};

export default AllExpenseType;
