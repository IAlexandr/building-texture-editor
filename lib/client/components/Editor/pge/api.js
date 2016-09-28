/* eslint-disable no-param-reassign */
import * as d3 from 'd3';
import jsfeat from 'jsfeat';

const lines = [];
let gpoints;
let edit;
let context;
let img;
let editSize;

export function getSizeContainer (container) {
  container.style.width = '50%';
  container.style.height = '100%';
  const width = container.offsetWidth;
  const height = container.offsetHeight;
  container.style.removeProperty('width');
  container.style.removeProperty('height');
  return { width, height };
}

export function getSizeImage (container) {
  return { width: container.width, height: container.height };
}

export function getImageArray (container, sizeContainer) {
  return container.getContext('2d').getImageData(0, 0, sizeContainer.width, sizeContainer.height);
}

function setImageToContainer (ctx, ImageArray) {
  ctx.putImageData(ImageArray, 0, 0);
}

export function getFactorImage (sizeImage, sizeContainer) {
  const factorWidth = sizeImage.width / sizeContainer.width;
  const factorHeight = sizeImage.height / sizeContainer.height;
  return Math.round(Math.max(factorWidth, factorHeight) * 100) / 100;
}

export function getResizeImage (sizeImage, factorImage) {
  return {
    width: Math.round(sizeImage.width / factorImage),
    height: Math.round(sizeImage.height / factorImage)
  };
}

export function getGridPoints (sizeImage) {
  return [
    { point: 0, line: [1, 4], x: 0 + 20, y: 0 + 20 },
    { point: 1, line: [2, 1], x: sizeImage.width - 20, y: 0 + 20 },
    { point: 2, line: [3, 2], x: sizeImage.width - 20, y: sizeImage.height - 20 },
    { point: 3, line: [4, 3], x: 0 + 20, y: sizeImage.height - 20 },
  ];
}

export function drawImage (image, container, sizeImage) {
  container.width = sizeImage.width;
  container.height = sizeImage.height;
  container.getContext('2d').drawImage(image, 0, 0, sizeImage.width, sizeImage.height);
}

export function createPreview (container, ImageArray, sizeImage) {
  container.width = sizeImage.width;
  container.height = sizeImage.height;
  container.style.marginLeft = `${sizeImage.width + 10}px`;
  edit = container;
  context = container.getContext('2d');
  img = ImageArray;
}

function dragCircle (circle, x, y) {
  d3.select(circle).attr('cx', x).attr('cy', y);
}

function draglines (line, x, y) {
  lines[line[0]].setAttribute('x1', x);
  lines[line[0]].setAttribute('y1', y);
  lines[line[1]].setAttribute('x2', x);
  lines[line[1]].setAttribute('y2', y);
}

function getChanels (ImageArray) {
  const length = ImageArray.data.length;
  const size = length / 4;

  let n = 0;
  const r = new Uint8Array(size);
  const g = new Uint8Array(size);
  const b = new Uint8Array(size);
  const a = new Uint8Array(size);

  for (let i = 0; i < length; i += 4) {
    r[n] = ImageArray.data[i];
    g[n] = ImageArray.data[i + 1];
    b[n] = ImageArray.data[i + 2];
    a[n] = ImageArray.data[i + 3];
    n++;
  }
  return { r, g, b, a, cols: ImageArray.width, rows: ImageArray.height, length };
}

function getRectified (matrix, chanel, transform) {
  const imgRectified = new jsfeat.matrix_t(matrix.cols, matrix.rows, jsfeat.U8_t | jsfeat.C1_t);
  matrix.data = chanel;
  jsfeat.imgproc.warp_perspective(matrix, imgRectified, transform, 255);
  return imgRectified;
}


function mergeChanels (r, g, b, a, length) {
  const rgba = new Uint8ClampedArray(length);
  let n = 0;

  for (let i = 0; i < length; i += 4) {
    rgba[i] = r[n];
    rgba[i + 1] = g[n];
    rgba[i + 2] = b[n];
    rgba[i + 3] = a[n];
    n++;
  }
  return rgba;
}

function perspectiveTransform (chanels) {
  const colsMax = Math.max(Math.sqrt((gpoints[2].x - gpoints[3].x) * (gpoints[2].x - gpoints[3].x) + (gpoints[2].y - gpoints[3].y) * (gpoints[2].y - gpoints[3].y)), Math.sqrt((gpoints[1].x - gpoints[0].x) * (gpoints[1].x - gpoints[0].x) + (gpoints[1].y - gpoints[0].y) * (gpoints[1].y - gpoints[0].y)));
  const rowsMax = Math.max(Math.sqrt((gpoints[1].x - gpoints[2].x) * (gpoints[1].x - gpoints[2].x) + (gpoints[1].y - gpoints[2].y) * (gpoints[1].y - gpoints[2].y)), Math.sqrt((gpoints[0].x - gpoints[3].x) * (gpoints[0].x - gpoints[3].x) + (gpoints[0].y - gpoints[3].y) * (gpoints[0].y - gpoints[3].y)));
  editSize = { width: colsMax, height: rowsMax };

  const transform = new jsfeat.matrix_t(6, 6, jsfeat.F32_t | jsfeat.C1_t);
  const m = new jsfeat.matrix_t(chanels.cols, chanels.rows, jsfeat.U8_t | jsfeat.C1_t);

  jsfeat.math.perspective_4point_transform(transform,
          gpoints[0].x, gpoints[0].y, 0, 0,
          gpoints[1].x, gpoints[1].y, colsMax, 0,
          gpoints[2].x, gpoints[2].y, colsMax, rowsMax,
          gpoints[3].x, gpoints[3].y, 0, rowsMax);
  jsfeat.matmath.invert_3x3(transform, transform);

  const r = getRectified(m, chanels.r, transform).data;
  const g = getRectified(m, chanels.g, transform).data;
  const b = getRectified(m, chanels.b, transform).data;
  const a = getRectified(m, chanels.a, transform).data;

  return mergeChanels(r, g, b, a, chanels.length);
}

function rgbaToImage (rgba) {
  return new ImageData(rgba, img.width, img.height);
}

function drag (e) {
  e.x += d3.event.dx;
  e.y += d3.event.dy;
  gpoints[e.point].x = e.x;
  gpoints[e.point].y = e.y;
  dragCircle(this, e.x, e.y);
  draglines(e.line, e.x, e.y);
  const newImage = rgbaToImage(perspectiveTransform(getChanels(img)));
  edit.width = editSize.width;
  edit.height = editSize.height;
  setImageToContainer(context, newImage);
}

function createCircles (points, svg) {
  d3.select(svg).selectAll('circle')
  .data(points)
  .enter().append('circle')
  .attr('cx', e => e.x)
  .attr('cy', e => e.y)
  .attr('name', e => e.point)
  .attr('r', 10)
  .attr('class', 'control-point')
  .call(d3.drag().on('drag', drag));
}

export function createLines (points, l1, l2, l3, l4) {
  lines[1] = l1;
  lines[2] = l2;
  lines[3] = l3;
  lines[4] = l4;
  draglines(points[0].line, points[0].x, points[0].y);
  draglines(points[1].line, points[1].x, points[1].y);
  draglines(points[2].line, points[2].x, points[2].y);
  draglines(points[3].line, points[3].x, points[3].y);
}

export function drawGrid (gridPoints, svg, l1, l2, l3, l4) {
  gpoints = gridPoints;
  createCircles(gridPoints, svg);
  createLines(gridPoints, l1, l2, l3, l4);
  setImageToContainer(context, img);
}
