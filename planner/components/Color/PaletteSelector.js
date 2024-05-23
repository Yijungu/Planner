import React from 'react';
import {
  View,
  Button,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Text,
} from 'react-native';
import {useColor} from '../../state/ColorContext';
import palettes from '../../utils/colors'; // Importing all palettes as a single object

const PaletteSelector = ({visible, onClose}) => {
  const {setTheme} = useColor();

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}>
      <View style={styles.modalView}>
        <Text style={styles.title}>Select a Theme</Text>
        <View style={styles.container}>
          {Object.entries(palettes).map(([name, palette]) => (
            <View key={name} style={styles.buttonContainer}>
              <Button
                title={`${name} Theme`}
                onPress={() => {
                  setTheme(palette);
                  onClose();
                }}
                color={palette.primary}
              />
            </View>
          ))}
        </View>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Text style={styles.closeButtonText}>Close</Text>
        </TouchableOpacity>
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
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#f0f0f0',
  },
  buttonContainer: {
    marginVertical: 10,
    width: '80%',
    borderRadius: 5,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {width: 1, height: 1},
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  closeButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: 'red',
    borderRadius: 5,
  },
  closeButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  title: {
    fontSize: 18,
    marginBottom: 20,
  },
});

export default PaletteSelector;
