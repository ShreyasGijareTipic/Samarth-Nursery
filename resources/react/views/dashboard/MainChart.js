import React, { useEffect, useRef } from 'react'
import { CChartBar } from '@coreui/react-chartjs'
import { getStyle } from '@coreui/utils'
import { getUserType } from '../../util/session'

const MainChart = (props) => {

  
  const chartRef = useRef(null)

  const getBarColor = (value) => {
    return value < 0 ? getStyle('--cui-danger') : getStyle('--cui-success'); // 'red' for negative values, green for non-negative
  };

  const labelName = (value) => {
    return value < 0 ? "Loss" : "Profit";
  };

  useEffect(() => {
    document.documentElement.addEventListener('ColorSchemeChange', () => {
      if (chartRef.current) {
        setTimeout(() => {
          chartRef.current.options.scales.x.grid.borderColor = getStyle(
            '--cui-border-color-translucent',
          )
          chartRef.current.options.scales.x.grid.color = getStyle('--cui-border-color-translucent')
          chartRef.current.options.scales.x.ticks.color = getStyle('--cui-body-color')
          chartRef.current.options.scales.y.grid.borderColor = getStyle(
            '--cui-border-color-translucent',
          )
          chartRef.current.options.scales.y.grid.color = getStyle('--cui-border-color-translucent')
          chartRef.current.options.scales.y.ticks.color = getStyle('--cui-body-color')
          chartRef.current.update()
        })
      }
    })
  }, [chartRef])

  let dataValues = props.monthlyPandL || [];
  const labelProfitOrLoss = labelName(dataValues[0] || 0); // Use the first value to determine the label

  let maxValue = Math.max(...dataValues.map(value => Math.abs(value))) + 10000;

  return (
    <>
     <CChartBar
        ref={chartRef}
        style={{ height: '300px', marginTop: '40px' }}
        data={{
          labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
          datasets: [
            {
              label: labelProfitOrLoss,
              backgroundColor: dataValues.map(value => getBarColor(value)),
              borderColor: dataValues.map(value => getBarColor(value)),
              pointHoverBackgroundColor: getStyle('--cui-info'),
              borderWidth: 2,
              data: dataValues,
              fill: true,
            },
          ],
        }}
        options={{
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false,
            },
            tooltip: {
              callbacks: {
                label: function (context) {
                  const value = context.raw;
                  const label = labelName(dataValues[context.dataIndex]);
                  return `${label}: ${value}`;
                },
              },
            },
            datalabels: {
              color: 'white',
              display: true,
              formatter: (value) => value,
            },
          },
          scales: {
            x: {
              grid: {
                color: getStyle('--cui-border-color-translucent'),
                drawOnChartArea: false,
              },
              ticks: {
                color: getStyle('--cui-body-color'),
              },
            },
            y: {
              beginAtZero: true,
              border: {
                color: getStyle('--cui-border-color-translucent'),
              },
              grid: {
                color: getStyle('--cui-border-color-translucent'),
              },
              max: maxValue,
              ticks: {
                color: getStyle('--cui-body-color'),
                maxTicksLimit: 5,
                stepSize: Math.ceil(maxValue / 5),
              },
            },
          },
          elements: {
            line: {
              tension: 0.4,
            },
            point: {
              radius: 0,
              hitRadius: 10,
              hoverRadius: 4,
              hoverBorderWidth: 3,
            },
          },
        }}
      />
    </>
  )
}

export default MainChart
