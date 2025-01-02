import React, { useEffect, useState } from 'react';
import {
  CBadge,
  CCol,
  CRow,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
} from '@coreui/react';
import { MantineReactTable } from 'mantine-react-table';
import { getAPICall, put } from '../../../util/api';
import ConfirmationModal from '../../common/ConfirmationModal';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../common/toast/ToastContext';
import CIcon from '@coreui/icons-react';
import { cilPhone } from '@coreui/icons';
import { useTranslation } from 'react-i18next';

import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";
import { themeQuartz } from 'ag-grid-community';
import "ag-grid-community/styles/ag-grid.css"; // Core CSS
import "ag-grid-community/styles/ag-theme-alpine.css"; // Base theme CSS
import CustomCellRenderer from '../../common/CustomCellRenderer';

ModuleRegistry.registerModules([AllCommunityModule]);

const myTheme = themeQuartz
	.withParams({
        accentColor: "#087AD1",
        backgroundColor: "#FFFFFF",
        borderColor: "#D7E2E6",
        borderRadius: 2,
        browserColorScheme: "light",
        cellHorizontalPaddingScale: 0.7,
        chromeBackgroundColor: {
            ref: "backgroundColor"
        },
        columnBorder: false,
        fontFamily: {
            googleFont: "Inter"
        },
        fontSize: 12,
        foregroundColor: "#555B62",
        headerBackgroundColor: "#FFFFFF",
        headerFontSize: 13,
        headerFontWeight: 400,
        headerTextColor: "#84868B",
        rowBorder: true,
        rowVerticalPaddingScale: 0.8,
        sidePanelBorder: true,
        spacing: 2,
        wrapperBorder: false,
        wrapperBorderRadius: 2
    });
const useSlimMode = false;
const Orders = () => {
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [deleteOrder, setDeleteOrder] = useState();
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const route = window.location.href.split('/').pop();
  const { t, i18n } = useTranslation("global")
  const lng = i18n.language;

  const [isLoading, setIsLoading] = useState(false);
  const [isRefetching, setIsRefetching] = useState(false);
  const [rowCount, setRowCount] = useState(0);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 25,
  });

  const fetchOrders = async () => {
    try {
      if (!orders.length) {
        setIsLoading(true);
      } else {
        setIsRefetching(true);
      }

      const type = route === 'order' ? -1 : route === 'bookings' ? 2 : 1;
      const orderStatus = type == 2 ? 2 : undefined;
      const response = await getAPICall(`/api/order?invoiceType=${type}&orderStatus=${orderStatus}&page=${pagination.pageIndex+1}`);
      setOrders(response?.data ?? []);
      //setCurrentPage(response.current_page);
      setRowCount(response.total);
      //setTotalPage(response.total);
    } catch (error) {
      showToast('danger', 'Error occured ' + error);
    }
    setIsLoading(false);
    setIsRefetching(false);
  };

  useEffect(() => {
    fetchOrders();
  }, [route, pagination.pageIndex]);

  const handleDelete = (order) => {
    setDeleteOrder(order);
    setDeleteModalVisible(true);
  };

  const onDelete = async () => {
    try {
      await put(`/api/order/${deleteOrder.id}`, { ...deleteOrder, orderStatus: 0 });
      setDeleteModalVisible(false);
      showToast('success', 'Order is canceled');
      fetchOrders();
    } catch (error) {
      showToast('danger', 'Error occured ' + error);
    }
  };

  const handleShow = (order) => {
    navigate(`/invoice-details/${order.id}`);
  };

  const formatDate = (dateString) => {
      const options = { day: 'numeric', month: 'short', year: 'numeric' };
      const date = new Date(dateString);
      const formattedDate = date.toLocaleDateString('en-US', options).replace(',', '');
      
      // Split the formatted date to rearrange it
      const [month, day] = formattedDate.split(' ');
      return `${day} ${month}`;
  };

  function convertTo12HourFormat(time) {
      // Split the time into hours and minutes
      let [hours, minutes] = time.split(':').map(Number);
      
      // Determine AM or PM suffix
      const suffix = hours >= 12 ? 'PM' : 'AM';
      
      // Convert hours from 24-hour format to 12-hour format
      hours = hours % 12 || 12; // Convert 0 to 12 for midnight

      // Return the formatted time
      return `${hours}:${minutes.toString().padStart(2, '0')} ${suffix}`;
  };

  const columns = [
    // { accessorKey: 'index', header: 'Sr.No.' },
    { accessorKey: 'customer.name', header: 'Name.' },
    { accessorKey: 'customer.mobile', header: 'Call',
      Cell: ({ cell }) => (
        <a href={"tel:"+cell.row.original.customer?.mobile}>
          Call <CIcon icon={cilPhone} />
        </a>
      ),
    },
    { accessorKey: 'invoiceDate', header: 'Delivery Date',
      Cell: ({ cell }) => formatDate(cell.row.original.invoiceDate) + "\n ("+convertTo12HourFormat(cell.row.original.deliveryTime)+")",
    },
    {
      accessorKey: 'items',
      header: 'Items',
      Cell: ({ cell }) => (
        cell.row.original.items.length >0 ? <table className="table table-sm borderless">
          <tbody>
          {
            cell.row.original.items.map(i=>(<tr key={i.id}>
              <td>{i.product_name}</td>
              <td>{i.dQty +' X '+i.dPrice + '₹' }</td>
              {/* <td>{'₹ ' + i.total_price}</td> */}
            </tr>))
          }
          </tbody>
        </table> : 'Only cash collected'
      ),
    },
    { accessorKey: 'balance', header: 'Balance' },
    { accessorKey: 'paidAmount', header: 'Paid' },
    { accessorKey: 'finalAmount', header: 'Total' },
    {
      accessorKey: 'orderStatus',
      header: 'Status',
      Cell: ({ cell }) => (
        <CBadge color={cell.row.original.orderStatus === 0 ? 'danger' : cell.row.original.orderStatus === 1 ? 'success' : 'warning'}>
          {cell.row.original.orderStatus === 0 ? 'Canceled' : cell.row.original.orderStatus === 1 ? 'Delivered' : 'Pending'}
        </CBadge>
      ),
    },
    {
      accessorKey: 'actions',
      header: 'Actions',
      Cell: ({ cell }) => (
        <div>
          <CBadge
            role="button"
            color="success"
            onClick={() => handleShow(cell.row.original)}
          >
            Show
          </CBadge>{' '}
          {cell.row.original.orderStatus !== 0 && (
            <CBadge
              role="button"
              color="danger"
              onClick={() => handleDelete(cell.row.original)}
            >
              Cancel
            </CBadge>
          )}
        </div>
      ),
    },
  ];

  const data = orders.map((order, index) => ({
    ...order,
    index: index + 1,
    balance: order.finalAmount - order.paidAmount,
  }));

  const colDefs = [
      { field: "customer.name", headerName: "Name", width: 150, filter: true },
      { field: "customer.mobile", headerName: "Mobile", width: 120 },
      { field: "invoiceDate", headerName: "Delivery Date", width: 150, 
        valueGetter: (params) => formatDate(params.data.invoiceDate) + "\n (" + convertTo12HourFormat(params.data.deliveryTime) + ")" 
      },
      { field: "items", headerName: "Items", width: 200, 
        cellRenderer: CustomCellRenderer, // Use the custom cell renderer
        valueGetter: (params) => {
          if (params.data.items.length > 0) {
            return `
              <table class="table table-sm borderless">
                <tbody>
                  ${params.data.items.map(i => `<tr><td>${i.product_name}</td><td>${i.dQty} X ${i.dPrice}₹</td></tr>`).join('')}
                </tbody>
              </table>`;
          } else {
            return 'Only cash collected';
          }
        }
      },
      { field: "balance", headerName: "Balance", width: 80 },
      { field: "paidAmount", headerName: "Paid", width: 80 },
      { field: "finalAmount", headerName: "Total", width: 100 },
      { field: "orderStatus", headerName: "Status", width: 100, 
        cellRenderer: CustomCellRenderer, // Use the custom cell renderer
        valueGetter: (params) => {
          const status = params.data.orderStatus;
          const badgeColor = status === 0 ? 'red' : status === 1 ? 'green' : 'orange';
          const statusText = status === 0 ? 'Canceled' : status === 1 ? 'Delivered' : 'Pending';
          return `<span style="color:${badgeColor}">${statusText}</span>`;
        }
      },
      // { field: "actions", headerName: "Actions", width: 150, 
      //   cellRenderer: CustomCellRenderer, // Use the custom cell renderer
      //   valueGetter: (params) => {
      //     return `
      //       <div>
      //         <CBadge role="button" color="success" onClick="handleShow(${params.data.id})">Show</CBadge>
      //         ${params.data.orderStatus !== 0 ? 
      //           `<CBadge role="button" color="danger" onClick="handleDelete(${params.data.id})">Cancel</CBadge>` : ''}
      //       </div>
      //     `;
      //   }
      // },
    ];

  const getView = ()=>{
    
    if(route === 'bookings'){
      return (
        <>
          <h2 className='text-center'>{t("LABELS.advance_booking")}</h2>
          <CTable>
            <CTableHead>
              <CTableRow>
                <CTableHeaderCell scope="col" className="d-none d-sm-table-cell">{t("LABELS.id")}</CTableHeaderCell>
                <CTableHeaderCell scope="col">{t("LABELS.name")}</CTableHeaderCell>
                {/* <CTableHeaderCell scope="col">Call</CTableHeaderCell> */}
                <CTableHeaderCell scope="col">{t("LABELS.date")}</CTableHeaderCell>
                <CTableHeaderCell scope="col">{t("LABELS.products")}</CTableHeaderCell>
                <CTableHeaderCell scope="col">{t("LABELS.actions")}</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              {data.map((o, index)=>(
              <CTableRow key={o.id}>
                <CTableDataCell className="d-none d-sm-table-cell" scope="row">{index + 1}</CTableDataCell>
                <CTableDataCell><a href={"tel:"+o.customer?.mobile}><CIcon icon={cilPhone}/></a>{o.customer.name}</CTableDataCell>
                {/* <CTableDataCell>
                  <a href={"tel:"+o.customer?.mobile}><CIcon icon={cilPhone}/></a> </CTableDataCell> */}
                <CTableDataCell>{formatDate(o.invoiceDate) + "\n ("+convertTo12HourFormat(o.deliveryTime)+")"}</CTableDataCell>
                <CTableDataCell>
                    <table style={{margin:0}} className="table table-sm borderless">
                      <tbody>
                        {/* <tr>
                          <td><strong>Product</strong></td>
                          <td><b>Details</b></td>
                        </tr> */}
                      {
                        o.items.map(i=>(<tr key={i.id}>
                          <td>{lng === 'en' ? i.product_name : i.product_local_name}</td>
                          <td>{i.dQty }</td>
                          {/* <td>{'₹ ' + i.total_price}</td> */}
                        </tr>))
                      }
                      </tbody> 
                    </table>
                </CTableDataCell>
                <CTableDataCell>
                  {o.orderStatus !== 0 && (
                      <CBadge
                        role="button"
                        color="danger"
                        onClick={() => handleDelete(o)}
                      >
                        {t("LABELS.cancel")}
                      </CBadge>
                    )}
                </CTableDataCell>
              </CTableRow>))}
          </CTableBody>
          </CTable>
        </>
      )
    }

    if(useSlimMode){
      return (
        <div 
        className="ag-theme-alpine"
        theme={myTheme} 
        style={{ width: "100%", height: "calc(100vh - 165px)" }}>
          <h2 className='text-center'>{t("LABELS.all_orders")}</h2>
          <AgGridReact
            defaultColDef={{ resizable: true }} // Allow column resizing
            //domLayout='autoHeight' // Adjust height based on content
            rowData={data}
            columnDefs={colDefs}
          />
        </div>
      );
    }
    return (<CCol xs={12}>
      <h2 className='text-center'>{t("LABELS.all_orders")}</h2>
      <MantineReactTable 
        defaultColumn={{
          maxSize: 400,
          minSize: 80,
          size: 100, //default size is usually 180
        }}
        enableStickyHeader={true}
        enableStickyFooter={true}
        enableDensityToggle={false}
        manualPagination  
        onPaginationChange={setPagination}
        rowCount={rowCount}
        paginationDisplayMode={'pages'}
        initialState={{density: 'xs'}}
        columns={columns} 
        data={data}
        state={{
          isLoading,
          pagination,
          showProgressBars: isRefetching,
        }}
        enableFullScreenToggle={false}/>
    </CCol>);
  }

  return (
    <CRow>
      <ConfirmationModal
        visible={deleteModalVisible}
        setVisible={setDeleteModalVisible}
        onYes={onDelete}
        resource={`${t('LABELS.cancel_order')} -` + deleteOrder?.id}
      />
      {getView()}
    </CRow>
  );
};

export default Orders;
