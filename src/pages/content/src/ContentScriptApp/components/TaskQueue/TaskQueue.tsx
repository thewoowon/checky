import { LinkQueueType } from "@src/shared/xState/checkyStreamChatStateMachine";

type TaskQueueProps = {
  queue: LinkQueueType[];
  setSelectedTask: (task: LinkQueueType) => void;
  clientX: number;
  clientY: number;
};

const TaskQueue = ({
  queue,
  setSelectedTask,
  clientX,
  clientY,
}: TaskQueueProps) => {
  return (
    <div
      style={{
        position: "relative",
        top: `${clientY}px`,
        left: `${clientX}px`,
        width: "100%",
        height: "300px",
        backgroundColor: "white",
        borderRadius: "10px",
        overflow: "scroll",
      }}
    >
      {queue.map((task, index) => (
        <div
          key={index}
          onClick={() => setSelectedTask(task)}
          style={{
            padding: "10px",
            border: "1px solid black",
            margin: "10px",
            cursor: "pointer",
          }}
        >
          {task.title}:{queue[0].url === task.url ? "분석중" : "대기중"}
        </div>
      ))}
    </div>
  );
};

export default TaskQueue;
