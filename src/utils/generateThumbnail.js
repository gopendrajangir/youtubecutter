import RNFS from 'react-native-fs';
import {RNFFmpeg} from 'react-native-ffmpeg';

import timeFormatter from './timeFormatter';

import {storageLocation, thumbnailPrefix} from '../constants';

export default async ({name, url, time = 0}) => {
  return new Promise((resolve, reject) => {
    try {
      (async () => {
        const file = `${
          RNFS.CachesDirectoryPath
        }/${thumbnailPrefix}${new Date().getTime()}.png`;
        await RNFFmpeg.executeAsync(
          `-ss ${timeFormatter(time)} -i ${
            name ? `file://${storageLocation}/${name}` : url
          } -vframes 1 ${file}`,
          res => {
            if (res.returnCode === 0) {
              resolve(file);
            } else {
              resolve(null);
            }
          },
        );
      })();
    } catch (err) {
      reject(err);
    }
  });
};
