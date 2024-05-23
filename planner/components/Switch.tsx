import React, {useState, useEffect, useRef} from 'react';
import {View, Text, TouchableOpacity, StyleSheet, Animated} from 'react-native';
import {useColor} from '../state/ColorContext';

const CustomSwitch = ({value, onValueChange}) => {
  const switchAnim = useRef(new Animated.Value(value ? 1 : 0)).current;
  const {theme} = useColor();

  useEffect(() => {
    Animated.timing(switchAnim, {
      toValue: value ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [value]);

  const interpolateBackgroundColor = switchAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [theme.third, theme.fourth],
  });

  const interpolatePosition = switchAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [2, 20],
  });

  return (
    <TouchableOpacity
      style={[styles.switchContainer]}
      onPress={() => onValueChange(!value)}>
      <Animated.View
        style={[
          styles.switchBackground,
          {backgroundColor: interpolateBackgroundColor},
        ]}
      />
      <Animated.View
        style={[
          styles.switchCircle,
          {transform: [{translateX: interpolatePosition}]},
        ]}
      />
      <Text style={styles.switchTextRight}>{value ? '기록' : '   '}</Text>
      <Text style={styles.switchTextLeft}>{value ? '   ' : '계획'}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 40,
    height: 20,
    borderRadius: 15,
    padding: 2,
    position: 'relative',
  },
  switchBackground: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 15,
  },
  switchCircle: {
    width: 13,
    height: 13,
    borderRadius: 13,
    backgroundColor: '#fff',
    position: 'absolute',
  },
  switchTextLeft: {
    position: 'absolute',
    right: 7,
    fontSize: 9,
    color: '#FFFFFF',
  },
  switchTextRight: {
    position: 'absolute',
    left: 3.5,
    fontSize: 9,
    color: '#FFFFFF',
  },
});

export default CustomSwitch;
