import React, { useEffect, useState } from 'react';
import { CBadge, CCol, CRow } from '@coreui/react';
import { MantineReactTable } from 'mantine-react-table';
import { deleteAPICall, getAPICall } from '../../../util/api';
import ConfirmationModal from '../../common/ConfirmationModal';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../common/toast/ToastContext';

const AllProducts = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [deleteProduct, setDeleteProduct] = useState();
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const { showToast } = useToast();

  const fetchProducts = async () => {
    try {
      const response = await getAPICall('/api/product');
      setProducts(response);
    } catch (error) {
      showToast('danger', 'Error occurred: ' + error.message);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = (p) => {
    setDeleteProduct(p);
    setDeleteModalVisible(true);
  };

  const onDelete = async () => {
    try {
      await deleteAPICall(`/api/product/${deleteProduct.id}`);
      setDeleteModalVisible(false);
      fetchProducts();
    } catch (error) {
      showToast('danger', 'Error occurred: ' + error.message);
    }
  };

  const handleEdit = (p) => {
    navigate(`/products/edit/${p.id}`);
  };

  const columns = [
    
    { accessorKey: 'name', header: 'Name' },
    {
      accessorKey: 'basePrice',
      header: 'Base Price',
      Cell: ({ cell }) => cell.row.original.sizes?.[0]?.bPrice || '',
    },
    {
      accessorKey: 'sellingPrice',
      header: 'Selling Price',
      Cell: ({ cell }) => cell.row.original.sizes?.[0]?.oPrice || '',
    },
    {
      accessorKey: 'quantity',
      header: 'Quantity',
      Cell: ({ cell }) => cell.row.original.sizes?.[0]?.qty || '',
    },
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

  const data = products.map((p, index) => ({
    ...p,
    index: index + 1, // Replacing Id with #
  }));

  return (
    <CRow>
      <ConfirmationModal
        visible={deleteModalVisible}
        setVisible={setDeleteModalVisible}
        onYes={onDelete}
        resource={`Delete product - ${deleteProduct?.name}`}
      />
      <CCol xs={12}>
        <MantineReactTable
          columns={columns}
          data={data}
          enableFullScreenToggle={false}
          enableColumnResizing
          enableStickyHeader
          enableRowNumbers={false}
          defaultColumn={{
            size: 110, // Reduce default column width for smaller cells
            Cell: ({ cell }) => (
              <div style={{ fontSize: '12px', padding: '5px' }}>
                {cell.getValue()}
              </div>
            ),
          }}
          muiTableBodyCellProps={{
            style: { padding: '5px', fontSize: '12px' }, // Smaller padding and font size for rows
          }}
        />
      </CCol>
    </CRow>
  );
};

export default AllProducts;
