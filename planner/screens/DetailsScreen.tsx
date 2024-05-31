import React, {useState} from 'react';
import {View, Text, StyleSheet, Image, TouchableOpacity} from 'react-native';
import PaletteSelector from '../components/Color/PaletteSelector';
import UserCategoryEditor from '../components/User/UserCategoryEditor';
import {useUser} from '../state/UserContext';
import AIComponent from '../components/AIComponent';
export default function DetailsScreen() {
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [paletteModalVisible, setPaletteModalVisible] = useState(false);
  const {user} = useUser();

  return (
    <View style={styles.container}>
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{user.nickname}</Text>
        <Text style={styles.userEmail}>{user.email}</Text>
      </View>
      <View style={styles.optionsContainer}>
        <TouchableOpacity
          style={styles.optionButton}
          onPress={() => setCategoryModalVisible(true)}>
          <Text style={styles.optionButtonText}>Edit Categories</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.optionButton}
          onPress={() => setPaletteModalVisible(true)}>
          <Text style={styles.optionButtonText}>Select Palette</Text>
        </TouchableOpacity>
      </View>
      <UserCategoryEditor
        visible={categoryModalVisible}
        onClose={() => setCategoryModalVisible(false)}
      />
      <PaletteSelector
        visible={paletteModalVisible}
        onClose={() => setPaletteModalVisible(false)}
      />
      <AIComponent></AIComponent>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f9f9f9',
  },
  userInfo: {
    alignItems: 'center',
    marginVertical: 20,
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 6,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 15,
  },
  userName: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 5,
    color: '#333',
  },
  userEmail: {
    fontSize: 16,
    color: '#888',
  },
  optionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  optionButton: {
    flex: 1,
    marginHorizontal: 10,
    backgroundColor: '#4A90E2',
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 5,
  },
  optionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
