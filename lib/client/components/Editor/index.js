import React, {Component, PropTypes} from 'react';
import FlatButton from 'material-ui/FlatButton';
import {connect} from 'react-redux';
import styles from './../styles';
import {buildingsActions, pgeActions} from './../../actions';
import Buildings from './Buildings';
import LinearProgress from 'material-ui/LinearProgress';
import {Card, CardActions, CardHeader, CardText} from 'material-ui/Card';
import Paper from 'material-ui/Paper';
import TextField from 'material-ui/TextField';
import Pge from './pge/Pge';
import {Scrollbars} from 'react-custom-scrollbars';
import {checkAccess} from 'basic-auth';
import Checkbox from 'material-ui/Checkbox';
import Divider from 'material-ui/Divider';

class Editor extends Component {
  constructor (props) {
    super(props);
    this.state = {
      addressState: null,
      images: {},
      copyTextureRegisterNo: this.props.selectInfo.registerNo || "",
      copyTextureID: this.props.selectInfo.ID || "",
      copyTextureWallId: this.props.selectInfo.wallId || "",
      copyBlockExpanded: false
    };
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

  saveAddressInfo (state) {
    const addrInfo = Object.assign({}, this.props.addressInfo.data);
    const comment = this.refs.comment.input.refs.input.value;
    let checked = addrInfo.checked;
    if (this.refs.hasOwnProperty('checkboxChecked')) {
      checked = this.refs.checkboxChecked.state.switched;
    }
    addrInfo.comment = comment;
    addrInfo.state = state;
    addrInfo.checked = checked;
    if (!checkAccess(this.props.user, 'checking')) {
      if (state === 'обработанное' || state === 'в работе') {
        addrInfo.userId = this.props.user.toJS().profile.id;
      } else {
        if (addrInfo.userId) {
          addrInfo.userId = null;
        }
      }
    } else {
      if (state !== 'обработанное') {
        addrInfo.userId = null;
      }
    }
    this.props.changeAddress(addrInfo, () => {
      // this.context.router.push('/');
    });
  }

  accesssEditorChecking (content) {
    if (this.props.addressInfo.data.userId === this.props.user.toJS().profile.id ||
      (this.props.addressInfo.data.userId !== this.props.user.toJS().profile.id &&
      this.props.addressInfo.data.state !== 'в работе' &&
      this.props.addressInfo.data.state !== 'обработанное') ||
      checkAccess(this.props.user, 'checking')) {
      return this.accessChecking('editing', content);
    } else {
      return null;
    }
  }

  accessChecking (accessLevel, content) {
    if (checkAccess(this.props.user, accessLevel)) {
      return content;
    } else {
      return null;
    }
  }

  prepCardActions () {
    return this.accesssEditorChecking(
      <CardActions
        expandable={true}
      >
        <FlatButton
          label="Необработанное"
          secondary={true}
          onClick={(() => {
            this.saveAddressInfo('необработанное');
          }).bind(this)}
        />
        <FlatButton
          label="Обработанное"
          primary={true}
          onClick={(() => {
            this.saveAddressInfo('обработанное');
          }).bind(this)}
        />
        <FlatButton
          label="Недостаточно фото"
          secondary={true}
          onClick={(() => {
            this.saveAddressInfo('недостаточно фотографий');
          }).bind(this)}
        />
        <FlatButton
          label="в работе"
          secondary={true}
          onClick={(() => {
            this.saveAddressInfo('в работе');
          }).bind(this)}
        /><FlatButton
        label="другое"
        secondary={true}
        onClick={(() => {
          this.saveAddressInfo('другое');
        }).bind(this)}
      />
      </CardActions>
    );
  }

  prepSaveButton () {
    return this.accesssEditorChecking(
      <FlatButton
        label="Сохранить изменения"
        secondary={true}
        onClick={(() => {
          const imagesInfo = Object.keys(this.state.images).map((wallKey) => {
            const { image, points, selectInfo, edit } = this.state.images[wallKey];
            return {
              image,
              points,
              selectInfo,
              edit
            }
          });
          this.props.getOriginTextures(this.props.selectInfo.registerNo, imagesInfo);
        }).bind(this)}
      />
    );
  }

  prepAddressCard () {
    let buildingsCount;
    if (this.props.buildings.hasOwnProperty(this.props.params.registerNo)) {
      buildingsCount = this.props.buildings[this.props.params.registerNo].buildings.length;
    }

    return (
      <Card>
        <CardHeader
          title={'Адрес: ' + this.props.addressInfo.data.address }
          subtitle={this.props.addressInfo.data.state}
          actAsExpander={true}
          showExpandableButton={true}
        />
        <CardText expandable={true}>
          <strong>
            Строений: {buildingsCount}
          </strong>
          <br />
          <TextField
            id="comment"
            style={{ width: '100%' }}
            ref="comment"
            multiLine={true}
            rows={1}
            rowsMax={4}
            defaultValue={this.props.addressInfo.data.comment}
          /><br />
          {
            this.accessChecking('checking', (
              <Checkbox
                ref="checkboxChecked"
                label="Проверено"
                defaultChecked={this.props.addressInfo.data.checked}
              />
            ))
          }
        </CardText>
        {
          this.prepCardActions()
        }
      </Card>
    );
  }

  getWall () {
    let wall = {};
    Cesium.myViewer.entities.values.forEach((entity) => {
      if (entity.ID === this.props.selectInfo.ID &&
        entity.wallId === this.props.selectInfo.wallId) {
        wall = entity.wall;
      }
    });
    return wall;
  }

  selectedImage (e) {
    const image = new Image();
    image.src = URL.createObjectURL(e.target.files[0]);
    image.onload = () => {
      this.setState({ image });
    }
  }

  saveImgPoints ({ image, points, selectInfo, edit }) {
    const images = this.state.images;
    images[selectInfo.ID + '_' + selectInfo.wallId] = {
      image,
      points,
      selectInfo,
      edit
    };
    this.setState({
      images
    });
  }

  prepCopyBlock () {
    let actionButton;
    if (
      this.state.copyTextureRegisterNo !== null && this.state.copyTextureRegisterNo !== "" &&
      this.state.copyTextureID !== null && this.state.copyTextureID !== "" &&
      this.state.copyTextureWallId !== null && this.state.copyTextureWallId !== ""
    ) {
      actionButton = <FlatButton
        label="Скопировать"
        secondary={true}
        onClick={(() => {
          const to = {
            registerNo: this.props.selectInfo.registerNo,
            ID: this.props.selectInfo.ID,
            wallId: this.props.selectInfo.wallId,
          };
          const from = {
            registerNo: this.state.copyTextureRegisterNo,
            ID: this.state.copyTextureID,
            wallId: this.state.copyTextureWallId,
          };
          this.props.copyBuildingTexture({
            from, to
          });
        }).bind(this)}
      />
    } else {
      actionButton = null;
    }

    if (this.props.selectInfo.registerNo !== null && this.props.selectInfo.ID !== null &&
      this.props.selectInfo.wallId !== null) {
      return (
        <Card
          style={{
            width: '100%',
            padding: 10,
            textAlign: 'center',
            display: 'inline-block',
          }}
          expanded={this.state.copyBlockExpanded}
          onExpandChange={(copyBlockExpanded) => {
            this.setState({
              copyBlockExpanded
            });
          }}
        >
          <CardHeader
            title={'Копирование текстур' }
            actAsExpander={true}
            showExpandableButton={true}
          />
          <CardText expandable={true}>
            <br />
            <TextField
              id="copyTextureRegisterNo"
              style={{ width: '250px' }}
              ref="copyTextureRegisterNo"
              multiLine={false}
              value={this.state.copyTextureRegisterNo}
              floatingLabelText="Регистрационный номер адреса"
              floatingLabelFixed={true}
              onChange={(evt) => {
                this.setState({
                  copyTextureRegisterNo: evt.target.value
                });
              }}
            /><br />
            <TextField
              id="copyTextureID"
              style={{ width: '250px' }}
              ref="copyTextureID"
              multiLine={false}
              value={this.state.copyTextureID}
              floatingLabelText="ID строения"
              floatingLabelFixed={true}
              onChange={(evt) => {
                this.setState({
                  copyTextureID: evt.target.value
                });
              }}
            /><br />
            <TextField
              id="copyTextureWallId"
              style={{ width: '250px' }}
              ref="copyTextureWallId"
              multiLine={false}
              value={this.state.copyTextureWallId}
              floatingLabelText="Порядковый номер стены"
              floatingLabelFixed={true}
              onChange={(evt) => {
                this.setState({
                  copyTextureWallId: evt.target.value
                });
              }}
            />
          </CardText>
          <CardActions expandable={true}>
            {
              actionButton
            }
          </CardActions>
        </Card>
      );
    } else {
      return null;
    }
  }

  render () {
    if (this.props.addressInfo.loading) {
      return (<LinearProgress mode="indeterminate"/>);
    }

    return (
      <Scrollbars style={{ height: '100%', width: '100%' }}>
        <div>
          <Paper style={styles.paper} zDepth={1}>
            <h2 style={styles.headline}>Редактор</h2>
            {this.prepAddressCard()}
            <br />
            <Divider />
            <Buildings
              buildings={this.props.buildings}
              selectInfo={this.props.selectInfo}
              registerNo={this.props.params.registerNo}
              unselect={this.props.unselect}
              changeBuilding={this.props.changeBuilding}
              user={this.props.user}
              accesssEditorChecking={this.accesssEditorChecking.bind(this)}
            />
            {
              this.accesssEditorChecking(
                <div>
                  <Divider />
                  <h3>Редактирование текстур</h3>
                  <div>
                    Начинать следует с 0 точки по нарастающей. (Так как возможно потребуется разбиение длинных стен на
                    более мелкие, что повлечет изменение нумерации стен и текстур).
                  </div>
                  <br />
                  {
                    this.prepCopyBlock()
                  }
                  <br />
                  <br />
                  <input
                    type="file"
                    ref="selectedImageInput"
                    onChange={this.selectedImage.bind(this)}
                  />
                </div>
              )
            }
            {
              this.refs.selectedImageInput && this.refs.selectedImageInput.value ? (
                <FlatButton
                  label="Сбросить изображение"
                  secondary={true}
                  onClick={(() => {
                    this.setState({
                      image: null
                    });
                    this.refs.selectedImageInput.value = null;
                  }).bind(this)}
                />
              ) : null
            }
            {
              this.prepSaveButton()
            }
            <br />
            <FlatButton
              label="Вернуться к списку"
              secondary={true}
              onClick={(() => {
                this.context.router.push('/');
              }).bind(this)}
            />
          </Paper>
          {
            Boolean(this.props.selectInfo.ID && this.state.image) &&
            (
              <Pge
                open={true}
                handleOpenPge={this.props.handleOpenPge}
                selectInfo={this.props.selectInfo}
                image={this.state.image}
                wall={this.getWall()}
                savePoints={this.saveImgPoints.bind(this)}
              />
            )
          }
        </div>
      </Scrollbars>
    );
  }
}

function mapStateToProps (state) {
  return {
    buildings: state.buildings.data,
    selectInfo: state.buildings.selectInfo,
    pge: state.pge,
    user: state.user
  };
}

export default connect(mapStateToProps, {
  loadBuildings: buildingsActions.loadBuildings,
  getOriginTextures: buildingsActions.getOriginTextures,
  unselect: buildingsActions.unselect,
  changeBuilding: buildingsActions.changeBuilding,
  copyBuildingTexture: buildingsActions.copyBuildingTexture,
  handleOpenPge: pgeActions.handleOpenPge,
})(Editor);
