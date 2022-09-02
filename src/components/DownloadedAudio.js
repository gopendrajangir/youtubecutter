import React, {useState, useEffect, useContext, useMemo} from 'react';
import PropTypes from 'prop-types';
import {Text, View, Image, TouchableOpacity, StyleSheet} from 'react-native';

import {RNFFprobe} from 'react-native-ffmpeg';
import Share from 'react-native-share';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Entypo from 'react-native-vector-icons/Entypo';

import {Context as AppContext} from '../context/AppContext';
import {Context as AudiosContext} from '../context/AudiosContext';

import DeleteConfirmationModal from './DeleteConfirmationModal';
import Button from './Button';

import timeFormatter from '../utils/timeFormatter';
import showToast from '../utils/showToast';
import {deleteAudioFile} from '../utils/deleteFile';

import {storageLocation} from '../constants';

import appStyles from '../appStyles';

const getAudioInfo = async name => {
  let info = (
    await RNFFprobe.getMediaInformation(`${storageLocation}/${name}`)
  ).getMediaProperties();

  if (info && info.duration && info.size) {
    return {
      duration: timeFormatter(info.duration),
      size: (info.size / 1024 / 1024).toFixed(2),
    };
  } else {
    return null;
  }
};

const shareFile = async fileName => {
  try {
    await Share.open({
      message: fileName,
      url: `file://${fileName}`,
    });
  } catch (err) {
    console.log(err);
  }
};

const DownloadedAudio = ({
  name,
  srno,
  size,
  setShowPlayer,
  setPlayerFile,
  info,
}) => {
  const [deleteAudioModalVisible, setDeleteAudioModalVisible] = useState(false);
  const [currentInfo, setCurrentInfo] = useState(null);

  const {addPermission} = useContext(AppContext);

  const {
    state: {audiosData},
    getAudios,
    saveAudioData,
    removeAudioData,
  } = useContext(AudiosContext);

  useEffect(() => {
    const info = audiosData[name];
    if (!info) {
      getAudioInfo(name).then(async info => {
        if (info) {
          saveAudioData({
            [name]: {duration: info.duration, size: info.size},
          });
          setCurrentInfo({duration: info.duration, size: info.size});
        } else {
          setCurrentInfo({
            duration: timeFormatter(0),
            size: (size / 1024 / 1024).toFixed(2),
          });
        }
      });
    }
  }, []);

  return useMemo(() => {
    const audioInfo = info ? info : currentInfo;

    return (
      <View style={styles.container}>
        <DeleteConfirmationModal
          modalVisible={deleteAudioModalVisible}
          setModalVisible={setDeleteAudioModalVisible}
          onConfirm={async () => {
            await deleteAudioFile(name, addPermission, removeAudioData);
            await getAudios();
          }}
          fileName={name}
          type="audio"
        />
        <View style={styles.imageWrapper}>
          <Image
            source={require('../../assets/audio-thumbnail.jpg')}
            style={styles.image}
          />
        </View>
        <View style={styles.srno}>
          <Text style={styles.srnoText}>{srno}</Text>
        </View>
        <View style={styles.details}>
          <View style={styles.name}>
            <Text style={styles.nameText}>
              {name.substr(0, name.lastIndexOf('.mp4')) ||
                name.substr(0, name.lastIndexOf('.aac'))}
            </Text>
            <Text style={styles.dots}>...</Text>
          </View>
          {audioInfo && (
            <View style={styles.info}>
              <View style={styles.duration}>
                <AntDesign name="clockcircleo" style={styles.durationIcon} />
                <Text style={styles.durationText}>{audioInfo.duration}</Text>
              </View>
              <Text style={styles.barLine}>|</Text>
              <Text style={styles.size}>{audioInfo.size} mb</Text>
            </View>
          )}
          <View style={styles.extras}>
            <Button
              title="Play"
              type="link_primary"
              style={styles.playButton}
              onPress={() => {
                setPlayerFile(`${storageLocation}/${name}`);
                setShowPlayer(true);
              }}
            />
            <TouchableOpacity
              onPress={() => shareFile(`${storageLocation}/${name}`)}
              style={styles.shareButton}>
              <Entypo
                name="share"
                style={{...styles.extrasIcon, ...styles.shareIcon}}
              />
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            onPress={() => setDeleteAudioModalVisible(true)}
            style={styles.deleteButton}>
            <MaterialCommunityIcons
              name="delete"
              style={{...styles.extrasIcon, ...styles.deleteIcon}}
            />
          </TouchableOpacity>
        </View>
      </View>
    );
  }, [deleteAudioModalVisible, currentInfo]);
};

DownloadedAudio.propTypes = {
  name: PropTypes.string.isRequired,
  srno: PropTypes.number.isRequired,
  size: PropTypes.number.isRequired,
  info: PropTypes.object,
  setShowPlayer: PropTypes.func.isRequired,
  setPlayerFile: PropTypes.func.isRequired,
};

export default DownloadedAudio;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginTop: 8,
    marginHorizontal: 8,
    borderRadius: 5,
    backgroundColor: '#0B0B13',
  },
  imageWrapper: {
    height: 100,
    width: 120,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
    borderRadius: 5,
  },
  image: {
    height: 100,
    width: 180,
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
    color: '#aaa',
  },
  dots: {
    color: '#aaa',
  },
  info: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
  },
  duration: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  durationText: {
    fontSize: 13,
    color: '#aaa',
  },
  durationIcon: {
    color: '#aaa',
    marginRight: 6,
    fontSize: 12,
  },
  barLine: {
    color: '#aaa',
    marginHorizontal: 20,
  },
  size: {
    fontSize: 13,
    color: '#aaa',
    textTransform: 'uppercase',
  },
  extras: {
    marginTop: 5,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  playButton: {
    paddingRight: 10,
  },
  extrasIcon: {
    fontSize: 24,
  },
  shareButton: {
    height: 30,
    width: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  shareIcon: {
    color: '#aaa',
    fontSize: 22,
  },
  deleteButton: {
    position: 'absolute',
    top: 8,
    right: 12,
    height: 30,
    width: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteIcon: {
    color: appStyles.colors.primary,
  },
});
