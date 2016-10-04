import React, {Component, PropTypes} from 'react';
import SplitPane from 'react-split-pane';
import CesiumMap from './CesiumMap';
import Snackbar from 'material-ui/Snackbar';
import {connect} from 'react-redux';
import {smessagesActions} from './../actions';
import { getActions } from 'basic-auth';

class Main extends Component {

  constructor (props) {
    super(props);
    this.props.loadUser();
  }

  static propTypes = {
    location: PropTypes.object.isRequired,
    sOpen: PropTypes.bool,
    sMessage: PropTypes.string,
    closeMessage: PropTypes.func,
    children: PropTypes.oneOfType([
      PropTypes.element,
      PropTypes.arrayOf(PropTypes.element)
    ])
  };

  handleRequestClose() {
    // TODO action.CLOSE_MESSAGE
    this.props.closeMessage();
  }
  
  render () {
    return (
      <div style={{ height: '100%' }}>
        <SplitPane split="vertical" minSize={200} defaultSize="55%" primary="second">
          <CesiumMap />
          <div style={{ height: '100%' }}>
            { this.props.children }
          </div>
        </SplitPane>
        <Snackbar
          open={this.props.sOpen}
          message={this.props.sMessage}
          onRequestClose={this.handleRequestClose.bind(this)}
        />
      </div>
    );
  }
}

function mapStateToProps (state) {
  return {
    sMessage: state.smessages.message,
    sOpen: state.smessages.open,
  };
}

export default connect(mapStateToProps, {
  closeMessage: smessagesActions.closeMessage,
  loadUser: getActions().loadUser
})(Main);
