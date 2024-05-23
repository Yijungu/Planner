// ScheduleListTypes.ts

export type ScheduleItem = {
  id: string;
  startTime: string; // 'HH:mm' format
  endTime: string; // 'HH:mm' format
  event: string;
  color: string; // Unique color for the event
};

type HandleDropFunction = (
  item: ScheduleItem,
  dropX: number,
  dropY: number,
) => Promise<boolean>;

// 전체 일정 설정 함수 타입 정의
// 이 함수는 새로운 일정 배열을 받아 상태를 업데이트 합니다.
type SetTotalSchedulesFunction = (schedules: ScheduleItem[]) => void;

export type ScheduleListProps = {
  schedule: ScheduleItem[];
  handleDrop: HandleDropFunction;
  setTotalSchedules: SetTotalSchedulesFunction;
  startHourOffset: number;
  setStartHourOffset: (offset: number) => void;
  endHourOffset: number;
  setEndHourOffset: (offset: number) => void;
};
