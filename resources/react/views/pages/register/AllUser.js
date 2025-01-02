import React, { useState, useEffect } from 'react';
import {
    CBadge,
    CButton,
    CCard,
    CCardBody,
    CCardHeader,
    CCol,
    CFormSwitch,
    CRow,
    CTable,
    CTableBody,
    CTableDataCell,
    CTableHead,
    CTableHeaderCell,
    CTableRow,
} from '@coreui/react';
import { getAPICall, put } from '../../../util/api';

function AllUsers() {
    const [AllUsers, setAllUsers] = useState([]);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await getAPICall('/api/appUsers');
                setAllUsers(response.data);
            } catch (error) {
                console.error('Error fetching users:', error);
            }
        };

        fetchUsers();
    }, []);

    
    const toggleVisibility = async (user) => {
        const updatedUser = { ...user, blocked: user.blocked === 1 ? 0 : 1 };

        try {
            await put('/api/appUsers', updatedUser);
            setAllUsers((prevUsers) =>
                prevUsers.map((u) =>
                    u.id === user.id ? updatedUser : u
                )
            );
        } catch (error) {
            console.error('Error updating user:', error);
        }
    };

    return (
        <CRow>
            <CCol xs={12}>
                <CCard className="mb-4">
                    <CCardHeader>
                        <strong>All Users</strong>
                    </CCardHeader>
                    <CCardBody>
                        <div className="table-responsive">
                            <CTable>
                                <CTableHead>
                                    <CTableRow>
                                        <CTableHeaderCell scope="col">Id</CTableHeaderCell>
                                        <CTableHeaderCell scope="col">Name</CTableHeaderCell>
                                        <CTableHeaderCell scope="col">Email</CTableHeaderCell>
                                        <CTableHeaderCell scope="col">Mobile</CTableHeaderCell>
                                        <CTableHeaderCell scope="col">Type</CTableHeaderCell>
                                        <CTableHeaderCell scope="col">Blocked</CTableHeaderCell>
                                        
                                    </CTableRow>
                                </CTableHead>
                                <CTableBody>
                                    {AllUsers.map((user, index) => (
                                        <CTableRow key={user.id}>
                                            <CTableHeaderCell scope="row">{index + 1}</CTableHeaderCell>
                                            <CTableDataCell>{user.name}</CTableDataCell>
                                            <CTableDataCell>{user.email}</CTableDataCell>
                                            <CTableDataCell>{user.mobile}</CTableDataCell>
                                            <CTableDataCell>{user.type}</CTableDataCell>
                                            <CTableDataCell>
                                            <CFormSwitch
                                                id={`formSwitchCheckDefault${user.id}`}
                                                checked={user.blocked === 1}
                                                onChange={() => toggleVisibility(user)}
    
                                                  />

                                            </CTableDataCell>
                                            
                                        </CTableRow>
                                    ))}
                                </CTableBody>
                            </CTable>
                        </div>
                    </CCardBody>
                </CCard>
            </CCol>
        </CRow>
    );
}

export default AllUsers;
