import {
  addressListActionTypes
} from '../actions';

const {
  LOAD_ADDRESS_LIST_COMPLETE,
  LOAD_ADDRESS_LIST_FAILED,
  LOAD_ADDRESS_LIST,

  CHANGE_ADDRESS_COMPLETE,
  CHANGE_ADDRESS_FAILED,
  CHANGE_ADDRESS
} = addressListActionTypes;

const initialState = {
  error: '',
  loading: true,
  data: {}
};

export default function (state = initialState, action) {
  let data;
  switch (action.type) {
    case LOAD_ADDRESS_LIST:
      return {
        loading: true,
        error: '',
        data: {}
      };

    case LOAD_ADDRESS_LIST_FAILED:
      return {
        loading: false,
        error: action.err,
        data: {}
      };

    case LOAD_ADDRESS_LIST_COMPLETE:
      const addrList = {};
      action.addressList.forEach((address) => {
        addrList[address.RegisterNo] = { loading: false, err: null, data: address };
      });
      return {
        loading: false,
        error: '',
        data: addrList
      };

    case CHANGE_ADDRESS:
      data = Object.assign({}, state.data);
      data[action.newAddress.RegisterNo].loading = true;
      data[action.newAddress.RegisterNo].err = null;
      return {
        ...state,
        ...{ data }
      };

    case CHANGE_ADDRESS_FAILED:
      data = Object.assign({}, state.data);
      data[action.newAddress.RegisterNo].loading = false;
      data[action.newAddress.RegisterNo].err = action.err;
      return {
        ...state,
        ...{ data }
      };

    case CHANGE_ADDRESS_COMPLETE:
      data = Object.assign({}, state.data);
      data[action.newAddress.RegisterNo].loading = false;
      data[action.newAddress.RegisterNo].data = action.address;
      return {
        ...state,
        ...{ data }
      };

    default:
      return state;
  }
}
