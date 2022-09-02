import React from 'react';
import PropTypes from 'prop-types';
import {StyleSheet, Text, View} from 'react-native';

import noRoundToFixed from '../utils/noRoundToFixed';

import appStyles from '../appStyles';

const ProgressBar = ({
  progressStats,
  duration,
  size,
  style,
  progressStyle,
  textStyle,
}) => {
  let progress;

  if (progressStats) {
    progress = progressStats.time / 1000 / duration;
  } else {
    progress = 0;
  }

  if (progress > 1) {
    progress = 1;
  }

  return (
    <View style={{...styles.bar, ...style}}>
      <View
        style={{
          width: `${progress * 100}%`,
          ...styles.progress,
          ...progressStyle,
        }}></View>
      <View style={styles.progressTextWrapper}>
        <Text style={{...styles.progressText, ...textStyle}}>
          {noRoundToFixed(progress * 100)}% | ~ {noRoundToFixed(size)} mb
        </Text>
      </View>
    </View>
  );
};

ProgressBar.defaultProps = {
  style: {},
  progressStyle: {},
  textStyle: {},
};

ProgressBar.propTypes = {
  progressStats: PropTypes.object,
  duration: PropTypes.number.isRequired,
  style: PropTypes.object,
  progressStyle: PropTypes.object,
  textStyle: PropTypes.object,
  size: PropTypes.number.isRequired,
};

export default ProgressBar;

const styles = StyleSheet.create({
  bar: {
    height: 20,
    borderRadius: 4,
    flexDirection: 'row',
    position: 'relative',
    alignItems: 'center',
    overflow: 'hidden',
    backgroundColor: appStyles.colors.secondaryFade,
  },
  progress: {
    position: 'absolute',
    height: '100%',
    alignSelf: 'flex-start',
    backgroundColor: appStyles.colors.primary,
  },
  progressText: {
    color: '#ccc',
  },
  progressTextWrapper: {
    position: 'absolute',
    height: '100%',
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    alignSelf: 'flex-start',
  },
});
