import {
  buildingsActionTypes
} from '../actions';

const {
  LOAD_BUILDINGS_COMPLETE,
  LOAD_BUILDINGS_FAILED,
  LOAD_BUILDINGS,
  SELECT_INFO,
  CHANGE_BUILDING,
  CHANGE_BUILDING_FAILED,
  CHANGE_BUILDING_COMPLETE,
  SAVE_BUILDING_TEXTURES_COMPLETE,
  SAVE_BUILDING_TEXTURES_FAILED,
  SAVE_BUILDING_TEXTURES,
  COPY_BUILDING_TEXTURE_COMPLETE,
  COPY_BUILDING_TEXTURE_FAILED,
  COPY_BUILDING_TEXTURE,
} = buildingsActionTypes;

const initialState = {
  data: {},
  selectInfo: { registerNo: null, wallId: null, ID: null }
};

export default function (state = initialState, action) {
  let data;
  switch (action.type) {
    case LOAD_BUILDINGS:
      if (state.data.hasOwnProperty(action.registerNo)) {
        return {
          ...state,
          ...{ data: state.data }
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

    case CHANGE_BUILDING:
      if (state.data.hasOwnProperty(action.newBuilding.properties.ParentRegisterNo) && !state.data[action.newBuilding.properties.ParentRegisterNo].loading) {
        data = Object.assign({}, state.data);
        data[action.newBuilding.properties.ParentRegisterNo].loading = true;
        return {
          ...state,
          ...{ data }
        };
      } else {
        return state;
      }

    case CHANGE_BUILDING_FAILED:
      data = Object.assign({}, state.data);
      data[action.newBuilding.properties.ParentRegisterNo].loading = false;
      return {
        ...state,
        ...{ data }
      };

    case CHANGE_BUILDING_COMPLETE:
      data = Object.assign({}, state.data);
      data[action.building.properties.ParentRegisterNo].loading = false;
      data[action.building.properties.ParentRegisterNo].buildings.forEach((building, i) => {
        if (building.properties.ID === action.building.properties.ID) {
          data[action.building.properties.ParentRegisterNo].buildings[i] = action.building;
        }
      });
      return {
        ...state,
        ...{ data }
      };


    case SAVE_BUILDING_TEXTURES:
        return state;

    case SAVE_BUILDING_TEXTURES_FAILED:
      console.log(action.err, action.registerNo);
      return state;

    case SAVE_BUILDING_TEXTURES_COMPLETE:
      console.log('сохранено текстур: ', action.count);
      return state;

    case COPY_BUILDING_TEXTURE:
        return state;

    case COPY_BUILDING_TEXTURE_FAILED:
      console.log(action.err, action.copyInfo);
      return state;

    case COPY_BUILDING_TEXTURE_COMPLETE:
      Cesium.myViewer.entities.values.forEach((entity) => {
        if (
          entity.wall &&
          entity.registerNo === action.copyInfo.to.registerNo &&
          entity.ID === action.copyInfo.to.ID &&
          entity.wallId === action.copyInfo.to.wallId
        ) {
          entity.wall.material = new Cesium.ImageMaterialProperty({
            image: '/api/buildings/' + action.copyInfo.from.registerNo + '_' +
            action.copyInfo.from.ID + '_' + action.copyInfo.from.wallId + '.png' });
        }
      });
      return state;

    default:
      return state;
  }
}
