import React from 'react';
import PropTypes from 'prop-types';

import {StyleSheet, Text, View} from 'react-native';

import TrimmerInput from './TrimmerInput';

const Trimmer = ({
  initialStartTime,
  initialEndTime,
  setStartTime,
  setEndTime,
  style,
}) => {
  return (
    <View style={{...styles.wrapper, ...style}}>
      <View style={styles.trimmerHead}>
        <View style={styles.trimmerTimeHeading}></View>
        <View style={styles.trimmerHeadTitles}>
          <Text
            style={{
              ...styles.trimmerHeadTitle,
              ...styles.trimmerHeadTitleHours,
            }}>
            Hours
          </Text>
          <Text
            style={{
              ...styles.trimmerHeadTitle,
              ...styles.trimmerHeadTitleMinutes,
            }}>
            Minutes
          </Text>
          <Text
            style={{
              ...styles.trimmerHeadTitle,
              ...styles.trimmerHeadTitleSeconds,
            }}>
            Seconds
          </Text>
        </View>
      </View>
      <View style={styles.trimmerTimes}>
        <View style={styles.trimmerTime}>
          <Text style={styles.trimmerTimeHeading}>Start Time :</Text>
          <TrimmerInput setTime={setStartTime} initialTime={initialStartTime} />
        </View>
        <View style={styles.trimmerTime}>
          <Text style={styles.trimmerTimeHeading}>End Time :</Text>
          <TrimmerInput setTime={setEndTime} initialTime={initialEndTime} />
        </View>
      </View>
    </View>
  );
};

Trimmer.defaultProps = {
  initialStartTime: 0,
  initialEndTime: 0,
  style: {},
};

Trimmer.propTypes = {
  initialStartTime: PropTypes.number,
  initialEndTime: PropTypes.number,
  style: PropTypes.object,
  setStartTime: PropTypes.func.isRequired,
  setEndTime: PropTypes.func.isRequired,
};

export default Trimmer;

const styles = StyleSheet.create({
  wrapper: {
    alignSelf: 'flex-start',
  },
  trimmerHead: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trimmerTimeHeading: {
    width: 80,
    fontSize: 13,
    color: '#757583',
  },
  trimmerHeadTitles: {
    flexDirection: 'row',
  },
  trimmerHeadTitle: {
    fontSize: 13,
    color: '#757583',
    letterSpacing: 0.2,
  },
  trimmerTime: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trimmerHeadTitleHours: {marginLeft: 5},
  trimmerHeadTitleMinutes: {marginLeft: 26},
  trimmerHeadTitleSeconds: {marginLeft: 17},
  trimmerTime: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
  },
  timeViewHeading: {
    letterSpacing: 0.2,
    // width: 90,
  },
  trimmerView: {
    // paddingLeft: 20,
  },
});
