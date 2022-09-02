import ytdl from 'react-native-ytdl';

export default async url => {
  const basicInfo = await ytdl.getBasicInfo(url);

  const duration = Math.floor(basicInfo.formats[0].approxDurationMs / 1000);

  const info = {
    audio: {},
    video: {},
    merged: {},
  };

  const data = basicInfo.formats
    .filter(info => {
      return !info.mimeType.includes('webm');
    })
    .map(info => {
      info.mimeType = info.mimeType.replace('"', '');
      info.mimeType = info.mimeType.replace('"', '');
      if (info.mimeType.includes(',') && info.mimeType.includes('video')) {
        info.mimeType = info.mimeType.replace('video', 'merged');
      }
      const mimeInfo = info.mimeType.split('; ');
      info.trackType = mimeInfo[0].split('/')[0];
      info.codecs = mimeInfo[1].split('=')[1];
      if (info.codecs.includes(',')) {
        info.codecs = info.codecs.split(', ');
      } else {
        info.codecs = [info.codecs];
      }

      return {
        trackType: info.trackType,
        codecs: info.codecs,
        qualityLabel: info.qualityLabel
          ? info.qualityLabel.replace('p', '')
          : null,
        itag: info.itag,
        size: info.contentLength,
        duration: info.approxDurationMs,
      };
    });
  data.forEach(item => {
    if (item.trackType === 'audio') {
      info[item.trackType][item.itag] = {
        codecs: item.codecs,
        size: item.size,
      };
    } else {
      if (!info[item.trackType][item.qualityLabel]) {
        info[item.trackType][item.qualityLabel] = {
          [item.itag]: {
            codecs: item.codecs,
            size: item.size,
          },
        };
      } else {
        info[item.trackType][item.qualityLabel][item.itag] = {
          codecs: item.codecs,
          size: item.size,
        };
      }
    }
  });
  const mergedLabels = Object.keys(info.merged);
  // mergedLabels.forEach(item => {
  //   delete info.video[item];
  // });
  Object.keys(info.video).forEach(label => {
    const itags = Object.keys(info.video[label]);
    if (itags.length > 1) {
      info.video[label] = {
        [itags[0]]: info.video[label][itags[0]],
      };
    }
  });
  return {
    qualities: {
      audios: info.audio,
      videos: info.video,
      merged: {},
    },
    duration,
    selectedQuality: mergedLabels[0],
  };
};
