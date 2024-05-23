import {StyleSheet, Dimensions} from 'react-native';

const screenWidth = Dimensions.get('window').width;

export default StyleSheet.create({
  container: {
    paddingTop: 10,
    paddingBottom: 10,
    backgroundColor: 'white',
  },
  monthYearText: {
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 16,
    paddingVertical: 7,
  },
  dateContainer: {
    width: screenWidth / 7,
    alignItems: 'center',
    justifyContent: 'center',
    // padding: 5,
  },
  dayText: {
    fontSize: 14,
  },
  dateText: {
    fontSize: 14,
  },
  selectedText: {
    color: 'black',
    fontWeight: 'bold',
  },
  unselectedText: {
    color: 'grey',
  },
  selectedDateText: {
    color: 'black',
    fontWeight: 'bold',
    fontSize: 18, // 선택된 날짜의 날짜에 대한 글자 크기를 증가시킵니다.
  },
  unselectedDateText: {
    color: 'grey',
    fontSize: 14, // 비선택된 날짜의 날짜에 대한 기본 글자 크기입니다.
  },
  selectedCircle: {
    height: 30,
    width: 30,
    borderRadius: 15,
    backgroundColor: 'blue',
    position: 'absolute',
    alignSelf: 'center',
    top: '50%',
    marginTop: -15,
  },
});
