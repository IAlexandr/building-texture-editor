import fs from 'fs';
import turf from 'turf';
import {coordEach} from 'turf-meta';
import simplify from 'simplify-js';
import distance from 'turf-distance';
import midpoint from 'turf-midpoint';

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
        writeToFile({ filePath, data }, callback);
      });
      return callback(new Error('Файл по пути: ' + filePath + ' уже существует.'));
    }
  } catch (e) {
    writeToFile({ filePath, data }, callback);
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

function pointGetXY (feature) {
  if (!feature.geometry.coordinates[1]) {
    console.log();
  }
  return {
    x: feature.geometry.coordinates[0],
    y: feature.geometry.coordinates[1]
  };
}

export function splitPointsByDistance (feature, m) {
  m = m / 1000;
  function split (points, m) {
    let temp = [];
    let isSplited = false;
    points.forEach(function (point, i) {
      temp = temp.concat(point);
      if (points[i + 1] === 0 || points[i + 1]) {
        const d = distance(point, points[i + 1], 'kilometers');
        if (d > m) {
          isSplited = true;
          temp = temp.concat(midpoint(point, points[i + 1]));
        }
      }
    });
    if (isSplited) {
      temp = split(temp, m);
    }
    return temp;
  }

  switch (feature.geometry.type) {
    case 'Polygon':
      var points = feature.geometry.points;
      points = points.map((point) => {
        return turf.point([point.x, point.y]);
      });
      const prePoints = split(points, m);
      feature.geometry.points = prePoints.map((point) => {
        return pointGetXY(point);
      });
      break;
    case 'MultiPolygon':
      // TODO
      break;
  }
  return feature;
}

export function prepSimplifyFeaturePoints (feature, m) {
  var resultPoints = [];
  switch (feature.geometry.type) {
    case 'Polygon':
      var points = feature.geometry.coordinates[0];
      points.forEach(function (point) {
        resultPoints.push({ x: point[0], y: point[1] });
      });
      resultPoints = simplify(resultPoints, m);
      break;
    case 'MultiPolygon':
      var parts = feature.geometry.coordinates;
      parts.forEach(function (part) {
        part.forEach(function (points) {
          var partResultPoints = [];
          points.forEach(function (point) {
            partResultPoints.push({ x: point[0], y: point[1] });
          });
          resultPoints.push(simplify(partResultPoints, m));
        });
      });
      break;
  }

  feature.geometry.points = resultPoints;
  return feature;
}

export function prepFloors (feature) {
  let floors = 5;
  if (feature.properties['этажность']) {
    if (parseInt(feature.properties['этажность'])) {
      floors = parseInt(feature.properties['этажность']);
    }
  }
  feature.properties['этажность'] = floors;
  return feature;
}

export function getObjId (feature) {
  if (feature.properties.hasOwnProperty('"Object ID"')) {
    return feature.properties['"Object ID"'];
  }
  if (feature.properties.hasOwnProperty('Object ID')) {
    return feature.properties['Object ID'];
  }
  if (feature.properties.hasOwnProperty('OBJECTID')) {
    return feature.properties['OBJECTID'];
  }
  return null;
}
