import React, {Component, PropTypes} from 'react';
import SplitPane from 'react-split-pane';
import CesiumMap from './Cesium';

export default class Base extends Component {
  static propTypes = {
    location: PropTypes.object.isRequired,
    children: PropTypes.oneOfType([
      PropTypes.element,
      PropTypes.arrayOf(PropTypes.element)
    ])
  };

  render () {

    return (
      <div style={{ height: '100%' }}>
        <SplitPane split="vertical" minSize={200} defaultSize="50%" primary="second">
          <CesiumMap />
          <div>{ this.props.children }</div>
        </SplitPane>
      </div>
    );
  }
}
