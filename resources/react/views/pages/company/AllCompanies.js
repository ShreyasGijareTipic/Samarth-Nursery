import React, { useEffect, useState } from 'react';
import { CBadge, CRow } from '@coreui/react';
import { MantineReactTable } from 'mantine-react-table';
import { getAPICall, put } from '../../../util/api';
import ConfirmationModal from '../../common/ConfirmationModal';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../common/toast/ToastContext';

const AllCompanies = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [blockCompany, setBlockCompany] = useState();
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const { showToast } = useToast();

  const fetchProducts = async () => {
    try {
      const response = await getAPICall('/api/company');
      setCustomers(response);
    } catch (error) {
      showToast('danger', 'Error occured ' + error);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleBlock = (p) => {
    setBlockCompany(p);
    setDeleteModalVisible(true);
  };

  const onDelete = async () => {
    try {
      await put('/api/company/'+blockCompany.company_id, {...blockCompany, block_status: blockCompany.block_status == 0});
      setDeleteModalVisible(false);
      fetchProducts();
      showToast('success', 'Updated successfully');
    } catch (error) {
      showToast('danger', 'Error occured ' + error);
    }
  };

  const handleEdit = (p) => {
    navigate('/company/edit/' + p.id);
  };


  const columns = [
    { accessorKey: 'index', header: 'Id' },
    { accessorKey: 'company_name', header: 'Name' },
    { accessorKey: 'phone_no', header: 'Mobile' },
    { accessorKey: 'Tal', header: 'Address',
      Cell: ({ cell }) => (
        <>{cell.row.original.land_mark},{cell.row.original.Tal},{cell.row.original.Dist}</>
      ),
     },
    {
      accessorKey: 'block_status',
      header: 'Status',
      Cell: ({ cell }) => (
        cell.row.original.block_status == 0 ? (
          <CBadge color="success">Active</CBadge>
        ) : (
          <CBadge color="danger">Blocked</CBadge>
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
            onClick={() => handleBlock(cell.row.original)}
          >
            {cell.row.original.block_status == 0 ? 'Block' : 'Unblock'}
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
        resource={'Block company "' + blockCompany?.company_name +'"'}
      />
      <MantineReactTable enableColumnResizing columns={columns} data={data} enableFullScreenToggle={false}/>
    </CRow>
  );
};

export default AllCompanies;
