import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  userContainer: {
    alignItems: 'flex-end',
    width: '100%',
    paddingHorizontal: 12,
  },
  botContainer: {
    alignItems: 'flex-start',
    width: '100%',
    paddingHorizontal: 12,
  },
  bubble: {
    maxWidth: '85%',
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginVertical: 4,
    elevation: 1, // Subtle shadow for Android
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  userBubble: {
    borderTopLeftRadius: 18,
    borderTopRightRadius: 4,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
  },
  botBubble: {
    borderTopLeftRadius: 4,
    borderTopRightRadius: 18,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
  },
  text: {
    fontSize: 15,
    lineHeight: 20,
  },
  image: {
    width: 240,
    height: 180,
    borderRadius: 12,
  }
});
