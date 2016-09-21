import React from 'react';
import ReactDOM from 'react-dom';
import Root from './components/Root';
var injectTapEventPlugin = require('react-tap-event-plugin');
injectTapEventPlugin();

ReactDOM.render(<Root />, document.getElementById('app-root'));
