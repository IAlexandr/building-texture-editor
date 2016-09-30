import superagent from 'superagent';
import {actions as smessagesActions} from './smessages';
import {
  getOriginalImage
} from './../components/Editor/pge/api';

export const actionTypes = {
  LOAD_BUILDINGS_COMPLETE: 'LOAD_BUILDINGS_COMPLETE',
  LOAD_BUILDINGS_FAILED: 'LOAD_BUILDINGS_FAILED',
  LOAD_BUILDINGS: 'LOAD_BUILDINGS',

  SELECT_INFO: 'SELECT_INFO',
  UNSELECT: 'UNSELECT',

  CHANGE_BUILDING_COMPLETE: 'CHANGE_BUILDING_COMPLETE',
  CHANGE_BUILDING_FAILED: 'CHANGE_BUILDING_FAILED',
  CHANGE_BUILDING: 'CHANGE_BUILDING',

  SAVE_BUILDING_TEXTURES_COMPLETE: 'SAVE_BUILDING_TEXTURES_COMPLETE',
  SAVE_BUILDING_TEXTURES_FAILED: 'SAVE_BUILDING_TEXTURES_FAILED',
  SAVE_BUILDING_TEXTURES: 'SAVE_BUILDING_TEXTURES',

  GET_ORIGIN_TEXTURES: 'GET_ORIGIN_TEXTURES',
};

export function loadBuildingsComplete (registerNo, buildings) {
  return {
    type: actionTypes.LOAD_BUILDINGS_COMPLETE,
    buildings,
    registerNo
  };
}

export function loadBuildingsFailed (registerNo, err) {
  return {
    type: actionTypes.LOAD_BUILDINGS_FAILED,
    err,
    registerNo
  };
}

export function loadBuildings (registerNo, callback) {
  return dispatch => {
    dispatch({
      type: actionTypes.LOAD_BUILDINGS,
      registerNo
    });

    superagent.get('/api/buildings/' + registerNo)
      .accept('application/json')
      .end((err, res) => {
        if (callback) {
          callback(err, res.body);
        }
        if (err) {
          dispatch(loadBuildingsFailed(registerNo, err));
        } else {
          dispatch(smessagesActions.openMessage('Строения загружены.'));
          dispatch(loadBuildingsComplete(registerNo, res.body));
        }
      });
  };
}

export function selectInfo ({ registerNo, wallId, ID }) {
  return {
    type: actionTypes.SELECT_INFO,
    registerNo,
    wallId,
    ID
  };
}
export function unselect () {
  return {
    type: actionTypes.SELECT_INFO,
    registerNo: null,
    wallId: null,
    ID: null
  };
}

export function changeBuildingComplete (building) {
  return {
    type: actionTypes.CHANGE_BUILDING_COMPLETE,
    building
  };
}

export function changeBuildingFailed (newBuilding, err) {
  return {
    type: actionTypes.CHANGE_BUILDING_FAILED,
    err,
    newBuilding
  };
}

export function changeBuilding (newBuilding) {
  return dispatch => {
    dispatch({
      type: actionTypes.CHANGE_BUILDING,
      newBuilding
    });
    const { ParentRegisterNo, ID } = newBuilding.properties;
    superagent.put('/api/buildings/' + ParentRegisterNo + '/' + ID)
      .accept('application/json')
      .send(newBuilding)
      .end((err, res) => {
        if (err) {
          dispatch(smessagesActions.openMessage('Ошибка обновления сведений по строению.'));
          dispatch(changeBuildingFailed(newBuilding, err));
        } else {
          dispatch(smessagesActions.openMessage('Сведения по cтроению обновлены.'));
          dispatch(changeBuildingComplete(res.body));
        }
      });
  };
}

export function getOriginTextures (registerNo, imagesInfo) {
  return dispatch => {
    dispatch(smessagesActions.openMessage('Пожалуйста подождите, выполняется подготовка изображений для отправки на' +
      ' сервер.'));
    setTimeout(() => {
      const textures = [];
      imagesInfo.forEach((imageInfo) => {
        const {
          image,
          points,
          selectInfo,
          edit
        } = imageInfo;
        const { registerNo, ID, wallId } = selectInfo;

        const originImage = getOriginalImage(image, points);
        // const originImage = edit;
        textures.push({
          registerNo,
          ID,
          wallId,
          image: originImage
        });
      });
      dispatch(smessagesActions.openMessage('Подготовка изображений для отправки на сервер завершена.'));
      dispatch(saveBuildingTextures(registerNo, textures));
    }, 300);
  }
}

export function saveBuildingTexturesComplete ({ registerNo, count }) {
  return {
    type: actionTypes.SAVE_BUILDING_TEXTURES_COMPLETE,
    registerNo,
    count
  };
}

export function saveBuildingTexturesFailed ({ registerNo, textures, err }) {
  return {
    type: actionTypes.SAVE_BUILDING_TEXTURES_FAILED,
    err,
    textures,
    registerNo
  };
}

export function saveBuildingTextures (registerNo, textures) {
  return dispatch => {
    dispatch({
      type: actionTypes.SAVE_BUILDING_TEXTURES,
      registerNo,
      textures
    });
    superagent.post('/api/buildings/' + registerNo)
      .accept('application/json')
      .send(textures)
      .end((err, res) => {
        if (err) {
          dispatch(smessagesActions.openMessage('Ошибка сохранения текстур.'));
          dispatch(saveBuildingTexturesFailed({ registerNo, textures, err }));
        } else {
          dispatch(smessagesActions.openMessage('Изменение текстур выполнено.'));
          dispatch(saveBuildingTexturesComplete({ registerNo, count: res.body.count }));
        }
      });
  }
}

export const actions = {
  loadBuildingsComplete,
  loadBuildingsFailed,
  loadBuildings,
  selectInfo,
  unselect,
  changeBuildingComplete,
  changeBuildingFailed,
  changeBuilding,
  saveBuildingTexturesComplete,
  saveBuildingTexturesFailed,
  saveBuildingTextures,
  getOriginTextures
};
