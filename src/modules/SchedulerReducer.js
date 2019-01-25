import moment from 'moment';

export const SCHEDULER_ADD_SCHEDULE = 'SCHEDULER_ADD_SCHEDULE';
export const SCHEDULER_REMOVE_SCHEDULE = 'SCHEDULER_REMOVE_SCHEDULE';

const INITIAL_STATE = {
  reminders: [
    {
      description: 'Go to Walmart',
      date: moment({ year: moment().year(), month: moment().month(), day: 29, hour: 9, minute: 45 }),
      color: '#2274A5'
    },
    {
      description: 'Make calendar for Scheduller',
      date: moment({ year: moment().year(), month: moment().month(), day: 29, hour: 11, minute: 30 }),
      color: '#E6AF2E'
    },
  ]
};

export function addNewSchedule(schedule) {
  return (dispatch) => {
    dispatch({
      type: SCHEDULER_ADD_SCHEDULE,
      payload: schedule
    });
  }
}

export function removeSchedule(schedule) {
  return (dispatch) => {
    dispatch({
      type: SCHEDULER_REMOVE_SCHEDULE,
      payload: schedule
    });
  }
}

const actionHandlers = {
  [SCHEDULER_REMOVE_SCHEDULE]: (state, action) => {
    const reminder = action.payload;
    const reminderIndex = state.reminders.indexOf(reminder);
    state.reminders.splice(reminderIndex, 1);

    return Object.assign({},
      {
        ...state,
      }
    );
  },
  [SCHEDULER_ADD_SCHEDULE]: (state, action) => {
    const reminders = state.reminders.concat(action.payload);

    return Object.assign({},
      {
        ...state,
        reminders
      }
    );
  },
}

export default function (state = INITIAL_STATE, action = {}) {
  const handler = actionHandlers[action.type];
  return handler ? handler(state, action) : state;
}
