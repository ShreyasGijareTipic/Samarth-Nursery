import React from 'react'
import { getUserType } from './util/session'

const Dashboard = React.lazy(() => import('./views/dashboard/Dashboard'))

//NewRegister
const NewUsers = React.lazy(() => import('./views/pages/register/NewUsers'))
const AllUser = React.lazy(() => import('./views/pages/register/AllUser'))

//Invoice
const Delivery = React.lazy(() => import('./views/pages/invoice/Delivery'))
const Invoice = React.lazy(() => import('./views/pages/invoice/Invoice'))
const Booking = React.lazy(() => import('./views/pages/invoice/Booking'))
const Orders = React.lazy(() => import('./views/pages/invoice/Orders'))
const InvoiceDetails = React.lazy(() => import('./views/pages/invoice/InvoiceDetails'))
const NewCompany = React.lazy(() => import('./views/pages/company/NewCompany'))
const AllCompanies = React.lazy(() => import('./views/pages/company/AllCompanies'))


//Products
const NewProduct = React.lazy(() => import('./views/pages/products/NewProduct'))
const AllProducts = React.lazy(() => import('./views/pages/products/AllProducts'))
const EditProduct = React.lazy(() => import('./views/pages/products/EditProduct'))
//const EditCategory = React.lazy(() => import('./views/pages/category/EditCategory'))
//const AllCategory = React.lazy(() => import('./views/pages/category/AllCategory'))
//const NewCategory = React.lazy(() => import('./views/pages/category/NewCategory'))
//const BulkQuantity = React.lazy(() => import('./views/pages/products/BulkQuantity'))

//Customers
const NewCustomer = React.lazy(() => import('./views/pages/customer/NewCustomer'))
const AllCustomers = React.lazy(() => import('./views/pages/customer/AllCustomers'))
const EditCustomer = React.lazy(() => import('./views/pages/customer/EditCustomer'))

//HelpModule
const TicketFormLogin = React.lazy(() => import('./views/pages/help/TicketFormLogin'));
const ExistingTicketTable = React.lazy(() => import('./views/pages/help/ExistingTicketTable'));
const LoginFaq = React.lazy(() => import('./views/pages/help/loginFaq'));
const ExistingTicketView = React.lazy(() => import('./views/pages/help/ExistingTicketView'));

//Expense
const AllExpenseType = React.lazy(() => import('./views/pages/expense/AllExpenseType'))
const EditExpenseType = React.lazy(() => import('./views/pages/expense/EditExpenseType'))
const NewExpenseType = React.lazy(() => import('./views/pages/expense/NewExpenseType'))
const NewExpense = React.lazy(() => import('./views/pages/expense/NewExpense'))

//Reports
const ExpenseReport = React.lazy(() => import('./views/pages/report/ExpenseReport'))
const CreditReport = React.lazy(() => import('./views/pages/report/CreditReport'))
const CustomerReport = React.lazy(() => import('./views/pages/report/CustomerReport'))
const SalesReport = React.lazy(() => import('./views/pages/report/SalesReport'))
const PnLReport = React.lazy(() => import('./views/pages/report/PnLReport'))
const All_Reports=React.lazy(() => import('./views/pages/report/AllReports'))

//Password Newpassword
const Updatepassword = React.lazy(() => import('./views/pages/Password/Newpassword'))

// map
const JarMap = React.lazy(() => import('./views/pages/map/Map'))

// const Charts = React.lazy(() => import('./views/charts/Charts'))

// const Widgets = React.lazy(() => import('./views/widgets/Widgets'))

export default function fetchRoutes(){
  const user=getUserType();
  let routes=[];

  
  if(user===0){
    routes = [
      { path: '/', exact: true, name: 'Home' },
      { path: '/dashboard', name: 'Dashboard', element: Dashboard },
      { path: '/delivery', name: 'Delivery', element: Delivery },
      { path: '/invoice', name: 'Invoice', element: Invoice },
      { path: '/booking', name: 'Booking', element: Booking },
      { path: '/newCustomer', name: 'New Customer', element: Delivery },
      { path: '/company/new', name: 'New Company', element: NewCompany },
      { path: '/company/all', name: 'All Companies', element: AllCompanies },
      { path: '/invoice-details/:id', name: 'InvoiceDetails', element: InvoiceDetails },
      { path: '/bookings', name: 'Advance Bookings', element: Orders },
      { path: '/regular', name: 'Regular Orders', element: Orders },
      { path: '/order', name: 'All Orders', element: Orders },
      { path: '/products/new', name: 'New Product', element: NewProduct },
      { path: '/products/all', name: 'All Products', element: AllProducts },
      { path: '/products/edit/:id', name: 'Edit Products', element: EditProduct },
      { path: '/customer/new', name: 'New Product', element: NewCustomer },
      { path: '/customer/all', name: 'All Products', element: AllCustomers },
      { path: '/customer/edit/:id', name: 'Edit Products', element: EditCustomer },
      // { path: '/category/new', name: 'New Category', element: NewCategory },
      // { path: '/category/all', name: 'All Category', element: AllCategory },
      // { path: '/category/edit/:id', name: 'Edit Category', element: EditCategory },
      { path: '/expense/new-type', name: 'New Type', element: NewExpenseType },
      { path: '/expense/edit-type/:id', name: 'Edit Type', element: EditExpenseType },
      { path: '/expense/all-type', name: 'All Types', element: AllExpenseType },
      { path: '/expense/new', name: 'New Expense', element: NewExpense },
      { path: '/Reports/Customer_Report', name: 'Customer Report', element: CustomerReport },
      { path: '/Reports/Expense_Report', name: 'Expense Report', element: ExpenseReport },
      { path: '/Reports/creditReport', name: 'Credit Report', element: CreditReport },
      { path: 'Reports/Sales_Report', name: 'Sales Report', element: SalesReport },
      { path: 'Reports/pnl_Report', name: 'Profit and Loss Report', element: PnLReport },
      { path: '/Reports/Reports', name: 'Reports', element: All_Reports },
      // { path: 'products/updateqty', name: 'Update Bulk Quantity', element: BulkQuantity },
      { path:'/updatepassword', name: 'Update Password', element: Updatepassword },
      { path:'/usermanagement/create-user', name: 'Create User', element: NewUsers },
      { path:'usermanagement/all-users', name: 'All Users', element: AllUser },

      //HelpModule
      //Ticket
      { path: '/TicketFormLogin', name: 'TicketFormLogin', element: TicketFormLogin },
      { path: '/loginFaq', name: 'loginFaq', element: LoginFaq },
      { path: '/ExistingTicketView/:id', name: 'ExistingTicketView', element:ExistingTicketView },
      { path: '/ExistingTicketTable', name: 'ExistingTicketTable', element:ExistingTicketTable },
      // { path: '/map', name: 'Map', element: JarMap },
    ]
  }
  else if(user===1){
    routes = [
    { path: '/', exact: true, name: 'Home' },
    { path: '/dashboard', name: 'Dashboard', element: Dashboard },
    { path: '/delivery', name: 'Delivery', element: Delivery },
    { path: '/invoice', name: 'invoice', element: Invoice },
    { path: '/booking', name: 'Booking', element: Booking },
    { path: '/invoice-details/:id', name: 'InvoiceDetails', element: InvoiceDetails },
    { path: '/bookings', name: 'Advance Bookings', element: Orders },
    { path: '/regular', name: 'Regular Orders', element: Orders },
    { path: '/order', name: 'All Orders', element: Orders },
    { path: '/customer/new', name: 'New Product', element: NewCustomer },
    { path: '/customer/all', name: 'All Products', element: AllCustomers },
    { path: '/customer/edit/:id', name: 'Edit Customer', element: EditCustomer },
    { path: '/products/new', name: 'New Product', element: NewProduct },
    { path: '/products/all', name: 'All Products', element: AllProducts },
    { path: '/products/edit/:id', name: 'Edit Products', element: EditProduct },
    { path: '/expense/new-type', name: 'New Type', element: NewExpenseType },
    { path: '/expense/edit-type/:id', name: 'Edit Type', element: EditExpenseType },
    { path: '/expense/all-type', name: 'All Types', element: AllExpenseType },
    { path: '/expense/new', name: 'New Expense', element: NewExpense },
    { path:'/updatepassword', name: 'Update Password', element: Updatepassword },
    // { path: '/map', name: 'Map', element: JarMap },
    { path: '/Reports/Customer_Report', name: 'Customer Report', element: CustomerReport },
    { path: '/Reports/creditReport', name: 'Credit Report', element: CreditReport },
    { path: '/Reports/Expense_Report', name: 'Expense Report', element: ExpenseReport },
    { path: 'Reports/Sales_Report', name: 'Sales Report', element: SalesReport },
    { path: 'Reports/pnl_Report', name: 'Profit and Loss Report', element: PnLReport },
    { path: '/Reports/Reports', name: 'Reports', element: All_Reports },
    { path:'/usermanagement/create-user', name: 'Create User', element: NewUsers },
    { path:'usermanagement/all-users', name: 'All Users', element: AllUser },

      //Ticket
      { path: '/TicketFormLogin', name: 'TicketFormLogin', element: TicketFormLogin },
      { path: '/loginFaq', name: 'loginFaq', element: LoginFaq },
      { path: '/ExistingTicketView/:id', name: 'ExistingTicketView', element:ExistingTicketView },
      { path: '/ExistingTicketTable', name: 'ExistingTicketTable', element:ExistingTicketTable },
  ]
  }
  else if(user===2){
    routes = [
    { path: '/', exact: true, name: 'Home' },
    { path: '/dashboard', name: 'Dashboard', element: Dashboard },
    { path: '/delivery', name: 'Delivery', element: Delivery },
    { path: '/invoice', name: 'invoice', element: Invoice },
    { path: '/booking', name: 'Booking', element: Booking },
    { path: '/invoice-details/:id', name: 'InvoiceDetails', element: InvoiceDetails },
    { path: '/bookings', name: 'Advance Bookings', element: Orders },
    { path: '/regular', name: 'Regular Orders', element: Orders },
    { path: '/order', name: 'All Orders', element: Orders },
    { path: '/customer/new', name: 'New Product', element: NewCustomer },
    { path: '/customer/all', name: 'All Products', element: AllCustomers },
    { path: '/customer/edit/:id', name: 'Edit Customer', element: EditCustomer },
    { path:'/updatepassword', name: 'Update Password', element: Updatepassword },
    
    
    //products
    { path: '/products/new', name: 'New Product', element: NewProduct },
    { path: '/products/all', name: 'All Products', element: AllProducts },
    { path: '/products/edit/:id', name: 'Edit Products', element: EditProduct },

     //Ticket
     { path: '/TicketFormLogin', name: 'TicketFormLogin', element: TicketFormLogin },
     { path: '/loginFaq', name: 'loginFaq', element: LoginFaq },
     { path: '/ExistingTicketView/:id', name: 'ExistingTicketView', element:ExistingTicketView },
     { path: '/ExistingTicketTable', name: 'ExistingTicketTable', element:ExistingTicketTable },
    
  ]
  }
  return routes;
}

