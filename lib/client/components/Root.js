import React, { Component } from 'react';

import getMuiTheme from 'material-ui/styles/getMuiTheme';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';

import { createStore, combineReducers, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import { Provider } from 'react-redux';
import { Router, browserHistory } from 'react-router';

import routes from './../routes';
import reducers from './../reducers';

import { getReducers } from 'basic-auth';

const createThunkedStore = applyMiddleware(thunk)(createStore);

export default class Root extends Component {
  constructor (props) {
    super(props);

    this.state = {
      store: createThunkedStore(combineReducers({ ...reducers, ...getReducers() }))
    };
  }

  render () {
    return (
      <Provider store={this.state.store}>
        <MuiThemeProvider muiTheme={getMuiTheme()}>
        <Router history={browserHistory} children={routes(this.state.store)} />
        </MuiThemeProvider>
      </Provider>
    );
  }
}
