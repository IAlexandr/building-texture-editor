Cesium.Math.setRandomNumberSeed(1234);

var viewer = new Cesium.Viewer('cesiumContainer', {
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
var entities = viewer.entities;
var scene = viewer.scene;
