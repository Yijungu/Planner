import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Alert,
  ScrollView,
} from 'react-native';
import {useUser} from '../../state/UserContext';
import {useColor} from '../../state/ColorContext';
import api from '../../utils/api';

const UserCategoryEditor = ({visible, onClose}) => {
  const {user, setUser} = useUser();
  const {theme} = useColor();
  const [categories, setCategories] = useState(user.category);

  const handleChange = (key, value) => {
    setCategories(prev => ({...prev, [key]: value}));
  };

  const handleSave = async () => {
    try {
      // 서버에 변경 사항을 저장하는 API 호출
      const response = await api.post('/user/update-category', {
        userId: user.id,
        categories,
      });

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
      <View style={styles.modalOverlay}>
        <View style={styles.modalView}>
          <Text style={styles.title}>Edit Categories</Text>
          <ScrollView style={styles.scrollContainer}>
            {Object.keys(categories).map(key => (
              <View key={key} style={styles.inputContainer}>
                <View style={styles.categoryTextContainer}>
                  <Text style={styles.label}>Category </Text>
                  <View
                    style={[
                      styles.colorCircle,
                      {backgroundColor: theme.complementary[key]},
                    ]}
                  />
                </View>
                <TextInput
                  style={styles.input}
                  value={categories[key]}
                  onChangeText={value => handleChange(key, value)}
                />
              </View>
            ))}
          </ScrollView>
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.buttonText}>Save</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.buttonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    width: '80%',
    maxHeight: '80%',
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
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  scrollContainer: {
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    backgroundColor: '#f9f9f9',
    fontSize: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginRight: 10,
  },
  closeButton: {
    flex: 1,
    backgroundColor: '#f44336',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
  },
  colorCircle: {
    width: 10,
    height: 10,
    borderRadius: 10,
    marginBottom: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  categoryTextContainer: {
    flexDirection: 'row',
    // justifyContent: 'center',
    alignItems: 'center',
  },
});

export default UserCategoryEditor;
