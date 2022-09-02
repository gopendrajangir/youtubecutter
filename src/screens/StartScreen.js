import React, {useState, useEffect, useContext, useRef, useMemo} from 'react';
import PropTypes from 'prop-types';

import {
  StyleSheet,
  View,
  Image,
  TextInput,
  ScrollView,
  Keyboard,
} from 'react-native';
import NetInfo from '@react-native-community/netinfo';

import ytdl from 'react-native-ytdl';

import AntDesign from 'react-native-vector-icons/AntDesign';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

import {Context as AppContext} from '../context/AppContext';
import {Context as TasksContext} from '../context/TasksContext';

import Button from '../components/Button';

import getVideoMetaData from '../utils/getVideoMetaData';
import showToast from '../utils/showToast';
import {fileReadWritePermission} from '../utils/permissions';
import {makeRootDirectory} from '../utils/directoryMaker';

import appStyles from '../appStyles';

async function handleSubmit(url, navigation, setTrimmerTask, setIsProcessing) {
  const {isConnected} = await NetInfo.fetch();
  if (!isConnected) {
    return showToast('OFFLINE_ERROR');
  }
  if (!ytdl.validateURL(url)) {
    return showToast('INVALID_URL_ERROR');
  }
  let videoId;
  try {
    videoId = ytdl.getURLVideoID(url);
  } catch (err) {
    return showToast('INVALID_URL_ERROR');
  }

  try {
    setIsProcessing(true);
    const videoUrl = (await ytdl(url))[0].url;
    const {qualities, duration, selectedQuality} = await getVideoMetaData(url);
    setIsProcessing(false);
    if (qualities.videos['2160']) {
      delete qualities.videos['2160'];
    }
    if (qualities.videos['1440']) {
      delete qualities.videos['1440'];
    }
    setTrimmerTask({
      url,
      videoId,
      videoUrl,
      duration,
      qualities,
      selectedQuality,
    });

    navigation.navigate('Trimmer');
  } catch (err) {
    console.log(err);
    setIsProcessing(false);
    return showToast('START_ERROR');
  }
}

const StartScreen = ({navigation}) => {
  const [url, setUrl] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const scrollViewRef = useRef(null);

  const {addPermission} = useContext(AppContext);
  const {setTrimmerTask} = useContext(TasksContext);

  useEffect(() => {
    try {
      (async () => {
        if (!(await fileReadWritePermission(addPermission))) {
          showToast('READ_WRITE_PERMISSION_ERROR');
        } else {
          await makeRootDirectory();
        }
      })();
    } catch (err) {
      showToast('INTERNAL_ERROR');
    }
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
    return (
      <View style={styles.container}>
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={styles.scrollView}
          keyboardShouldPersistTaps="always">
          <View style={styles.header}>
            <Image
              style={styles.hero}
              source={require('../../assets/hero.png')}
            />
          </View>
          <View style={styles.inputWrapper}>
            <FontAwesome
              style={styles.inputIcon}
              size={16}
              name="chain"
              color="#ddd"
            />
            <TextInput
              style={styles.urlInput}
              value={url}
              onChangeText={setUrl}
              placeholder="Paste Url"
              placeholderTextColor="#777"
            />
          </View>
          {
            <Button
              disabled={isProcessing}
              loading={isProcessing}
              style={styles.button}
              title="start"
              onPress={() => {
                Keyboard.dismiss();
                handleSubmit(url, navigation, setTrimmerTask, setIsProcessing);
              }}
              IconType={AntDesign}
              iconName="arrowright"
            />
          }
        </ScrollView>
      </View>
    );
  }, [url, isProcessing]);
};

StartScreen.propTypes = {
  navigation: PropTypes.object.isRequired,
};

export default StartScreen;

const styles = StyleSheet.create({
  container: {
    alignItems: 'stretch',
    height: '100%',
    backgroundColor: appStyles.colors.screenBackground,
  },
  header: {
    flexDirection: 'row',
    marginTop: 70,
    justifyContent: 'center',
  },
  hero: {
    height: 230,
    width: 280,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 40,
    marginHorizontal: 16,
  },
  inputIcon: {
    height: 16,
    width: 16,
    position: 'absolute',
    left: 20,
    color: '#777',
    zIndex: 1,
  },
  urlInput: {
    backgroundColor: '#252535',
    width: '100%',
    height: 50,
    paddingLeft: 48,
    fontSize: 14,
    borderRadius: 5,
    color: '#fff',
  },
  button: {
    marginTop: 10,
    marginHorizontal: 16,
  },
});
