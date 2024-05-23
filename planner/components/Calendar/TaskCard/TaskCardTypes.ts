// TaskCardTypes.ts

export type TaskItem = {
  title: string;
  description: string;
  dueDate: string;
};

export type TaskCardProps = {
  tasks: TaskItem[];
};
