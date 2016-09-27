import React, {Component, PropTypes} from 'react';
import FlatButton from 'material-ui/FlatButton';

export default class Buildings extends Component {
  constructor (props) {
    super(props);
    this.state = {
      walls: {},
      floors: {},
    };
  }

  static propTypes = {
    buildings: PropTypes.object,
    registerNo: PropTypes.string,
    selectInfo: PropTypes.object,
    unselect: PropTypes.func,
    changeBuilding: PropTypes.func,
  };

  componentDidMount () {
    if (this.props.buildings.hasOwnProperty(this.props.registerNo)) {
      if (this.state.walls.length === 0 && !this.props.buildings[this.props.registerNo].loading) {
        this.buildWalls(this.props.buildings[this.props.registerNo].buildings);
        Cesium.myViewer.zoomTo(Cesium.myViewer.entities);
      }
    }
  }

  componentWillReceiveProps (nextProps) {
    if (nextProps.buildings.hasOwnProperty(nextProps.registerNo)) {
      if (!nextProps.buildings[nextProps.registerNo].loading) {
        if (Object.keys(this.state.walls).length === 0) {
          this.buildWalls(nextProps.buildings[nextProps.registerNo].buildings);
          Cesium.myViewer.zoomTo(Cesium.myViewer.entities);
        } else {
          const rebuildBuildings = [];
          nextProps.buildings[nextProps.registerNo].buildings.forEach((nextBuilding) => {
            if (this.state.floors[nextBuilding.properties.ID] !== nextBuilding.properties['этажность']) {
              rebuildBuildings.push(nextBuilding);
            }
          });
          if (rebuildBuildings.length > 0) {
            this.rebuildWalls(rebuildBuildings);
          }
        }
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

  buildWalls (buildings) {
    let walls = {};
    let floors = this.state.floors;
    Cesium.myViewer.entities.removeAll();
    buildings.forEach((building) => {
      switch (building.geometry.type) {
        case 'Polygon':
          floors[building.properties.ID] = building.properties['этажность'];
          const buildingWalls = this.prepWalls(building);
          buildingWalls.forEach((wall) => {
            Cesium.myViewer.entities.add(wall);
            walls[wall.ID + '_' + wall.wallId] = wall;
          });
          break;
        case 'MultiPolygon':
        // TODO не тестировал
        default:
          break;
      }
    });
    this.setState({
      walls,
      floors
    });
  }

  rebuildWalls (buildings) {
    let walls = this.state.walls;
    let floors = this.state.floors;
    buildings.forEach((building) => {
      Object.keys(this.state.walls).forEach((wallKey, i) => {
        const wall = this.state.walls[wallKey];
        if (wall.ID === building.properties.ID) {
          Cesium.myViewer.entities.remove(wall);
          delete this.state.walls[wallKey];
        }
      });
    });
    buildings.forEach((building) => {
      switch (building.geometry.type) {
        case 'Polygon':
          floors[building.properties.ID] = building.properties['этажность'];
          const buildingWalls = this.prepWalls(building);
          buildingWalls.forEach((wall) => {
            Cesium.myViewer.entities.add(wall);
            walls[wall.ID + '_' + wall.wallId] = wall;
          });
          break;
        case 'MultiPolygon':
        // TODO не тестировал
        default:
          break;
      }
    });
    this.setState({
      walls,
      floors
    });
  }

  findSelectedBuilding () {
    let resultBuilding;
    this.props.buildings[this.props.registerNo].buildings.forEach((building) => {
      if (building.properties.ID === this.props.selectInfo.ID) {
        resultBuilding = building;
      }
    });
    return resultBuilding;
  }

  prepSelectedBuildingInfo () {
    if (!this.props.selectInfo) {
      console.log('!!!!');
    }
    const { registerNo, wallId, ID } = this.props.selectInfo;
    if (wallId !== 0 && !wallId) {
      return <h3>Выберите стену!</h3>;
    }
    const walls = Object.keys(this.state.walls).filter((wallKey) => {
      const wall = this.state.walls[wallKey];
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
        <FlatButton
          label="Изменить этажность"
          secondary={true}
          onClick={(() => {
            const building = this.findSelectedBuilding();
            building.properties['этажность'] = 10;
            this.props.changeBuilding(building);
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
