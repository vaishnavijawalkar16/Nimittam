import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import styles from './MessageInputBar.styles';
import { useTheme } from '../../theme/ThemeContext';
import { pickFromCamera, pickFromGallery } from '../../utils/imagePicker';

export default function MessageInputBar({ onSend, hasModel }) {
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

  const onAddPress = async () => {
    const image = await pickFromGallery();
    if (image) {
      onSend({
        type: 'image',
        uri: image.uri,
        name: image.fileName
      });
    }
  };

  const onCameraPress = async () => {
    const image = await pickFromCamera();
    if (image) {
      onSend({
        type: 'image',
        uri: image.uri,
        name: image.fileName
      });
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.inputBg }]}>
      <TouchableOpacity onPress={onAddPress}>
        <Icon name="add" size={24} color={theme.text} />
      </TouchableOpacity>

      <TouchableOpacity onPress={onCameraPress}>
        <Icon name="photo-camera" size={24} color={theme.text} />
      </TouchableOpacity>

      <TextInput
        style={[styles.input, { color: theme.text }]}
        placeholder="Message Nimittam..."
        placeholderTextColor="#999"
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
