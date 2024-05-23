import React, {createContext, useContext, useState} from 'react';
import palettes from '../utils/colors'; // 모든 팔레트를 하나의 객체로 가져옵니다.

const ColorContext = createContext({
  theme: palettes.Pink, // Pink 팔레트를 기본값으로 설정
  setTheme: () => {},
});

export const ColorProvider = ({children}) => {
  const [theme, setTheme] = useState(palettes.Pink); // useState에 Pink 팔레트를 초기값으로 설정

  return (
    <ColorContext.Provider value={{theme, setTheme}}>
      {children}
    </ColorContext.Provider>
  );
};

export const useColor = () => useContext(ColorContext);
