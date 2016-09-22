import superagent from 'superagent';
import {actions as smessagesActions} from './smessages';

export const actionTypes = {
  LOAD_ADDRESS_LIST_COMPLETE: 'LOAD_ADDRESS_LIST_COMPLETE',
  LOAD_ADDRESS_LIST_FAILED: 'LOAD_ADDRESS_LIST_FAILED',
  LOAD_ADDRESS_LIST: 'LOAD_ADDRESS_LIST',
};

export function loadAddressListComplete (addressList) {
  return {
    type: actionTypes.LOAD_ADDRESS_LIST_COMPLETE,
    addressList
  };
}

export function loadAddressListFailed (err) {
  return {
    type: actionTypes.LOAD_ADDRESS_LIST_FAILED,
    err
  };
}

export function loadAddressList (callback) {
  return dispatch => {
    dispatch({
      type: actionTypes.LOAD_ADDRESS_LIST
    });

    superagent.get('/api/address')
      .accept('application/json')
      .end((err, res) => {
        if (callback) {
          callback(err, res.body);
        }
        if (err) {
          dispatch(loadAddressListFailed(err));
        } else {
          dispatch(smessagesActions.openMessage('Список адресов загружен.'));
          dispatch(loadAddressListComplete(res.body));
        }
      });
  };
}

export const actions = {
  loadAddressListComplete,
  loadAddressListFailed,
  loadAddressList,
};
