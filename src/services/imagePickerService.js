import { launchCamera, launchImageLibrary } from 'react-native-image-picker';

const options = {
  mediaType: 'photo',
  quality: 0.8
};

export function pickFromCamera() {
  return new Promise(resolve => {
    launchCamera(options, response => {
      if (response.didCancel || response.errorCode) {
        resolve(null);
        return;
      }

      if (response.assets && response.assets.length > 0) {
        resolve(response.assets[0]);
      } else {
        resolve(null);
      }
    });
  });
}

export function pickFromGallery() {
  return new Promise(resolve => {
    launchImageLibrary(options, response => {
      if (response.didCancel || response.errorCode) {
        resolve(null);
        return;
      }

      if (response.assets && response.assets.length > 0) {
        resolve(response.assets[0]);
      } else {
        resolve(null);
      }
    });
  });
}
