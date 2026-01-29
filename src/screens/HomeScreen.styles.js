import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: {
    flex: 1,
  },
  listContainer: {
    padding: 24,
    paddingTop: 10,
  },
  introSection: {
    marginBottom: 30,
    marginTop: 10,
  },
  subtitle: {
    fontSize: 15,
    opacity: 0.6,
    lineHeight: 22,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 20,
    paddingVertical: 18,
    // Minimalistic shadows
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  cardDesc: {
    fontSize: 13,
    marginTop: 4,
    lineHeight: 18,
  },
  arrow: {
    opacity: 0.3,
  }
});


