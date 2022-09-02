import AsyncStorage from '@react-native-async-storage/async-storage';
import createDataContext from './createDataContext';

import loadFiles from '../utils/loadFiles';

const appReducer = (state, action) => {
  switch (action.type) {
    case 'add_permission':
      return {...state, permissions: {...state.permissions, ...action.payload}};
    case 'add_ffmpeg_statistics':
      return {
        ...state,
        statistics: {
          ...state.statistics,
          ...action.payload,
        },
      };
    case 'remove_ffmpeg_statistics':
      const newState = Object.assign({}, state);
      delete newState.statistics[action.payload];
      return {
        ...newState,
      };
    default:
      return state;
  }
};

const addPermission = dispatch => {
  return permission => {
    return dispatch({type: 'add_permission', payload: {[permission]: true}});
  };
};

const addFFmpegStatistics = dispatch => {
  return statistics => {
    return dispatch({
      type: 'add_ffmpeg_statistics',
      payload: {
        [statistics.executionId]: statistics,
      },
    });
  };
};

const removeFFmpegStatistics = dispatch => {
  return executionId => {
    return dispatch({
      type: 'remove_ffmpeg_statistics',
      payload: executionId,
    });
  };
};

export const {Context, Provider} = createDataContext(
  appReducer,
  {
    addPermission,
    addFFmpegStatistics,
    removeFFmpegStatistics,
  },
  {
    permissions: {},
    statistics: {},
  },
);
