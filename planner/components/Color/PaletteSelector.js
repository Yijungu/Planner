import React from 'react';
import {
  View,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Text,
  ScrollView,
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
      <View style={styles.modalOverlay}>
        <View style={styles.modalView}>
          <Text style={styles.title}>Select a Theme</Text>
          <ScrollView contentContainerStyle={styles.scrollContainer}>
            <View style={styles.container}>
              {Object.entries(palettes).map(([name, palette]) => (
                <TouchableOpacity
                  style={[
                    styles.paletteButton,
                    {backgroundColor: palette.primary},
                  ]}
                  key={name}
                  onPress={() => {
                    setTheme(palette);
                    onClose();
                  }}>
                  <Text
                    style={[styles.paletteButtonText, {color: palette.fourth}]}>
                    {name} Theme
                  </Text>
                  <View style={styles.colorPreviewContainer}>
                    {Object.values(palette).map((color, index) => (
                      <View
                        key={index}
                        style={[styles.colorPreview, {backgroundColor: color}]}
                      />
                    ))}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
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
    width: '90%',
    maxHeight: '80%',
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    alignItems: 'center',
  },
  scrollContainer: {
    alignItems: 'center',
  },
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  paletteButton: {
    width: '42%', // Palette buttons take up 45% of the container width
    marginVertical: 10,
    marginHorizontal: 10,
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  paletteButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  colorPreviewContainer: {
    flexDirection: 'row',
    marginTop: 10,
  },
  colorPreview: {
    width: 15,
    height: 15,
    borderRadius: 3,
    marginHorizontal: 2,
    borderWidth: 0.3,
    borderColor: 'white',
  },
  closeButton: {
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 30,
    backgroundColor: '#ff5a5f',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  closeButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
  },
});

export default PaletteSelector;
