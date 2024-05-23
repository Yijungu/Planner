import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet, Modal} from 'react-native';
import moment from 'moment';

const TimePickerModal = ({
  visible,
  onClose,
  startTime,
  endTime,
  setStartTime,
  setEndTime,
  dateString,
}) => {
  const increaseHour = (time, setTime) => {
    const newTime = time + 1;
    setTime(newTime);
  };

  const decreaseHour = (time, setTime) => {
    const newTime = time - 1;
    setTime(newTime);
  };

  const getTimeFromOffset = offset => {
    const originalLocale = moment.locale();
    moment.locale('en-gb');
    const formattedDate = moment(dateString)
      .clone()
      .add(offset, 'hours')
      .format('h a');
    moment.locale(originalLocale); // 다시 원래 로케일로 변경
    return formattedDate;
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}>
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>시간 선택</Text>
          <View style={styles.timePickerRow}>
            <Text style={styles.modalLabel}>시작 시간</Text>
            <View style={styles.timePickerControls}>
              <TouchableOpacity
                onPress={() => decreaseHour(startTime, setStartTime)}>
                <Text style={styles.arrow}>⬆</Text>
              </TouchableOpacity>
              <Text style={styles.timeText}>
                {getTimeFromOffset(startTime)}
              </Text>
              <TouchableOpacity
                onPress={() => increaseHour(startTime, setStartTime)}>
                <Text style={styles.arrow}>⬇</Text>
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.timePickerRow}>
            <Text style={styles.modalLabel}>종료 시간</Text>
            <View style={styles.timePickerControls}>
              <TouchableOpacity
                onPress={() => decreaseHour(endTime, setEndTime)}>
                <Text style={styles.arrow}>⬆</Text>
              </TouchableOpacity>
              <Text style={styles.timeText}>{getTimeFromOffset(endTime)}</Text>
              <TouchableOpacity
                onPress={() => increaseHour(endTime, setEndTime)}>
                <Text style={styles.arrow}>⬇</Text>
              </TouchableOpacity>
            </View>
          </View>
          <TouchableOpacity
            style={styles.closeButtonContainer}
            onPress={onClose}>
            <Text style={styles.closeButton}>확인</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
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
  timePickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  timePickerControls: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 10,
  },
  arrow: {
    fontSize: 24,
    marginHorizontal: 10,
  },
  timeText: {
    fontSize: 18,
    marginHorizontal: 10,
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
});

export default TimePickerModal;
