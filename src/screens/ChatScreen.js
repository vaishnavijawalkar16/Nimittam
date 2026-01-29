import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet, Modal, Image, TouchableOpacity, Text, Alert } from 'react-native';
import TopBar from '../components/TopBar/TopBar';
import MessageBubble from '../components/MessageBubble/MessageBubble';
import MessageInputBar from '../components/MessageInputBar/MessageInputBar';
import {
  loadMessages,
  saveMessages,
  clearMessages
} from '../storage/messageStorage';
import { getBotReply } from '../services/chatService';
import { getActiveModel } from '../services/modelService';
import { useTheme } from '../theme/ThemeContext';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';


export default function ChatScreen({ occasion, onBack }) {
  const { theme } = useTheme();
  const [messages, setMessages] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null); // Keep selectedImage state as it's used in Modal
  const [activeModel, setActiveModel] = useState(null);

  useEffect(() => {
    if (occasion?.id) {
      loadMessages(occasion.id).then(setMessages);
    }
    checkModelStatus();
  }, [occasion?.id]);

  const checkModelStatus = async () => {
    const model = await getActiveModel();
    setActiveModel(model);
  };

  const sendMessage = async payload => {
    if (!activeModel) {
      Alert.alert('Model Required', 'Please download a model or use a saved model first.');
      return;
    }

    const newMessage = {
      id: Date.now().toString(),
      ...payload,
      sender: 'user',
      timestamp: new Date().toISOString(),
    };

    const updatedMessages = [...messages, newMessage];
    setMessages(updatedMessages);
    saveMessages(occasion.id, updatedMessages);

    // Show typing or thinking state
    const botId = (Date.now() + 1).toString();
    const botPlaceholder = {
      id: botId,
      type: 'text',
      value: '...',
      sender: 'bot',
      timestamp: new Date().toISOString(),
    };
    setMessages(prev => [...prev, botPlaceholder]);

    try {
      // Pass occasion to RAG logic
      const reply = await getBotReply({ ...payload, occasion });
      
      const finalBotMessage = {
        ...botPlaceholder,
        value: reply,
      };

      setMessages(prev => prev.map(msg => msg.id === botId ? finalBotMessage : msg));
      saveMessages(occasion.id, [...updatedMessages, finalBotMessage]);
    } catch (error) {
      console.error('Error getting reply:', error);
      
      // Re-add error message for bot if reply fails
      const errorMsg = {
        id: Date.now() + 2, // Ensure unique ID
        sender: 'bot',
        type: 'text',
        value: 'Sorry, I couldn\'t process that. ' + (error.message || 'Please try again.')
      };
      setMessages(prev => prev.map(msg => msg.id === botId ? errorMsg : msg)); // Replace placeholder with error
      saveMessages(occasion.id, [...updatedMessages, errorMsg]);
    }
  };

  const clearChat = async () => {
    Alert.alert(
      'Clear Chat',
      'Are you sure you want to delete all messages?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            await clearMessages(occasion.id);
            setMessages([]);
          },
        },
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <TopBar 
        onClearChat={clearChat} 
        occasion={occasion}
        onBack={onBack}
        onModelStatusChange={checkModelStatus}
      />

      <Modal visible={!!selectedImage} transparent={true} onRequestClose={() => setSelectedImage(null)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'center', alignItems: 'center' }}>
          <TouchableOpacity style={{ position: 'absolute', top: 40, right: 20 }} onPress={() => setSelectedImage(null)}>
            <View style={{ padding: 8 }}>
              <Icon name="close" size={30} color="white" />
            </View>
          </TouchableOpacity>
          {selectedImage && (
            <Image source={{ uri: selectedImage }} style={{ width: '95%', height: '80%', resizeMode: 'contain' }} />
          )}
        </View>
      </Modal>

      <View style={{ flex: 1 }}>
        {!activeModel && messages.length === 0 && (
          <View style={styles.promptContainer}>
            <Text style={[styles.promptText, { color: theme.text }]}>
              Welcome to {occasion.name}! Please download a model or use a saved model from the Top Bar menu to start chatting with your spiritual guide.
            </Text>
          </View>
        )}

        <FlatList
          data={messages}
          keyExtractor={item => item.id.toString()}
          renderItem={({ item }) => (
            <MessageBubble 
              message={item} 
              onPressImage={uri => setSelectedImage(uri)} 
            />
          )}
          contentContainerStyle={styles.listContent}
        />
      </View>

      <MessageInputBar onSend={sendMessage} />
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 20,
  },
  promptContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  promptText: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.8,
  },
});

