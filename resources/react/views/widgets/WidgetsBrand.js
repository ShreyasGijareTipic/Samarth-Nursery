import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { CWidgetStatsD, CRow, CCol } from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilCalendar } from '@coreui/icons';
import { getAPICall } from '../../util/api';
import { useToast } from '../common/toast/ToastContext';

const WidgetsBrand = (props) => {
  const [todaysDeliveries, setTodaysDeliveries] = useState(0); // State to store today's deliveries count
  const [tomorrowsDeliveries, setTomorrowsDeliveries] = useState(0); // State to store tomorrow's deliveries count
  const { showToast } = useToast();

  useEffect(() => {
    TodaysDeliveries(); // Fetch deliveries on component mount
    TomorrowsDeliveries();
  }, []);

  const TodaysDeliveries = async () => {
    try {
      const today = new Date();
      const fulldate = today.toISOString().split('T')[0];
      const resp = await getAPICall(`/api/totalDeliveries?startDate=${fulldate}&endDate=${fulldate}`);
      const todaysCount = resp.length;
      
      setTodaysDeliveries(todaysCount); // Update state with today's deliveries count
    } catch (error) {
      showToast('danger', 'Error occured ' + error);
      console.error('Error fetching deliveries:', error);
    }
  };

  const TomorrowsDeliveries = async () => {
    try {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const fulldate = tomorrow.toISOString().split('T')[0];
      const resp = await getAPICall(`/api/totalDeliveries?startDate=${fulldate}&endDate=${fulldate}`);
      const tomorrowsCount = resp.length;
      setTomorrowsDeliveries(tomorrowsCount); // Update state with tomorrow's deliveries count
    } catch (error) {
      showToast('danger', 'Error occured ' + error);
      console.error('Error fetching deliveries:', error);
    }
  };

  return (
    <CRow className={props.className} xs={{ gutter: 4 }}>
      <CCol sm={12} xl={12} xxl={12}>
        <CWidgetStatsD
          color="warning"
          icon={<div className="d-flex align-items-center"><CIcon icon={cilCalendar} height={40} className="pr-4 text-white align-items-center " /><span className="text-white display-6 mr-2">&nbsp;Schedule Delivery</span></div>}
          values={[
            { title: 'Today', value: todaysDeliveries }, // Display today's deliveries count here
            { title: 'Tomorrow', value: tomorrowsDeliveries }, // Display tomorrow's deliveries count
          ]}
        />
      </CCol>
    </CRow>
  );
};

WidgetsBrand.propTypes = {
  className: PropTypes.string,
  withCharts: PropTypes.bool,
};

export default WidgetsBrand;
