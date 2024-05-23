import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Modal,
  Alert,
} from 'react-native';
import {useUser} from '../../state/UserContext';
import axios from 'axios'; // Axios를 사용하여 서버에 요청을 보냅니다.

const UserCategoryEditor = ({visible, onClose}) => {
  const {user, setUser} = useUser();
  const [categories, setCategories] = useState(user.category);

  const handleChange = (key, value) => {
    setCategories(prev => ({...prev, [key]: value}));
  };

  const handleSave = async () => {
    try {
      // 서버에 변경 사항을 저장하는 API 호출
      const response = await axios.post(
        'http://localhost:8080/user/update-category',
        {
          userId: user.id,
          categories,
        },
      );

      if (response.status === 200) {
        setUser(prevUser => ({...prevUser, category: categories}));
        onClose();
      } else {
        Alert.alert('Error', 'Failed to update categories on server');
      }
    } catch (error) {
      console.error('Error updating categories:', error);
      Alert.alert('Error', 'Failed to update categories on server');
    }
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}>
      <View style={styles.modalView}>
        <Text style={styles.title}>Edit Categories</Text>
        {Object.keys(categories).map(key => (
          <View key={key} style={styles.inputContainer}>
            <Text style={styles.label}>Category {key}:</Text>
            <TextInput
              style={styles.input}
              value={categories[key]}
              onChangeText={value => handleChange(key, value)}
            />
          </View>
        ))}
        <Button title="Save" onPress={handleSave} />
        <Button title="Close" onPress={onClose} color="red" />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalView: {
    margin: 20,
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  title: {
    fontSize: 18,
    marginBottom: 10,
  },
  inputContainer: {
    marginBottom: 10,
  },
  label: {
    fontSize: 14,
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    backgroundColor: '#fff',
  },
});

export default UserCategoryEditor;
