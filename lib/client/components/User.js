import React, {PropTypes, Component} from 'react';
import FlatButton from 'material-ui/FlatButton';
import Divider from 'material-ui/Divider';
import TextField from 'material-ui/TextField';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import {calcMd5, getActions} from 'basic-auth';
import {connect} from 'react-redux';

const actions = getActions('/api');
class User extends Component {
  componentDidMount () {
    if (this.refs.username) {
      this.refs.username.focus();
    }
  }

  static contextTypes = {
    router: React.PropTypes.object.isRequired
  };

  handleLogin () {
    this.props.login({
      name: this.refs.username.input.value,
      password: calcMd5(this.refs.password.input.value),
    });
  }

  handleLogout () {
    this.props.logout();
  }

  render () {
    let content;

    if (this.props.user.hasIn(['profile', 'displayName'])) {
      content = (
        <div>
          <h3>
            {this.props.user.getIn(['profile', 'displayName'])}
          </h3>
          <Divider />
          <FlatButton
            label="Выйти"
            style={{ margin: 12 }}
            onClick={::this.handleLogout}
          />
          <FlatButton
            label="Перейти к списку адресов"
            style={{ margin: 12 }}
            onClick={() => {
              this.context.router.push('/editor');
            }}
          />
        </div>
      );
    } else {
      content = (
        <div>
          <TextField
            ref="username"
            hintText="Имя пользователя"
            style={{ marginLeft: 20 }}
            floatingLabelText="Имя пользователя"
            underlineShow={false}
          />
          <Divider />
          <TextField
            ref="password"
            type="password"
            hintText="Пароль"
            style={{ marginLeft: 20 }}
            floatingLabelText="Пароль"
            underlineShow={false}
          />
          <Divider />
          <FlatButton
            label="Войти"
            style={{ margin: 12 }}
            onClick={::this.handleLogin}
          />
          <FlatButton
            label="Перейти к списку адресов"
            style={{ margin: 12 }}
            onClick={() => {
              this.context.router.push('/editor');
            }}
          />
        </div>
      );
    }


    return (
      <div>
        <MuiThemeProvider muiTheme={getMuiTheme()}>
          <div>
            {JSON.stringify(this.props.user, null, 2)}
            {content}
          </div>
        </MuiThemeProvider>
      </div>
    );
  }
}

User.propTypes = {
  user: PropTypes.object,
  dispatch: PropTypes.func
};

function mapStateToProps (state) {
  return {
    user: state.user
  };
}

export default connect(mapStateToProps, {
  login: actions.login,
  logout: actions.logout
})(User);
