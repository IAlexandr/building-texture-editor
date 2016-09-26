import superagent from 'superagent';
import {actions as smessagesActions} from './smessages';

export const actionTypes = {
  LOAD_BUILDINGS_COMPLETE: 'LOAD_BUILDINGS_COMPLETE',
  LOAD_BUILDINGS_FAILED: 'LOAD_BUILDINGS_FAILED',
  LOAD_BUILDINGS: 'LOAD_BUILDINGS',

  SELECT_INFO: 'SELECT_INFO',
  UNSELECT: 'UNSELECT',
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

export function selectInfo ({registerNo, wallId, ID}) {
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
export const actions = {
  loadBuildingsComplete,
  loadBuildingsFailed,
  loadBuildings,
  selectInfo,
  unselect,
};
