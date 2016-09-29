import React, {PropTypes, Component} from 'react';
import {
  createPreview,
  createSvg,
  getSizeContainer,
  getSizeImage,
  getFactorImage,
  getResizeImage,
  getGridPoints,
  getImageArray,
  drawImage,
  drawGrid,
  setWall,
} from './api';
import * as d3 from 'd3';

let original;
let edit;
let svg;
let l1;
let l2;
let l3;
let l4;

const style = {
  origin: {
    padding: 0,
    float: 'left',
    position: 'absolute',
    zIndex: -1,
    border: '2px dashed #F44336',
  },
  svg: {
    position: 'absolute',
  },
  edit: {
    padding: 0,
    float: 'left',
    position: 'absolute',
    zIndex: -1,
    border: '2px double #03A9F4',
  }
};



const draw = (wall, image) => {
    const sizeContainer = getSizeContainer(original);
    const sizeImage = getSizeImage(image);

    const factorImage = getFactorImage(sizeImage, sizeContainer);
    const resizeImage = getResizeImage(sizeImage, factorImage);
    const gridPoints = getGridPoints(resizeImage);
    createSvg(svg, resizeImage)
    setWall(wall);
    drawImage(image, original, resizeImage);
    const ImageArray = getImageArray(original, resizeImage);
    createPreview(edit, ImageArray, resizeImage);
    drawGrid(gridPoints, svg, l1, l2, l3, l4);
}

class Pge extends Component {

  static propTypes = {
    open: PropTypes.bool.isRequired,
    handleOpenPge: PropTypes.func.isRequired,
    wall: PropTypes.object,
    image: PropTypes.object,
  };

  componentDidMount() {
    original = this.refs.original;
    edit = this.refs.edit;
    svg = this.refs.svg;
    l1 = this.refs.l1;
    l2 = this.refs.l2;
    l3 = this.refs.l3;
    l4 = this.refs.l4;
    draw(this.props.wall, this.props.image);
  }

  componentWillReceiveProps(nextProps) {
    draw(this.props.wall, nextProps.image);
  }

  render ({ open, handleOpenPge } = this.props) {
    return (
      open ? <div>
        <canvas
          ref="original"
          style={style.origin}
        />
        <canvas
          ref="edit"
          style={style.edit}
        />
        <svg
          ref="svg"
          style={style.svg}
        >
          <line ref="l1" strokeWidth="2" stroke="#03A9F4"/>
          <line ref="l2" strokeWidth="2" stroke="#03A9F4"/>
          <line ref="l3" strokeWidth="2" stroke="#03A9F4"/>
          <line ref="l4" strokeWidth="2" stroke="#03A9F4"/>
        </svg>
      </div> : null
    );
  }
}

export default Pge;
