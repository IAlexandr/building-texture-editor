import {
  buildingsActionTypes
} from '../actions';

const {
  LOAD_BUILDINGS_COMPLETE,
  LOAD_BUILDINGS_FAILED,
  LOAD_BUILDINGS,
  SELECT_INFO,
} = buildingsActionTypes;

const initialState = {
  data: {},
  selectInfo: {}
};

export default function (state = initialState, action) {
  let data;
  switch (action.type) {
    case LOAD_BUILDINGS:
      if (state.data.hasOwnProperty(action.registerNo)) {
        return {
          data: state.data
        }
      }
      data = Object.assign({}, state.data);
      data[action.registerNo] = {
        loading: true,
        error: '',
        buildings: []
      };
      return {
        ...state,
        ...{ data }
      };

    case LOAD_BUILDINGS_FAILED:
      data = Object.assign({}, state.data);
      data[action.registerNo] = {
        loading: false,
        error: action.err,
        buildings: []
      };
      return {
        ...state,
        ...{ data }
      };

    case LOAD_BUILDINGS_COMPLETE:
      data = Object.assign({}, state.data);
      data[action.registerNo] = {
        loading: false,
        error: '',
        buildings: action.buildings
      };
      return {
        ...state,
        ...{ data }
      };

    case SELECT_INFO:
      const selectInfo = {
        registerNo: action.registerNo,
        wallId: action.wallId,
        ID: action.ID
      };
      return {
        ...state,
        ...{ selectInfo }
      };

    default:
      return state;
  }
}
