import { combineReducers } from 'redux';

import SchedulerReducer from './modules/SchedulerReducer';

const combinedReducers = combineReducers({
  scheduler: SchedulerReducer
});

export default combinedReducers;
