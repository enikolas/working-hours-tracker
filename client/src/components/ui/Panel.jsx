import React from 'react';
import PropTypes from 'prop-types';

import './Panel.css';

const Panel = ({ message, type }) => {
  if (message) {
    return (
      <div className={`panel ${type}`}>
        <div className="icon" />
        <div className="message">
          {message}
        </div>
      </div>
    );
  }

  return null;
};

export default Panel;

Panel.propTypes = {
  type: PropTypes.oneOf(['success', 'error']).isRequired,
  message: PropTypes.string
};

Panel.defaultProps = {
  message: null
};
