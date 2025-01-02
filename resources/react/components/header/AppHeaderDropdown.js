import React from 'react'
import {
  CAvatar,
  CBadge,
  CDropdown,
  CDropdownDivider,
  CDropdownHeader,
  CDropdownItem,
  CDropdownMenu,
  CDropdownToggle,
} from '@coreui/react'
import { cilLockLocked, cilMobile, cilSettings, cilUser } from '@coreui/icons'
import CIcon from '@coreui/icons-react'

import avatar8 from './../../assets/images/user.webp';

import { logout } from '../../util/api'
import { deleteUserData, getUserData } from '../../util/session'
import { Link, useNavigate } from 'react-router-dom'

const AppHeaderDropdown = () => {
  const navigate = useNavigate()
  const user = getUserData();
  const handleLogout = async () => {
    await logout()
    deleteUserData()
    navigate('/login')
  }
  return (
    <CDropdown variant="nav-item">
      <CDropdownToggle placement="bottom-end" className="py-0 pe-0" caret={false}>
        <CAvatar src={avatar8} size="md" />
      </CDropdownToggle>
      <CDropdownMenu className="pt-0" placement="bottom-end">
        <CDropdownItem>
          <CIcon icon={cilUser} className="me-2" />
          {user?.name}<br/>
        </CDropdownItem>
        <CDropdownItem>
          <CIcon icon={cilMobile} className="me-2" />
          {user?.email}
        </CDropdownItem>
        
        <CDropdownHeader className="bg-body-secondary fw-semibold my-2">Settings</CDropdownHeader>
        
        <Link to="/updatepassword" style={{ textDecoration: 'none', color: 'inherit' }}>
          <CDropdownItem>
            <CIcon icon={cilSettings} className="me-2" />
            Password
          </CDropdownItem>
        </Link>

        <CDropdownDivider />
        <CDropdownItem onClick={handleLogout}>
          <CIcon icon={cilLockLocked} className="me-2" />
          Logout
        </CDropdownItem>
      </CDropdownMenu>
    </CDropdown>
  )
}

export default AppHeaderDropdown
