import RNFS from 'react-native-fs';

import {storageLocation} from '../constants';

export const makeRootDirectory = async () => {
  const dirExists = await RNFS.exists(storageLocation);
  if (!dirExists) {
    if (await RNFS.mkdir(storageLocation)) {
      return true;
    } else {
      return false;
    }
  } else {
    return true;
  }
};
