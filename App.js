import React from 'react';
import { Alert, StatusBar, StyleSheet } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import ChatScreen from './src/screens/ChatScreen';
import { ThemeProvider, useTheme } from './src/theme/ThemeContext';

import HomeScreen from './src/screens/HomeScreen';

import { clearMessages } from './src/storage/messageStorage';

function Main() {
  const { theme } = useTheme();
  const [selectedOccasion, setSelectedOccasion] = React.useState(null);

  const clearChat = async () => {
    Alert.alert(
      'Clear All Chats',
      'This will delete messages for the current session.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
             // For global clear, we'd need to loop, but usually users clear per session.
             // I'll make this clear the current occasion if one is selected, 
             // or just provide a helpful note.
             if (selectedOccasion) {
                await clearMessages(selectedOccasion.id);
             }
          },
        },
      ]
    );
  };

  if (!selectedOccasion) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <StatusBar
          barStyle={theme.dark ? 'light-content' : 'dark-content'}
          backgroundColor={theme.background}
        />
        <HomeScreen 
          onSelectOccasion={setSelectedOccasion} 
          onClearChat={clearChat}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar
        barStyle={theme.dark ? 'light-content' : 'dark-content'}
        backgroundColor={theme.background}
      />
      <ChatScreen 
        occasion={selectedOccasion} 
        onBack={() => setSelectedOccasion(null)} 
        onClearChatExternal={clearChat}
      />
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <Main />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
