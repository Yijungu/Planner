import React, {useState} from 'react';
import {View, Button, StyleSheet} from 'react-native';
import PaletteSelector from '../components/Color/PaletteSelector';
import UserCategoryEditor from '../components/User/UserCategoryEditor';

export default function DetailsScreen() {
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [paletteModalVisible, setPaletteModalVisible] = useState(false);

  return (
    <View style={styles.container}>
      <View style={styles.leftPane}>
        <Button
          title="Edit Categories"
          onPress={() => setCategoryModalVisible(true)}
        />
      </View>
      <View style={styles.rightPane}>
        <Button
          title="Select Palette"
          onPress={() => setPaletteModalVisible(true)}
        />
      </View>
      <UserCategoryEditor
        visible={categoryModalVisible}
        onClose={() => setCategoryModalVisible(false)}
      />
      <PaletteSelector
        visible={paletteModalVisible}
        onClose={() => setPaletteModalVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    padding: 20,
    backgroundColor: '#fff',
  },
  leftPane: {
    flex: 1,
    marginRight: 10,
    borderRadius: 10,
    backgroundColor: '#e0e0e0',
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rightPane: {
    flex: 1,
    marginLeft: 10,
    borderRadius: 10,
    backgroundColor: '#e0e0e0',
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
