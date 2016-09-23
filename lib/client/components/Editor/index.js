import React, {Component, PropTypes} from 'react';
import FlatButton from 'material-ui/FlatButton';
import {connect} from 'react-redux';
import styles from './../styles';
import {buildingsActions} from './../../actions';

class Editor extends Component {
  constructor (props) {
    super(props);
    this.props.loadBuildings(this.props.params.registerNo);
  }

  static propTypes = {
    addressInfo: PropTypes.object,
    buildings: PropTypes.object
  };

  static contextTypes = {
    router: React.PropTypes.object.isRequired
  };

  componentWillReceiveProps () {

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
            console.log('Переход на домой');
            this.context.router.push('/');
          }).bind(this)}
        />
        <FlatButton
          label="Добавить точку"
          secondary={true}
          onClick={(() => {
            console.log('Добавить точку');
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
