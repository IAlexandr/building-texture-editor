import React, {Component, PropTypes} from 'react';
import FlatButton from 'material-ui/FlatButton';
import TextField from 'material-ui/TextField';

export default class Buildings extends Component {
  constructor (props) {
    super(props);
    this.state = {
      buildingsInfo: {},
      selectedBuildingFloors: 0,
    }
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
      if (!this.props.buildings[this.props.registerNo].loading) {
        this.props.buildings[this.props.registerNo].buildings.forEach((nextBuilding) => {
          if (!this.state.buildingsInfo.hasOwnProperty(nextBuilding.properties.ID)) {
            // построение стен нового строения
            this.buildBuildingWalls(nextBuilding);
            Cesium.myViewer.zoomTo(Cesium.myViewer.entities);
          }
        });
      }
    }
  }

  componentWillReceiveProps (nextProps) {
    if (nextProps.buildings.hasOwnProperty(nextProps.registerNo)) {
      if (!nextProps.buildings[nextProps.registerNo].loading) {

        nextProps.buildings[nextProps.registerNo].buildings.forEach((nextBuilding) => {
          if (!this.state.buildingsInfo.hasOwnProperty(nextBuilding.properties.ID)) {
            this.buildBuildingWalls(nextBuilding);
            Cesium.myViewer.zoomTo(Cesium.myViewer.entities);
          } else {
            if (this.state.buildingsInfo[nextBuilding.properties.ID].floors !==
              nextBuilding.properties['этажность'] ||
              this.state.buildingsInfo[nextBuilding.properties.ID].building.geometry.updatedAt !==
              nextBuilding.geometry.updatedAt) {
              this.rebuildBuildingWalls({
                oldBuildingInfo: this.state.buildingsInfo[nextBuilding.properties.ID],
                newBuilding: nextBuilding
              });
            }
          }
          if (nextBuilding.properties.ID === nextProps.selectInfo.ID && this.state.selectedBuildingFloors !== nextBuilding.properties['этажность']) {
            this.setState({
              selectedBuildingFloors: nextBuilding.properties['этажность']
            });
          }
        });

      }
    }
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
      // this.addPoint(point.x, point.y, height, i);
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

  buildBuildingWalls (building) {
    let walls = {};
    switch (building.geometry.type) {
      case 'Polygon':
        const buildingWalls = this.prepWalls(building);
        buildingWalls.forEach((wall) => {
          wall.wall.material = new Cesium.ImageMaterialProperty({
            image: '/api/buildings/' + wall.registerNo + '/' + wall.ID + '/' + wall.wallId
          });
          Cesium.myViewer.entities.add(wall);
          walls[wall.ID + '_' + wall.wallId] = wall;
        });
        break;
      default:
        break;
    }
    // TODO
    const buildingsInfo = this.state.buildingsInfo;
    buildingsInfo[building.properties.ID] = { building, walls, floors: building.properties['этажность'] };
    this.setState({
      buildingsInfo
    });
  }

  rebuildBuildingWalls ({ oldBuildingInfo, newBuilding }) {
    newBuilding = Object.assign({}, newBuilding);
    let walls = {};
    switch (newBuilding.geometry.type) {
      case 'Polygon':
        const buildingWalls = this.prepWalls(newBuilding);
        buildingWalls.forEach((wall) => {
          const wallKey = wall.ID + '_' + wall.wallId;
          wall.wall.material = oldBuildingInfo.walls[wallKey].wall.material;
          Cesium.myViewer.entities.remove(oldBuildingInfo.walls[wallKey]);
          Cesium.myViewer.entities.add(wall);
          walls[wall.ID + '_' + wall.wallId] = wall;
        });
        break;
      default:
        break;
    }
    // TODO
    const buildingInfo = {
      building: newBuilding,
      walls,
      floors: newBuilding.properties['этажность']
    };
    const buildingsInfo = this.state.buildingsInfo;
    buildingsInfo[newBuilding.properties.ID] = buildingInfo;
    this.setState({
      buildingsInfo
    });
  }

  prepSelectedBuildingInfo () {
    const { registerNo, wallId, ID } = this.props.selectInfo;
    if (wallId !== 0 && !wallId) {
      return <h3>Выберите стену!</h3>;
    }
    const floors = 5;
    const walls = [];
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
            const building = Object.assign({}, this.state.buildingsInfo[this.props.selectInfo.ID].building);
            building.properties['этажность'] = this.state.selectedBuildingFloors;
            this.props.changeBuilding(building);
          }).bind(this)}
        />
      </div>
    );
  }

  render () {
    return (
      <div>
        <h3>Редактирование строения</h3>
        {
          this.prepSelectedBuildingInfo()
        }

        <br />
      </div>
    );
  }
}
