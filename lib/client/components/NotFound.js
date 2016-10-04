import React, {Component} from 'react';
import FlatButton from 'material-ui/FlatButton';
import Paper from 'material-ui/Paper';
import styles from './styles';

export default class NotFound extends Component {

  static contextTypes = {
    router: React.PropTypes.object.isRequired
  };

  render () {
    return (<Paper style={Object.assign({height: '100%'}, styles.paper)} zDepth={1}>
        <h1>Нет доступа</h1>
        <FlatButton
          label="Вернуться к списку адресов"
          style={{ margin: 12 }}
          onClick={() => {
            this.context.router.push('/');
          }}
        />
        <FlatButton
          label="Профиль"
          style={{ margin: 12 }}
          onClick={() => {
            this.context.router.push('/user');
          }}
        />
      </Paper>
    );
  };
};
