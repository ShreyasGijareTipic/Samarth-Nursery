import { CFormInput, CFormLabel, CFormSelect } from '@coreui/react';
import React, { useEffect, useRef, useState } from 'react';
import 'react-datepicker/dist/react-datepicker.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { WeekPicker } from './Weekpicker';

export function Custom({ setStateCustom }) {
  const startRef = useRef();
  const endRef = useRef();

  const handleChange = () => {
    const start = startRef.current.value;
    const end = endRef.current.value;
    if (start && end) {
      setStateCustom({ start_date: start, end_date: end });
    }
  };

  return (
    <div className="row mt-1">
  <div className="col-sm-6 mb-3">
    <div className="mb-1">
      <CFormLabel htmlFor="start_date">Start Date</CFormLabel>
      <CFormInput
        type="date"
        ref={startRef}
        id="start_date"
        name="start_date"
        placeholder="Select Start Date"
        onChange={handleChange}
        required
        feedbackInvalid="Please select a date."
      />
    </div>
  </div>
  <div className="col-sm-6 mb-3">
    <div className="mb-1">
      <CFormLabel htmlFor="end_date">End Date</CFormLabel>
      <CFormInput
        type="date"
        id="end_date"
        ref={endRef}
        name="end_date"
        onChange={handleChange}
        required
        feedbackInvalid="Please select a date."
      />
    </div>
  </div>
</div>

  
  );
}




export function Months({ setStateMonth }) {
  const isLeapYear = (year) => {
    return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
  };

  const getLastDayOfMonth = (year, month) => {
    if (month === 2) {
      return isLeapYear(year) ? 29 : 28;
    }
    const thirtyDays = [4, 6, 9, 11];
    return thirtyDays.includes(month) ? 30 : 31;
  };

  const currentYear = new Date().getFullYear();
  const currentMonth = (new Date().getMonth() + 1).toString().padStart(2, '0');
  const [selectedYear, setSelectedYear] = useState(currentYear.toString());
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);

  const minYear = 2023;
  const maxYear = 2030;

  const generateYearOptions = () => {
    const years = [];
    for (let year = minYear; year <= maxYear; year++) {
      years.push(<option key={year} value={year.toString()}>{year}</option>);
    }
    return years;
  };

  const generateMonthOptions = () => {
    const months = [
      { value: '01', label: 'January' },
      { value: '02', label: 'February' },
      { value: '03', label: 'March' },
      { value: '04', label: 'April' },
      { value: '05', label: 'May' },
      { value: '06', label: 'June' },
      { value: '07', label: 'July' },
      { value: '08', label: 'August' },
      { value: '09', label: 'September' },
      { value: '10', label: 'October' },
      { value: '11', label: 'November' },
      { value: '12', label: 'December' },
    ];
    return months.map((month) => (
      <option key={month.value} value={month.value}>{month.label}</option>
    ));
  };

  const handleYearChange = (e) => {
    const year = e.target.value;
    setSelectedYear(year);
    const lastDay = getLastDayOfMonth(parseInt(year), parseInt(selectedMonth));
    setStateMonth({
      start_date: `${year}-${selectedMonth}-01`,
      end_date: `${year}-${selectedMonth}-${lastDay}`,
    });
  };

  const handleMonthChange = (e) => {
    const month = e.target.value;
    setSelectedMonth(month);
    const lastDay = getLastDayOfMonth(parseInt(selectedYear), parseInt(month));
    setStateMonth({
      start_date: `${selectedYear}-${month}-01`,
      end_date: `${selectedYear}-${month}-${lastDay}`,
    });
  };

  useEffect(() => {
    const year = selectedYear || currentYear;
    const month = selectedMonth || currentMonth;
    const lastDay = getLastDayOfMonth(parseInt(year), parseInt(month));
    setStateMonth({
      start_date: `${year}-${month}-01`,
      end_date: `${year}-${month}-${lastDay}`,
    });
  }, [selectedYear, selectedMonth]);

  return (
    <div className="d-flex mb-3">
  <div className="flex-fill mx-1">
    <CFormSelect
      className="pl-3"
      aria-label="Select Year"
      value={selectedYear}
      onChange={handleYearChange}
    >
      {generateYearOptions()}
    </CFormSelect>
  </div>
  <div className="flex-fill mx-1">
    <CFormSelect
      className="pl-3"
      aria-label="Select Month"
      value={selectedMonth}
      onChange={handleMonthChange}
    >
      {generateMonthOptions()}
    </CFormSelect>
  </div>
</div>

  );
}





export function Quarter({ setStateQuarter }) {
  const getCurrentQuarter = (month) => {
    if (month >= 4 && month <= 6) return '1';
    if (month >= 7 && month <= 9) return '2';
    if (month >= 10 && month <= 12) return '3';
    return '4';
  };

  const getQuarterStartDate = (year, quarter) => {
    switch (quarter) {
      case '1': return `${year}-04-01`;
      case '2': return `${year}-07-01`;
      case '3': return `${year}-10-01`;
      case '4': return `${year + 1}-01-01`;
      default: return `${year}-04-01`;
    }
  };

  const getQuarterEndDate = (year, quarter) => {
    switch (quarter) {
      case '1': return `${year}-06-30`;
      case '2': return `${year}-09-30`;
      case '3': return `${year}-12-31`;
      case '4': return `${year + 1}-03-31`;
      default: return `${year + 1}-03-31`;
    }
  };

  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;
  const [selectedYear, setSelectedYear] = useState(currentYear.toString());
  const [selectedQuarter, setSelectedQuarter] = useState(getCurrentQuarter(currentMonth));

  useEffect(() => {
    const year = parseInt(selectedYear, 10);
    const start = getQuarterStartDate(year, selectedQuarter);
    const end = getQuarterEndDate(year, selectedQuarter);
    setStateQuarter({ start_date: start, end_date: end });
  }, [selectedYear, selectedQuarter, setStateQuarter]);

  const handleYearChange = (e) => {
    setSelectedYear(e.target.value);
  };

  const handleQuarterChange = (e) => {
    setSelectedQuarter(e.target.value);
  };

  return (
    <div className="d-flex">
    <div className="flex-fill mx-1 col-sm-2">
      <CFormSelect
        className="pl-3 w-100"
        aria-label="Select Financial Year"
        value={selectedYear}
        onChange={handleYearChange}
      >
        {Array.from({ length: 7 }, (_, i) => (
          <option key={2023 + i} value={2023 + i}>
            {`${2023 + i}-${(2023 + i + 1).toString().slice(-2)}`}
          </option>
        ))}
      </CFormSelect>
    </div>
    <div className="flex-fill mx-1 col-sm-4">
      <CFormSelect
        className="pl-3 w-100"
        aria-label="Select Quarter"
        value={selectedQuarter}
        onChange={handleQuarterChange}
      >
        {[
          { value: '1', label: 'Q1 (Apr - Jun)' },
          { value: '2', label: 'Q2 (Jul - Sep)' },
          { value: '3', label: 'Q3 (Oct - Dec)' },
          { value: '4', label: 'Q4 (Jan - Mar)' },
        ].map((quarter) => (
          <option key={quarter.value} value={quarter.value}>
            {quarter.label}
          </option>
        ))}
      </CFormSelect>
    </div>
  </div>
  
  );
}


export function Year({ setStateYear }) {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear.toString());

  useEffect(() => {
    const year = parseInt(selectedYear, 10);
    setStateYear({
      start_date: `${year}-04-01`,
      end_date: `${year + 1}-03-31`,
    });
  }, [selectedYear, setStateYear]);

  return (
    <div className="mt-2 col-sm-2 d-flex justify-content-center">
    <div className="flex-fill mx-1">
      <CFormSelect
        className="pl-3 w-100"
        aria-label="Select Financial Year"
        value={selectedYear}
        onChange={(e) => setSelectedYear(e.target.value)}
      >
        {Array.from({ length: 7 }, (_, i) => {
          const year = 2023 + i;
          return (
            <option key={year} value={year.toString()}>
              {`${year}-${(year + 1).toString().slice(-2)}`}
            </option>
          );
        })}
      </CFormSelect>
    </div>
  </div>
  
  );
}





export function Week({ setStateWeek }) {
  const [week, setWeek] = useState({
    firstDay: new Date(),
    lastDay: new Date()
  });

  // Function to convert date to yyyy-mm-dd format
  const convertDate = (date) => {
    let dt = new Date(date);
    let year = dt.getFullYear();
    let month = String(dt.getMonth() + 1).padStart(2, '0'); // Ensure two digits
    let day = String(dt.getDate()).padStart(2, '0'); // Ensure two digits
    return `${year}-${month}-${day}`;
  };

  // Update week and set formatted start and end dates
  const onChange = (week) => {
    setWeek(week);
    setStateWeek({
      start_date: convertDate(week.firstDay),
      end_date: convertDate(week.lastDay)
    });
  };

  return (
    <div className="App ">
      <WeekPicker onChange={onChange} />
    </div>
  );
}