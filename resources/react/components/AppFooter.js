import React from 'react'
import { CFooter } from '@coreui/react'

const AppFooter = () => {
  return (
    <div className='no-print'>
    <CFooter className="px-4">
      <div>
        <a href="https://tipic.co.in" target="_blank" rel="noopener noreferrer">
          Tipic
        </a>
        <span className="ms-1">&copy; 2024 tipic.</span>
      </div>
      <div className="ms-auto">
        {/* <span className="me-1">Powered by</span>
        <a href="https://coreui.io/react" target="_blank" rel="noopener noreferrer">
          CoreUI
        </a> */}
      </div>
    </CFooter>
    </div>
  )
}

export default React.memo(AppFooter)
