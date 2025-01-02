import React, { useEffect, useState } from 'react';
import { CBadge, CRow } from '@coreui/react';
import { MantineReactTable } from 'mantine-react-table';
import { deleteAPICall, getAPICall } from '../../../util/api';
import ConfirmationModal from '../../common/ConfirmationModal';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../common/toast/ToastContext';

const AllCustomers = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [deleteCustomer, setDeleteCustomer] = useState();
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const { showToast } = useToast();

  const fetchProducts = async () => {
    try {
      const response = await getAPICall('/api/customer');
      setCustomers(response);
    } catch (error) {
      showToast('danger', 'Error occured ' + error);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = (p) => {
    setDeleteCustomer(p);
    setDeleteModalVisible(true);
  };

  const onDelete = async () => {
    try {
      await deleteAPICall('/api/customer/' + deleteCustomer.id);
      setDeleteModalVisible(false);
      fetchProducts();
    } catch (error) {
      showToast('danger', 'Error occured ' + error);
    }
  };

  const handleEdit = (p) => {
    navigate('/customer/edit/' + p.id);
  };


  const columns = [
    { accessorKey: 'index', header: 'Id' },
    { accessorKey: 'name', header: 'Name' },
    { accessorKey: 'mobile', header: 'Mobile' },
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

  const data = customers.map((p, index) => ({
    ...p,
    index: index + 1,
  }));

  return (
    <CRow>
      <ConfirmationModal
        visible={deleteModalVisible}
        setVisible={setDeleteModalVisible}
        onYes={onDelete}
        resource={'Delete customer - ' + deleteCustomer?.name}
      />
      <MantineReactTable enableColumnResizing columns={columns} data={data} enableFullScreenToggle={false}/>
    </CRow>
  );
};

export default AllCustomers;
