import {
  smassagesTypes
} from '../actions';

const {
  OPEN_MESSAGE,
  CLOSE_MESSAGE
} = smassagesTypes;

const initialState = {
  message: 'init',
  open: false
};

export default function (state = initialState, action) {
  switch (action.type) {
    case OPEN_MESSAGE:
      return {
        ...state,
        ...{
          message: action.message,
          open: true
        }
      };

    case CLOSE_MESSAGE:
      return {
        ...state,
        ...{
          message: '',
          open: false
        }
      };

    default:
      return state;
  }
}
