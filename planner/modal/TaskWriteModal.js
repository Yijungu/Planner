import React, {useState} from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  saveAccessToken,
  loadAccessToken,
  deleteAccessToken,
} from '../utils/accessToken';
import api from '../utils/api';
import {useColor} from '../state/ColorContext';
import {useUser} from '../state/UserContext';

const TaskWriteModal = ({isVisible, onClose, date, onUpdateTasks}) => {
  // Initialize alarmDate with the date prop if it exists
  const {theme} = useColor();
  const {user} = useUser();
  const complementaryColors = theme.complementary || {};
  const firstComplementaryColorKey = Object.keys(complementaryColors)[0];

  const [eventName, setEventName] = useState('');
  const [repeatSchedule, setRepeatSchedule] = useState(false);
  const [selectedColorKey, setSelectedColorKey] = useState(
    firstComplementaryColorKey || 'fourth',
  );

  const handleComplete = async () => {
    let deleteOption;
    if (!date) {
      deleteOption = 'keep';
    } else if (repeatSchedule) {
      deleteOption = 'delay';
    } else {
      deleteOption = 'immediate';
    }

    const newTask = {
      title: eventName,
      dueDate: date ? new Date(date).toISOString() : null,
      color: selectedColorKey,
      deleteOption: deleteOption,
    };

    try {
      const response = await api.post('/tasks', newTask);

      const addedTask = response.data;
      onUpdateTasks(addedTask); // UI 업데이트 함수 호출

      // 저장된 작업 목록 로드 및 업데이트
      const storedTasksString = await AsyncStorage.getItem('tasks');
      let storedTasks = storedTasksString ? JSON.parse(storedTasksString) : [];
      storedTasks.push(addedTask);
      await AsyncStorage.setItem('tasks', JSON.stringify(storedTasks));

      onModalClose(); // 모달 닫기
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Error', 'Failed to create task due to network error');
    }
  };

  const onModalClose = () => {
    setEventName('');
    onClose();
  };

  const clearInput = () => {
    setEventName('');
  };

  return (
    <Modal
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
      animationType="fade">
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPressOut={onModalClose}>
        <View style={[styles.modalView, {backgroundColor: theme.third}]}>
          <Text style={styles.modalTitle}>할일 카드 등록</Text>
          <View style={styles.inputView}>
            <TextInput
              style={[styles.input, {backgroundColor: theme.fifth}]}
              placeholder="할일을 입력하세요"
              value={eventName}
              onChangeText={setEventName}
              onSubmitEditing={handleComplete} // 엔터를 누를 때 handleComplete 함수 실행
              returnKeyType="done" // 키보드에 완료 버튼을 'Done'으로 표시
            />
            {eventName.length > 0 && (
              <TouchableOpacity onPress={clearInput} style={styles.clearButton}>
                <Text style={styles.clearButtonText}>+</Text>
              </TouchableOpacity>
            )}
          </View>
          <View style={styles.colorPicker}>
            {Object.keys(theme.complementary).map(key => (
              <TouchableOpacity
                key={key}
                style={[
                  styles.colorOption,
                  selectedColorKey === key
                    ? {
                        borderColor: theme.primary,
                        borderWidth: 2,
                        backgroundColor: 'white',
                      }
                    : {},
                ]}
                onPress={() => setSelectedColorKey(key)}>
                <View
                  style={[
                    styles.colorCircle,
                    {backgroundColor: theme.complementary[key]},
                  ]}
                />
                <Text style={styles.colorText}>{user.category[key]}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <View
            style={[styles.scheduleTypeBox, {backgroundColor: theme.fifth}]}>
            <TouchableOpacity
              style={{
                ...styles.scheduleTypeButton,
                ...(repeatSchedule
                  ? {backgroundColor: theme.fifth}
                  : {backgroundColor: theme.third}),
              }}
              onPress={() => setRepeatSchedule(false)}>
              <Text style={styles.scheduleTypeButtonText}>{'하루'}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                ...styles.scheduleTypeButton,
                ...(repeatSchedule
                  ? {backgroundColor: theme.third}
                  : {backgroundColor: theme.fifth}),
              }}
              onPress={() => setRepeatSchedule(true)}>
              <Text style={styles.scheduleTypeButtonText}>{'매주'}</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.dateButton}>
            <View style={[styles.addCardT, {backgroundColor: theme.primary}]}>
              <Text style={styles.addCardText}>+</Text>
            </View>
            <Text style={styles.dateButtonText}>위치추가</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    justifyContent: 'flex-end',
    flex: 1,
    // justifyContent: 'center'
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalView: {
    margin: 0,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    // width:
    padding: 35,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
    marginLeft: 5,
  },
  inputView: {
    justifyContent: 'center',
  },
  input: {
    width: '100%',
    padding: 10,
    marginVertical: 10,
    borderRadius: 10,
    // backgroundColor: '#FFFFFF',
  },
  dateButton: {
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    // marginVertical: 10,
  },
  dateButtonText: {
    color: '#333',
    marginHorizontal: 10,
  },
  datePicker: {
    width: 320,
    height: 260,
    display: 'none',
  },
  mapContainer: {
    width: '100%',
    height: 200,
    marginVertical: 20,
  },
  map: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
  },
  selectedAddressText: {
    width: '100%',
    textAlign: 'center',
    color: '#666',
    fontSize: 16,
    marginBottom: 20,
  },
  completeButton: {
    padding: 10,
    marginVertical: 10,
    backgroundColor: '#eaeaea',
    borderRadius: 10,
  },
  addCardT: {
    width: 17, // 동그라미의 너비
    height: 17, // 동그라미의 높이
    // backgroundColor: '#A2845E', // 배경색
    borderRadius: 30, // 둥근 테두리를 만드는데 필요한 반지름 값 (너비와 높이의 반)
    justifyContent: 'center', // 가운데 정렬
    alignItems: 'center', // 가운데 정렬
    textAlign: 'center',
    // 다른 스타일들...
  },

  addCardText: {
    left: 0.5,
    color: 'white',
    fontSize: 13,
  },
  clearButton: {
    position: 'absolute',
    right: 10,
    height: 13,
    width: 13,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(60, 60, 67, 0.6)', // 취향에 맞게 색상 조절
    borderRadius: 20, // 원형 버튼을 만들기 위함
    marginVertical: 10,
  },
  clearButtonText: {
    left: 0.5,
    color: 'white', // 취향에 맞게 색상 조절
    fontSize: 10,
    transform: [{rotate: '45deg'}], // 회전 적용
  },
  scheduleButtonBox: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  scheduleTypeBox: {
    width: '28%',
    paddingVertical: 3,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'space-between',
    flexDirection: 'row',
    borderRadius: 10,
  },
  taskButton: {
    width: '68%',
    paddingVertical: 8,
    paddingHorizontal: 10,
    backgroundColor: '#F9F4EE',
    alignContent: 'center',
    borderRadius: 10,
  },
  scheduleTypeButtonText: {
    color: '#101010',
  },
  scheduleTypeButton: {
    borderRadius: 7,
    paddingVertical: 5,
    paddingHorizontal: 5,
  },
  colorPicker: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
    width: '80%',
  },
  colorOption: {
    alignItems: 'center',
    padding: 5,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  colorCircle: {
    width: 10,
    height: 10,
    borderRadius: 10,
    marginBottom: 5,
  },
  colorText: {
    fontSize: 12,
    color: '#333',
  },
});

export default TaskWriteModal;
