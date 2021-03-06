import {Router} from 'express';
import options from './../../../options';
import arcgisFeaturesToGeojson from './../modules/arcgis-features-to-geojson';
import {fcBuildingsToDb, addressesToDb, pointsToDb} from './../modules/sync';
import async from 'async';
import path from 'path';
import fs from 'fs';
import db from './../mongo/db';
import turfArea from 'turf-area';
import {rewriteToFile, prepSimplifyFeaturePoints, prepFloors, splitPointsByDistance} from './../modules/utils';
import {getFeaturesByPointsInsidePolygons, findBuildingsByPolygons} from './../modules/buffer';

function featureFilter (feature) {
  // feature.properties['Наименование'] === 'Строение' ||
  // feature.properties['Название_улицы'] ||
  return feature.properties['Площадь'] > 15;
}

const router = Router();
const stroeniyaFilePath = path.resolve(options.sourceDirPath, 'stroeniya.json');

router.get('/buildings/simplify/:m', (req, res) => {
  const m = req.params.m ? req.params.m * 0.000001 : 0.000001;
  db.Building.find({}, (err, docs) => {
    if (err) {
      return res.status(500).json({ errmessage: err.message });
    }
    const features = docs.filter((doc) => {
      return featureFilter(doc);
    });
    const date = new Date().toISOString();
    async.eachLimit(features, 1, (feature, done) => {
      feature = prepSimplifyFeaturePoints(feature, m);
      feature = prepFloors(feature);
      // feature = splitPointsByDistance(feature, 20);
      feature.geometry.originPoints = feature.geometry.points;
      feature.geometry.updatedAt = date;
      db.Building.update({_id: feature._id}, { $set: { geometry: feature.geometry }}, { new: true }, (err) => {
        return done(err);
      });
    }, (err) => {
      if (err) {
        return res.status(500).json({ errmessage: err.message });
      }
      return res.json({ result: 'done' });
    });
  });
});

router.get('/', function (req, res) {
  async.parallel({
    Address: (callback) => {
      db.Address.count({}, callback);
    },
    Building: (callback) => {
      db.Building.count({}, callback);
    },
    NezhilPomeshPoint: (callback) => {
      db.NezhilPomeshPoint.count({}, callback);
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

      function getPoints (callback) {
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
            // обновление таблицы Points на основе целевых строений.
            pointsToDb(prms.fcPoints, (err, docs) => {
              console.log(i + '. done.');
              prms.fcPoints = docs;
              return callback(err, prms);
            });
          })
      }

      if (!force) {
        db.NezhilPomeshPoint.find({}, (err, docs) => {
          if (err) {
            return callback(err);
          }
          if (docs.length > 0) {
            prms.fcPoints = {
              type: 'FeatureCollection',
              features: docs
            };
            return callback(null, prms);
          } else {
            getPoints(callback);
          }
        });
      } else {
        getPoints(callback);
      }
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
      prms.fcBuildings = featureCollection;
      return callback(null, prms);
    },
    (prms, callback) => {
      i++;
      console.log(i + '. start sync addresses.');
      // обновление таблицы Address на основе целевых строений.
      addressesToDb(prms.fcBuildings, (err) => {
        console.log(i + '. done.');
        return callback(err, prms);
      });
    },
    (prms, callback) => {
      i++;
      console.log(i + '. start search annexe buildings.');
      const buildingsFeatures = findBuildingsByPolygons(prms.fcBuildings.features, prms.fcStroeniya.features, 0.2, 'kilometers');
      const features = [];
      buildingsFeatures.forEach((feature) => {
        const area = turfArea(feature);
        feature.properties['Площадь'] = area;
        features.push(feature);
      });
      const featureCollection = {
        type: 'FeatureCollection',
        features: features
      };
      prms.fcStroeniyaResult = featureCollection;
      console.log(i + '. done. features:', featureCollection.features.length);
      return callback(null, prms);
    },
    (prms, callback) => {
      i++;
      console.log(i + '. start fcBuildingsToDb (stroeniya_result)');
      fcBuildingsToDb(prms.fcStroeniyaResult, (err, fcStroeniyaResult) => {
        console.log(i + '. done.');
        prms.fcStroeniyaResult = fcStroeniyaResult;
        return callback(err, prms);
      });
    },
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
