import fs from 'fs';
import {coordEach} from 'turf-meta';
import simplify from 'simplify-js';

function writeToFile ({ data, filePath }, callback) {
  fs.writeFile(filePath, data, (err) => {
    console.log('(writeToFile) done.');
    return callback(err);
  });
}
export function rewriteToFile ({ data, filePath }, callback) {
  console.log('rewriteToFile', filePath);
  try {
    if (fs.statSync(filePath)) {
      fs.unlink(filePath, (err) => {
        if (err) {
          return callback(err);
        }
        writeToFile({filePath, data}, callback);
      });
      return callback(new Error('Файл по пути: ' + filePath + ' уже существует.'));
    }
  } catch (e) {
    writeToFile({filePath, data}, callback);
  }
}
export function splitArray (input, spacing) {
  var output = [];
  for (var i = 0; i < input.length; i += spacing)
    output[output.length] = input.slice(i, i + spacing);
  return output;
}

export function progressConsole (i, number, message) {
  if (i % number === 0) {
    console.log(message, i);
  }
}

export function getFeatureExtent (layer) {
  var extent = [Infinity, Infinity, -Infinity, -Infinity];
  coordEach(layer, function (coord) {
    if (extent[0] > coord[0]) extent[0] = coord[0];
    if (extent[1] > coord[1]) extent[1] = coord[1];
    if (extent[2] < coord[0]) extent[2] = coord[0];
    if (extent[3] < coord[1]) extent[3] = coord[1];
  });
  return extent;
}

export function prepSimplifyFeaturePoints (feature) {
  var resultPoints = [];
  switch (feature.geometry.type) {
    case 'Polygon':
      var points = feature.geometry.coordinates[0];
      points.forEach(function (point) {
        resultPoints.push({x: point[0], y: point[1]});
      });
      resultPoints = simplify(resultPoints, 0.000001);
      break;
    case 'MultiPolygon':
      var parts = feature.geometry.coordinates;
      parts.forEach(function (part) {
        part.forEach(function (points) {
          var partResultPoints = [];
          points.forEach(function (point) {
            partResultPoints.push({x: point[0], y: point[1]});
          });
          resultPoints.push(simplify(partResultPoints, 0.000001));
        });
      });
      break;
  }

  feature.geometry.points = resultPoints;
  return feature;
}
