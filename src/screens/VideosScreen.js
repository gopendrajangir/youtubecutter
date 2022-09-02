import React, {useState, useEffect, useContext, useMemo} from 'react';
import PropTypes from 'prop-types';

import {
  View,
  Text,
  Image,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  PermissionsAndroid,
  Modal,
} from 'react-native';

import VideoPlayer from 'react-native-video-controls';

import {Context as AppContext} from '../context/AppContext';
import {Context as TasksContext} from '../context/TasksContext';
import {Context as VideosContext} from '../context/VideosContext';

import DownloadedVideo from '../components/DownloadedVideo';
import Button from '../components/Button';

import appStyles from '../appStyles';
import showToast from '../utils/showToast';
import {fileReadWritePermission} from '../utils/permissions';
import {makeRootDirectory} from '../utils/directoryMaker';

const videosLoading = async (
  addPermission,
  getVideos,
  getVideosData,
  getVideosThumbnails,
  setReady,
) => {
  try {
    if (await fileReadWritePermission(addPermission)) {
      await makeRootDirectory();
      await getVideosThumbnails();
      await getVideosData();
      await getVideos();
      setReady(true);
    } else {
      showToast('READ_WRITE_PERMISSION_ERROR');
    }
  } catch (err) {
    console.log(err);
    showToast('INTERNAL_ERROR');
  }
};

const VideosScreen = ({navigation}) => {
  const [ready, setReady] = useState(false);
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
    state: {videos, videosData, videosThumbnails},
    getVideos,
    getVideosData,
    getVideosThumbnails,
  } = useContext(VideosContext);

  useEffect(() => {
    videosLoading(
      addPermission,
      getVideos,
      getVideosData,
      getVideosThumbnails,
      setReady,
    );

    const unsubscriber = navigation.addListener('focus', () => {
      videosLoading(
        addPermission,
        getVideos,
        getVideosData,
        getVideosThumbnails,
        setReady,
      );
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

  return useMemo(() => {
    const tasksNames = tasks.map(({name}) => name);

    const videoFiles = videos.filter(item => {
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
                videosLoading(
                  addPermission,
                  getVideos,
                  getVideosData,
                  getVideosThumbnails,
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
                {!videoFiles.length && (
                  <View style={styles.noDownloads}>
                    <Image
                      style={styles.emptyImage}
                      source={require('../../assets/empty.png')}
                    />
                    <Text style={styles.noDownloadsText}>No Videos</Text>
                  </View>
                )}
                <FlatList
                  style={styles.list}
                  data={videoFiles}
                  keyExtractor={item => item.name}
                  renderItem={({item, index}) => (
                    <DownloadedVideo
                      name={item.name}
                      srno={index + 1}
                      size={item.size}
                      info={videosData[item.name]}
                      image={videosThumbnails[item.name]}
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
  }, [ready, showPlayer, playerFile, permissions, tasks, videos]);
};

VideosScreen.propTypes = {
  navigation: PropTypes.object.isRequired,
};

export default VideosScreen;

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
  videoPlayer: {
    width: '100%',
    height: '60%',
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
});
