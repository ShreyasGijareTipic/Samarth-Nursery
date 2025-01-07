import React from 'react'
import CIcon from '@coreui/icons-react'
// import { BsBack } from "react-icons/bs";
import {
  // cilBell,
  // cilCalculator,
  // cilChartPie,
  cilCursor,
  // cilDescription,
  cilNotes,
  cilChart,
  cilGroup,
  // cilStar,
  cibElasticStack,
  cilBookmark,
  cilUser,
  cilTruck,
  cilDollar,
  cilAddressBook,
  cilPrint,
  cilInbox,
  cilList,
} from '@coreui/icons'
import { CNavGroup, CNavItem } from '@coreui/react'
import { getUserData } from './util/session';

export default function fetchNavItems(t1){
  const userData = getUserData();
  const user = userData?.type;
  const t = t1;

  let _nav =[];
  const mode = userData?.company_info?.appMode ?? 'advance';

  

  if(user===0){
    _nav = [
        {
          component: CNavItem,
          name: t("LABELS.dashboard"),
          to: '/dashboard',
          icon: <CIcon icon={cibElasticStack} customClassName="nav-icon" />,
        },
        
        // {
        //   component: CNavItem,
        //   name: t("LABELS.delivery"),
        //   to: '/delivery',
        //   icon: <CIcon icon={cilTruck} customClassName="nav-icon" />,
        // },
        {
          component: CNavItem,
          name: t("LABELS.invoice"),
          to: '/invoice',
          icon: <CIcon icon={cilPrint} customClassName="nav-icon" />,
        },
        // {
        //   component: CNavItem,
        //   name: t("LABELS.booking"),
        //   to: '/booking',
        //   icon: <CIcon icon={cilBookmark} customClassName="nav-icon" />,
        // },
        {
          component: CNavItem,
          name: t("LABELS.all_customers"),
           to: '/customer/all',
           icon: <CIcon icon={cilUser} customClassName="nav-icon" />,
         },
        // {
        //   component: CNavGroup,
        //   name: t("LABELS.customers"),
        //   icon: <CIcon icon={cilUser} customClassName="nav-icon" />,
        //   items: [
        //     {
        //       component: CNavItem,
        //       name: t("LABELS.new_customer"),
        //       to: '/customer/new',
        //     },
        //     {
        //       component: CNavItem,
        //       name: t("LABELS.all_customers"),
        //       to: '/customer/all',
        //     }
        //   ],
        // },
        {
          component: CNavGroup,
          name: t("LABELS.products"),
          icon: <CIcon icon={cilNotes} customClassName="nav-icon" />,
          items: [
            {
              component: CNavItem,
              name: t("LABELS.new_product"),
              to: '/products/new',
            },
            {
              component: CNavItem,
              name: t("LABELS.all_products"),
              to: '/products/all',
            },
            // {
            //   component: CNavItem,
            //   name: 'Bulk Quantity ',
            //   to: 'products/updateqty',
            // },        
          ],
        },
        // {
        //   component: CNavGroup,
        //   name: 'Category',
        //   to: '/base',
        //   icon: <CIcon icon={cilPuzzle} customClassName="nav-icon" />,
        //   items: [
        //     {
        //       component: CNavItem,
        //       name: 'New Category',
        //       to: '/category/new',
        //     },
        //     {
        //       component: CNavItem,
        //       name: 'All Category',
        //       to: '/category/all',
        //     },
        //   ],
        // },
        {
          component: CNavGroup,
          name: t("LABELS.orders"),
          to: '/order',
          icon: <CIcon icon={cilCursor} customClassName="nav-icon" />,
          items: [
            {
              component: CNavItem,
              name: t("LABELS.advance_booking"),
              to: '/bookings',
            },
            // {
            //   component: CNavItem,
            //   name: t("LABELS.regular_orders"),
            //   to: '/regular',
            // },
            {
              component: CNavItem,
              name: t("LABELS.all_orders"),
              to: '/order',
            }
          ],
        },

   

        {
          component: CNavGroup,
          name: t("LABELS.expense"),
          icon: <CIcon icon={cilDollar} customClassName="nav-icon" />,
          items: [
            {
              component: CNavItem,
              name: t("LABELS.new_expense"),
              to: '/expense/new',
            },
            
            {
              component: CNavItem,
              name: t("LABELS.new_expense_type"),
              to: '/expense/new-type',
            },
            {
              component: CNavItem,
              name: t("LABELS.all_expense_types"),
              to: '/expense/all-type',
            },
          ],
        },
        {
          component: CNavGroup,
          name: t("LABELS.report"),
          icon: <CIcon icon={cilChart} customClassName="nav-icon" />,
          items: [
            {
              component: CNavItem,
              name: t("LABELS.customer_report"),
              to: 'Reports/Customer_Report',
            },
            {
              component: CNavItem,
              name: t("LABELS.credit_report"),
              to: 'Reports/creditReport',
            },
            // {
            //   component: CNavItem,
            //   name: 'Expense Report',
            //   to: 'Reports/Expense_Report',
            // },
            // {
            //   component: CNavItem,
            //   name: 'Sales Report',
            //   to: 'Reports/Sales_Report',
            // },
            // {
            //   component: CNavItem,
            //   name: 'Profit and Loss Report',
            //   to: 'Reports/pnl_Report',
            // },
            {
              component: CNavItem,
              name: t("LABELS.report"),
              to: 'Reports/Reports',
            },
          ],
        },
        {
          component: CNavGroup,
          name: t("LABELS.user_management"),
          icon: <CIcon icon={cilGroup} customClassName="nav-icon" />,
          items: [
            {
              component: CNavItem,
              name: t("LABELS.all_Users"),
              to: 'usermanagement/all-users',
            },
            {
              component: CNavItem,
              name: t("LABELS.create_user"),
              to: 'usermanagement/create-user',
            },
          ],
        },
        {
          component: CNavGroup,
          name: t("LABELS.company"),
          icon: <CIcon icon={cibElasticStack} customClassName="nav-icon" />,
          items: [
            {
              component: CNavItem,
              name: t("LABELS.new_company"),
              to: '/company/new',
            },
            {
              component: CNavItem,
              name: t("LABELS.all_companies"),
              to: '/company/all',
            }
          ],
        },
        // {
        //   component: CNavItem,
        //   name: t("LABELS.map"),
        //   to: '/map',
        //   icon: <CIcon icon={cilCursor} customClassName="nav-icon" />,
        // },
      ]
  }
  else if(user===1){
    _nav = [
      {
        component: CNavItem,
        name: t("LABELS.dashboard"),
        to: '/dashboard',
        icon: <CIcon icon={cibElasticStack} customClassName="nav-icon" />,
      },
      {
        component: CNavGroup,
        name: t("LABELS.report"),
        icon: <CIcon icon={cilChart} customClassName="nav-icon" />,
        items: [
          {
            component: CNavItem,
            name: t("LABELS.customer_history_report"),
            to: 'Reports/Customer_Report',
          },
          {
            component: CNavItem,
            name: t("LABELS.credit_report"),
            to: 'Reports/creditReport',
          },
          // {
          //   component: CNavItem,
          //   name: 'Expense Report',
          //   to: 'Reports/Expense_Report',
          // },
          // {
          //   component: CNavItem,
          //   name: 'Sales Report',
          //   to: 'Reports/Sales_Report',
          // },
          // {
          //   component: CNavItem,
          //   name: 'Profit and Loss Report',
          //   to: 'Reports/pnl_Report',
          // },
          {
            component: CNavItem,
            name: t("LABELS.report"),
            to: 'Reports/Reports',
          },
        ],
      },
      {
        component: CNavItem,
        name: t("LABELS.invoice"),
        to: '/invoice',
        icon: <CIcon icon={cilPrint} customClassName="nav-icon" />,
      },
      // {
      //   component: CNavItem,
      //   name: t("LABELS.delivery"),
      //   to: '/delivery',
      //   icon: <CIcon icon={cilTruck} customClassName="nav-icon" />,
      // },
      // {
      //   component: CNavItem,
      //   name: t("LABELS.booking"),
      //   to: '/booking',
      //   icon: <CIcon icon={cilBookmark} customClassName="nav-icon" />,
      // },
      {
        component: CNavItem,
        name: t("LABELS.all_customers"),
         to: '/customer/all',
         icon: <CIcon icon={cilUser} customClassName="nav-icon" />,
       },
    ];

    if(mode === 'advance'){
      _nav.push(...[
        
        {
          component: CNavGroup,
          name: t("LABELS.orders"),
          to: '/order',
          icon: <CIcon icon={cilCursor} customClassName="nav-icon" />,
          items: [
            {
              component: CNavItem,
              name: t("LABELS.advance_booking"),
              to: '/bookings',
            },
            //Make below object to add conditionally if mode === 'advance'
            // {
            //   component: CNavItem,
            //   name: t("LABELS.regular_orders"),
            //   to: '/regular',
            // },
            {
              component: CNavItem,
              name: t("LABELS.all_orders"),
              to: '/order',
            }
          ],
        },
        {
          component: CNavGroup,
          name: t("LABELS.products"),
          icon: <CIcon icon={cilNotes} customClassName="nav-icon" />,
          items: [
            {
              component: CNavItem,
              name: t("LABELS.new_product"),
              to: '/products/new',
            },
            {
              component: CNavItem,
              name: t("LABELS.all_products"),
              to: '/products/all',
            },
            // {
            //   component: CNavItem,
            //   name: 'Bulk Quantity ',
            //   to: 'products/updateqty',
            // },        
          ],
        },
        // {
        //   component: CNavGroup,
        //   name: t("LABELS.customers"),
        //   icon: <CIcon icon={cilUser} customClassName="nav-icon" />,
        //   items: [
        //     {
        //       component: CNavItem,
        //       name: t("LABELS.new_customer"),
        //       to: '/customer/new',
        //     },
        //     {
        //       component: CNavItem,
        //       name: t("LABELS.all_customers"),
        //       to: '/customer/all',
        //     }
        //   ],
        // },
        {
          component: CNavGroup,
          name: t("LABELS.expense"),
          icon: <CIcon icon={cilDollar} customClassName="nav-icon" />,
          items: [
            {
              component: CNavItem,
              name: t("LABELS.new_expense"),
              to: '/expense/new',
            },
            {
              component: CNavItem,
              name: t("LABELS.all_expense_types"),
              to: '/expense/all-type',
            },
          ],
        },
        
        {
          component: CNavGroup,
          name: t("LABELS.user_management"),
          icon: <CIcon icon={cilGroup} customClassName="nav-icon" />,
          items: [
            {
              component: CNavItem,
              name: t("LABELS.all_Users"),
              to: 'usermanagement/all-users',
            },
            {
              component: CNavItem,
              name: t("LABELS.create_user"),
              to: 'usermanagement/create-user',
            },
          ],
        },
      ])
    }else{
      _nav.push(...[
        {
          component: CNavItem,
          name: t("LABELS.advance_booking"),
          to: '/bookings',
          icon: <CIcon icon={cilList} customClassName="nav-icon" />,
        },{
          component: CNavItem,
          name: t("LABELS.customer_report"),
          to: 'Reports/Customer_Report',
          icon: <CIcon icon={cilAddressBook} customClassName="nav-icon" />,
        },
        {
          component: CNavItem,
          name: t("LABELS.credit_report"),
          to: 'Reports/creditReport',
          icon: <CIcon icon={cilDollar} customClassName="nav-icon" />,
        },
        {
          component: CNavGroup,
          name: t("LABELS.products"),
          icon: <CIcon icon={cilNotes} customClassName="nav-icon" />,
          items: [
            {
              component: CNavItem,
              name: t("LABELS.new_product"),
              to: '/products/new',
            },
            {
              component: CNavItem,
              name: t("LABELS.all_products"),
              to: '/products/all',
            },
            // {
            //   component: CNavItem,
            //   name: 'Bulk Quantity ',
            //   to: 'products/updateqty',
            // },        
          ],
        },
      ]);
    }
  }
  else if(user===2){
    _nav = [
      {
        component: CNavItem,
        name: t("LABELS.dashboard"),
        to: '/dashboard',
        icon: <CIcon icon={cibElasticStack} customClassName="nav-icon" />,
      },
      {
        component: CNavItem,
        name: t("LABELS.invoice"),
        to: '/invoice',
        icon: <CIcon icon={cilPrint} customClassName="nav-icon" />,
      },
      // {
      //   component: CNavItem,
      //   name: t("LABELS.delivery"),
      //   to: '/delivery',
      //   icon: <CIcon icon={cilTruck} customClassName="nav-icon" />,
      // },
      // {
      //   component: CNavItem,
      //   name: t("LABELS.booking"),
      //   to: '/booking',
      //   icon: <CIcon icon={cilBookmark} customClassName="nav-icon" />,
      // },
      {
       component: CNavItem,
       name: t("LABELS.all_customers"),
        to: '/customer/all',
        icon: <CIcon icon={cilUser} customClassName="nav-icon" />,
      },
      
      
    ]
    if(mode === 'advance'){
      _nav.push(...[
        // {
        //   component: CNavGroup,
        //   name: t("LABELS.customers"),
        //   icon: <CIcon icon={cilUser} customClassName="nav-icon" />,
        //   items: [
        //     {
        //       component: CNavItem,
        //       name: t("LABELS.new_customer"),
        //       to: '/customer/new',
        //     },
        //     {
        //       component: CNavItem,
        //       name: t("LABELS.all_customers"),
        //       to: '/customer/all',
        //     }
        //   ],
        // },
        {
          component: CNavGroup,
          name: t("LABELS.orders"),
          to: '/order',
          icon: <CIcon icon={cilCursor} customClassName="nav-icon" />,
          items: [
            {
              component: CNavItem,
              name: t("LABELS.advance_booking"),
              to: '/bookings',
            },
            // {
            //   component: CNavItem,
            //   name: t("LABELS.regular_orders"),
            //   to: '/regular',
            // },
            {
              component: CNavItem,
              name: t("LABELS.all_orders"),
              to: '/order',
            }
          ],
        },
        {
          component: CNavGroup,
          name: t("LABELS.products"),
          icon: <CIcon icon={cilNotes} customClassName="nav-icon" />,
          items: [
            {
              component: CNavItem,
              name: t("LABELS.new_product"),
              to: '/products/new',
            },
            {
              component: CNavItem,
              name: t("LABELS.all_products"),
              to: '/products/all',
            },
            // {
            //   component: CNavItem,
            //   name: 'Bulk Quantity ',
            //   to: 'products/updateqty',
            // },        
          ],
        },
      ])
    }else{
      _nav.push(...[
        {
          component: CNavItem,
          name: t("LABELS.advance_booking"),
          to: '/bookings',
          icon: <CIcon icon={cilAddressBook} customClassName="nav-icon" />,
        },
      ]);
    }
  }
  // _nav.push({
  //   component: CNavItem,
  //   name: t("LABELS.map"),
  //   to: '/map',
  //   icon: <CIcon icon={cilCursor} customClassName="nav-icon" />,
  // },)
  return _nav;
}
