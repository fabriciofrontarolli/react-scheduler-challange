import React, { Component } from 'react';
import Calendar from './components/Calendar';

import { Provider } from 'react-redux';
import { createStore, applyMiddleware } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import thunk from 'redux-thunk';
import combinedReducers from './rootReducer';

import './App.css';

const store = createStore(
  combinedReducers,
  composeWithDevTools(
    applyMiddleware(thunk)
  )
);

class App extends Component {
  render() {
    return (
      <div className="App">
        <Provider store={store}>
          <Calendar />
        </Provider>
      </div>
    );
  }
}

export default App;
