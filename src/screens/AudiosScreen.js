import React, {useState, useEffect, useContext, useMemo} from 'react';
import PropTypes from 'prop-types';

import {
  View,
  Text,
  Image,
  FlatList,
  Modal,
  ActivityIndicator,
  StyleSheet,
  PermissionsAndroid,
} from 'react-native';

import VideoPlayer from 'react-native-video-controls';

import {Context as AppContext} from '../context/AppContext';
import {Context as TasksContext} from '../context/TasksContext';
import {Context as AudiosContext} from '../context/AudiosContext';

import DownloadedAudio from '../components/DownloadedAudio';
import Button from '../components/Button';

import appStyles from '../appStyles';
import showToast from '../utils/showToast';
import {fileReadWritePermission} from '../utils/permissions';
import {makeRootDirectory} from '../utils/directoryMaker';

const audiosLoading = async (
  addPermission,
  getAudios,
  getAudiosData,
  setReady,
) => {
  try {
    if (await fileReadWritePermission(addPermission)) {
      await makeRootDirectory();
      await getAudiosData();
      await getAudios();
      setReady(true);
    } else {
      showToast('READ_WRITE_PERMISSION_ERROR');
    }
  } catch (err) {
    console.log(err);
    showToast('INTERNAL_ERROR');
  }
};

const AudiosScreen = ({navigation}) => {
  const [ready, setReady] = useState(false);
  const [refreshAudios, setRefreshAudios] = useState(true);
  const [showPlayer, setShowPlayer] = useState(false);
  const [playerFile, setPlayerFile] = useState('');

  const {
    state: {permissions},
    addPermission,
  } = useContext(AppContext);

  const {
    state: {tasks},
  } = useContext(TasksContext);

  const {
    state: {audios, audiosData},
    getAudios,
    getAudiosData,
  } = useContext(AudiosContext);

  useEffect(() => {
    audiosLoading(addPermission, getAudios, getAudiosData, setReady);

    const unsubscriber = navigation.addListener('focus', () => {
      audiosLoading(addPermission, getAudios, getAudiosData, setReady);
    });

    return () => {
      unsubscriber();
    };
  }, []);

  useEffect(() => {
    const unsubscriber = navigation.addListener('blur', e => {
      setShowPlayer(false);
    });

    return () => {
      unsubscriber();
    };
  }, []);

  useEffect(() => {
    setRefreshAudios(!refreshAudios);
  }, [audios]);

  return useMemo(() => {
    const tasksNames = tasks.map(({name}) => name);

    const audioFiles = audios.filter(item => {
      return !tasksNames.includes(item.name);
    });

    let permissionsGranted;

    if (!permissions[PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE]) {
      permissionsGranted = false;
    } else {
      permissionsGranted = true;
    }

    return (
      <View
        style={{
          ...styles.container,
          ...(showPlayer ? {paddingTop: 0} : {paddingTop: 60}),
        }}>
        {!permissionsGranted ? (
          <View style={styles.noPermissions}>
            <Text style={styles.noPermissionsText}>
              You haven't given file read access to this app
            </Text>
            <Button
              type="outline_secondary"
              title="Give Permissions"
              onPress={() => {
                audiosLoading(
                  addPermission,
                  getAudios,
                  getAudiosData,
                  setReady,
                );
              }}
              style={styles.noPermissionsButton}
            />
          </View>
        ) : (
          <>
            {!ready ? (
              <View style={styles.gettingInfo}>
                <Text style={styles.noDownloadsText}>Getting Info</Text>
                <ActivityIndicator
                  size="large"
                  color={appStyles.colors.primary}
                />
              </View>
            ) : (
              <>
                {!audioFiles.length && (
                  <View style={styles.noDownloads}>
                    <Image
                      style={styles.emptyImage}
                      source={require('../../assets/empty.png')}
                    />
                    <Text style={styles.noDownloadsText}>No Audios</Text>
                  </View>
                )}
                <FlatList
                  style={styles.list}
                  data={audioFiles}
                  keyExtractor={item => item.name}
                  renderItem={({item, index}) => (
                    <DownloadedAudio
                      name={item.name}
                      srno={index + 1}
                      size={item.size}
                      info={audiosData[item.name]}
                      setShowPlayer={setShowPlayer}
                      setPlayerFile={setPlayerFile}
                    />
                  )}
                />
              </>
            )}
            <Modal
              visible={showPlayer}
              onRequestClose={() => setShowPlayer(false)}>
              <VideoPlayer
                source={{
                  uri: playerFile,
                }}
                poster={
                  Image.resolveAssetSource(
                    require('../../assets/audio-thumbnail.jpg'),
                  ).uri
                }
                style={styles.videoPlayer}
                resizeMode="contain"
                disableBack={true}
                showOnStart={true}
              />
            </Modal>
          </>
        )}
      </View>
    );
  }, [ready, showPlayer, playerFile, permissions, tasks, audios]);
};

AudiosScreen.propTypes = {
  navigation: PropTypes.object.isRequired,
};

export default AudiosScreen;

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: appStyles.colors.screenBackground,
    height: '100%',
    paddingTop: 60,
    paddingBottom: 10,
  },
  noDownloads: {
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  noDownloadsText: {
    color: '#fff',
    opacity: 0.3,
    fontSize: 18,
    fontWeight: '600',
    marginTop: 20,
    marginBottom: 50,
  },
  emptyImage: {
    width: 200,
    height: 150,
  },
  list: {
    marginTop: 5,
    width: '100%',
  },
  videoPlayerWrapper: {
    position: 'absolute',
    top: 60,
    left: 0,
    width: '100%',
    height: '100%',
  },
  videoPlayer: {
    position: 'relative',
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0,0,0,0.9)',
  },
  closeButton: {
    position: 'absolute',
    top: 15,
    right: 15,
  },
  closeButtonIcon: {
    color: '#999',
    fontSize: 30,
  },
  noPermissions: {
    height: '100%',
    justifyContent: 'center',
    paddingHorizontal: 50,
  },
  noPermissionsText: {
    color: '#ccc',
    marginBottom: 20,
    fontSize: 16,
    textAlign: 'center',
  },
  gettingInfo: {
    height: '100%',
    justifyContent: 'center',
  },
  audiosHeader: {
    flexDirection: 'row',
    width: '100%',
    height: 55,
    borderTopWidth: 1,
    borderTopColor: appStyles.colors.secondaryFade,
    borderBottomWidth: 1,
    borderBottomColor: appStyles.colors.secondaryFade,
  },
  audiosHeaderItem: {
    flex: 1,
    height: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  audiosHeaderItemIcon: {
    color: '#757583',
    fontSize: 16,
    marginRight: 8,
  },
  audiosHeaderItemSelected: {
    backgroundColor: appStyles.colors.secondaryFade,
  },
  audiosHeaderItemText: {
    fontWeight: '600',
    color: '#757583',
  },
});
