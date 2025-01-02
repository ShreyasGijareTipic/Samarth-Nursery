import React, { useEffect, useRef, useState } from 'react'
import PropTypes from 'prop-types'
import 'chartjs-plugin-datalabels'// To modify the data on barghaph

import {
  CRow,
  CCol,
  CDropdown,
  CDropdownMenu,
  CDropdownItem,
  CDropdownToggle,
  CWidgetStatsA,
} from '@coreui/react'
import { getStyle } from '@coreui/utils'
import { CChartBar } from '@coreui/react-chartjs'
import CIcon from '@coreui/icons-react'
import { cilArrowBottom, cilArrowTop, cilOptions } from '@coreui/icons'
import { color } from 'chart.js/helpers'
import { getUserType } from '../../util/session'

const WidgetsDropdown = (props) => {

  const user= getUserType();
  const widgetChartRef1 = useRef(null)
  const widgetChartRef2 = useRef(null)
  const [reportMonth,setReportMonth]=useState({
    currentSales:0,
    currentExpense:0,
    currentPandL:0,
    currentMonth:''
  });
  
  const date= new Date();
  const currentMonth= date.getMonth();
 
  function calculateMonthlyReport (){
    let sales=[];
    let expence=[];
    let pandL=[];
  
    sales=props.reportMonth.monthlySales;
    expence=props.reportMonth.monthlyExpense;
    pandL=props.reportMonth.monthlyPandL;
    let length = sales.length;


    if (currentMonth >= 0 && currentMonth < length) {
      const currentSales = sales[currentMonth];
      const currentExpense = expence[currentMonth];
      const currentPandL = pandL[currentMonth];
      const months= ["January","February","March","April","May","June","July","August","September","October","November","December"];
      const monthName=months[currentMonth];
      setReportMonth(resp=>({
        ...resp,
      currentSales:currentSales,
      currentExpense:currentExpense,
      currentPandL: currentPandL,
      currentMonth: monthName
      }))
      return (currentSales,currentExpense,currentPandL)
        } else {
      console.log("Index is out of bounds.");
      }
  }
  
  useEffect(()=>{
    calculateMonthlyReport();
  },[props.reportMonth]);

  useEffect(() => {
    document.documentElement.addEventListener('ColorSchemeChange', () => {
      if (widgetChartRef1.current) {
        setTimeout(() => {
          widgetChartRef1.current.data.datasets[0].pointBackgroundColor = getStyle('--cui-primary')
          widgetChartRef1.current.update()
        })
      }

      if (widgetChartRef2.current) {
        setTimeout(() => {
          widgetChartRef2.current.data.datasets[0].pointBackgroundColor = getStyle('--cui-info')
          widgetChartRef2.current.update()
        })
      }
    })
  }, [widgetChartRef1, widgetChartRef2])

  return (
    <>
      {(user === 0 || user === 1) && (
        <CRow className={props.className} xs={{ gutter: 4 }}>
          <CCol sm={4} xl={4} xxl={4} className='vh-[40%]'>
            <CWidgetStatsA   className='pb-3'
            color={reportMonth.currentPandL > 0 ? "success" : "danger"}
              value={
                <><div d-flex>
                  <span className='fs-4'>{Math.abs(reportMonth.currentPandL)}&nbsp;₹ </span>
                  <span className="fs-6 fw-normal">
                    in {reportMonth.currentMonth}
                  </span>
                  </div>
                </>
              }
              title="Profit / Loss "
              
              />
          </CCol>
        
          <CCol sm={4} xl={4} xxl={4}>
            <CWidgetStatsA className='pb-3'
                  style={{ backgroundColor: '#669DB3FF' }} 
              value={
                <>
                  
                  <span className='fs-4'style={{color: 'white'}}>{reportMonth.currentSales}&nbsp;₹ </span>
                  <span className="fs-6 fw-normal" style={{color: 'white'}}>in {reportMonth.currentMonth}</span>
                </>
              }
                title= {<span style={{ color: 'white' }}>Sales </span>}
              />
          </CCol>
        
            <CCol sm={4} xl={4} xxl={4}>
            <CWidgetStatsA  className='pb-3'
              style={{ backgroundColor: '#D09683' }} 
              value={
                <>
                  <span className='fs-4' style={{color:'white'}}>{reportMonth.currentExpense}&nbsp;₹ </span>
                    <span className="fs-6 fw-normal" style={{color:'white'}}>in {reportMonth.currentMonth}</span>
                </>
              }
              title= {<span style={{ color: 'white' }}>Expenses</span>}
              
              
            />
          </CCol>
     </CRow>
      )}
    </>
  );
}

WidgetsDropdown.propTypes = {
  className: PropTypes.string,
  withCharts: PropTypes.bool,
}

export default WidgetsDropdown