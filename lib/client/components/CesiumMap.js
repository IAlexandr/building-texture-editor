import React, {Component} from 'react';
import {connect} from 'react-redux';
import {buildingsActions} from './../actions';

class CesiumMap extends Component {
  constructor (props) {
    super(props);
    this.state = {
      viewer: null,
      ScreenSpaceEventHandler: null
    }
  }

  static contextTypes = {
    router: React.PropTypes.object.isRequired
  };

  addScreenSpaceEventHandler (scene) {
    if (!this.state.ScreenSpaceEventHandler) {
      const ScreenSpaceEventHandler = new Cesium.ScreenSpaceEventHandler(scene.canvas);
      ScreenSpaceEventHandler.setInputAction((movement) => {
        const pickedObjects = scene.drillPick(movement.position);
        if (Cesium.defined(pickedObjects)) {
          if (pickedObjects[0]) {
            const entity = pickedObjects[0].id;
            if (entity.wall) {
              const { registerNo, wallId, ID } = entity;
              this.props.selectInfo({ registerNo, wallId, ID });
            }
          } else {
            this.props.selectInfo({ registerNo: null, wallId: null });
          }
        }
      }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
      this.setState({
        ScreenSpaceEventHandler
      });
    }
  }

  componentDidMount () {
    if (!this.state.viewer) {
      Cesium.Math.setRandomNumberSeed(1234);

      const viewer = new Cesium.Viewer('cesiumContainer', {
        infoBox: false,
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
      const { scene } = Cesium.myViewer;
      this.addScreenSpaceEventHandler(scene);
    }
  }

  render () {
    return (
      <div id="cesiumContainer"></div>
    );
  }
}

function mapStateToProps (state) {
  return {
    buildings: state.buildings,
  };
}

export default connect(mapStateToProps, {
  selectInfo: buildingsActions.selectInfo,
})(CesiumMap);
