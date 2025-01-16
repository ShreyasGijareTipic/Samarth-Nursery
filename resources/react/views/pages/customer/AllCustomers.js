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
      showToast('danger', 'Error occurred: ' + error.message);
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
      await deleteAPICall(`/api/customer/${deleteCustomer.id}`);
      setDeleteModalVisible(false);
      fetchProducts();
    } catch (error) {
      showToast('danger', 'Error occurred: ' + error.message);
    }
  };

  const handleEdit = (p) => {
    navigate(`/customer/edit/${p.id}`);
  };

  const columns = [
    { accessorKey: 'name', header: 'Name' },
    { accessorKey: 'mobile', header: 'Mobile' },
    {
      accessorKey: 'status',
      header: 'Status',
      Cell: ({ cell }) => (
        cell.row.original.show === 1 ? (
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
        <div className="d-flex flex-wrap">
          <CBadge
            role="button"
            color="info"
            className="me-2 mb-2"
            onClick={() => handleEdit(cell.row.original)}
          >
            Edit
          </CBadge>
          <CBadge
            role="button"
            color="danger"
            className="mb-2"
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
    index: index + 1, // Replacing Id with #
  }));

  return (
    <CRow>
      <ConfirmationModal
        visible={deleteModalVisible}
        setVisible={setDeleteModalVisible}
        onYes={onDelete}
        resource={`Delete customer - ${deleteCustomer?.name}`}
      />
      <MantineReactTable
        columns={columns}
        data={data}
        enableFullScreenToggle={false}
        enableColumnResizing
        defaultColumn={{
          size: 80, // Default column width for compact cells
          Cell: ({ cell }) => (
            <div style={{ fontSize: '10px', padding: '2px' }}>
              {cell.getValue()}
            </div>
          ),
        }}
        muiTableBodyCellProps={{
          style: { padding: '2px', fontSize: '10px' },
        }}
        muiTableHeadCellProps={{
          style: { padding: '4px', fontSize: '11px' },
        }}
      />
    </CRow>
  );
};

export default AllCustomers;
