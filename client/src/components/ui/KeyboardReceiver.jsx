/* global window */
import React from 'react';
import PropTypes from 'prop-types';

export const keyMap = {
  backspace: 8,
  tab: 9,
  enter: 13,
  shift: 16,
  ctrl: 17,
  alt: 18,
  pause_break: 19,
  caps_lock: 20,
  escape: 27,
  page_up: 33,
  page_down: 34,
  end: 35,
  home: 36,
  left_arrow: 37,
  up_arrow: 38,
  right_arrow: 39,
  down_arrow: 40,
  insert: 45,
  delete: 46,
  0: 48,
  1: 49,
  2: 50,
  3: 51,
  4: 52,
  5: 53,
  6: 54,
  7: 55,
  8: 56,
  9: 57,
  a: 65,
  b: 66,
  c: 67,
  d: 68,
  e: 69,
  f: 70,
  g: 71,
  h: 72,
  i: 73,
  j: 74,
  k: 75,
  l: 76,
  m: 77,
  n: 78,
  o: 79,
  p: 80,
  q: 81,
  r: 82,
  s: 83,
  t: 84,
  u: 85,
  v: 86,
  w: 87,
  x: 88,
  y: 89,
  z: 90,
  left_window_key: 91,
  right_window_key: 92,
  select_key: 93,
  numpad_0: 96,
  numpad_1: 97,
  numpad_2: 98,
  numpad_3: 99,
  numpad_4: 100,
  numpad_5: 101,
  numpad_6: 102,
  numpad_7: 103,
  numpad_8: 104,
  numpad_9: 105,
  multiply: 106,
  add: 107,
  subtract: 109,
  decimal_point: 110,
  divide: 111,
  f1: 112,
  f2: 113,
  f3: 114,
  f4: 115,
  f5: 116,
  f6: 117,
  f7: 118,
  f8: 119,
  f9: 120,
  f10: 121,
  f11: 122,
  f12: 123,
  num_lock: 144,
  scroll_lock: 145,
  semi_colon: 186,
  equal_sign: 187,
  comma: 188,
  dash: 189,
  period: 190,
  forward_slash: 191,
  grave_accent: 192,
  open_bracket: 219,
  back_slash: 220,
  close_braket: 221,
  single_quote: 222
};

const callbackOnKeyPress = (callback, keys) => (event) => {
  const crtlPressed = event.ctrlKey && keys.includes(keyMap.ctrl);
  const shiftPressed = event.shiftKey && keys.includes(keyMap.shift);
  const altPressed = event.altKey && keys.includes(keyMap.alt);
  const noSecondPress = !(
    keys.includes(keyMap.ctrl) ||
    keys.includes(keyMap.shift) ||
    keys.includes(keyMap.alt)
  );
  const keyToBePress = keys.filter(key =>
    key !== keyMap.ctrl && key !== keyMap.shift && key !== keyMap.alt)[0];

  if (
    keyToBePress === event.keyCode &&
    (noSecondPress || crtlPressed || shiftPressed || altPressed)
  ) {
    event.preventDefault();
    callback();
  }
};

/**
 * Component to add a keyboard event on key press
 * Example of usage: print hello on ctrl + a
 *   <KeyboardReceiver
 *    callback={() => {console.log('oi');}}
 *    keys={[keyMap.ctrl, keyMap.a]}
 *  />
 */
class KeyboardReceiver extends React.Component {
  constructor(props) {
    super(props);
    this.callbackToEvent = () => {};
  }

  componentWillMount() {
    this.callbackToEvent = callbackOnKeyPress(this.props.callback, this.props.keys);
    window.addEventListener(
      'keydown',
      this.callbackToEvent,
      false
    );
  }

  componentWillUnmount() {
    window.removeEventListener(
      'keydown',
      this.callbackToEvent
    );
  }

  render() {
    return '';
  }
}

KeyboardReceiver.propTypes = {
  callback: PropTypes.func.isRequired,
  keys: PropTypes.arrayOf(PropTypes.number).isRequired
};

export default KeyboardReceiver;
