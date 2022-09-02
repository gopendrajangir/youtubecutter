import RNFS from 'react-native-fs';

export const storageLocation = `${
  RNFS.ExternalStorageDirectoryPath
    ? `${RNFS.ExternalStorageDirectoryPath}/youtubecutter`
    : RNFS.DocumentDirectoryPath
}`;

export const filePrefix = 'youtube_cutter_';
export const thumbnailPrefix = 'youtube_cutter_thumbnail_';
export const apiKey = 'AIzaSyAvsoJZ9ToMRDn6e6Wq1IhMN_yBaXIlXHg';
