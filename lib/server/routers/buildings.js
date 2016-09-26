import {Router} from 'express';
import path from 'path';
import options from './../../../options';
import db from './../nedb';
import {prepSimplifyFeaturePoints, prepFloors} from './../modules/utils';

const router = Router();
const stroeniyaResultFilePath = path.resolve(options.sourceDirPath, 'stroeniya_result.json');
const stroeniya_result_object_by_register_no = {};
let stroeniya_result;

function featureFilter(feature) {
  return feature.properties['Наименование'] === 'Строение' ||
    feature.properties['Название_улицы'] ||
    feature.properties['Площадь'] > 15
}

function updateTempData () {
  console.log('start. (updateTempData)');
  try {
    if (typeof stroeniya_result !== 'object') {
      stroeniya_result = require(stroeniyaResultFilePath);
      stroeniya_result.features = stroeniya_result.features.filter((feature) => {
        return featureFilter(feature);
      });
    }

    if (Object.keys(stroeniya_result_object_by_register_no).length === 0) {
      db.EditedBuilding.find()
        .exec((err, docs) => {
          if (err) {
            console.log(err.message);
          } else {
            const editedBuildings = {};
            docs.forEach((doc) => {
              editedBuildings[doc.properties.ID] = doc;
            });
            stroeniya_result.features.forEach((feature) => {
              if (!stroeniya_result_object_by_register_no.hasOwnProperty(feature.properties.ParentRegisterNo)) {
                stroeniya_result_object_by_register_no[feature.properties.ParentRegisterNo] = [];
              }
              if (editedBuildings.hasOwnProperty(feature.properties.ID)) {
                feature = editedBuildings[feature.properties.ID];
              }
              feature = prepSimplifyFeaturePoints(feature);
              feature = prepFloors(feature);
              stroeniya_result_object_by_register_no[feature.properties.ParentRegisterNo].push(feature);
            });
          }
        });
    }
    console.log('done. (updateTempData)');
  } catch (e) {}
}
updateTempData();

router.get('/', function (req, res) {
  try {
    return res.json(stroeniya_result);
  } catch (e) {
    return res.status(404).json({errmessage: 'Нет файла с (целевыми) строениями.'});
  }
});

router.get('/:RegisterNo', function (req, res) {
  const features = stroeniya_result_object_by_register_no[req.params.RegisterNo];
  if (features) {
    return res.json(features);
  } else {
    return res.status(404).json({errmessage: 'Нет строений по этому адресу.'});
  }
});

router.put('/:RegisterNo/:ID', function (req, res) {
  if (!req.body) {
    return res.status(500).json(new Error('Нет данных для изменения!'));
  }
  const newBuilding = req.body;
  db.EditedBuilding.findOne(
    {'properties.ID': newBuilding.properties.ID }, (err, doc) => {
      if (err) {
        return res.status(500).json({errmessage: err.message});
      }
      if (doc) {
        db.EditedBuilding.update({ID: newBuilding.properties.ID }, newBuilding, { upsert: true }, (err, numReplaced, upsert) => {
          if (err) {
            return res.status(500).json({errmessage: err.message});
          }
          const features = stroeniya_result_object_by_register_no[req.params.RegisterNo];
          features.forEach((feature, i) => {
            if (feature.properties.ID === req.params.ID) {
              features[i] = upsert;
            }
          });
          return res.json(upsert);
        });
      } else {
        db.EditedBuilding.insert(newBuilding, (err, doc) => {
          if (err) {
            return res.status(500).json({errmessage: err.message});
          }
          const features = stroeniya_result_object_by_register_no[req.params.RegisterNo];
          if (features) {
            features.forEach((feature, i) => {
              if (feature.properties.ID === req.params.ID) {
                features[i] = doc;
              }
            });
          } else {
            console.log('!!!!!!');
          }
          return res.json(doc);
        });
      }
    });
});

export default {
  route: 'buildings',
  router
};
