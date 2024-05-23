import React, {useState, useRef, useEffect} from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import moment, {months} from 'moment';

const screenWidth = Dimensions.get('window').width;

const DateDisplayComponent = ({onDateSelect}) => {
  const scrollViewRef = useRef(null);
  const [currentWeekStart, setCurrentWeekStart] = useState(
    moment().startOf('week'),
  );
  const [selectedDate, setSelectedDate] = useState(
    moment().format('YYYY-MM-DD'),
  );

  useEffect(() => {
    // 컴포넌트 마운트 후 초기 스크롤 위치 조정
    const scrollToX = screenWidth;
    setTimeout(() => {
      scrollViewRef.current?.scrollTo({x: scrollToX, animated: false});
    }, 100); // 100ms 후에 스크롤 조정을 시작합니다
  }, []);

  const handleSelectDate = date => {
    setSelectedDate(date);
    if (onDateSelect) {
      onDateSelect(date);
    }
  };

  const handleScroll = event => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    if (contentOffsetX < screenWidth / 2) {
      setCurrentWeekStart(prev => prev.clone().subtract(1, 'week'));
    } else if (contentOffsetX > screenWidth * 1.5) {
      setCurrentWeekStart(prev => prev.clone().add(1, 'week'));
    }
    // Reset scroll position to the middle page
    scrollViewRef.current?.scrollTo({x: screenWidth, animated: false});
  };

  const generateWeekDays = startOfWeek => {
    const daysArray = [];
    for (let i = 0; i < 7; i++) {
      const day = startOfWeek.clone().add(i, 'days');
      daysArray.push({
        day: day.format('ddd').toUpperCase(),
        date: day.date(),
        key: day.format('YYYY-MM-DD'),
      });
    }
    return daysArray;
  };

  const renderWeeks = () => {
    return [-1, 0, 1].map(weekOffset => {
      const startOfWeek = currentWeekStart.clone().add(weekOffset, 'week');
      const weekDays = generateWeekDays(startOfWeek);
      return (
        <View
          key={weekOffset}
          style={{flexDirection: 'row', width: screenWidth}}>
          {weekDays.map((day, index) => {
            const isSelected = selectedDate === day.key;
            return (
              <TouchableOpacity
                key={index}
                style={[
                  styles.dayContainer,
                  isSelected && styles.selectedContainer,
                ]}
                onPress={() => handleSelectDate(day.key)}>
                <Text
                  style={[
                    styles.dayText,
                    isSelected && styles.selectedDayText,
                  ]}>
                  {day.day}
                </Text>
                <Text
                  style={[
                    styles.dateText,
                    isSelected && styles.selectedDateText,
                  ]}>
                  {day.date}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      );
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.monthText}>
        {currentWeekStart.format('YYYY년 MMMM')}
      </Text>
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        ref={scrollViewRef}
        contentContainerStyle={styles.weekContainer}
        onMomentumScrollEnd={handleScroll}>
        {renderWeeks()}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    // flex: 1,
    marginTop: 23,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  weekContainer: {
    alignItems: 'center',
  },
  dayContainer: {
    width: screenWidth / 7,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 10,
  },
  selectedContainer: {
    // borderBottomWidth: 2,
    // borderBottomColor: 'black',
  },
  monthText: {
    marginTop: 1,
    fontSize: 18,
    fontWeight: '600',
  },
  dayText: {
    fontSize: 14,
    color: 'grey',
  },
  dateText: {
    fontSize: 14,
    color: 'grey',
  },
  selectedDayText: {
    color: 'black',
    fontSize: 15,
  },
  selectedDateText: {
    fontSize: 15,
    color: 'black',
  },
});

export default DateDisplayComponent;
