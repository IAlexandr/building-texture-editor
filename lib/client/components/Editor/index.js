import React, {Component, PropTypes} from 'react';
import FlatButton from 'material-ui/FlatButton';
import {connect} from 'react-redux';
import styles from './../styles';
import {buildingsActions} from './../../actions';
import Buildings from './Buildings';
import LinearProgress from 'material-ui/LinearProgress';

class Editor extends Component {
  constructor (props) {
    super(props);
  }

  static propTypes = {
    addressInfo: PropTypes.object,
    changeAddress: PropTypes.func,
    buildings: PropTypes.object
  };

  static contextTypes = {
    router: React.PropTypes.object.isRequired
  };

  componentDidMount () {
    this.props.loadBuildings(this.props.params.registerNo);
  }

  componentWillUnmount () {
    Cesium.myViewer.entities.removeAll();
    this.props.unselect();
  }

  prepAddressPanel () {
    let buildingsCount;
    if (this.props.buildings.hasOwnProperty(this.props.params.registerNo)) {
      buildingsCount = this.props.buildings[this.props.params.registerNo].buildings.length;
    }
    return (
      <div>
        <h2 style={styles.headline}>Редактирование текстур</h2>
        Адрес: {this.props.addressInfo.data.address }
        <br />
        Строений: {buildingsCount}
        <br />
      </div>
    );
  }

  render () {
    if (this.props.addressInfo.loading) {
      return (<LinearProgress mode="indeterminate"/>);
    }

    return (
      <div>
        <div style={{ paddingLeft: 10 }}>
          {this.prepAddressPanel()}
          <br />
          <Buildings
            buildings={this.props.buildings}
            selectInfo={this.props.selectInfo}
            registerNo={this.props.params.registerNo}
            unselect={this.props.unselect}
            changeBuilding={this.props.changeBuilding}
          />
        </div>
        <FlatButton
          label="Вернуться к поиску"
          secondary={true}
          onClick={(() => {
            this.context.router.push('/');
          }).bind(this)}
        />
      </div>
    );
  }
}

function mapStateToProps (state) {
  return {
    buildings: state.buildings.data,
    selectInfo: state.buildings.selectInfo
  };
}

export default connect(mapStateToProps, {
  loadBuildings: buildingsActions.loadBuildings,
  unselect: buildingsActions.unselect,
  changeBuilding: buildingsActions.changeBuilding,
})(Editor);
