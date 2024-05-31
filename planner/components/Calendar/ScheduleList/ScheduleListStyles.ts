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
  currentTimeCircle: {
    position: 'absolute',
    // left: 30,
    width: 10,
    height: 10,
    borderRadius: 30,
  },
  currentTimeLineContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    marginRight: 5,
    marginLeft: 55,
    flexDirection: 'row',
    alignItems: 'center',
    // zIndex: 10000,
  },
  currentTimeLine: {
    height: 3,
    flex: 1,
    borderBottomWidth: 2,
  },
  hourTextBold: {
    width: 50, // Adjust the width as needed
    textAlign: 'right',
    marginRight: 10,
    fontWeight: 'bold',
  },
  boldTextBox: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
  },
});

export default styles;
