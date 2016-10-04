import React from 'react';
import {Route, Redirect} from 'react-router';
import Main from './components/Main';
import AddressList from './components/AddressList';
import Editor from './components/Editor/index';
import User from './components/User';
import NotFound from './components/NotFound';
import {checkAccess} from 'basic-auth';

export default function (store) {

  return (
    <Route component={Main}>
      <Route path="/" component={AddressList}>
        <Route path="/user" component={User}/>
        <Redirect from="/editor" to="/"/>
        <Route path="/editor/:registerNo" component={Editor} onEnter={(nextState, replace, callback) => {
          const curStore = store.getState();
          console.log(checkAccess(curStore.user, 'editing'));
          if (!checkAccess(curStore.user, 'editing')) {
            replace(`/403`);
          }
          callback();
        }}/>
        <Route path="/403" component={NotFound}/>
    </Route>
  <Redirect from="*" to="/"/>
  </Route>
  );
}
