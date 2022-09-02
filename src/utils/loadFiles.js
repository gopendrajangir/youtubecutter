import RNFS from 'react-native-fs';

import {storageLocation} from '../constants';

export default async type => {
  const info = await RNFS.readDir(storageLocation);
  const files = info.filter(item => {
    if (type === 'mp4') {
      return (
        item.isFile() && item.name.substr(item.name.lastIndexOf('.')) === '.mp4'
      );
    } else if (type === 'aac') {
      return (
        item.isFile() && item.name.substr(item.name.lastIndexOf('.')) === '.aac'
      );
    }
  });
  return files;
};
