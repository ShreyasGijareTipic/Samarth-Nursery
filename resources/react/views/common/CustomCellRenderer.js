import React from 'react';

const CustomCellRenderer = (props) => {
  return (
    <div dangerouslySetInnerHTML={{ __html: props.value }} />
  );
};

export default CustomCellRenderer;