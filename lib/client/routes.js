import React from 'react';
import { Route } from 'react-router';
import Main from './components/Main';
import Home from './components/Home';
import Test from './components/Test';

export default function () {
  return (
    <Route component={Main} >
      <Route path="/" component={Home} />
      <Route path="/test" component={Test} />
    </Route>
  );
}
