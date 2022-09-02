import AsyncStorage from '@react-native-async-storage/async-storage';
import createDataContext from './createDataContext';

import loadFiles from '../utils/loadFiles';

const videosReducer = (state, action) => {
  switch (action.type) {
    case 'get_videos':
      return {
        ...state,
        videos: action.payload,
      };
    case 'get_videos_data':
      return {
        ...state,
        videosData: action.payload,
      };
    case 'get_videos_thumbnails':
      return {
        ...state,
        videosThumbnails: action.payload,
      };
    default:
      return state;
  }
};

const getVideos = dispatch => {
  return async () => {
    const videos = (await loadFiles('mp4')).sort(
      (a, b) => new Date(b.mtime).getTime() - new Date(a.mtime).getTime(),
    );
    return dispatch({
      type: 'get_videos',
      payload: videos,
    });
  };
};

const getVideosData = dispatch => {
  return async () => {
    let data = await AsyncStorage.getItem('videos');

    if (!data) {
      data = '{}';
    }

    return dispatch({
      type: 'get_videos_data',
      payload: JSON.parse(data),
    });
  };
};

const saveVideoData = dispatch => {
  return async videoData => {
    await AsyncStorage.mergeItem('videos', JSON.stringify(videoData));

    const videosData = await AsyncStorage.getItem('videos');

    return dispatch({
      type: 'get_videos_data',
      payload: JSON.parse(videosData),
    });
  };
};

const removeVideoData = (dispatch, state) => {
  return async name => {
    const {videosData} = state;

    const data = Object.assign({}, videosData);
    delete data[name];

    await AsyncStorage.setItem('videos', JSON.stringify(data));

    const updatedData = await AsyncStorage.getItem('videos');

    return dispatch({
      type: 'get_videos_data',
      payload: JSON.parse(updatedData),
    });
  };
};

const getVideosThumbnails = dispatch => {
  return async () => {
    let thumbnails = await AsyncStorage.getItem('videos_thumbnails');

    if (!thumbnails) {
      thumbnails = '{}';
    }

    return dispatch({
      type: 'get_videos_thumbnails',
      payload: JSON.parse(thumbnails),
    });
  };
};

const saveVideoThumbnail = dispatch => {
  return async thumbnail => {
    await AsyncStorage.mergeItem(
      'videos_thumbnails',
      JSON.stringify(thumbnail),
    );

    const thumbnails = await AsyncStorage.getItem('videos_thumbnails');

    return dispatch({
      type: 'get_videos_thumbnails',
      payload: JSON.parse(thumbnails),
    });
  };
};

const removeVideoThumbnail = (dispatch, state) => {
  return async name => {
    const {videosThumbnails} = state;

    const thumbnails = Object.assign({}, videosThumbnails);
    delete thumbnails[name];

    await AsyncStorage.setItem('videos_thumbnails', JSON.stringify(thumbnails));

    const updatedThumbnails = await AsyncStorage.getItem('videos_thumbnails');

    return dispatch({
      type: 'get_videos_thumbnails',
      payload: JSON.parse(updatedThumbnails),
    });
  };
};

export const {Context, Provider} = createDataContext(
  videosReducer,
  {
    getVideos,
    getVideosData,
    saveVideoData,
    removeVideoData,
    getVideosThumbnails,
    saveVideoThumbnail,
    removeVideoThumbnail,
  },
  {
    videos: [],
    videosData: {},
    videosThumbnails: {},
  },
);
