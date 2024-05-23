import {StyleSheet} from 'react-native';

const styles = StyleSheet.create({
  dateText: {
    paddingLeft: 12,
    paddingVertical: 3,
    fontSize: 12,
  },
  entireContainer: {
    flex: 1,
  },
  timePickerContainer: {
    marginVertical: 5,
    marginLeft: 2,
  },
  dateRangeContainer: {
    alignItems: 'center',
    marginVertical: 10,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  timePicker: {
    width: '100%',
    height: 150, // 줄어든 높이
  },
  closeButtonContainer: {
    marginTop: 20,
    width: '100%',
    alignItems: 'center',
  },
  closeButton: {
    color: 'white',
    backgroundColor: '#007BFF',
    padding: 10,
    borderRadius: 5,
    textAlign: 'center',
    width: '100%',
  },
  container: {
    // marginTop: 12,
    marginBottom: 20,
    marginRight: 10,
    borderBottomRightRadius: 15,
    borderTopRightRadius: 15,
  },
  hourRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 50, // Adjust the height for each hour slot
  },
  hourText: {
    width: 50, // Adjust the width as needed
    textAlign: 'right',
    marginRight: 10,
    fontWeight: 'bold',
    color: '#616161',
  },
  line: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#C2C2C2',
    marginRight: 10,
    flexGrow: 1,
  },
  event: {
    position: 'absolute',
    left: 60, // Adjust based on your layout
    right: 10, // Adjust based on your layout
    borderRadius: 5,
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  draggEvent: {
    position: 'absolute',
    width: 140,
    height: 45,
    borderRadius: 5,
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },

  draggingEvent: {
    position: 'absolute',
    width: 95,
    height: 45,
    borderRadius: 8,
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  eventText: {
    fontWeight: 'bold',
    color: 'white',
  },
  currentTimeLine: {
    position: 'absolute',
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 0, // 왼쪽 변 없음
    borderRightWidth: 10, // 삼각형의 높이
    borderTopWidth: 5, // 삼각형의 밑변의 절반
    borderBottomWidth: 5, // 삼각형의 밑변의 절반
    borderLeftColor: 'transparent', // 왼쪽 투명
    borderTopColor: 'transparent', // 상단 투명
    borderBottomColor: 'transparent', // 하단 투명
    borderRightColor: '#895737', // 오른쪽 색상
    transform: [{rotate: '-180deg'}], // 90도 회전
  },
});

export default styles;
