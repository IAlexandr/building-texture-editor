import db from './../mongo/db';
import async from 'async';
import {getObjId} from './utils';

export function fcBuildingsToDb (fc, callback) {
  async.waterfall([
    (callback) => {
      async.eachLimit(fc.features, 1, (feature, done) => {
        //if (feature.properties['Название_улицы'] && feature.properties['Номер_дома']) {
        if (!feature.properties.ID || !feature.properties.ParentRegisterNo) {
          const objId = getObjId(feature);
          console.log(objId);
          return done();
        } else {
          db.Building
            .findOne({ 'properties.ID': feature.properties.ID, 'properties.RegisterNo': feature.properties.RegisterNo })
            .exec((err, doc) => {
              if (err) {
                return done(err);
              }
              if (!doc) {
                const document = new db.Building(feature);
                document.save((err) => {
                  return done(err);
                });
              } else {
                if (!doc.properties.edited && doc.properties['этажность'] !== feature.properties['этажность']) {
                  console.log('изменилось значение свойства "этажность"', doc.properties['этажность'], 'на', feature.properties['этажность']);
                  db.Building
                    .update({ _id: doc._id }, feature, (err) => {
                      return done(err);
                    });
                } else {
                  return done();
                }
              }
            });
        }

        // } else {
        //    let objId;
        //
        //    function getObjId (feature) {
        //      if (feature.properties.hasOwnProperty('"Object ID"')) {
        //        return objId = feature.properties['"Object ID"'];
        //      }
        //      if (feature.properties.hasOwnProperty('Object ID')) {
        //        return objId = feature.properties['Object ID'];
        //      }
        //      if (feature.properties.hasOwnProperty('OBJECTID')) {
        //        return objId = feature.properties['OBJECTID'];
        //      }
        //    }
        //
        //    console.log('У строения нет адреса OBJECTID:', getObjId(feature));
        //    return done();
        // }
      }, (err) => {
        return callback(err);
      });
    },
    (callback) => {
      db.Building
        .find({})
        .exec((err, docs) => {
          return callback(err, {
            type: 'FeatureCollection',
            features: docs
          });
        });
    }
  ], callback);
}

export function pointsToDb (fc, callback) {
  async.eachLimit(fc.features, 10, (feature, done) => {
    db.NezhilPomeshPoint
      .findOneAndUpdate({
        'properties.oks_ID': feature.properties.oks_ID,
        'properties.Дом_код': feature.properties['Дом_код']
      }, feature, { upsert: true }, (err) => {
        return done(err);
      });
  }, (err) => {
    if (err) {
      return callback(err);
    }
    db.NezhilPomeshPoint.find()
      .exec((err, docs) => {
        return callback(err, {
          type: 'FeatureCollection',
          features: docs
        });
      });
  });
}

export function addressesToDb (fc, callback) {
  async.waterfall([
    (callback) => {
      const addresses = {};
      fc.features.forEach((feature) => {
        const address = feature.properties['Название_улицы'] + ', ' + feature.properties['Номер_дома'];
        let RegisterNo = feature.properties.RegisterNo;
        let ID = feature.properties.ID;
        if (!feature.properties.RegisterNo) {
          RegisterNo = getObjId(feature);
          if (!feature.properties.ID) {
             ID = RegisterNo;
          }
        }
        addresses[address] = {
          RegisterNo: RegisterNo,
          ID: ID,
          address,
          state: 'необработаное',  // 'недостаточно фотографий', 'обработаное'
          comment: ''
        };
      });
      return callback(null, addresses);
    },
    (addresses, callback) => {
      async.eachLimit(Object.keys(addresses), 1, (addressKey, done) => {
        db.Address
          .findOne({ 'address': addressKey })
          .exec((err, doc) => {
            if (err) {
              return done(err);
            }
            if (!doc) {
              const document = new db.Address(addresses[addressKey]);
              document.save((err) => {
                return done(err);
              });
            } else {
              return done();
            }
          });
      }, (err) => {
        return callback(err);
      });
    },
    (callback) => {
      db.Address
        .find({})
        .exec((err, docs) => {
          return callback(err, docs);
        });
    }
  ], callback);
}
