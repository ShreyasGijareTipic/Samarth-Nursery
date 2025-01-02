import { CButton, CFormSelect } from '@coreui/react'
import React from 'react'

export function Dropdown({ ReportOptions, selectedOption, setSelectedOption }) {
  return (
    <div className="">
      <CFormSelect
        className="mr-2"
        aria-label="Select Report Type"
        options={ReportOptions}
        value={selectedOption}
        onChange={(e) => setSelectedOption(e.target.value)}
      />
      
    </div>
  )
}


export function Button({fetchReportData}) {
  return (
    <div>
      <CButton color="success" onClick={fetchReportData}>
        Fetch Report
      </CButton>
    </div>
  )
}

