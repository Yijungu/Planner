import React from 'react';
import {Text, StyleSheet} from 'react-native';

const CustomText = ({style, children, weight, ...props}) => {
  let fontFamily = 'NanumGothic-Regular'; // 기본 폰트 설정

  if (weight === 'bold') {
    fontFamily = 'NanumGothic-Bold';
  } else if (weight === 'extrabold') {
    fontFamily = 'NanumGothic-ExtraBold';
  }

  return (
    <Text style={[{fontFamily}, style]} {...props}>
      {children}
    </Text>
  );
};

export default CustomText;
