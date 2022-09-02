import React, {useState, useEffect, useContext, useMemo} from 'react';
import PropTypes from 'prop-types';
import {Text, View, Image, TouchableOpacity, StyleSheet} from 'react-native';

import {RNFFprobe} from 'react-native-ffmpeg';
import Share from 'react-native-share';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Entypo from 'react-native-vector-icons/Entypo';

import {Context as AppContext} from '../context/AppContext';
import {Context as VideosContext} from '../context/VideosContext';

import DeleteConfirmationModal from './DeleteConfirmationModal';
import Button from './Button';

import timeFormatter from '../utils/timeFormatter';
import generateThumbnail from '../utils/generateThumbnail';
import showToast from '../utils/showToast';
import {deleteVideoFile} from '../utils/deleteFile';

import {storageLocation} from '../constants';

import appStyles from '../appStyles';

const getVideoInfo = async name => {
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

const DownloadedVideo = ({
  name,
  srno,
  setShowPlayer,
  setPlayerFile,
  info,
  size,
  image,
}) => {
  const [deleteVideoModalVisible, setDeleteVideoModalVisible] = useState(false);
  const [currentImage, setCurrentImage] = useState(null);
  const [currentInfo, setCurrentInfo] = useState(null);

  const {addPermission} = useContext(AppContext);

  const {
    getVideos,
    saveVideoData,
    removeVideoData,
    saveVideoThumbnail,
    removeVideoThumbnail,
  } = useContext(VideosContext);

  useEffect(() => {
    if (!image) {
      generateThumbnail({name}).then(image => {
        saveVideoThumbnail({[name]: image});
        setCurrentImage(image);
      });
    }

    if (!info) {
      getVideoInfo(name).then(async info => {
        if (info) {
          saveVideoData({
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
    const thumbnail = image ? image : currentImage;
    const videoInfo = info ? info : currentInfo;

    return (
      <View style={styles.container}>
        <DeleteConfirmationModal
          modalVisible={deleteVideoModalVisible}
          setModalVisible={setDeleteVideoModalVisible}
          onConfirm={async () => {
            await deleteVideoFile(
              name,
              thumbnail,
              addPermission,
              removeVideoThumbnail,
              removeVideoData,
            );
            await getVideos();
          }}
          fileName={name}
          image={thumbnail}
          type="video"
        />
        <View style={styles.imageWrapper}>
          <Image source={{uri: `file://${thumbnail}`}} style={styles.image} />
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
          {videoInfo && (
            <View style={styles.info}>
              <View style={styles.duration}>
                <AntDesign name="clockcircleo" style={styles.durationIcon} />
                <Text style={styles.durationText}>{videoInfo.duration}</Text>
              </View>
              <Text style={styles.barLine}>|</Text>
              <Text style={styles.size}>{videoInfo.size} mb</Text>
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
            onPress={() => setDeleteVideoModalVisible(true)}
            style={styles.deleteButton}>
            <MaterialCommunityIcons
              name="delete"
              style={{...styles.extrasIcon, ...styles.deleteIcon}}
            />
          </TouchableOpacity>
        </View>
      </View>
    );
  }, [deleteVideoModalVisible, currentImage, currentInfo]);
};

DownloadedVideo.propTypes = {
  name: PropTypes.string.isRequired,
  image: PropTypes.string,
  info: PropTypes.object,
  size: PropTypes.number.isRequired,
  srno: PropTypes.number.isRequired,
  setShowPlayer: PropTypes.func.isRequired,
  setPlayerFile: PropTypes.func.isRequired,
};

export default DownloadedVideo;

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
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
    borderBottomLeftRadius: 5,
  },
  image: {
    height: 100,
    width: 120,
    position: 'absolute',
    borderBottomLeftRadius: 5,
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
    borderColor: appStyles.colors.screenBackground,
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
  extrasIcon: {
    fontSize: 24,
  },
  playButton: {
    paddingRight: 10,
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
