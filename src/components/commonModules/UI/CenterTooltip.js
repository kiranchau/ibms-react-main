import React from 'react';
import "../../SCSS/tooltip.scss"
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';
const CenterTooltip = ({title, children}) => {
    const renderTooltip = (props) => (
      <Tooltip id="button-tooltip" {...props}>
        {title}
      </Tooltip>
    );
  
    return (
      <OverlayTrigger
        placement="bottom"
        delay={{ show: 250, hide: 300 }}
        overlay={renderTooltip}
      >
        <span variant="success"> {children}</span>
      </OverlayTrigger>
    );
  }
  

export default CenterTooltip;
