import React, {Component, PropTypes} from 'react';
import FlatButton from 'material-ui/FlatButton';
import TextField from 'material-ui/TextField';

export default class Buildings extends Component {
  constructor (props) {
    super(props);
    this.state = {
      walls: {},
      floors: {},
      selectedBuildingFloors: 0,
      svgEntityImage: this.prepSvgImage()
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
            if (nextProps.selectInfo.registerNo && nextProps.selectInfo.ID) {
              if (nextBuilding.properties.ID === nextProps.selectInfo.ID) {
                this.setState({
                  selectedBuildingFloors: nextBuilding.properties['этажность']
                });
              }
            }
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
  
  prepSvgImage () {
    const svgDataDeclare = "data:image/svg+xml,";
    const svgCircle = '<circle cx="50" cy="50" r="10" stroke="green" stroke-width="4" fill="yellow" />';
    const svgPrefix = '<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"' +
      ' x="0px" y="0px" width="100px" height="100px" xml:space="preserve">';
    const svgSuffix = "</svg>";
    const svgString = svgPrefix + svgCircle + svgSuffix;
    return svgDataDeclare + svgString;
  }

  prepWalls (building) {
    const { registerNo, ID } = this.props.selectInfo;
    const floors = building.properties['этажность'];
    const height = floors * 3;
    let wallId = 0;
    console.log('prepWalls', registerNo, ID, wallId);
    const walls = [];
    const points = Object.assign([], building.geometry.points);
    points.reverse().forEach((point, i) => {
      if (points[i + 1] === 0 || points[i + 1]) {
        const wallEntity = new Cesium.Entity({
          wall: {
            positions: Cesium.Cartesian3.fromDegreesArrayHeights([point.x, point.y, height,
              points[i + 1].x, points[i + 1].y, height]),
            outline: true,
            outlineWidth: 3,
            outlineColor: Cesium.Color.RED
          },
          registerNo: building.properties.ParentRegisterNo,
          ID: building.properties.ID,
          wallId: wallId,
          floors
        });
        wallEntity.wall.material = new Cesium.ImageMaterialProperty({
          image: '/api/buildings/' + registerNo + '/' + ID + '/' + wallId
        });
        walls.push(
          wallEntity
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
            wall.wall.material = new Cesium.ImageMaterialProperty({
              image: '/api/buildings/' + wall.registerNo + '/' + wall.ID + '/' + wall.wallId
            });
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
    // buildings.forEach((building) => {
    //   Object.keys(this.state.walls).forEach((wallKey, i) => {
    //     const wall = this.state.walls[wallKey];
    //     if (wall.ID === building.properties.ID) {
    //       Cesium.myViewer.entities.remove(wall);
    //       delete this.state.walls[wallKey];
    //     }
    //   });
    // });
    buildings.forEach((building) => {
      switch (building.geometry.type) {
        case 'Polygon':
          floors[building.properties.ID] = building.properties['этажность'];
          const buildingWalls = this.prepWalls(building);
          buildingWalls.forEach((wall) => {
            const wallKey = wall.ID + '_' + wall.wallId;
            wall.wall.material = this.state.walls[wallKey].wall.material;
            Cesium.myViewer.entities.remove(this.state.walls[wallKey]);
            delete this.state.walls[wallKey];
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
    const floors = this.state.floors[ID];
    const height = floors * 3;
    return (
      <div>
        высота (м): {height}
        <br />

        кол-во стен: { walls.length }
        <br />
        Порядковый номер выбранной стены: { wallId }
        <br />

        <TextField
          ref="floors"
          value={this.state.selectedBuildingFloors}
          floatingLabelText="Кол-во этажей:"
          floatingLabelFixed={true}
          onChange={(evt) => {
            this.setState({
              selectedBuildingFloors: evt.target.value
            });
          }}
        />
        <br />
        <FlatButton
          label="Изменить этажность"
          secondary={true}
          onClick={(() => {
            const building = this.findSelectedBuilding();
            building.properties['этажность'] = this.state.selectedBuildingFloors;
            this.props.changeBuilding(building);
          }).bind(this)}
        />
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
