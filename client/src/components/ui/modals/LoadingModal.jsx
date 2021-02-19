import React from 'react';
import PropTypes from 'prop-types';

import Modal from '../Modal';
import Spinner from '../Spinner';
import strings from '../../../utils/strings';

import '../../ui/FullScreenSpinner.css';

const LoadingModal = props => (
  <Modal
    active={props.active}
    title={props.title ? props.title : strings.pageLoading}
    content={<Spinner class="loadingModal" />}
    hasButtons={false}
  />
);

LoadingModal.propTypes = {
  active: PropTypes.bool,
  title: PropTypes.string
};

LoadingModal.defaultProps = {
  active: false,
  title: null
};

export default LoadingModal;
