import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  backdrop: {
    flex: 1
  },
  overlay: {
    position: 'absolute',
    top: 56,
    zIndex: 1000
  },
  left: {
    left: 12
  },
  right: {
    right: 12
  },
  menu: {
    backgroundColor: '#F2ECF7',
    borderRadius: 8,
    minWidth: 200,
    elevation: 10,
    zIndex: 1001
  },
  item: {
    padding: 14
  },
  disabled: {
    opacity: 0.5
  },
  text: {
    fontSize: 14
  }
});
