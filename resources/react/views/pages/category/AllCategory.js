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

const AllCategory = () => {
  const navigate = useNavigate();
  const [category, setCategory] = useState([]);
  const [deleteCategory, setDeleteCategory] = useState();
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const { showToast } = useToast();

  const fetchCategory = async () => {
    try {
      const response = await getAPICall('/api/category');
      setCategory(response);
    } catch (error) {
      showToast('danger', 'Error occured ' + error);
    }
  };

  useEffect(() => {
    fetchCategory();
  }, []);

  const handleDelete = (c) => {
    setDeleteCategory(c);
    setDeleteModalVisible(true);
  };

  const onDelete = async () => {
    try {
      await deleteAPICall('/api/category/' + deleteCategory.id);
      setDeleteModalVisible(false);
      fetchCategory();
    } catch (error) {
      showToast('danger', 'Error occured ' + error);
    }
  };

  const handleEdit = (c) => {
    navigate('/category/edit/' + c.id);
  };

  const columns = [
    { accessorKey: 'index', header: 'Sr.No.' },
    { accessorKey: 'name', header: 'Name' },
    { accessorKey: 'localName', header: 'Local Name' },
    {
      accessorKey: 'status',
      header: 'Status',
      Cell: ({ cell }) => (
        cell.row.original.show == 1 ? (
          <CBadge color="success">Visible</CBadge>
        ) : (
          <CBadge color="danger">Hidden</CBadge>
        )
      ),
    },
    {
      accessorKey: 'actions',
      header: 'Actions',
      Cell: ({ cell }) => (
        <div>
          <CBadge
            role="button"
            color="info"
            onClick={() => handleEdit(cell.row.original)}
          >
            Edit
          </CBadge>
          &nbsp;
          <CBadge
            role="button"
            color="danger"
            onClick={() => handleDelete(cell.row.original)}
          >
            Delete
          </CBadge>
        </div>
      ),
    },
  ];

  const data = category.map((c, index) => ({
    ...c,
    index: (index + 1)
  }));

  return (
    <CRow>
      <ConfirmationModal
        visible={deleteModalVisible}
        setVisible={setDeleteModalVisible}
        onYes={onDelete}
        resource={'Delete category - ' + deleteCategory?.name}
      />
      <CCol xs={12}>
      <MantineReactTable columns={columns} data={data} enableFullScreenToggle={false} />
        
      </CCol>
    </CRow>
  );
};

export default AllCategory;
