import {PermissionsAndroid} from 'react-native';

export const fileReadPermission = async addPermission => {
  if (
    !(await PermissionsAndroid.check(
      PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
    ))
  ) {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
    );
    if (granted === PermissionsAndroid.RESULTS.GRANTED) {
      addPermission(PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE);
      return true;
    } else {
      return false;
    }
  } else {
    addPermission(PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE);
    return true;
  }
};

export const fileWritePermission = async addPermission => {
  if (
    !(await PermissionsAndroid.check(
      PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
    ))
  ) {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
    );
    if (granted === PermissionsAndroid.RESULTS.GRANTED) {
      addPermission(PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE);
      return true;
    } else {
      return false;
    }
  } else {
    addPermission(PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE);
    return true;
  }
};

export const fileReadWritePermission = async addPermission => {
  if (
    !(await PermissionsAndroid.check(
      PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
    )) ||
    !(await PermissionsAndroid.check(
      PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
    ))
  ) {
    const granted = await PermissionsAndroid.requestMultiple([
      PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
      PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
    ]);

    const result = {};

    if (
      granted[PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE] ===
      PermissionsAndroid.RESULTS.GRANTED
    ) {
      addPermission(PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE);
      result.read = true;
    }
    if (
      granted[PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE] ===
      PermissionsAndroid.RESULTS.GRANTED
    ) {
      addPermission(PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE);
      result.write = true;
    }

    if (result.write) {
      return result;
    } else {
      return false;
    }
  } else {
    addPermission(PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE);
    addPermission(PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE);
    return {
      read: true,
      write: true,
    };
  }
};
