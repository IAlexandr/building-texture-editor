import {
  addressListActionTypes
} from '../actions';

const {
  LOAD_ADDRESS_LIST_COMPLETE,
  LOAD_ADDRESS_LIST_FAILED,
  LOAD_ADDRESS_LIST,
} = addressListActionTypes;

const initialState = {
  error: '',
  loading: false,
  data: {}
};

export default function (state = initialState, action) {
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
      return {
        loading: false,
        error: '',
        data: action.addressList
      };

    default:
      return state;
  }
}
