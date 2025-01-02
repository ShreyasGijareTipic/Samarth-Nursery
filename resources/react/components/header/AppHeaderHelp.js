import React from 'react'
import {
  CAvatar,
  CDropdown,
  CDropdownDivider,
  CDropdownHeader,
  CDropdownItem,
  CDropdownMenu,
  CDropdownToggle,
} from '@coreui/react'
import { cilLockLocked } from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import { useNavigate } from 'react-router-dom'

// Import the help-desk image
import supportIcon from './../../assets/images/avatars/help-desk.png'

const AppHeaderHelp = () => {
  const navigate = useNavigate()

  const handleExistingTicket = () => {
    navigate('/ExistingTicketTable')
  }

  const handleFaq = () => {
    navigate('/loginFaq')
  }

  return (
    <CDropdown variant="nav-item">
      <CDropdownToggle
        placement="bottom-end"
        className="py-0 pe-0"
        caret={false}
        style={{ cursor: 'pointer' }}  // Add pointer cursor
      >
        {/* Use the help-desk image instead of avatar */}
        <img src={supportIcon} alt="Help Desk" className="avatar-img" style={{ width: '40px', height: '40px', borderRadius: '50%' }} />
      </CDropdownToggle>
      <CDropdownMenu className="pt-0" placement="bottom-end">
        <CDropdownHeader className="bg-body-secondary fw-semibold my-2">
          Help & Support
        </CDropdownHeader>
        <CDropdownItem onClick={handleFaq}>
          <CIcon icon={cilLockLocked} className="me-2" />
          Raise Ticket
        </CDropdownItem>
        <CDropdownDivider />
        <CDropdownItem onClick={handleExistingTicket}>
          <CIcon icon={cilLockLocked} className="me-2" />
          Existing Ticket
        </CDropdownItem>
      </CDropdownMenu>
    </CDropdown>
  )
}

export default AppHeaderHelp
