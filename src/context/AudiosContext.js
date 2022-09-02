import AsyncStorage from '@react-native-async-storage/async-storage';
import createDataContext from './createDataContext';

import loadFiles from '../utils/loadFiles';

const audiosReducer = (state, action) => {
  switch (action.type) {
    case 'get_audios':
      return {
        ...state,
        audios: action.payload,
      };
    case 'get_audios_data':
      return {
        ...state,
        audiosData: action.payload,
      };
    case 'get_audios_thumbnails':
      return {
        ...state,
        audiosThumbnails: action.payload,
      };
    default:
      return state;
  }
};

const getAudios = dispatch => {
  return async () => {
    const audios = (await loadFiles('aac')).sort(
      (a, b) => new Date(b.mtime).getTime() - new Date(a.mtime).getTime(),
    );
    return dispatch({
      type: 'get_audios',
      payload: audios,
    });
  };
};

const getAudiosData = dispatch => {
  return async () => {
    let data = await AsyncStorage.getItem('audios');

    if (!data) {
      data = '{}';
    }

    return dispatch({
      type: 'get_audios_data',
      payload: JSON.parse(data),
    });
  };
};

const saveAudioData = dispatch => {
  return async audioData => {
    await AsyncStorage.mergeItem('audios', JSON.stringify(audioData));

    const audiosData = await AsyncStorage.getItem('audios');

    return dispatch({
      type: 'get_audios_data',
      payload: JSON.parse(audiosData),
    });
  };
};

const removeAudioData = (dispatch, state) => {
  return async name => {
    const {audiosData} = state;

    const data = Object.assign({}, audiosData);
    delete data[name];

    await AsyncStorage.setItem('audios', JSON.stringify(data));

    const updatedData = await AsyncStorage.getItem('audios');

    return dispatch({
      type: 'get_audios_data',
      payload: JSON.parse(updatedData),
    });
  };
};

export const {Context, Provider} = createDataContext(
  audiosReducer,
  {
    getAudios,
    getAudiosData,
    saveAudioData,
    removeAudioData,
  },
  {
    audios: [],
    audiosData: {},
    audiosThumbnails: {},
  },
);
