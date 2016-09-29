import superagent from 'superagent';
import {actions as smessagesActions} from './smessages';

export const actionTypes = {
  LOAD_BUILDINGS_COMPLETE: 'LOAD_BUILDINGS_COMPLETE',
  LOAD_BUILDINGS_FAILED: 'LOAD_BUILDINGS_FAILED',
  LOAD_BUILDINGS: 'LOAD_BUILDINGS',

  SELECT_INFO: 'SELECT_INFO',
  UNSELECT: 'UNSELECT',

  CHANGE_BUILDING_COMPLETE: 'CHANGE_BUILDING_COMPLETE',
  CHANGE_BUILDING_FAILED: 'CHANGE_BUILDING_FAILED',
  CHANGE_BUILDING: 'CHANGE_BUILDING',
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

export function saveBuildingTextures () {

}

export const actions = {
  loadBuildingsComplete,
  loadBuildingsFailed,
  loadBuildings,
  selectInfo,
  unselect,
  changeBuildingComplete,
  changeBuildingFailed,
  changeBuilding
};
