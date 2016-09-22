import turf from 'turf';
import featurecollection from 'turf-featurecollection';
import {coordEach} from 'turf-meta';
import {progressConsole} from './utils';

export function getFeaturesByPointsInsidePolygons (fcPoints, fcPolygons) {
  const resultFeatures = [];
  console.log('Поиск точек в полигоне:');
  fcPoints.features.forEach((feature, pointIndex) => {
    let isPointIn = false;
    for (let i = 0; i < fcPolygons.features.length; i++) {
      if (turf.inside(feature, fcPolygons.features[i])) {
        resultFeatures.push(fcPolygons.features[i]);
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
