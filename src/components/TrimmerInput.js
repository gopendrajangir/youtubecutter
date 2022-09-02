import React, {useState, useEffect} from 'react';
import PropTypes from 'prop-types';

import {StyleSheet, Text, View, TextInput} from 'react-native';

import appStyles from '../appStyles';

const validateInput = (units, setUnits, max) => {
  return num => {
    if (num === '') {
      return setUnits('');
    }
    num = parseInt(num);
    if (isNaN(num)) {
      return setUnits(units + '');
    } else {
      if (num < 0 || num > max) {
        return setUnits(units + '');
      } else {
        return setUnits(num + '');
      }
    }
  };
};

const formatTime = (hours, minutes, seconds, setTime) => {
  hours = hours ? parseInt(hours) : 0;
  minutes = minutes ? parseInt(minutes) : 0;
  seconds = seconds ? parseInt(seconds) : 0;

  const time = hours * 60 * 60 + minutes * 60 + seconds;
  return setTime(time);
};

const Input = ({value, valueSetter, max, validater}) => {
  return (
    <TextInput
      style={{
        ...styles.input,
        ...(value.length === 2
          ? {paddingLeft: 14}
          : value.length === 1
          ? {paddingLeft: 18}
          : {paddingLeft: 14}),
      }}
      value={value}
      keyboardType="numeric"
      onChangeText={validater(value, valueSetter, max)}
      maxLength={2}
      key="00"
      placeholder="00"
      placeholderTextColor="#666"
    />
  );
};

const TrimmerInput = ({setTime, initialTime}) => {
  const [hours, setHours] = useState('');
  const [minutes, setMinutes] = useState('');
  const [seconds, setSeconds] = useState('');

  useEffect(() => {
    formatTime(hours, minutes, seconds, setTime);
  }, [hours, minutes, seconds]);

  useEffect(() => {
    const initialHours = Math.floor(initialTime / 3600);
    const initialMinutes = Math.floor((initialTime % 3600) / 60);
    const initialSeconds = (initialTime % 3600) % 60;

    setHours(initialHours ? initialHours.toString() : '');
    setMinutes(initialMinutes ? initialMinutes.toString() : '');
    setSeconds(initialSeconds ? initialSeconds.toString() : '');
  }, [initialTime]);

  return (
    <View style={styles.wrapper}>
      <Input
        value={hours}
        validater={validateInput}
        valueSetter={setHours}
        max={100}
      />
      <Text style={styles.colon}>:</Text>
      <Input
        value={minutes}
        validater={validateInput}
        valueSetter={setMinutes}
        max={59}
      />
      <Text style={styles.colon}>:</Text>
      <Input
        value={seconds}
        validater={validateInput}
        valueSetter={setSeconds}
        max={59}
      />
    </View>
  );
};

TrimmerInput.defaultProps = {
  initialTime: 0,
};

TrimmerInput.propTypes = {
  setTime: PropTypes.func.isRequired,
  initialTime: PropTypes.number,
};

export default TrimmerInput;

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    backgroundColor: appStyles.colors.secondaryFade,
    fontSize: 14,
    width: 45,
    height: 45,
    borderRadius: 3,
    color: '#aaa',
  },
  colon: {
    marginHorizontal: 10,
    fontSize: 20,
    lineHeight: 20,
    color: '#666',
  },
});
