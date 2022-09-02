import RNFS from 'react-native-fs';

import showToast from './showToast';

import {fileWritePermission} from './permissions';
import {storageLocation} from '../constants';

export const deleteVideoFile = async (
  name,
  image,
  addPermission,
  removeVideoThumbnail,
  removeVideoData,
) => {
  try {
    if (await fileWritePermission(addPermission)) {
      await RNFS.unlink(`${storageLocation}/${name}`);
      if (image) {
        if (RNFS.exists(image)) {
          await RNFS.unlink(image);
        }
        if (removeVideoThumbnail) {
          await removeVideoThumbnail(name);
        }
      }
      if (removeVideoData) {
        await removeVideoData(name);
      }
    } else {
      showToast('DELETE_FILE_ERROR');
    }
  } catch (err) {
    console.log(err);
    showToast('DELETE_FILE_ERROR');
  }
};

export const deleteAudioFile = async (name, addPermission, removeAudioData) => {
  try {
    if (await fileWritePermission(addPermission)) {
      await RNFS.unlink(`${storageLocation}/${name}`);
      if (removeAudioData) {
        await removeAudioData(name);
      }
    } else {
      showToast('DELETE_FILE_ERROR');
    }
  } catch (err) {
    console.log(err);
    showToast('DELETE_FILE_ERROR');
  }
};
