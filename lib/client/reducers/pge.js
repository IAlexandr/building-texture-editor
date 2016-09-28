import {
  pgeActionTypes
} from '../actions';

const {
  OPEN_PGE,
} = pgeActionTypes;

const initialState = {
  open: true,
};

export default function (state = initialState, action) {
  switch (action.type) {
    case OPEN_PGE:
      return { ...state, open: !state.open };
    default:
      return state;
  }
}
