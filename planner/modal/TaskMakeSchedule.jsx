import React, {useRef, useImperativeHandle, useState, useEffect} from 'react';
import {View, Text, ScrollView, Animated} from 'react-native';
import moment from 'moment';
import 'moment-timezone';
import 'moment/locale/ko'; // 한국어 로케일 추가
import 'moment/locale/en-gb';

import styles from './ScheduleListStyles';
import 'moment-timezone';
import 'moment/locale/ko';
import {useColor} from '../state/ColorContext';

const TaskMakeSchedule = ({
  schedule,
  dateString,
  startHourOffset,
  endHourOffset,
}) => {
  const {theme} = useColor();
  const [scrollOffset, setScrollOffset] = useState(0);
  const translations = useRef({});
  const [currentTime, setCurrentTime] = useState(moment().tz('Asia/Seoul'));

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(moment().tz('Asia/Seoul'));
    }, 60000); // 매분마다 현재 시간 업데이트

    return () => clearInterval(timer); // 컴포넌트 언마운트 시 타이머 제거
  }, []);
  useEffect(() => {
    // 새로운 아이템에 대해서만 Animated.ValueXY를 생성합니다.
    schedule.forEach(item => {
      if (!translations.current[item._id]) {
        // 아직 Animated.ValueXY가 생성되지 않았으면 새로 생성합니다.
        translations.current[item._id] = new Animated.ValueXY();
      }
    });
  }, [schedule]);

  // 현재 시간 선 위치 계산
  const currentTimeLineOffset = () => {
    const minutesSinceMidnight =
      currentTime.hours() * 60 + currentTime.minutes();
    return ((minutesSinceMidnight - startHourOffset * 60) / 60) * 50; // 시간당 높이 50으로 가정
  };

  const filteredSchedules = schedule.filter(scheduleItem => {
    const scheduleDate = moment(scheduleItem.startTime).format('YYYY-MM-DD');
    return scheduleDate === dateString;
  });

  const createHourRows = () => {
    let hours = [];
    for (let hour = startHourOffset; hour <= endHourOffset; hour++) {
      const timeString = getTimeFromOffset(hour).format('HH 시'); // "01 시", "13 시" 형식으로 변환
      hours.push(
        <View key={hour} style={styles.hourRow}>
          <Text style={styles.hourText}>{timeString}</Text>
          <View style={styles.line} />
        </View>,
      );
    }
    return hours;
  };

  const handleScroll = event => {
    setScrollOffset(event.nativeEvent.contentOffset.y);
  };

  const formatDate = date => {
    const originalLocale = moment.locale();
    moment.locale('en-gb');
    const formattedDate = date.format('D. h a');
    moment.locale(originalLocale); // 다시 한국어 로케일로 변경
    return formattedDate;
  };

  const getTimeFromOffset = offset => {
    return moment(dateString).clone().add(offset, 'hours');
  };

  return (
    <View style={styles.entireContainer}>
      <View style={styles.timePickerContainer}>
        <Text style={styles.dateText}>
          {formatDate(getTimeFromOffset(startHourOffset))} ~{' '}
          {formatDate(getTimeFromOffset(endHourOffset))}
        </Text>
      </View>

      <ScrollView
        style={[styles.container, {backgroundColor: theme.third}]}
        onScroll={handleScroll}
        scrollEventThrottle={1}>
        {createHourRows()}
        {filteredSchedules.map((item, index) => {
          const getTimeInMinutes = (timeStr, referenceDateStr) => {
            const time = moment(timeStr); // moment 객체로 변환
            const referenceDate = moment(referenceDateStr); // 기준 날짜 객체로 변환
            const diffInDays = time.diff(referenceDate, 'days'); // 기준 날짜와의 일 수 차이 계산
            return diffInDays * 24 * 60 + time.hours() * 60 + time.minutes(); // 일 수 차이를 분 단위로 변환 후 추가
          };

          const startMinutes = getTimeInMinutes(item.startTime, dateString);
          const endMinutes = getTimeInMinutes(item.endTime, dateString);
          const topOffset =
            ((startMinutes - startHourOffset * 60) / 60) * 50 + 25;
          const height = ((endMinutes - startMinutes) / 60) * 50 - 1;
          translations.current[item._id] = new Animated.ValueXY();
          return (
            <>
              <View
                key={index}
                style={[
                  styles.event,
                  {
                    top: topOffset,
                    height,
                    backgroundColor: theme.complementary[item.color],
                  },
                ]}>
                <Text style={styles.eventText}>{item.event.slice(0, 2)}</Text>
              </View>
            </>
          );
        })}
        <View
          style={[
            styles.currentTimeLine,
            {top: currentTimeLineOffset() + 25},
          ]}></View>
      </ScrollView>
    </View>
  );
};

export default TaskMakeSchedule;
