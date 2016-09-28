import React, {PropTypes, Component} from 'react';
import {
  createPreview,
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
let image;
const style = {
  origin: {
    padding: 0,
    float: 'left',
    position: 'absolute',
    zIndex: -1,
    backgroundColor: 'slategray',
  },
  svg: {
    width: '50%',
    height: '100%',
    position: 'absolute',
  }
};

class Pge extends Component {

  static propTypes = {
    open: PropTypes.bool.isRequired,
    handleOpenPge: PropTypes.func.isRequired,
    wall: PropTypes.object,
    image: PropTypes.object,
  };

  componentDidMount () {

  }

  init(_img, _wall) {
    const original = this.refs.original;
    const edit = this.refs.edit;
    const svg = this.refs.svg;
    const l1 = this.refs.l1;
    const l2 = this.refs.l2;
    const l3 = this.refs.l3;
    const l4 = this.refs.l4;

    image = _img;

    image.onload = () => {
      const sizeContainer = getSizeContainer(original);
      const sizeImage = getSizeImage(image);
      const factorImage = getFactorImage(sizeImage, sizeContainer);
      const resizeImage = getResizeImage(sizeImage, factorImage);
      const gridPoints = getGridPoints(resizeImage);
      setWall(_wall);
      drawImage(image, original, resizeImage);
      const ImageArray = getImageArray(original, resizeImage);

      createPreview(edit, ImageArray, resizeImage);
      drawGrid(gridPoints, svg, l1, l2, l3, l4);
    };

  }

  render ({ open, handleOpenPge } = this.props) {
    return (
      open ? <div>
        <canvas
          w={this.init(this.props.image, this.props.wall )}
          ref="original"
          style={style.origin}
        />
        <canvas
          ref="edit"
          style={style.origin}
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
