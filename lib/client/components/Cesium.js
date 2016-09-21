import React, { Component } from 'react';

class Test extends Component {
  constructor (props) {
    super(props);
    this.state = {
      viewer: null
    }
  }
  static contextTypes = {
    router: React.PropTypes.object.isRequired
  };

  componentDidMount () {
    if (!this.state.viewer) {
      Cesium.Math.setRandomNumberSeed(1234);

      const viewer = new Cesium.Viewer('cesiumContainer', {
        infoBox : false,
        animation: false,
        sceneModePicker: false,
        baseLayerPicker: false,
        fullscreenButton: false,
        vrButton: false,
        geocoder: false,
        homeButton: false,
        selectionIndicator: false,
        timeline: false,
        navigationHelpButton: false,
        navigationInstructionsInitiallyVisible: false,
        scene3DOnly: true,
        imageryProvider: new Cesium.createOpenStreetMapImageryProvider({
          url: 'https://a.tile.openstreetmap.org/'// 'http://gwosm.cloudapp.net/osm/'
        })
      });
      this.setState({
        viewer
      });
      Cesium.myViewer = viewer;
    }
  }

  render () {
    return (
      <div id="cesiumContainer"></div>
    );
  }
}

export default Test;
