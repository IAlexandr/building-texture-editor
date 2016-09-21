import React, { Component } from 'react';
import FlatButton from 'material-ui/FlatButton';

class Home extends Component {

  static contextTypes = {
    router: React.PropTypes.object.isRequired
  };

  render () {
    var stripeMaterial = new Cesium.StripeMaterialProperty({
      evenColor : Cesium.Color.WHITE.withAlpha(0.5),
      oddColor : Cesium.Color.BLUE.withAlpha(0.5),
      repeat : 5.0
    });
    return (
      <div>
        HOME!
        <FlatButton
          label="ТЕСТ"
          secondary={true}
          onClick={(() => {
            console.log('Переход на тест');
            this.context.router.push('/test');
          }).bind(this)}
        />
        <FlatButton
          label="Добавить точку"
          secondary={true}
          onClick={(() => {
            console.log('Добавить точку');
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

export default Home;
