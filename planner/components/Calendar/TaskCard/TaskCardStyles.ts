import {StyleSheet} from 'react-native';

const styles = StyleSheet.create({
  card: {
    padding: 15,
    marginHorizontal: 30,
    borderRadius: 10,
  },
  title: {
    color: '#FFF6F6',
    textDecorationLine: 'underline',
    fontWeight: 'bold',
    fontSize: 18,
  },
  backgroud: {
    backgroundColor: '#5E3023',
    marginBottom: 10,
    marginTop: 10,
    height: 510,
    width: '45%',
    borderBottomLeftRadius: 10,
    borderTopLeftRadius: 10,
  },
  emptyMessage: {
    textAlign: 'center',
    marginTop: 20,
  },
});

export default styles;
