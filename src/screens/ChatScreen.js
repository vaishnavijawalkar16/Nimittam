import React, { useEffect, useState } from 'react';
import { View, FlatList, Alert } from 'react-native';
import TopBar from '../components/TopBar/TopBar';
import MessageBubble from '../components/MessageBubble/MessageBubble';
import MessageInputBar from '../components/MessageInputBar/MessageInputBar';
import {
  loadMessages,
  saveMessages,
  clearMessages
} from '../storage/messageStorage';
import { getActiveModel } from '../storage/modelStorage';
import { getBotReply } from '../services/chatService';

export default function ChatScreen() {
  const [messages, setMessages] = useState([]);
  const [model, setModel] = useState(null);

  useEffect(() => {
    loadMessages().then(setMessages);
    getActiveModel().then(setModel);
  }, []);

  

const sendMessage = async payload => {
  const userMsg = {
    id: Date.now(),
    role: 'user',
    ...payload
  };

  let updated = [...messages, userMsg];

  if (payload.type === 'text') {
    const botReply = await getBotReply(payload.value);

    const botMsg = {
      id: Date.now() + 1,
      role: 'bot',
      type: 'text',
      value: botReply
    };

    updated.push(botMsg);
  }

  setMessages(updated);
  saveMessages(updated);
};


  return (
    <View style={{ flex: 1 }}>
      <TopBar
        onClearChat={async () => {
          await clearMessages();
          setMessages([]);
        }}
        onModelSelected={setModel}
      />

      <FlatList
        data={messages}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => <MessageBubble message={item} />}
      />

      <MessageInputBar
        onSend={sendMessage}
        hasModel={!!model}
      />
    </View>
  );
}
