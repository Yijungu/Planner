// ScheduleModal.js
import React, {useState} from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import moment from 'moment';
import {useColor} from '../../state/ColorContext';

const CalendarWriteModal = ({
  isVisible,
  onClose,
  onSave,
  eventTitle,
  setEventTitle,
  startDate,
  endDate,
}) => {
  const {theme} = useColor();

  // 날짜 형식 변환
  const formatDate = date => moment(date).format('YYYY년 MM월 DD일 dddd');
  const formatTime = time => moment(time).format('A hh시 mm분');

  const handleSaveEvent = () => {
    onSave({
      title: eventTitle,
      startDate,
      endDate,
    });
    onClose(); // 모달 닫기
  };

  const clearInput = () => {
    setEventTitle('');
  };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}>
      <TouchableOpacity
        style={styles.modalEntireView}
        activeOpacity={1}
        onPressOut={onClose}>
        <View style={[styles.modalView, {backgroundColor: theme.third}]}>
          <View style={styles.inputView}>
            <Text style={styles.modalText}>{formatDate(startDate)} 일정</Text>
            <Text style={styles.modalText}>
              {formatTime(startDate)} ~ {formatTime(endDate)}
            </Text>
            <TextInput
              style={styles.input}
              placeholder="일정을 입력하세요"
              value={eventTitle}
              onChangeText={setEventTitle}
              returnKeyType="done"
              autoFocus={true}
            />
            {eventTitle.length > 0 && (
              <TouchableOpacity onPress={clearInput} style={styles.clearButton}>
                <Text style={styles.clearButtonText}>X</Text>
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity style={styles.saveButton} onPress={handleSaveEvent}>
            <Text style={styles.saveButtonText}>할일 추가하기</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalEntireView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalView: {
    width: '80%',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  inputView: {
    width: '100%',
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: 'gray',
    width: '100%',
    padding: 10,
    marginBottom: 10,
  },
  clearButton: {
    position: 'absolute',
    right: 10,
    top: 10,
    backgroundColor: 'red',
    width: 25,
    height: 25,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
  },
  clearButtonText: {
    color: 'white',
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: 'blue',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
  },
  modalText: {
    fontSize: 18,
    marginBottom: 10,
  },
});

export default CalendarWriteModal;
