import {Router} from 'express';
import path from 'path';
import options from './../../../options';
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
      stroeniya_result.features.forEach((feature) => {
        if (!stroeniya_result_object_by_register_no.hasOwnProperty(feature.properties.ParentRegisterNo)) {
          stroeniya_result_object_by_register_no[feature.properties.ParentRegisterNo] = [];
        }
        feature = prepSimplifyFeaturePoints(feature);
        feature = prepFloors(feature);
        stroeniya_result_object_by_register_no[feature.properties.ParentRegisterNo].push(feature);
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

export default {
  route: 'buildings',
  router
};
