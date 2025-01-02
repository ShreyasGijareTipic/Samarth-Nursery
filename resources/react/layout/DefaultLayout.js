import React, { useEffect } from 'react'
import { AppContent, AppSidebar, AppFooter, AppHeader } from '../components/index'
import { useNavigate } from 'react-router-dom'
import { isLogIn } from '../util/session'
import NetworkStatus from '../views/common/NetworkStatus'

const DefaultLayout = () => {
  const navigate = useNavigate()

  useEffect(() => {
    if (!isLogIn()) {
      navigate('/login')
    }
  }, [])

  return (
    <div>
      <NetworkStatus/>
      <AppSidebar />
      <div className="wrapper d-flex flex-column min-vh-100  no-print">
        <AppHeader />
        <div className="body flex-grow-1">
          <AppContent />
        </div>
        <AppFooter />
      </div>
    </div>
  )
}

export default DefaultLayout
