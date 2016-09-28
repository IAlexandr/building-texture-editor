import superagent from 'superagent';
import {actions as smessagesActions} from './smessages';

export const actionTypes = {
  LOAD_ADDRESS_LIST_COMPLETE: 'LOAD_ADDRESS_LIST_COMPLETE',
  LOAD_ADDRESS_LIST_FAILED: 'LOAD_ADDRESS_LIST_FAILED',
  LOAD_ADDRESS_LIST: 'LOAD_ADDRESS_LIST',
  CHANGE_ADDRESS_COMPLETE: 'CHANGE_ADDRESS_COMPLETE',
  CHANGE_ADDRESS_FAILED: 'CHANGE_ADDRESS_FAILED',
  CHANGE_ADDRESS: 'CHANGE_ADDRESS',
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
          dispatch(smessagesActions.openMessage('Список адресов обновлен.'));
          dispatch(loadAddressListComplete(res.body));
        }
      });
  };
}


export function changeAddressComplete (address) {
  return {
    type: actionTypes.CHANGE_ADDRESS_COMPLETE,
    address
  };
}

export function changeAddressFailed (newAddress, err) {
  return {
    type: actionTypes.CHANGE_ADDRESS_FAILED,
    err,
    newAddress
  };
}

export function changeAddress (newAddress) {
  return dispatch => {
    dispatch({
      type: actionTypes.CHANGE_ADDRESS,
      newAddress
    });
    superagent.put('/api/address')
      .accept('application/json')
      .send(newAddress)
      .end((err, res) => {
        if (err) {
          dispatch(smessagesActions.openMessage('Ошибка обновления сведений по адресу.'));
          dispatch(changeAddressFailed(newAddress, err));
        } else {
          dispatch(smessagesActions.openMessage('Сведения по адресу обновлены.'));
          dispatch(changeAddressComplete(res.body));
        }
      });
  };
}

export const actions = {
  loadAddressListComplete,
  loadAddressListFailed,
  loadAddressList,

  changeAddressComplete,
  changeAddressFailed,
  changeAddress
};
