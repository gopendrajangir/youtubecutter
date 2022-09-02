import React, {useState, useEffect, useContext, useRef, useMemo} from 'react';
import PropTypes from 'prop-types';

import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Keyboard,
  TouchableOpacity,
} from 'react-native';
import NetInfo from '@react-native-community/netinfo';

import {RNFFmpeg} from 'react-native-ffmpeg';
import ytdl from 'react-native-ytdl';
import YouTube from 'react-native-youtube';

import Entypo from 'react-native-vector-icons/Entypo';

import {Context as AppContext} from '../context/AppContext';
import {Context as TasksContext} from '../context/TasksContext';
import {Context as VideosContext} from '../context/VideosContext';
import {Context as AudiosContext} from '../context/AudiosContext';

import Trimmer from '../components/Trimmer';
import ProgressBar from '../components/ProgressBar';
import ConfirmationModal from '../components/ConfirmationModal';
import Button from '../components/Button';

import timeFormatter from '../utils/timeFormatter';
import showToast from '../utils/showToast';
import generateThumbnail from '../utils/generateThumbnail';
import {fileWritePermission} from '../utils/permissions';
import {makeRootDirectory} from '../utils/directoryMaker';
import {deleteAudioFile, deleteVideoFile} from '../utils/deleteFile';

import {storageLocation, filePrefix, apiKey} from '../constants';

import appStyles from '../appStyles';

const onSubmit = (
  startTime,
  endTime,
  url,
  videoId,
  videoUrl,
  isMounted,
  isTaskCancelled,
  qualities,
  selectedQuality,
  quality,
  videoDuration,
  trimType,
  setIsProcessing,
  removeFFmpegStatistics,
  setRefreshTasks,
  addTask,
  removeTask,
  saveVideoThumbnail,
  setTrimmerTask,
  setCancelTaskModalVisible,
  setNewTaskModalVisible,
  getVideos,
  getAudios,
  setImage,
) => {
  (async () => {
    if (startTime >= endTime) {
      showToast('TRIMMER_TIME_ERROR');
    } else if (endTime > videoDuration + 1) {
      showToast('TRIMMER_TIME_EXCEED_ERROR');
    } else {
      if (endTime > videoDuration && endTime < videoDuration + 1) {
        endTime = videoDuration;
      }

      try {
        setIsProcessing(true);

        if (quality) {
          selectedQuality = quality;
        }

        const sTime = timeFormatter(startTime);
        const duration = timeFormatter(endTime - startTime);

        let fileName;
        let command;
        let ytVideoUrl;
        let trimmedSize;

        if (trimType === 'audio') {
          fileName = filePrefix + new Date().getTime() + '.aac';
          const itag = Object.keys(qualities.audios)[0];

          const audioUrl = (
            await ytdl(url, {
              quality: itag,
            })
          )[0].url;

          const size = qualities.audios[itag].size;
          const ratio = size / videoDuration;

          trimmedSize = ((endTime - startTime) * ratio) / 1024 / 1024;

          command = `-ss ${sTime} -i ${audioUrl} -t ${duration} ${storageLocation}/${fileName}`;
        } else {
          fileName = filePrefix + new Date().getTime() + '.mp4';

          const audioItag = Object.keys(qualities.audios)[0];
          const videoItag = Object.keys(qualities.videos[selectedQuality])[0];

          ytVideoUrl = (
            await ytdl(url, {
              quality: videoItag,
            })
          )[0].url;

          const audioUrl = (
            await ytdl(url, {
              quality: audioItag,
            })
          )[0].url;

          const audioSize = qualities.audios[audioItag].size;
          const videoSize = qualities.videos[selectedQuality][videoItag].size;

          const audioRatio = audioSize / videoDuration;
          const videoRatio = videoSize / videoDuration;

          const audioTrimmedSize =
            ((endTime - startTime) * audioRatio) / 1024 / 1024;
          const videoTrimmedSize =
            ((endTime - startTime) * videoRatio) / 1024 / 1024;

          trimmedSize = audioTrimmedSize + videoTrimmedSize;

          command = `-ss ${sTime}  -t ${duration} -i ${ytVideoUrl} -ss ${sTime} -t ${duration} -i ${audioUrl} -c:v libx264 -c:a aac ${storageLocation}/${fileName}`;
        }

        if (!(await makeRootDirectory)) {
          showToast('INTERNAL_ERROR');
          if (isMounted.current) {
            setIsProcessing(false);
          }
          return;
        }

        const executionId = await RNFFmpeg.executeAsync(
          command,
          completedExecution => {
            if (isMounted.current) {
              if (completedExecution.returnCode === 0) {
                if (trimType === 'video') {
                  getVideos();
                  showToast('TRIM_VIDEO_SUCCESS_MESSAGE');
                } else {
                  getAudios();
                  showToast('TRIM_AUDIO_SUCCESS_MESSAGE');
                }
                console.log('FFmpeg process completed successfully');
              } else {
                if (!isTaskCancelled.current) {
                  RNFFmpeg.cancelExecution(executionId);
                  if (trimType === 'video') {
                    showToast('TRIM_VIDEO_FAILED_ERROR');
                  } else {
                    showToast('TRIM_AUDIO_FAILED_ERROR');
                  }
                  console.log(
                    `FFmpeg process failed with rc=${completedExecution.returnCode}.`,
                  );
                } else {
                  isTaskCancelled.current = false;
                }
              }
              setIsProcessing(false);
              setCancelTaskModalVisible(false);
              setNewTaskModalVisible(false);
            }
            removeFFmpegStatistics(executionId);
            removeTask(executionId);
            setRefreshTasks();
          },
        );

        const task = {
          name: fileName,
          startTime,
          endTime,
          executionId,
          url,
          videoId,
          videoUrl,
          qualities,
          selectedQuality,
          duration: videoDuration,
          trimType,
          size: trimmedSize,
        };

        addTask(task);
        setTrimmerTask(task);

        if (trimType === 'video') {
          const image = await generateThumbnail({
            url: videoUrl,
            time: startTime,
          });

          saveVideoThumbnail({
            [fileName]: image,
          });

          if (isMounted.current) {
            setImage(image);
          }
        }
      } catch (err) {
        if (isMounted.current) {
          console.log(err);
          showToast('INTERNAL_ERROR');
          setIsProcessing(false);
        }
      }
    }
  })();
};

const cancelTrimVideo = async (
  executionId,
  removeFFmpegStatistics,
  removeTask,
  isTaskCancelled,
  trimType,
  name,
  image,
  addPermission,
) => {
  try {
    isTaskCancelled.current = true;
    await RNFFmpeg.cancelExecution(executionId);
    removeFFmpegStatistics(executionId);
    removeTask(executionId);
    if (trimType === 'audio') {
      await deleteAudioFile(name, addPermission);
      showToast('TRIM_AUDIO_CANCELLED_MESSAGE');
    } else {
      console.log('Hellooooooooooo');
      await deleteVideoFile(name, image, addPermission);
      showToast('TRIM_VIDEO_CANCELLED_MESSAGE');
    }
  } catch (err) {
    console.log(err);
    showToast('INTERNAL_ERROR');
  }
};

const TrimmerScreen = ({navigation}) => {
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [closeTrimmerModalVisible, setCloseTrimmerModalVisible] =
    useState(false);
  const [cancelTaskModalVisible, setCancelTaskModalVisible] = useState(false);
  const [newTaskModalVisible, setNewTaskModalVisible] = useState(false);
  const [navigationDataAction, setNavigationDataAction] = useState(null);
  const [quality, setQuality] = useState(null);
  const [trimType, setTrimType] = useState(null);
  const [isPaused, setIsPaused] = useState(true);
  const [image, setImage] = useState(null);
  const [showPlayer, setShowPlayer] = useState(true);

  const isMounted = useRef(false);
  const scrollViewRef = useRef(null);
  const isFocused = useRef(true);

  const {
    state: {statistics},
    addPermission,
    removeFFmpegStatistics,
  } = useContext(AppContext);

  const {
    state: {trimmerTask, isTaskCancelled},
    addTask,
    setTrimmerTask,
    removeTask,
    setRefreshTasks,
  } = useContext(TasksContext);

  const {getVideos, saveVideoThumbnail} = useContext(VideosContext);

  const {getAudios} = useContext(AudiosContext);

  useEffect(() => {
    isMounted.current = true;
    isFocused.current = true;

    const focusUnsubscriber = navigation.addListener('focus', () => {
      isFocused.current = true;
      setShowPlayer(true);
    });

    const blurUnsubscriber = navigation.addListener('blur', () => {
      setShowPlayer(false);
      setIsPaused(true);
      isFocused.current = false;
    });

    return () => {
      isMounted.current = false;
      focusUnsubscriber();
      blurUnsubscriber();
    };
  }, []);

  useEffect(() => {
    const unsubscriber = navigation.addListener('beforeRemove', e => {
      e.preventDefault();
      setCloseTrimmerModalVisible(true);
      setNavigationDataAction(e.data.action);
    });

    return () => {
      unsubscriber();
    };
  }, []);

  useEffect(() => {
    const showKeyboardSubscriber = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        scrollViewRef.current.scrollToEnd({animated: true});
      },
    );
    return () => {
      showKeyboardSubscriber.remove();
    };
  });

  return useMemo(() => {
    const {
      name,
      startTime: initialStartTime = 0,
      endTime: initialEndTime = 0,
      url,
      videoId,
      videoUrl,
      executionId,
      qualities,
      selectedQuality,
      duration,
      size,
    } = trimmerTask;

    const labels = [
      ...Object.keys(qualities.merged),
      ...Object.keys(qualities.videos),
    ].sort((a, b) => b - a);

    const stats = statistics[executionId];

    return (
      <View style={styles.container}>
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={styles.scrollView}
          keyboardShouldPersistTaps="always">
          <ConfirmationModal
            modalVisible={closeTrimmerModalVisible}
            setModalVisible={setCloseTrimmerModalVisible}
            onConfirm={() => navigation.dispatch(navigationDataAction)}
            type="CLOSE_TRIMMER"
          />
          <ConfirmationModal
            modalVisible={cancelTaskModalVisible}
            setModalVisible={setCancelTaskModalVisible}
            onConfirm={async () => {
              await cancelTrimVideo(
                executionId,
                removeFFmpegStatistics,
                removeTask,
                isTaskCancelled,
                trimType,
                name,
                image,
                addPermission,
              );
              setCancelTaskModalVisible(false);
            }}
            type="CANCEL_TASK"
          />
          <ConfirmationModal
            modalVisible={newTaskModalVisible}
            setModalVisible={setNewTaskModalVisible}
            onConfirm={() => {
              setTrimmerTask({
                url,
                videoId,
                qualities,
                videoUrl,
                duration,
                selectedQuality: quality ? quality : selectedQuality,
              });
              setIsProcessing(false);
              setNewTaskModalVisible(false);
            }}
            type="NEW_TASK"
          />
          {showPlayer && (
            <YouTube
              videoId={videoId} // The YouTube video ID
              apiKey={apiKey}
              style={styles.videoPlayer}
            />
          )}
          {/* <VideoPlayer
            source={{
              uri: videoUrl,
            }}
            paused={isPaused}
            onPause={() => {
              setIsPaused(true);
            }}
            onPlay={() => {
              setIsPaused(false);
            }}
            style={styles.videoPlayer}
            disableBack={true}
            showOnStart={true}
          /> */}
          {stats && (
            <View style={styles.progressBarWrapper}>
              <ProgressBar
                progressStats={stats}
                duration={initialEndTime - initialStartTime}
                barStyle={{marginTop: 20, marginBottom: 10}}
                size={size}
              />
            </View>
          )}
          <>
            <ScrollView horizontal={true} style={styles.labels}>
              {labels.map(label => {
                return (
                  <TouchableOpacity
                    key={label}
                    style={{
                      ...styles.qualityLabel,
                      ...(quality
                        ? quality === label
                          ? styles.selectedQualityLabel
                          : {}
                        : selectedQuality === label
                        ? styles.selectedQualityLabel
                        : {}),
                    }}
                    onPress={() => {
                      return setQuality(label);
                    }}>
                    <Text
                      style={{
                        ...styles.qualityLabelText,
                        ...(quality
                          ? quality === label
                            ? styles.selectedQualityLabelText
                            : {}
                          : selectedQuality === label
                          ? styles.selectedQualityLabelText
                          : {}),
                      }}>
                      {label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
            <Trimmer
              style={styles.trimmer}
              initialStartTime={initialStartTime}
              initialEndTime={initialEndTime}
              setStartTime={setStartTime}
              setEndTime={setEndTime}
            />
            <View style={styles.buttons}>
              {stats && (
                <>
                  <Button
                    type="outline_secondary"
                    title="Cancel"
                    onPress={() => {
                      setCancelTaskModalVisible(true);
                    }}
                    style={styles.cancelButton}
                  />
                  <Button
                    title="New"
                    onPress={() => setNewTaskModalVisible(true)}
                    style={styles.newButton}
                  />
                </>
              )}
              {!stats && (
                <>
                  <Button
                    title="Trim"
                    disabled={isProcessing || stats}
                    loading={(isProcessing || stats) && trimType === 'video'}
                    onPress={() => {
                      (async () => {
                        try {
                          Keyboard.dismiss();
                          const allowed = await fileWritePermission(
                            addPermission,
                          );
                          const {isConnected} = await NetInfo.fetch();
                          if (!isConnected) {
                            return showToast('OFFLINE_ERROR');
                          }
                          if (allowed) {
                            setTrimType('video');
                            onSubmit(
                              startTime,
                              endTime,
                              url,
                              videoId,
                              videoUrl,
                              isMounted,
                              isTaskCancelled,
                              qualities,
                              selectedQuality,
                              quality,
                              duration,
                              'video',
                              setIsProcessing,
                              removeFFmpegStatistics,
                              setRefreshTasks,
                              addTask,
                              removeTask,
                              saveVideoThumbnail,
                              setTrimmerTask,
                              setCancelTaskModalVisible,
                              setNewTaskModalVisible,
                              getVideos,
                              getAudios,
                              setImage,
                            );
                          } else {
                            showToast('WRITE_PERMISSION_ERROR');
                          }
                        } catch (err) {
                          return showToast('INTERNAL_ERROR');
                        }
                      })();
                    }}
                    style={{
                      ...styles.trimButton,
                    }}
                    IconType={Entypo}
                    iconName="scissors"
                  />
                  <Button
                    title="Trim + Convert To Audio"
                    type="link_primary"
                    disabled={isProcessing || stats}
                    loading={(isProcessing || stats) && trimType === 'audio'}
                    onPress={() => {
                      (async () => {
                        try {
                          Keyboard.dismiss();
                          const allowed = await fileWritePermission(
                            addPermission,
                          );
                          const {isConnected} = await NetInfo.fetch();
                          if (!isConnected) {
                            return showToast('OFFLINE_ERROR');
                          }
                          if (allowed) {
                            setTrimType('audio');
                            onSubmit(
                              startTime,
                              endTime,
                              url,
                              videoId,
                              videoUrl,
                              isMounted,
                              isTaskCancelled,
                              qualities,
                              selectedQuality,
                              quality,
                              duration,
                              'audio',
                              setIsProcessing,
                              removeFFmpegStatistics,
                              setRefreshTasks,
                              addTask,
                              removeTask,
                              saveVideoThumbnail,
                              setTrimmerTask,
                              setCancelTaskModalVisible,
                              setNewTaskModalVisible,
                              getVideos,
                              getAudios,
                            );
                          } else {
                            showToast('WRITE_PERMISSION_ERROR');
                          }
                        } catch (err) {
                          console.log(err);
                          return showToast('INTERNAL_ERROR');
                        }
                      })();
                    }}
                    style={{
                      ...styles.trimButton,
                      ...styles.trimAudioButton,
                    }}
                  />
                </>
              )}
            </View>
          </>
        </ScrollView>
      </View>
    );
  }, [
    startTime,
    endTime,
    isProcessing,
    closeTrimmerModalVisible,
    cancelTaskModalVisible,
    newTaskModalVisible,
    navigationDataAction,
    quality,
    trimType,
    isPaused,
    statistics,
    trimmerTask,
    isTaskCancelled,
    removeFFmpegStatistics,
    showPlayer,
  ]);
};

TrimmerScreen.propTypes = {
  navigation: PropTypes.object.isRequired,
};

export default TrimmerScreen;

const styles = StyleSheet.create({
  container: {
    alignItems: 'stretch',
    height: '100%',
    backgroundColor: appStyles.colors.screenBackground,
  },
  scrollView: {
    paddingBottom: 16,
  },
  youtubePlayer: {
    width: '100%',
    height: 225,
    marginBottom: 20,
  },
  videoPlayer: {
    width: '100%',
    height: 225,
    marginBottom: 20,
  },
  progressBarWrapper: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  trimmer: {
    marginTop: 20,
    marginLeft: 40,
  },
  labels: {
    alignSelf: 'stretch',
    marginHorizontal: 16,
    overflow: 'visible',
  },
  qualityLabel: {
    borderWidth: 1,
    borderColor: appStyles.colors.secondaryFade,
    padding: 12,
    borderRadius: 5,
    marginRight: 10,
  },
  selectedQualityLabel: {
    borderColor: appStyles.colors.primary,
    backgroundColor: appStyles.colors.primary,
  },
  qualityLabelText: {
    color: '#666',
    fontSize: 12,
  },
  selectedQualityLabelText: {
    color: '#ddd',
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 30,
    paddingHorizontal: 16,
  },
  trimButton: {
    height: 47,
    paddingHorizontal: 20,
  },
  trimAudioButton: {
    marginLeft: 10,
    width: 200,
  },
  cancelButton: {
    height: 47,
    width: 110,
    marginRight: 20,
  },
  newButton: {
    height: 47,
    width: 110,
  },
});
