import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, PermissionsAndroid, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';
import styles from './MessageInputBar.styles';
import { useTheme } from '../../theme/ThemeContext';

export default function MessageInputBar({ onSend }) {
  const { theme } = useTheme();
  const [text, setText] = useState('');

  const sendMessage = () => {
    if (!text.trim()) return;

    onSend({
      type: 'text',
      value: text
    });

    setText('');
  };

  const pickImage = async () => {
    if (Platform.OS === 'android') {
      const permission = Platform.Version >= 33 
        ? PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES 
        : PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE;
        
      try {
        const granted = await PermissionsAndroid.request(permission);
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          console.log("Storage/Media permission denied");
          return;
        }
      } catch (err) {
        console.warn(err);
        return;
      }
    }

    const options = {
      mediaType: 'photo',
      includeBase64: false,
      maxHeight: 2000,
      maxWidth: 2000,
    };

    launchImageLibrary(options, (response) => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.errorMessage) {
        console.log('ImagePicker Error: ', response.errorMessage);
      } else if (response.assets && response.assets.length > 0) {
        const source = { uri: response.assets[0].uri };
        onSend({
          type: 'image',
          value: source.uri
        });
      }
    });
  };


  const takePhoto = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: "App Camera Permission",
            message: "App needs access to your camera ",
            buttonNeutral: "Ask Me Later",
            buttonNegative: "Cancel",
            buttonPositive: "OK"
          }
        );
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          console.log("Camera permission denied");
          return;
        }
      } catch (err) {
        console.warn(err);
        return;
      }
    }

    const options = {
      mediaType: 'photo',
      includeBase64: false,
      maxHeight: 2000,
      maxWidth: 2000,
    };

    launchCamera(options, (response) => {
      if (response.didCancel) {
        console.log('User cancelled camera');
      } else if (response.errorMessage) {
        console.log('Camera Error: ', response.errorMessage);
      } else if (response.assets && response.assets.length > 0) {
        const source = { uri: response.assets[0].uri };
        onSend({
          type: 'image',
          value: source.uri
        });
      }
    });
  };


  return (
    <View style={[styles.container, { backgroundColor: theme.inputBg }]}>
      <TouchableOpacity onPress={pickImage}>
        <Icon name="image" size={24} color="#6B4EFF" />
      </TouchableOpacity>

      <TouchableOpacity onPress={takePhoto}>
        <Icon name="camera-alt" size={24} color="#6B4EFF" />
      </TouchableOpacity>

      <TextInput
        style={[styles.input, { color: '#000000' }]}
        placeholder="Message Nimittam..."
        placeholderTextColor="#666"
        value={text}
        onChangeText={setText}
        multiline
      />

      <TouchableOpacity onPress={sendMessage}>
        <Icon name="send" size={24} color="#6B4EFF" />
      </TouchableOpacity>
    </View>
  );
}
