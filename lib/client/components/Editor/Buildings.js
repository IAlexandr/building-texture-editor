import React, {Component, PropTypes} from 'react';
import FlatButton from 'material-ui/FlatButton';

export default class Buildings extends Component {
  constructor (props) {
    super(props);
    this.state = {
      walls: []
    };
  }
  static propTypes = {
    buildings: PropTypes.object,
    registerNo: PropTypes.string,
    selectInfo: PropTypes.object,
    unselect: PropTypes.func
  };

  componentDidMount() {
    if (this.props.buildings.hasOwnProperty(this.props.registerNo)) {
      if (this.state.walls.length === 0 && !this.props.buildings[this.props.registerNo].loading) {
        this.addWalls(this.props.buildings[this.props.registerNo].buildings);
      }
    }
  }

  componentWillReceiveProps (nextProps) {
    if (nextProps.buildings.hasOwnProperty(nextProps.registerNo)) {
      if (this.state.walls.length === 0 && !nextProps.buildings[nextProps.registerNo].loading) {
        this.addWalls(nextProps.buildings[nextProps.registerNo].buildings);
      }
    }
  }

  componentWillUnmount () {
    Cesium.myViewer.entities.removeAll();
    this.props.unselect();
  }

  prepWalls (building) {
    const floors = building.properties['этажность'];
    const height = floors * 3;
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
            wallId: wallId,
            floors
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
          const buildingWalls = this.prepWalls(building);
          buildingWalls.forEach((wall) => {
            Cesium.myViewer.entities.add(wall);
          });
          walls = walls.concat(buildingWalls);
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

  prepSelectedBuildingInfo () {
    const { registerNo, wallId, ID } = this.props.selectInfo;
    if (!wallId) {
      return <h3>Выберите стену!</h3>;
    }
    const walls = this.state.walls.filter((wall) => {
      return wall.registerNo === registerNo && wall.ID === ID;
    });
    const floors = walls[0] ? walls[0].floors || 0 : 0;
    const height = floors * 3;
    return (
      <div>
        высота (м): {height}
        <br />
        кол-во этажей: {floors}
        <br />
        кол-во стен: { walls.length }
        <br />
        Порядковый номер выбранной стены: { wallId }
        <br />
        <FlatButton
          label="Сбросить"
          secondary={true}
          onClick={(() => {
            this.props.unselect();
          }).bind(this)}
        />
      </div>
    );
  }

  render () {

    return (
      <div>
        {this.prepSelectedBuildingInfo()}
      </div>
    );
  }
}
