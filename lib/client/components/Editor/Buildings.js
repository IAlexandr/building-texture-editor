import React, {Component, PropTypes} from 'react';
import FlatButton from 'material-ui/FlatButton';
import TextField from 'material-ui/TextField';
import distance from 'turf-distance';
import bearing from 'turf-bearing';
import turfPoint from 'turf-point';
import destination from 'turf-destination';

export default class Buildings extends Component {
  constructor (props) {
    super(props);
    this.state = {
      buildingsInfo: {},
      selectedBuildingFloors: 0,
      labelPoints: []
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
              this.rebuildBuildingWalls(this.state.buildingsInfo[nextBuilding.properties.ID],
                nextBuilding);
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

  addPoint (x, y, height, label) {
    var point = new Cesium.Entity(
      {
        position: Cesium.Cartesian3.fromDegrees(x, y, height),
        point: {
          pixelSize: 5,
          color: Cesium.Color.RED,
          outlineColor: Cesium.Color.WHITE,
          outlineWidth: 2,
          height: height
        },
        label: {
          text: label.toString(),
          font: '14pt monospace',
          style: Cesium.LabelStyle.FILL_AND_OUTLINE,
          outlineWidth: 2,
          verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
          pixelOffset: new Cesium.Cartesian2(0, -9)
        }
      }
    );
    return Cesium.myViewer.entities.add(point);
  }

  wallsSplit (sourcePoints, wallId, amount) {
    let points = Object.assign([], sourcePoints);
    points = points.reverse();
    const from = turfPoint([points[wallId].x, points[wallId].y]);
    // this.addPoint(from.geometry.coordinates[0], from.geometry.coordinates[1], 15, 'from:' + wallId);
    const to = turfPoint([points[wallId + 1].x, points[wallId + 1].y]);
    // this.addPoint(to.geometry.coordinates[0], to.geometry.coordinates[1], 15, 'from:' + (wallId + 1));
    const midPoints = this._wallsSplit(from, to, amount);
    let resultPoints = [];
    points.forEach((point, i) => {
      resultPoints.push(point);
      if (i === wallId) {
        resultPoints = resultPoints.concat(midPoints);
      }
    });
    return resultPoints.reverse();
  }

  _wallsSplit (from, to, amount) {
    const d = distance(from, to, 'kilometers');
    const averageDist = d / amount;
    const heading = bearing(from, to);
    let resultPoints = [];
    for (let i = 1; i < amount; i++) {
      let frm = from;
      if (resultPoints.length > 0) {
        frm = resultPoints[resultPoints.length - 1];
      }
      resultPoints.push(destination(frm, averageDist, heading, 'kilometers'));
    }
    resultPoints = resultPoints.map((point) => {
      return {
        x: point.geometry.coordinates[0],
        y: point.geometry.coordinates[1]
      };
    });
    return resultPoints;
  }

  clearPoints () {
    this.state.labelPoints.forEach((point) => {
      Cesium.myViewer.entities.remove(point);
    });
    this.setState({
      labelPoints: []
    });
  }

  prepWalls (building) {
    const { registerNo, ID } = this.props.selectInfo;
    const floors = building.properties['этажность'];
    const height = floors * 3;
    let wallId = 0;
    console.log('prepWalls', registerNo, ID, wallId);
    const walls = [];
    const points = Object.assign([], building.geometry.points);
    this.clearPoints();
    const labelPoints = [];
    points.reverse().forEach((point, i) => {
      labelPoints.push({
        x: point.x,
        y: point.y,
        height,
        label: i
      });
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
    const labelPointsEntities = [];
    labelPoints.forEach((point) => {
      const { x, y, height, label } = point;
      labelPointsEntities.push(this.addPoint(x, y, height, label));
    });
    this.setState({
      labelPoints: labelPointsEntities
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

  rebuildBuildingWalls (oldBuildingInfo, newBuilding) {
    newBuilding = Object.assign({}, newBuilding);
    let walls = {};
    switch (newBuilding.geometry.type) {
      case 'Polygon':
        const buildingWalls = this.prepWalls(newBuilding);
        buildingWalls.forEach((wall) => {
          const wallKey = wall.ID + '_' + wall.wallId;
          if (oldBuildingInfo.walls.hasOwnProperty(wallKey)) {
            wall.wall.material = oldBuildingInfo.walls[wallKey].wall.material;
            Cesium.myViewer.entities.remove(oldBuildingInfo.walls[wallKey]);
          } else {
            wall.wall.material = new Cesium.ImageMaterialProperty({
              image: '/api/buildings/' + wall.registerNo + '/' + wall.ID + '/' + wall.wallId
            });
          }
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

    const { floors, walls } = this.state.buildingsInfo[this.props.selectInfo.ID];
    const height = floors * 3;
    return (
      <div>
        высота (м): {height}
        <br />
        кол-во стен: { Object.keys(walls).length }
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
        <FlatButton
          label="Разделить выбранную стену на две части"
          secondary={true}
          onClick={(() => {
            const building = Object.assign({}, this.state.buildingsInfo[this.props.selectInfo.ID].building);
            building.geometry.points = this.wallsSplit(building.geometry.points, this.props.selectInfo.wallId, 2);
            this.rebuildBuildingWalls(this.state.buildingsInfo[this.props.selectInfo.ID], building);
            {/*this.props.changeBuilding(building);*/
            }
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
