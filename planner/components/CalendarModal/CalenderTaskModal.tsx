import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Alert,
} from 'react-native';
import TaskWriteModal from '../../modal/TaskWriteModal'; // Assuming TaskWriteModal is in the same directory
import {useSchedules} from '../../state/ScheduleContext';
import {useColor} from '../../state/ColorContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../../utils/api';

const CalenderTaskComponent = ({task, date, onUpdateTasks}) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const {tasks, setTasks} = useSchedules();
  const [localTasks, setLocalTasks] = useState([]);
  const [selectedItemId, setSelectedItemId] = useState(null); // Using an object to track multiple selections
  const {theme} = useColor();

  useEffect(() => {
    setLocalTasks(task);
  }, [task]);

  const addItem = () => {
    setIsModalVisible(true);
  };

  const handleSelectItem = id => {
    setSelectedItemId(id === selectedItemId ? null : id); // Toggle selection
  };

  const handleDeleteTask = async id => {
    try {
      const response = await api.delete(`/tasks/${id}`);

      setLocalTasks(prevTasks => prevTasks.filter(task => task._id !== id));
      setSelectedItemId(null); // Reset selection after deletion
      const newTasks = tasks.filter(task => task._id !== id);
      setTasks(newTasks);
      await AsyncStorage.setItem('tasks', JSON.stringify(newTasks));
    } catch (error) {}
  };

  const updateLocalTasks = task => {
    let newLocalTasks = localTasks;
    newLocalTasks.push(task);
    setLocalTasks(newLocalTasks);
    onUpdateTasks(task);
  };

  const renderItem = ({item}) => {
    const isSelected = item._id === selectedItemId;
    return (
      <TouchableOpacity
        onPress={() => handleSelectItem(item._id)}
        style={[
          styles.itemContainer,
          isSelected
            ? {backgroundColor: 'rgba(218, 180, 157, 0.3)'}
            : {backgroundColor: theme.complementary[item.color]},
        ]}>
        <Text style={styles.itemText}>{item.title}</Text>
        {isSelected && (
          <TouchableOpacity
            style={styles.overlayContainer}
            onPress={() => handleDeleteTask(item._id)}>
            <Text style={styles.overlayText}>지우기</Text>
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    );
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
  };

  return (
    <View>
      <View style={styles.container}>
        <FlatList
          data={localTasks}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          ListHeaderComponent={
            <TouchableOpacity
              style={[styles.addButton, {backgroundColor: theme.fifth}]}
              onPress={addItem}>
              <View style={[styles.addCardT, {backgroundColor: theme.primary}]}>
                <Text style={styles.addCardText}>+</Text>
                <Text style={styles.addCardTextKr}>할일 카드</Text>
              </View>
            </TouchableOpacity>
          }
        />
        <TaskWriteModal
          isVisible={isModalVisible}
          onClose={handleCloseModal}
          date={date}
          onUpdateTasks={updateLocalTasks}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    minHeight: 50,
    paddingBottom: 8,
  },
  itemContainer: {
    marginHorizontal: 8,
    marginTop: 8,
    borderRadius: 12,
    width: 75,
    height: 45,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemText: {
    color: '#fff',
  },
  overlayContainer: {
    position: 'absolute',
    borderRadius: 12,
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
  },
  overlayText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  addButton: {
    marginHorizontal: 8,
    marginTop: 8,
    borderRadius: 12,
    width: 75,
    height: 45,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addCardT: {
    width: 15,
    height: 15,
    bottom: 4,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addCardText: {
    left: 0.5,
    bottom: 1,
    borderRadius: 30,
    color: 'white',
  },
  addCardTextKr: {
    position: 'absolute',
    width: 38,
    top: 18,
    fontSize: 10,
    borderRadius: 30,
    color: '#999595',
  },
});

export default CalenderTaskComponent;
