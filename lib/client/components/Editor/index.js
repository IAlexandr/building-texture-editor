import React, { Component, PropTypes } from 'react';
import FlatButton from 'material-ui/FlatButton';
import {connect} from 'react-redux';

class Editor extends Component {

  static propTypes = {
    address: PropTypes.object,
  };

  static contextTypes = {
    router: React.PropTypes.object.isRequired
  };

  componentWillReceiveProps () {

  }

  render () {

    return (
      <div>
        Список всех адресов: {this.props.params.registerNo || this.props.params.wallId || 'Пусто' }
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
              evenColor : Cesium.Color.WHITE.withAlpha(0.5),
              oddColor : Cesium.Color.BLUE.withAlpha(0.5),
              repeat : 5.0
            });
            Cesium.myViewer.entities.add({
              rectangle : {
                coordinates : Cesium.Rectangle.fromDegrees(-92.0, 20.0, -86.0, 27.0),
                outline : true,
                outlineColor : Cesium.Color.WHITE,
                outlineWidth : 4,
                stRotation : Cesium.Math.toRadians(45),
                material : stripeMaterial
              }
            });
          }).bind(this)}
        />
      </div>
    );
  }
}

export default Editor;
