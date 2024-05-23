//DayComponent.tsx
import React from 'react';
import {
  TouchableOpacity,
  View,
  Text,
  StyleSheet,
  Dimensions,
} from 'react-native';
import moment from 'moment';
import {useColor} from '../../state/ColorContext';

const formatDate = date => date.split('T')[0];
const screenWidth = Dimensions.get('window').width;

const DayComponentSelected = ({
  date,
  isCurrentMonth,
  isToday,
  daySchedule,
  dayTasks,
  openModal,
}) => {
  const {theme} = useColor();
  const dateObject = new Date(date);
  // 원하는 형태의 객체로 변환
  const formattedDate = {
    dateString: dateObject.toISOString().split('T')[0], // ISO 문자열에서 날짜 부분만 추출
    day: dateObject.getDate(), // 일
    month: dateObject.getMonth() + 1, // 월 (getMonth는 0부터 시작하므로 1을 더해줌)
    year: dateObject.getFullYear(), // 년
  };
  const dayObj = moment(formattedDate.dateString);
  const isSunday = dayObj.day() === 0;

  let dateTextStyle = styles.dateText;

  if (!isCurrentMonth) {
    dateTextStyle = {...dateTextStyle, ...styles.dateTextNotInCurrentMonth};
  } else if (isSunday) {
    dateTextStyle = {...dateTextStyle, ...styles.sundayText};
  }

  // 모달을 여는 함수를 호출합니다.

  const formatEventTime = startTime => {
    // 시간을 12시간 형식으로 변환 ('h'는 1-12시간을 표시, 'A'는 AM/PM을 표시)
    let time = moment(startTime).format('h');
    if (time === '12') {
      time = '0';
    }
    return `${time}시`; // "3시", "4시", "3시" 등의 형식으로 반환
  };

  return (
    <View style={isToday ? styles.todayContainer : styles.dayContainer}>
      <View>
        <Text style={dateTextStyle}>{formattedDate.day}</Text>
      </View>
      {/* 태스크 아이템 렌더링 */}
      {dayTasks.map((task, index) => {
        let taskStyle = {
          backgroundColor: theme.complementary[task.color],
          borderColor: theme.complementary[task.color],
        };

        let additionalStyle = {};

        if (!task.done) {
          additionalStyle = {
            opacity: 0.5, // 투명화 처리
          };
        } else if (task.finish) {
          additionalStyle = {
            shadowColor: theme.fourth,
            shadowOffset: {width: 0, height: 0},
            shadowOpacity: 6, // 더 강한 그림자
            shadowRadius: 2, // 직경을 짧게
            elevation: 15, // 더 강한 그림자 효과
          };
        }

        return (
          <View
            key={task.title + task.id + index}
            style={[
              styles.eventItem,
              styles.taskItem,
              taskStyle,
              additionalStyle,
            ]}>
            <Text style={styles.eventText}>{task.title.slice(0, 3)}</Text>
          </View>
        );
      })}
      {daySchedule.map((event, index) => {
        return (
          <View
            key={event.startTime + event.id + index}
            style={styles.eventItemSchedule}>
            {/* 이벤트 제목의 처음 세 글자와 시간을 결합하여 표시 */}
            <Text style={styles.eventText}>
              {formatEventTime(event.startTime)} {event.event.slice(0, 3)}
            </Text>
            <View
              style={[
                styles.marker,
                {backgroundColor: theme.complementary[event.color]},
              ]}></View>
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  eventItem: {
    flexDirection: 'row',
    alignItems: 'center',
    textAlign: 'center',
    justifyContent: 'center',
    marginVertical: 2,
    paddingHorizontal: 2,
    // paddingVertical: 1,
  },
  eventItemSchedule: {
    alignItems: 'center',
    textAlign: 'center',
    justifyContent: 'center',
    marginVertical: 4,
    // paddingVertical: 1,
  },
  marker: {
    position: 'absolute',
    left: 0,
    top: 10,
    width: 12,
    height: 4,
    borderRadius: 2,
  },
  eventText: {
    fontSize: 7.5,
    textAlign: 'center',
  },
  eventMarker: {
    width: 6,
    height: 20,
    borderRadius: 3,
    marginRight: 4,
  },
  taskItem: {
    height: 17,
    borderWidth: 2,
    borderRadius: 4, // 타원형 테두리의 곡률을 낮춥니다.
  },
  scheduleItem: {
    // Schedule 아이템에 대한 스타일을 유지합니다.
  },
  taskMarker: {
    width: 20, // 타원의 너비를 더 넓게 설정
    height: 6, // 타원의 높이를 줄여서 더 납작하게 만듭니다.
    borderRadius: 3, // 낮은 곡률로 설정
    backgroundColor: 'black', // 타원의 색상
    marginRight: 4,
  },
  dateText: {
    textAlign: 'center',
    color: 'black',
  },
  todayContainer: {
    width: screenWidth / 7 - 0.000001,
    paddingHorizontal: 10,
    paddingVertical: 5,
    // margin: 5,
    minHeight: 70,
    borderRadius: 10,
    backgroundColor: 'rgba(230, 230, 230, 0.5)',
  },
  dayContainer: {
    width: screenWidth / 7 - 0.000001,
    paddingHorizontal: 10,
    paddingVertical: 5,
    // margin: 5,
    minHeight: 70,
  },
  sundayText: {
    color: 'red',
  },
  dateTextNotInCurrentMonth: {
    color: 'lightgrey',
  },
  todayMarker: {
    // top: -5,
    // width: 20,
    // height: 20,
    fontSize: 12,
    borderRadius: 15,
    backgroundColor: '#D9D9D9',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default DayComponentSelected;
