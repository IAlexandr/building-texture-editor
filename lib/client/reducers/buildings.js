import {
  buildingsActionTypes
} from '../actions';

const {
  LOAD_BUILDINGS_COMPLETE,
  LOAD_BUILDINGS_FAILED,
  LOAD_BUILDINGS,
} = buildingsActionTypes;

const initialState = {
  data: {}
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
        data
      };

    case LOAD_BUILDINGS_FAILED:
      data = Object.assign({}, state.data);
      data[action.registerNo] = {
        loading: false,
        error: action.err,
        buildings: []
      };
      return {
        data
      };

    case LOAD_BUILDINGS_COMPLETE:
      data = Object.assign({}, state.data);
      data[action.registerNo] = {
        loading: false,
        error: '',
        buildings: action.buildings
      };
      return {
        data
      };

    default:
      return state;
  }
}
