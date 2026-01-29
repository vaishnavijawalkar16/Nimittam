import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: {
    height: 60,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 4,
    width: '100%',
  },
  leftSection: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
  },
  backButton: {
    marginRight: 8,
    padding: 4
  },
  titleRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    flexShrink: 1,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  progressInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
    backgroundColor: 'rgba(0,0,0,0.05)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  textContainer: {
    alignItems: 'flex-end',
    marginRight: 6,
  },
  percentageText: {
    fontSize: 11,
    fontWeight: '800'
  },
  bytesText: {
    fontSize: 9,
    opacity: 0.7,
    marginTop: -1
  },
  cancelButton: {
    padding: 2
  },
  progressBarContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: 'rgba(0,0,0,0.05)',
    overflow: 'hidden'
  },
  progressBar: {
    height: '100%',
    borderRadius: 0,
  }
});
