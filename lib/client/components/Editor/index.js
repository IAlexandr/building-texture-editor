import React, {Component, PropTypes} from 'react';
import FlatButton from 'material-ui/FlatButton';
import {connect} from 'react-redux';
import styles from './../styles';
import {buildingsActions} from './../../actions';

class Editor extends Component {
  constructor (props) {
    super(props);
    this.props.loadBuildings(this.props.params.registerNo);
    this.state = {
      walls: []
    };
  }

  static propTypes = {
    addressInfo: PropTypes.object,
    buildings: PropTypes.object
  };

  static contextTypes = {
    router: React.PropTypes.object.isRequired
  };

  componentDidMount () {
    if (this.props.buildings.hasOwnProperty(this.props.params.registerNo)) {
      if (this.state.walls.length === 0 && !this.props.buildings[this.props.params.registerNo].loading) {
        this.addWalls(this.props.buildings[this.props.params.registerNo].buildings);
      }
    }
  }

  componentWillReceiveProps (nextProps) {
    if (nextProps.buildings.hasOwnProperty(nextProps.params.registerNo)) {
      if (this.state.walls.length === 0 && !nextProps.buildings[nextProps.params.registerNo].loading) {
        this.addWalls(nextProps.buildings[nextProps.params.registerNo].buildings);
      }
    }
  }

  componentWillUnmount () {
    Cesium.myViewer.entities.removeAll();
  }

  prepWalls (building) {
    const height = building.properties['этажность'] * 3;
    let wallId = 0;
    const walls = [];
    building.geometry.points.forEach((point, i) => {
      if (building.geometry.points[i + 1] === 0 || building.geometry.points[i + 1]) {
        walls.push(
          new Cesium.Entity({
            wall: {
              positions: Cesium.Cartesian3.fromDegreesArrayHeights([point.x, point.y, height,
                building.geometry.points[i + 1].x, building.geometry.points[i + 1].y, height]),
            },
            registerNo: building.properties.ParentRegisterNo,
            ID: building.properties.ID,
            wallId: wallId
          })
        );
        wallId++;
      }
    });
    return walls;
  }

  addWalls (buildings) {
    let walls = [];
    buildings.forEach((building) => {
      switch (building.geometry.type) {
        case 'Polygon':
          const walls = this.prepWalls(building);
          walls.forEach((wall) => {
            Cesium.myViewer.entities.add(wall);
          });
          break;
        case 'MultiPolygon':
        // TODO не тестировал
        default:
          break;
      }
    });
    this.setState({
      walls
    });
    Cesium.myViewer.zoomTo(Cesium.myViewer.entities);
  }

  render () {
    let buildingsCount;
    if (this.props.buildings.hasOwnProperty(this.props.params.registerNo)) {
      buildingsCount = this.props.buildings[this.props.params.registerNo].buildings.length;
    }
    return (
      <div>
        <div style={{ paddingLeft: 10 }}>
          <h2 style={styles.headline}>Редактирование текстур</h2>
          Адрес: {this.props.addressInfo.address }
          <br />
          Строений: {buildingsCount}
        </div>
        <FlatButton
          label="Вернуться к поиску"
          secondary={true}
          onClick={(() => {
            this.context.router.push('/');
          }).bind(this)}
        />
        <FlatButton
          label="Добавить точку"
          secondary={true}
          onClick={(() => {
            var stripeMaterial = new Cesium.StripeMaterialProperty({
              evenColor: Cesium.Color.WHITE.withAlpha(0.5),
              oddColor: Cesium.Color.BLUE.withAlpha(0.5),
              repeat: 5.0
            });
            Cesium.myViewer.entities.add({
              rectangle: {
                coordinates: Cesium.Rectangle.fromDegrees(-92.0, 20.0, -86.0, 27.0),
                outline: true,
                outlineColor: Cesium.Color.WHITE,
                outlineWidth: 4,
                stRotation: Cesium.Math.toRadians(45),
                material: stripeMaterial
              }
            });
          }).bind(this)}
        />
      </div>
    );
  }
}

function mapStateToProps (state) {
  return {
    buildings: state.buildings.data,
  };
}

export default connect(mapStateToProps, {
  loadBuildings: buildingsActions.loadBuildings,
})(Editor);
