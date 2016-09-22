export const actionTypes = {
  OPEN_MESSAGE: 'OPEN_MESSAGE',
  CLOSE_MESSAGE: 'CLOSE_MESSAGE'
};

let to;

export function openMessage (message) {
  return dispatch => {
    dispatch({
      type: actionTypes.OPEN_MESSAGE,
      message
    });
    if (to) {
      clearTimeout(to);
    }
    to = setTimeout(() => {
      dispatch(closeMessage());
    }, 5000);
  }
}

export function closeMessage () {
  return dispatch => {
    if (to) {
      clearTimeout(to);
    }
    dispatch({
      type: actionTypes.CLOSE_MESSAGE
    });
  }
}

export const actions = {
  openMessage,
  closeMessage
};
