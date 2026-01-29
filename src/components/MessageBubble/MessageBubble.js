import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import styles from './MessageBubble.styles';
import { useTheme } from '../../theme/ThemeContext';

export default function MessageBubble({ message, onPressImage }) {
  const { theme } = useTheme();
  const isUser = message.sender === 'user' || message.role === 'user';

  return (
    <View style={isUser ? styles.userContainer : styles.botContainer}>
      <View
        style={[
          styles.bubble,
          isUser ? styles.userBubble : styles.botBubble,
          { backgroundColor: isUser ? theme.bubbleUser : theme.bubbleBot }
        ]}
      >
        {message.type === 'image' ? (
          <TouchableOpacity onPress={() => onPressImage && onPressImage(message.value)} activeOpacity={0.8}>
            <Image
              source={{ uri: message.value }}
              style={styles.image}
            />
          </TouchableOpacity>
        ) : (
          <Text style={[styles.text, { color: theme.text }]}>{message.value}</Text>
        )}
      </View>
    </View>
  );
}
