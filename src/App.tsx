import { useState, useEffect, useRef } from "react";

interface Task {
  id: number;
  title: string;
  estimatedPomodoros: number;
  completedPomodoros: number;
  completed: boolean;
}

interface FocusMetric {
  score: number;
  distractions: number;
}

enum TimerAction {
  PAUSE = "Pause",
  START = "Start",
}

export default function PomodoroApp() {
  // Timer state
  const [workDuration, setWorkDuration] = useState<number>(25);
  const [breakDuration, setBreakDuration] = useState<number>(5);
  const [timeLeft, setTimeLeft] = useState<number>(workDuration * 60);
  const [isActive, setIsActive] = useState<boolean>(false);
  const [isWorkSession, setIsWorkSession] = useState<boolean>(true);
  const [cycles, setCycles] = useState<number>(0);

  // Tasks state
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState<string>("");
  const [estimatedPomodoros, setEstimatedPomodoros] = useState<number>(1);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [activeTaskId, setActiveTaskId] = useState<number | null>(null);

  // Focus metrics
  const [focusMetrics, setFocusMetrics] = useState<FocusMetric>({
    score: 100,
    distractions: 0,
  });

  const [showFocusMetrics, setShowFocusMetrics] = useState<boolean>(false);

  const audioRef = useRef<HTMLAudioElement>(null);

  // Timer logic
  useEffect(() => {
    let interval: ReturnType<typeof setTimeout> | null = null;

    if (isActive) {
      interval = setInterval(() => {
        setTimeLeft((time) => {
          if (time <= 1) {
            // Play sound when timer ends
            if (audioRef.current) {
              audioRef.current.play();
            }

            // Switch between work and break
            if (isWorkSession) {
              // Work session completed
              if (activeTaskId !== null) {
                updateTaskProgress(activeTaskId);
              }
              setIsWorkSession(false);
              setTimeLeft(breakDuration * 60);
              return breakDuration * 60;
            } else {
              // Break completed, start new work session
              setIsWorkSession(true);
              setCycles((cycle) => cycle + 1);
              setTimeLeft(workDuration * 60);

              // Check if current task is now completed and if so, find next incomplete task
              if (activeTaskId !== null) {
                const currentTask = tasks.find((t) => t.id === activeTaskId);
                if (currentTask && currentTask.completed) {
                  // Find next incomplete task
                  const nextIncompleteTask = tasks.find((t) => !t.completed);
                  if (nextIncompleteTask) {
                    setActiveTaskId(nextIncompleteTask.id);
                  } else {
                    setActiveTaskId(null);
                  }
                }
              }

              return workDuration * 60;
            }
          }
          return time - 1;
        });
      }, 1000);
    } else if (!isActive && timeLeft !== 0) {
      if (interval) clearInterval(interval);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    isActive,
    isWorkSession,
    workDuration,
    breakDuration,
    activeTaskId,
    tasks,
  ]);

  // Format time as MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  // Get any incomplete task
  const getIncompleteTask = (): Task | undefined => {
    return tasks.find((task) => !task.completed);
  };

  // Control timer
  const toggleTimer = (action: TimerAction): void => {
    if (!isActive && tasks.length === 0) {
      alert("Add at least one task before starting the timer");
      return;
    }

    // Check if there are any incomplete tasks
    if (!isActive && !getIncompleteTask()) {
      alert("All tasks are completed. Please add a new task to continue.");
      return;
    }

    // If no active task is selected, select the first incomplete task
    if (!isActive && activeTaskId === null) {
      const firstIncompleteTask = getIncompleteTask();
      if (firstIncompleteTask) {
        setActiveTaskId(firstIncompleteTask.id);
      } else {
        alert("All tasks are completed. Please add a new task to continue.");
        return;
      }
    }

    // Check if the active task is completed
    if (!isActive && activeTaskId !== null) {
      const activeTask = tasks.find((t) => t.id === activeTaskId);
      if (activeTask && activeTask.completed) {
        const nextIncompleteTask = getIncompleteTask();
        if (nextIncompleteTask) {
          setActiveTaskId(nextIncompleteTask.id);
        } else {
          alert("All tasks are completed. Please add a new task to continue.");
          return;
        }
      }
    }

    if (action === TimerAction.PAUSE) {
      setFocusMetrics((previous) => ({
        ...previous,
        distractions: previous.distractions + 1,
        score: Math.max(previous.score - 5, 0),
      }));
    }

    setIsActive(!isActive);
  };

  const resetTimer = (): void => {
    setIsActive(false);
    setIsWorkSession(true);
    setTimeLeft(workDuration * 60);
  };

  // Skip break and start next work session
  const skipBreak = (): void => {
    if (!isWorkSession) {
      setIsWorkSession(true);
      setTimeLeft(workDuration * 60);
      setCycles((cycle) => cycle + 1);

      // Check if current task is completed and select next incomplete task if needed
      if (activeTaskId !== null) {
        const currentTask = tasks.find((t) => t.id === activeTaskId);
        if (currentTask && currentTask.completed) {
          const nextIncompleteTask = getIncompleteTask();
          if (nextIncompleteTask) {
            setActiveTaskId(nextIncompleteTask.id);
          } else {
            setActiveTaskId(null);
            setIsActive(false);
            alert(
              "All tasks are completed. Please add a new task to continue."
            );
          }
        }
      }
    }
  };

  // Create a new task
  const addTask = (): void => {
    if (newTask.trim() === "") {
      alert("Task name cannot be empty");
      return;
    }

    const task: Task = {
      id: Date.now(),
      title: newTask,
      estimatedPomodoros: estimatedPomodoros,
      completedPomodoros: 0,
      completed: false,
    };

    setTasks([...tasks, task]);
    setNewTask("");
    setEstimatedPomodoros(1);

    // Set as active task if no active task or if current active task is completed
    if (activeTaskId === null) {
      setActiveTaskId(task.id);
    } else {
      const currentActiveTask = tasks.find((t) => t.id === activeTaskId);
      if (currentActiveTask && currentActiveTask.completed) {
        setActiveTaskId(task.id);
      }
    }
  };

  // Start edit mode for a task
  const startEditTask = (task: Task): void => {
    setEditingTask({ ...task });
  };

  // Save edited task
  const saveTask = (): void => {
    if (!editingTask) return;

    setTasks(
      tasks.map((task) => (task.id === editingTask.id ? editingTask : task))
    );
    setEditingTask(null);
  };

  // Delete a task
  const deleteTask = (id: number): void => {
    setTasks(tasks.filter((task) => task.id !== id));

    // Handle active task if deleted
    if (activeTaskId === id) {
      const remainingIncompleteTasks = tasks.filter(
        (t) => t.id !== id && !t.completed
      );
      if (remainingIncompleteTasks.length > 0) {
        setActiveTaskId(remainingIncompleteTasks[0].id);
      } else {
        setActiveTaskId(null);
      }
    }
  };

  // Update task progress when a work session is completed
  const updateTaskProgress = (taskId: number): void => {
    setTasks(
      tasks.map((task) => {
        if (task.id === taskId) {
          const newCompleted = task.completedPomodoros + 1;
          const isNowCompleted = newCompleted >= task.estimatedPomodoros;

          return {
            ...task,
            completedPomodoros: newCompleted,
            completed: isNowCompleted,
          };
        }
        return task;
      })
    );
  };

  // Set a task as active
  const setTaskActive = (id: number): void => {
    const taskToActivate = tasks.find((task) => task.id === id);

    // Don't set completed tasks as active
    if (taskToActivate && taskToActivate.completed) {
      alert(
        "This task is already completed. Please select an incomplete task."
      );
      return;
    }

    setActiveTaskId(id);
  };

  // Handle duration changes
  const handleWorkDurationChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ): void => {
    const value = parseInt(e.target.value);
    if (value > 0) {
      setWorkDuration(value);
      if (isWorkSession && !isActive) {
        setTimeLeft(value * 60);
      }
    }
  };

  const handleBreakDurationChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ): void => {
    const value = parseInt(e.target.value);
    if (value > 0) {
      setBreakDuration(value);
      if (!isWorkSession && !isActive) {
        setTimeLeft(value * 60);
      }
    }
  };

  // Calculate progress percentage for each task
  const getProgressPercentage = (task: Task): number => {
    if (task.estimatedPomodoros === 0) return 0;
    return Math.min(
      (task.completedPomodoros / task.estimatedPomodoros) * 100,
      100
    );
  };

  const getActiveTask = (): Task | undefined => {
    return tasks.find((task) => task.id === activeTaskId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 to-purple-900 p-4 text-gray-100">
      <div className="max-w-4xl mx-auto bg-gray-800 rounded-xl shadow-2xl overflow-hidden backdrop-blur-lg border border-gray-700">
        <div className="p-6">
          <h1 className="text-3xl font-bold text-center text-white mb-5">
            Focus Flow ⌛
          </h1>

          {/* Timer Section */}
          <div className="mb-8 bg-gray-900 bg-opacity-60 p-8 rounded-xl border border-gray-700 shadow-inner">
            <div className="flex justify-center">
              <div className="text-center">
                <div className="text-7xl font-mono font-bold mb-6 text-white">
                  {formatTime(timeLeft)}
                </div>
                <div className="mb-6 text-xl">
                  <span
                    className={`px-6 py-2 rounded-full ${
                      isWorkSession
                        ? "bg-indigo-600 text-white"
                        : "bg-purple-600 text-white"
                    }`}
                  >
                    {isWorkSession ? "Work Session" : "Break Time"}
                  </span>
                </div>

                <div className="flex flex-wrap space-x-2 mb-8 justify-center">
                  <button
                    onClick={() => {
                      toggleTimer(
                        isActive && isWorkSession
                          ? TimerAction.PAUSE
                          : TimerAction.START
                      );
                    }}
                    className={`px-6 py-3 rounded-full font-semibold transition-all duration-200 ${
                      isActive
                        ? "bg-red-500 hover:bg-red-600 text-white"
                        : "bg-emerald-500 hover:bg-emerald-600 text-white"
                    }`}
                  >
                    {isActive ? TimerAction.PAUSE : TimerAction.START}
                  </button>
                  <button
                    onClick={resetTimer}
                    className="px-6 py-3 rounded-full bg-gray-600 hover:bg-gray-700 text-white font-semibold transition-all duration-200"
                  >
                    Reset
                  </button>
                  {!isWorkSession && (
                    <button
                      onClick={skipBreak}
                      className="px-6 py-3 rounded-full bg-blue-500 hover:bg-blue-600 text-white font-semibold transition-all duration-200"
                    >
                      Skip Break
                    </button>
                  )}
                </div>

                {/* Current task indicator */}
                {activeTaskId !== null && (
                  <div className="mb-6 p-3 bg-gray-800 rounded-lg border border-gray-700">
                    <div className="text-sm text-gray-400 mb-1">
                      Current Task
                    </div>
                    <div className="font-semibold text-lg">
                      {getActiveTask()?.title || "No task selected"}
                    </div>
                  </div>
                )}

                {/* Timer settings */}
                <div className="grid grid-cols-2 gap-6 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Work Duration (mins)
                    </label>
                    <input
                      type="number"
                      value={workDuration}
                      onChange={handleWorkDurationChange}
                      className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                      min="1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Break Duration (mins)
                    </label>
                    <input
                      type="number"
                      value={breakDuration}
                      onChange={handleBreakDurationChange}
                      className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                      min="1"
                    />
                  </div>
                </div>

                <div className="text-sm text-gray-400 mt-4">
                  Completed Cycles: {cycles}
                </div>
              </div>
            </div>
          </div>

          {/* Focus Metrics Section */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-xl font-semibold text-white">
                Focus Metrics
              </h2>
              <button
                onClick={() => setShowFocusMetrics(!showFocusMetrics)}
                className="text-indigo-300 text-sm font-medium hover:text-indigo-200 transition-colors"
              >
                {showFocusMetrics ? "Hide Details" : "Show Details"}
              </button>
            </div>

            <div className="bg-gray-900 p-6 rounded-xl border border-gray-700">
              <div className="mb-3">
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium text-gray-300">
                    Focus Score
                  </span>
                  <span className="text-sm font-medium text-gray-300">
                    {focusMetrics.score}%
                  </span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full ${
                      focusMetrics.score > 80
                        ? "bg-emerald-500"
                        : focusMetrics.score > 50
                        ? "bg-yellow-500"
                        : "bg-red-500"
                    }`}
                    style={{ width: `${focusMetrics.score}%` }}
                  ></div>
                </div>
              </div>

              {showFocusMetrics && (
                <div className="mt-5 space-y-3 text-sm">
                  <div className="flex justify-between items-center p-3 bg-gray-800 rounded-lg">
                    <span className="text-gray-300">
                      Detected distractions:
                    </span>
                    <span className="bg-gray-700 px-3 py-1 rounded-full text-gray-200">
                      {focusMetrics.distractions}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-800 rounded-lg">
                    <span className="text-gray-300">Completed sessions:</span>
                    <span className="bg-gray-700 px-3 py-1 rounded-full text-gray-200">
                      {cycles}
                    </span>
                  </div>
                  <div className="mt-4 text-xs text-gray-400 italic p-3 border-l-2 border-indigo-500 bg-gray-800 rounded-r-lg">
                    Your focus score reflects how well you maintain attention
                    during work sessions. The app detects the number of times
                    you pause the timer, which may indicate distractions.
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Task Management Section */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4 text-white">Tasks</h2>

            {/* Add Task Form */}
            <div className="flex flex-col md:flex-row md:items-end space-y-3 md:space-y-0 md:space-x-3 mb-6 bg-gray-900 p-4 rounded-xl border border-gray-700">
              <div className="flex-grow">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Task Name
                </label>
                <input
                  type="text"
                  value={newTask}
                  onChange={(e) => setNewTask(e.target.value)}
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  placeholder="Enter a new task"
                />
              </div>
              <div className="md:w-32">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Est. Pomodoros
                </label>
                <input
                  type="number"
                  value={estimatedPomodoros}
                  onChange={(e) =>
                    setEstimatedPomodoros(
                      Math.max(1, parseInt(e.target.value) || 1)
                    )
                  }
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  min="1"
                />
              </div>
              <button
                onClick={addTask}
                className="px-5  py-3 h-max bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all duration-200 font-semibold flex-shrink-0 self-end"
              >
                Add Task
              </button>
            </div>

            {/* Task List */}
            <div className="space-y-4">
              {tasks.length === 0 ? (
                <div className="text-center text-gray-400 py-12 bg-gray-900 bg-opacity-60 rounded-xl border border-gray-700">
                  <div className="text-4xl mb-4">📋</div>
                  <div>No tasks yet. Add a task to get started!</div>
                </div>
              ) : (
                tasks.map((task) => (
                  <div
                    key={task.id}
                    className={`border rounded-xl p-4 transition-all duration-200 ${
                      activeTaskId === task.id
                        ? "border-indigo-500 bg-indigo-900 bg-opacity-30"
                        : "border-gray-700 bg-gray-800 hover:bg-gray-900 hover:border-gray-600"
                    } ${
                      task.completed
                        ? "border-green-600 bg-green-900 bg-opacity-20"
                        : ""
                    }`}
                  >
                    {editingTask && editingTask.id === task.id ? (
                      <div className="flex flex-col space-y-3 md:flex-row md:space-y-0 md:space-x-3">
                        <input
                          type="text"
                          value={editingTask.title}
                          onChange={(e) =>
                            setEditingTask({
                              ...editingTask,
                              title: e.target.value,
                            })
                          }
                          className="flex-grow p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                        />
                        <input
                          type="number"
                          value={editingTask.estimatedPomodoros}
                          onChange={(e) =>
                            setEditingTask({
                              ...editingTask,
                              estimatedPomodoros: Math.max(
                                editingTask.completedPomodoros,
                                parseInt(e.target.value) || 1
                              ),
                            })
                          }
                          className="w-full md:w-32 p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                          min={editingTask.completedPomodoros}
                        />
                        <button
                          onClick={saveTask}
                          className="px-5 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-all duration-200 font-medium"
                        >
                          Save
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="flex justify-between mb-3">
                          <div className="font-medium text-lg">
                            {task.title}
                          </div>
                          <div className="text-sm bg-gray-700 px-3 py-1 rounded-full text-gray-300">
                            {task.completedPomodoros}/{task.estimatedPomodoros}{" "}
                            Pomodoros
                          </div>
                        </div>

                        <div className="mb-3">
                          <div className="w-full bg-gray-700 rounded-full h-2.5">
                            <div
                              className={`${
                                task.completed
                                  ? "bg-emerald-500"
                                  : "bg-indigo-500"
                              } h-2.5 rounded-full transition-all duration-500`}
                              style={{
                                width: `${getProgressPercentage(task)}%`,
                              }}
                            ></div>
                          </div>
                        </div>

                        <div className="flex flex-wrap justify-between mt-3">
                          <div>
                            <button
                              onClick={() => setTaskActive(task.id)}
                              className={`text-sm px-3 py-1 rounded-lg mr-2 transition-all ${
                                activeTaskId === task.id
                                  ? "bg-indigo-600 text-white"
                                  : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                              }`}
                            >
                              {activeTaskId === task.id
                                ? "Active"
                                : "Set Active"}
                            </button>
                            {task.completed && (
                              <span className="text-sm bg-emerald-800 text-emerald-200 px-3 py-1 rounded-lg">
                                Completed!
                              </span>
                            )}
                          </div>
                          <div className="mt-2 md:mt-0">
                            <button
                              onClick={() => startEditTask(task)}
                              className="text-sm mr-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg transition-all"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => deleteTask(task.id)}
                              className="text-sm bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-lg transition-all"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Sound for timer completion */}
      <audio ref={audioRef} preload="auto">
        <source src="/clock-alarm.mp3"></source>
      </audio>
    </div>
  );
}
