import {Router} from 'express';
import options from './../../../options';
import arcgisFeaturesToGeojson from './../modules/arcgis-features-to-geojson';
import {fcBuildingsToNedb, addressesToNedb, pointsToNedb, fcStroeniyaToNedb} from './../modules/sync';
import async from 'async';
import path from 'path';
import fs from 'fs';
import db from './../nedb';
import {writeToFile, rewriteToFile} from './../modules/utils';
import {getFeaturesByPointsInsidePolygons} from './../modules/buffer';

const router = Router();
const stroeniyaFilePath = path.resolve(options.sourceDirPath, 'stroeniya.json');
router.get('/', function (req, res) {
  async.parallel({
    Address: (callback) => {
      db.Address.count({}, callback);
    },
    Building: (callback) => {
      db.Building.count({}, callback);
    },
    Point: (callback) => {
      db.Point.count({}, callback);
    },
    Stroeniya: (callback) => {
      try {
        if (fs.statSync(stroeniyaFilePath)) {
          const fc = require(stroeniyaFilePath);
          return callback(null, fc.features.length);
        }
      } catch (e) {
        return callback(null, 0);
      }
    }
  }, (err, result) => {
    return res.json(result);
  });
});

router.get('/update/fs-to-nedb', function (req, res) {
  const force = req.query.hasOwnProperty('force');
  console.log('START /update/fs-to-nedb');
  const { servicesUrl, username, password } = options.connections.arcgis[1];
  let i = 0;
  res.json({ operation: 'started' });
  const prms = {};
  async.waterfall([
    (callback) => {
      i++;
      console.log(i + '. start arcgisFeaturesToGeojson (nezhil_pomesh_points)');
      const props = {
        featureServerUrl: servicesUrl + '/pomesheniya/nezhil_pom_v8/FeatureServer/0',
        username: username,
        password: password
      };
      arcgisFeaturesToGeojson(
        props,
        function (err, featureCollection) {
          if (err) {
            console.log(err.message);
            return callback(err);
          }
          console.log(i + '. done. featureCollection', featureCollection.features.length);
          prms.fcPoints = featureCollection;
          return callback(null, prms);
        })
    },
    (prms, callback) => {
      i++;
      console.log(i + '. start sync points in nedb.');
      // обновление таблицы Points на основе целевых строений.
      pointsToNedb(prms.fcPoints, (err) => {
        console.log(i + '. done.');
        return callback(err, prms);
      });
    },
    (prms, callback) => {
      i++;
      console.log(i + '. start arcgisFeaturesToGeojson (stroeniya)');
      const filePath = stroeniyaFilePath;

      function getFeatures (prms, callback) {
        const props = {
          featureServerUrl: servicesUrl + '/test/stroeniya/FeatureServer/0',
          coordSystemConvertOperation: 'inverse',
          username: username,
          password: password
        };
        arcgisFeaturesToGeojson(
          props,
          function (err, featureCollection) {
            if (err) {
              console.log(err.message);
              return callback(err);
            }
            console.log(i + '. done. featureCollection', featureCollection.features.length);
            prms.fcStroeniya = featureCollection;
            return callback(err, prms);
          })
      }

      try {
        if (fs.statSync(filePath) && !force) {
          prms.fcStroeniya = require(filePath);
          return callback(null, prms);
        }
      } catch (e) {
        getFeatures(prms, (err, prms) => {
          if (err) {
            return callback(err);
          }
          rewriteToFile({ filePath, data: JSON.stringify(prms.fcStroeniya, null, 2) }, (err) => {
            if (err) {
              return callback(err);
            }
            return callback(null, prms);
          });
        });
      }
    },
    (prms, callback) => {
      i++;
      console.log(i + '. start getFeaturesByPointsInsidePolygons.');
      const targetBuildingsFeatures = getFeaturesByPointsInsidePolygons(prms.fcPoints, prms.fcStroeniya);
      const featureCollection = {
        type: 'FeatureCollection',
        features: targetBuildingsFeatures
      };
      console.log(i + '. done. featureCollection', featureCollection.features.length);
      prms.fcTargetBuildings = featureCollection;
      return callback(null, prms);
    },
    (prms, callback) => {
      i++;
      console.log(i + '. start sync fcBuildings in nedb.');
      // обновление таблицы Building на основе получ. данных.
      fcBuildingsToNedb(prms.fcTargetBuildings, (err, fcBuildings) => {
        console.log(i + '. done.');
        return callback(err, fcBuildings);
      });
    },
    (fcBuildings, callback) => {
      i++;
      console.log(i + '. start sync addresses in nedb.');
      // обновление таблицы Address на основе целевых строений.
      addressesToNedb(fcBuildings, (err) => {
        console.log(i + '. done.');
        return callback(err);
      });
    }
  ], (err) => {
    if (err) {
      console.log('/update/fs-to-nedb err:', err.message);
    } else {
      console.log('DONE. /update/fs-to-nedb');
    }
  });

});

export default {
  route: 'sync',
  router
};
