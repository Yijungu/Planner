import React, {
  useRef,
  useImperativeHandle,
  forwardRef,
  useState,
  useEffect,
} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Animated,
  TouchableOpacity,
  Modal,
} from 'react-native';
import moment from 'moment';
import 'moment-timezone';
import 'moment/locale/ko'; // 한국어 로케일 추가
import 'moment/locale/en-gb';
import {useDragDrop} from '../../../state/DragDropContext'; // 드래그 앤 드롭 컨텍스트 가져오기
import styles from './ScheduleListStyles';
import {
  LongPressGestureHandler,
  PanGestureHandler,
  State,
  GestureHandlerRootView,
} from 'react-native-gesture-handler';
import 'moment-timezone';
import 'moment/locale/ko';
import {useColor} from '../../../state/ColorContext';
import TimePickerModal from './TimePickerModal';

interface ScheduleListComponentProps extends ScheduleListProps {
  dateString: string;
}

// forwardRef를 사용하여 ScrollView에 대한 ref 전달 가능하도록 설정
const ScheduleListComponent = forwardRef<
  ScrollView,
  ScheduleListComponentProps
>((props, ref) => {
  const {
    schedule,
    dateString,
    handleDrop,
    setTotalSchedules,
    startHourOffset,
    setStartHourOffset,
    endHourOffset,
    setEndHourOffset,
  } = props;
  const {theme} = useColor();
  const scrollViewRef = useRef<ScrollView>(null);
  const [scrollOffset, setScrollOffset] = useState(0);
  const {handleDragEnd, handleDragStart, dragging, draggedItem} = useDragDrop();
  const [startTranslation, setStartTranslation] = useState({x: 0, y: 0});
  const translations = useRef({});
  const [currentTime, setCurrentTime] = useState(moment().tz('Asia/Seoul'));
  const [startDate, setStartDate] = useState(moment(dateString));
  const [modalVisible, setModalVisible] = useState(false);
  const [pickerMode, setPickerMode] = useState<'start' | 'end'>('start');
  const [zIndex, setZIndex] = useState(0);

  useEffect(() => {
    // 새로운 아이템에 대해서만 Animated.ValueXY를 생성합니다.
    setStartDate(moment(dateString));
  }, [dateString]);

  useEffect(() => {
    // 새로운 아이템에 대해서만 Animated.ValueXY를 생성합니다.
    schedule.forEach(item => {
      if (!translations.current[item._id]) {
        // 아직 Animated.ValueXY가 생성되지 않았으면 새로 생성합니다.
        translations.current[item._id] = new Animated.ValueXY();
      }
    });
  }, [schedule]);

  useEffect(() => {
    const currentHour = moment().tz('Asia/Seoul').hour();
    const scrollToY = currentHour * 50 + 25 - startHourOffset * 50;
    setTimeout(() => {
      scrollViewRef.current?.scrollTo({y: scrollToY, animated: true}); // 계산된 위치로 스크롤합니다.
    }, 100); // 100ms 후에 스크롤 조정을 시작합니다.
  }, [dateString]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(moment().tz('Asia/Seoul'));
    }, 60000); // 매분마다 현재 시간 업데이트

    return () => clearInterval(timer); // 컴포넌트 언마운트 시 타이머 제거
  }, []);

  // 현재 시간 선 위치 계산
  const currentTimeLineOffset = () => {
    const minutesSinceMidnight =
      currentTime.hours() * 60 + currentTime.minutes();
    return ((minutesSinceMidnight - startHourOffset * 60) / 60) * 50; // 시간당 높이 50으로 가정
  };

  useImperativeHandle(ref, () => ({
    measure: callback => {
      scrollViewRef.current?.measure((x, y, width, height, pageX, pageY) => {
        callback({x, y, width, height, pageX, pageY, scrollOffset});
      });
    },
    getScrollOffset: () => scrollOffset,
  }));

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

  const startDrag = (item, nativeEvent, index) => {
    translations.current[item._id].x.setValue(0);
    translations.current[item._id].y.setValue(0);

    const startX = nativeEvent.absoluteX - 60;
    const startY = nativeEvent.absoluteY - 100;
    setZIndex(1);
    handleDragStart(item);
    setStartTranslation({x: startX, y: startY});
    // 드래그 시작 위치를 절대 위치로 설정합니다.
  };

  const endDrag = (item, nativeEvent) => {
    // 드래그가 끝난 후의 translation 값으로 드롭 지점 계산
    const dropX = startTranslation.x + nativeEvent.translationX;
    const dropY = startTranslation.y + nativeEvent.translationY;
    setZIndex(0);
    handleDrop(item, dropX, dropY);
    handleDragEnd();
  };

  const handleTimeChange = (hour, mode) => {
    if (mode === 'start') {
      // setEndHourOffset(endHourOffset + (hour - startHourOffset));
      if (24 > hour && hour > -1) setStartHourOffset(hour);
    } else {
      if (hour > startHourOffset) setEndHourOffset(hour);
    }
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

  const toggleModal = () => {
    setModalVisible(!modalVisible);
  };

  return (
    <View style={[styles.entireContainer, {zIndex}]}>
      <View style={styles.timePickerContainer}>
        <TouchableOpacity onPress={toggleModal}>
          <Text style={styles.dateText}>
            {formatDate(getTimeFromOffset(startHourOffset))} ~{' '}
            {formatDate(getTimeFromOffset(endHourOffset))}
          </Text>
        </TouchableOpacity>
      </View>

      <TimePickerModal
        visible={modalVisible}
        onClose={toggleModal}
        startTime={startHourOffset}
        endTime={endHourOffset}
        setStartTime={time => handleTimeChange(time, 'start')}
        setEndTime={time => handleTimeChange(time, 'end')}
        dateString={dateString}
      />
      <ScrollView
        ref={scrollViewRef}
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
              {item.targetTime === undefined && (
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
                  <Text style={styles.eventText}>{item.event}</Text>
                </View>
              )}
              {item.targetTime && (
                <GestureHandlerRootView style={StyleSheet.absoluteFillObject}>
                  <PanGestureHandler
                    onGestureEvent={Animated.event(
                      [
                        {
                          nativeEvent: {
                            translationX: translations.current[item._id].x,
                            translationY: translations.current[item._id].y,
                          },
                        },
                      ],
                      {useNativeDriver: false},
                    )}
                    onHandlerStateChange={({nativeEvent}) => {
                      if (nativeEvent.state === State.BEGAN) {
                        startDrag(item, nativeEvent, index);
                      } else if (nativeEvent.state === State.END) {
                        endDrag(item, nativeEvent);
                      }
                    }}>
                    <Animated.View
                      style={[
                        styles.draggEvent,
                        {
                          top: topOffset,
                          height,
                          left: 60,
                          backgroundColor:
                            draggedItem?._id === item._id
                              ? 'transparent'
                              : theme.complementary[item.color],
                        },
                      ]}>
                      <Text style={styles.eventText}>{item.event}</Text>
                    </Animated.View>
                  </PanGestureHandler>
                </GestureHandlerRootView>
              )}
            </>
          );
        })}
        <View
          style={[
            styles.currentTimeLine,
            {top: currentTimeLineOffset() + 25},
          ]}></View>
      </ScrollView>
      {dragging && draggedItem && draggedItem.toSchedule === undefined && (
        <Animated.View
          style={[
            styles.draggingEvent,
            {
              backgroundColor: theme.complementary[draggedItem.color],
              transform: [
                {
                  translateX: Animated.add(
                    startTranslation.x,
                    translations.current[draggedItem._id].x,
                  ),
                },
                {
                  translateY: Animated.add(
                    startTranslation.y,
                    translations.current[draggedItem._id].y,
                  ),
                },
              ],
            },
          ]}>
          <Text style={styles.eventText}>{draggedItem.event}</Text>
        </Animated.View>
      )}
    </View>
  );
});

export default ScheduleListComponent;
