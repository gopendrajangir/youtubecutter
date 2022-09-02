import {ToastAndroid} from 'react-native';

export default errorType => {
  const errors = {
    TRIMMER_TIME_ERROR: 'Start time should be greater than start time',
    TRIMMER_TIME_EXCEED_ERROR: 'End time should be less than video duration',
    TRIM_VIDEO_FAILED_ERROR: 'Error while trimming the video. Try again.',
    TRIM_AUDIO_FAILED_ERROR: 'Error while trimming the audio. Try again.',
    TRIM_AUDIO_SUCCESS_MESSAGE: 'Audio trimmed successfully',
    TRIM_VIDEO_SUCCESS_MESSAGE: 'Video trimmed successfully',
    TRIM_AUDIO_CANCELLED_MESSAGE: 'Audio trimming is cancelled',
    TRIM_VIDEO_CANCELLED_MESSAGE: 'Video trimming is cancelled',
    YOUTUBE_PLAY_ERROR: 'Video unavailable. Watch on Youtube',
    INTERNAL_ERROR: 'Some Internal Error.',
    INVALID_URL_ERROR: 'Invalid URL',
    DELETE_FILE_ERROR: 'Error while deleting the file',
    DELETE_FILE_SUCCESS_MESSAGE: 'File deleted successfully',
    WRITE_PERMISSION_ERROR: 'File write permission not granted',
    READ_PERMISSION_ERROR: 'File read permission not granted',
    READ_WRITE_PERMISSION_ERROR: 'File read and write permissions not granted',
    OFFLINE_ERROR: 'You are offline',
    YOUTUBE_ERROR:
      'Error from youtube.\nMake sure you do not paste url of age restricted videos',
    START_ERROR:
      'Unable to load video. Check your internet connection and make sure you do not paste url of restricted videos',
  };
  ToastAndroid.show(errors[errorType], ToastAndroid.LONG);
};
