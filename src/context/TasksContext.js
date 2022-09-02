import AsyncStorage from '@react-native-async-storage/async-storage';
import createDataContext from './createDataContext';

import loadFiles from '../utils/loadFiles';

const appReducer = (state, action) => {
  switch (action.type) {
    case 'add_task':
      return {
        ...state,
        tasks: [...state.tasks, action.payload],
      };
    case 'set_trimmer_task':
      return {
        ...state,
        trimmerTask: action.payload,
      };
    case 'remove_task':
      return {
        ...state,
        tasks: [
          ...state.tasks.filter(
            ({executionId}) => executionId !== action.payload,
          ),
        ],
      };
    case 'refresh_tasks':
      return {
        ...state,
        refreshTasks: !state.refreshTasks,
      };
    case 'set_is_task_cancelled':
      return {
        ...state,
        isTaskCancelled: action.payload,
      };
    default:
      return state;
  }
};

const addTask = dispatch => {
  return task => {
    dispatch({
      type: 'add_task',
      payload: task,
    });
  };
};

const setTrimmerTask = dispatch => {
  return task => {
    dispatch({
      type: 'set_trimmer_task',
      payload: task,
    });
  };
};

const removeTask = dispatch => {
  return executionId => {
    dispatch({
      type: 'remove_task',
      payload: executionId,
    });
  };
};

const setRefreshTasks = dispatch => {
  return () => {
    dispatch({
      type: 'refresh_tasks',
    });
  };
};

const setIsTaskCancelled = dispatch => {
  return ref => {
    dispatch({
      type: 'set_is_task_cancelled',
      payload: ref,
    });
  };
};

export const {Context, Provider} = createDataContext(
  appReducer,
  {
    addTask,
    setTrimmerTask,
    removeTask,
    setRefreshTasks,
    setIsTaskCancelled,
  },
  {
    tasks: [],
    refreshTasks: false,
  },
);
