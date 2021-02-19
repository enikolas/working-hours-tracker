import React from 'react';
import PropTypes from 'prop-types';

import Button from '../ui/Button';
import InputTimeGroup from '../ui/InputTimeGroup';
import ModeSelect from './ModeSelect';

import strings from '../../utils/strings';
import { Entries } from '../../PropTypes';

const HEADERS = {
  startTime: { key: 0, referenceHour: 8 },
  startBreakTime: { key: 1, referenceHour: 12 },
  endBreakTime: { key: 2, referenceHour: 13 },
  endTime: { key: 3, referenceHour: 17 }
};

const TimeEntryForm = ({
  entry,
  mode,
  isDisabled,
  onChangeEntry,
  onChangeMode,
  isPersisted,
  onSubmit
}) => (
  <form className="TimeEntryForm" onSubmit={onSubmit}>
    <ModeSelect
      mode={mode}
      onSelect={onChangeMode}
    />
    {
      Object.keys(HEADERS).map(phase => (
        <InputTimeGroup
          key={phase}
          isHidden={Boolean(mode)}
          label={strings.times[HEADERS[phase].key].label}
          value={entry[phase]}
          isDisabled={isDisabled}
          onChangeTime={time => onChangeEntry({ ...entry, [phase]: time })}
          referenceHour={HEADERS[phase].referenceHour}
        />
      ))
    }
    <Button
      label={isPersisted ? strings.update : strings.send}
    />
  </form>
);

export default TimeEntryForm;

TimeEntryForm.propTypes = {
  entry: Entries,
  mode: PropTypes.string,
  isDisabled: PropTypes.bool,
  isPersisted: PropTypes.bool,
  onChangeEntry: PropTypes.func,
  onChangeMode: PropTypes.func,
  onSubmit: PropTypes.func
};

TimeEntryForm.defaultProps = {
  entry: {},
  mode: '',
  isDisabled: false,
  isPersisted: false,
  onChangeEntry: () => {},
  onChangeMode: () => {},
  onSubmit: () => {}
};
