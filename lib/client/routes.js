import React from 'react';
import { Route, Redirect } from 'react-router';
import Main from './components/Main';
import AddressList from './components/AddressList';
import Editor from './components/Editor/index';

export default function () {
  return (
    <Route component={Main} >
      <Route path="/" component={AddressList} />
      <Redirect from="/editor" to="/" />
      <Route path="/editor/:registerNo" component={Editor} />
      <Redirect from="*" to="/"/>
    </Route>
  );
}
