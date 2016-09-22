import superagent from 'superagent';

export const actionTypes = {
  LOAD_ADDRESS_LIST_COMPLETE: 'LOAD_ADDRESS_LIST_COMPLETE',
  LOAD_ADDRESS_LIST_FAILED: 'LOAD_ADDRESS_LIST_FAILED',
  LOAD_ADDRESS_LIST: 'LOAD_ADDRESS_LIST',
};

export function loadAddressListComplete (addressList) {
  return {
    type: types.LOAD_ADDRESS_LIST_COMPLETE,
    addressList
  };
}

export function loadAddressListFailed (err) {
  return {
    type: types.LOAD_ADDRESS_LIST_FAILED,
    err
  };
}

export function loadAddressList (callback) {
  return dispatch => {
    dispatch({
      type: types.LOAD_ADDRESS_LIST
    });

    superagent.get('/api/address')
      .accept('application/json')
      .end((err, res) => {
        if (callback) {
          callback(err, !err ? JSON.parse(res.body) : null);
        }
        if (err) {
          dispatch(loadAddressListFailed(err));
        } else {
          dispatch(loadAddressListComplete(JSON.parse(res.body)));
        }
      });
  };
}

export const actions = {
  loadAddressListComplete,
  loadAddressListFailed,
  loadAddressList,
};
