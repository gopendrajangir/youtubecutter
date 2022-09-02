import React, {useContext, useState, useMemo} from 'react';
import PropTypes from 'prop-types';

import {StyleSheet, Text, View, Image} from 'react-native';

import {RNFFmpeg} from 'react-native-ffmpeg';

import AntDesign from 'react-native-vector-icons/AntDesign';

import {Context as AppContext} from '../context/AppContext';
import {Context as TasksContext} from '../context/TasksContext';
import {Context as AudiosContext} from '../context/AudiosContext';
import {Context as VideosContext} from '../context/VideosContext';

import ProgressBar from './ProgressBar';
import ConfirmationModal from './ConfirmationModal';
import Button from './Button';

import showToast from '../utils/showToast';
import timeFormatter from '../utils/timeFormatter';
import {deleteVideoFile, deleteAudioFile} from '../utils/deleteFile';

import appStyles from '../appStyles';

const cancelTrimVideo = async (
  name,
  executionId,
  image,
  isTaskCancelled,
  type,
  removeTask,
  removeFFmpegStatistics,
  addPermission,
) => {
  isTaskCancelled.current = true;
  await RNFFmpeg.cancelExecution(executionId);
  removeTask(executionId);
  removeFFmpegStatistics(executionId);
  if (type === 'audio') {
    await deleteAudioFile(name, addPermission);
    showToast('TRIM_AUDIO_CANCELLED_MESSAGE');
  } else {
    await deleteVideoFile(name, image, addPermission);
    showToast('TRIM_VIDEO_CANCELLED_MESSAGE');
  }
};

const Task = ({
  navigation,
  name,
  startTime,
  endTime,
  executionId,
  url,
  videoId,
  videoUrl,
  srno,
  duration,
  qualities,
  selectedQuality,
  trimType,
  size,
  stats,
}) => {
  const [cancelTaskModalVisible, setCancelTaskModalVisible] = useState(false);
  const [image, setImage] = useState(null);

  const {removeFFmpegStatistics, addPermission} = useContext(AppContext);

  const {
    state: {isTaskCancelled},
    setTrimmerTask,
    removeTask,
  } = useContext(TasksContext);

  const {
    state: {audiosThumbnails},
  } = useContext(AudiosContext);

  const {
    state: {videosThumbnails},
  } = useContext(VideosContext);

  if (!image) {
    if (trimType === 'audio') {
      if (audiosThumbnails[videoId]) {
        setImage(audiosThumbnails[videoId]);
      }
    } else {
      if (videosThumbnails[name]) {
        setImage(videosThumbnails[name]);
      }
    }
  }

  return useMemo(() => {
    return (
      <View style={styles.container}>
        <ConfirmationModal
          modalVisible={cancelTaskModalVisible}
          setModalVisible={setCancelTaskModalVisible}
          onConfirm={async () => {
            await cancelTrimVideo(
              name,
              executionId,
              image,
              isTaskCancelled,
              trimType,
              removeTask,
              removeFFmpegStatistics,
              addPermission,
            );
          }}
          type="CANCEL_TASK"
        />
        <View style={styles.trimType}>
          <Text style={styles.trimTypeText}>
            {trimType === 'audio' ? 'AAC' : 'MP4'}
          </Text>
        </View>
        <View style={styles.imageWrapper}>
          {trimType === 'video' ? (
            <Image source={{uri: `file://${image}`}} style={styles.image} />
          ) : (
            <Image
              source={{uri: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`}}
              style={styles.image}
            />
          )}
          <View style={styles.srno}>
            <Text style={styles.srnoText}>{srno}</Text>
          </View>
        </View>
        <View style={styles.details}>
          <View style={styles.name}>
            <Text style={styles.nameText}>
              {name.substr(0, name.lastIndexOf('.mp4')) ||
                name.substr(0, name.lastIndexOf('.aac'))}
            </Text>
            <Text>...</Text>
          </View>
          <ProgressBar
            progressStats={stats}
            duration={endTime - startTime}
            style={styles.progressBar}
            size={size}
            textStyle={styles.progressBarText}
          />
          <View style={styles.times}>
            <AntDesign name="clockcircleo" style={styles.timesIcon} />
            <Text style={styles.time}>{timeFormatter(startTime)}</Text>
            <Text style={styles.timeDash}>-</Text>
            <Text style={styles.time}>{timeFormatter(endTime)}</Text>
          </View>
          <View style={styles.buttons}>
            <Button
              title="Open Trimmer"
              type="link_primary"
              style={{...styles.openTrimmerButton}}
              onPress={() => {
                setTrimmerTask({
                  executionId,
                  startTime,
                  endTime,
                  url,
                  videoId,
                  videoUrl,
                  qualities,
                  duration,
                  selectedQuality,
                  size,
                });
                navigation.navigate('Trimmer');
              }}
            />
            <Button
              title="Cancel"
              type="link_secondary"
              onPress={() => {
                setCancelTaskModalVisible(true);
              }}
              style={{
                ...styles.cancelButton,
              }}
            />
          </View>
        </View>
      </View>
    );
  }, [cancelTaskModalVisible, isTaskCancelled, image, stats]);
};

Task.propTypes = {
  navigation: PropTypes.object.isRequired,
  name: PropTypes.string.isRequired,
  startTime: PropTypes.number.isRequired,
  endTime: PropTypes.number.isRequired,
  executionId: PropTypes.number.isRequired,
  url: PropTypes.string.isRequired,
  videoId: PropTypes.string.isRequired,
  srno: PropTypes.number.isRequired,
  qualities: PropTypes.object.isRequired,
  selectedQuality: PropTypes.string.isRequired,
  trimType: PropTypes.string.isRequired,
  size: PropTypes.number.isRequired,
  duration: PropTypes.number.isRequired,
  stats: PropTypes.object,
};

export default Task;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginTop: 8,
    marginHorizontal: 8,
    backgroundColor: '#0B0B13',
    borderRadius: 5,
    position: 'relative',
  },
  imageWrapper: {
    height: 120,
    width: 120,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  image: {
    height: 100,
    width: 120,
    position: 'absolute',
  },
  imageIcon: {
    fontSize: 80,
    color: '#ddd',
  },
  srno: {
    position: 'absolute',
    top: -6,
    left: -6,
    backgroundColor: appStyles.colors.primary,
    width: 20,
    height: 20,
    borderRadius: 30,
    borderColor: appStyles.colors.screenBackground,
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
  },
  srnoText: {
    marginBottom: 2,
    fontSize: 10,
    color: '#fff',
  },
  trimType: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    borderWidth: 0.5,
    borderColor: '#fff',
    borderRadius: 5,
    height: 25,
    width: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  trimTypeText: {
    color: '#fff',
    fontSize: 12,
  },
  details: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  name: {
    width: 180,
    height: 20,
    flexDirection: 'row',
  },
  nameText: {
    fontSize: 13,
    textTransform: 'capitalize',
    color: '#ddd',
  },
  progressBar: {
    marginVertical: 8,
    height: 16,
  },
  progressStyle: {},
  progressBarText: {
    fontSize: 11,
  },
  times: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  timeDash: {
    fontWeight: '700',
    color: '#fff',
    marginHorizontal: 10,
  },
  time: {
    color: '#ddd',
    fontWeight: '400',
    fontSize: 12,
  },
  timesIcon: {
    color: '#ddd',
    marginRight: 8,
    fontSize: 13,
  },
  buttons: {
    flexDirection: 'row',
    marginTop: 6,
  },
  openTrimmerButton: {},
  cancelButton: {
    marginLeft: 20,
  },
});
