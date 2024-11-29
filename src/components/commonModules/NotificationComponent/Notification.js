/* eslint-disable jsx-a11y/anchor-has-content */

import React from 'react';
import PropTypes from 'prop-types';

const Notification = ({ description, created_at, url, onClick }) => {
  return (
    <div className="title" onClick={() => onClick(url)}>
      <div dangerouslySetInnerHTML={{ __html: description }} />
      <div className='date'>{created_at}</div>
      <a href={url} target="_blank" rel="noopener noreferrer"></a>
    </div>
  );
};

Notification.propTypes = {
  description: PropTypes.string.isRequired,
  created_at: PropTypes.string.isRequired,
  url: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired,
};

export default Notification;
