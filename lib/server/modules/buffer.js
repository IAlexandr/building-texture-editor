import turf from 'turf';
import featurecollection from 'turf-featurecollection';
import {progressConsole, getFeatureExtent, getObjId} from './utils';

export function getFeaturesByPointsInsidePolygons (fcPoints, fcPolygons) {
  const resultFeatures = [];
  console.log('Поиск точек в полигоне:');
  fcPoints.features.forEach((feature, pointIndex) => {
    let isPointIn = false;
    for (let i = 0; i < fcPolygons.features.length; i++) {
      const polygonFeature = fcPolygons.features[i];
      if (turf.inside(feature, polygonFeature)) {
        if (!polygonFeature.properties['Название_улицы'] || !polygonFeature.properties['Номер_дома']) {
          polygonFeature.properties.fullAddress = feature.properties['Адрес'];
        } else {
          polygonFeature.properties.fullAddress = polygonFeature.properties['Название_улицы'] + ', ' + polygonFeature.properties['Номер_дома'];
        }
        resultFeatures.push(polygonFeature);
        progressConsole(resultFeatures.length, 100,
          'Обработано точек: ' + pointIndex + '. Найдено полигонов:');
        isPointIn = true;
        break;
      }
    }
    if (!isPointIn) {
      console.log(feature.properties['Адрес']);
    }
  });
  console.log('Поиск точек в полигоне закончен.', resultFeatures.length);
  return resultFeatures;
}

export function neareOfPolygonBuf (targetFeature, sourceFeatures, result = {}, distance = 1, unit = 'kilometers') {
  const buf = turf.buffer(targetFeature, distance, unit);
  sourceFeatures.forEach((sFeature) => {
    if (sFeature.properties.ID !== targetFeature.properties.ID && !result.hasOwnProperty(sFeature.properties.ID)) {
      const points = sFeature.geometry.coordinates[0];


      for (let i = 0; i < points.length; i++) {
        const point = turf.point(points[i]);
        if (turf.inside(point, buf)) {

          let parentRegNo = sFeature.properties['ParentRegisterNo'] || sFeature.properties['RegisterNo'];
          if (!parentRegNo) {
            parentRegNo = getObjId(sFeature);
            if (!sFeature.properties.ID) {
              sFeature.properties.ID = parentRegNo;
            }
          }
          if (sFeature.properties['Название_улицы']) {
            sFeature.properties['ParentRegisterNo'] = parentRegNo;
          } else {
            sFeature.properties['этажность'] = sFeature.properties['этажность'] || 1;
            sFeature.properties['ParentRegisterNo'] = parentRegNo;
          }
          result[sFeature.properties.ID] = sFeature;
          const preResult = neareOfPolygonBuf(sFeature, sourceFeatures, result, distance, unit);
          // result = Object.assign(result, preResult);
        }
      }
    }
  });
  return result;
}

export function findBuildingsByPolygons (targetFeatures, sourceFeatures, distance = 1, unit = 'kilometers') {
  // быстрое решение, нет времени улучшать
  const sourceFeatureByID = {};
  const sourceFeaturesFirstPoints = [];
  console.log('Начинаем поиск прилегающих объектов к полигонам. Кол-во полигонов в которых ведется поиск (', sourceFeatures.length, '), кол-во целевых полигонов: ', targetFeatures.length);
  sourceFeatures.forEach((sFeature) => {
    sourceFeatureByID[sFeature.properties['ID']] = sFeature;
    const point = turf.point(sFeature.geometry.coordinates[0][0]);
    point.properties.ID = sFeature.properties['ID'];
    sourceFeaturesFirstPoints.push(point);
  });
  const source_points_fc = featurecollection(sourceFeaturesFirstPoints);
  const resultFeatures = [];
  let result = {};
  targetFeatures.forEach((tFeature, i) => {
    const buf = turf.buffer(tFeature, distance, unit);
    const bufFc = featurecollection([buf]);
    const extent = getFeatureExtent(bufFc);
    const bbox = turf.bboxPolygon(extent);
    const bboxFc = featurecollection([bbox]);
    const sourceFeaturesInExtentFc = turf.within(source_points_fc, bboxFc);
    const sourceFeaturesForFilter = sourceFeaturesInExtentFc.features.map((feature) => {
      return sourceFeatureByID[feature.properties.ID];
    });
    let parentRegNo = tFeature.properties['ParentRegisterNo'] || tFeature.properties['RegisterNo'];
    if (!parentRegNo) {
      parentRegNo = getObjId(tFeature);
      if (!tFeature.properties.ID) {
        tFeature.properties.ID = parentRegNo;
      }
    }
    tFeature.properties.ParentRegisterNo = parentRegNo;
    result[tFeature.properties.ID] = tFeature;
    const preResult = neareOfPolygonBuf(tFeature,
      sourceFeaturesForFilter,
      result,
      0.000001,
      unit = 'kilometers');
    result = preResult;

    progressConsole(i, 5,
      'Обработано целевых полигонов:');
  });
  Object.keys(result).forEach((featureId) => {
    resultFeatures.push(result[featureId]);
  });
  console.log('Найдено пристроев:', resultFeatures.length);
  return resultFeatures;
}
