import db from './../nedb';
import async from 'async';

export function fcBuildingsToNedb (fc, callback) {
  async.waterfall([
    (callback) => {
      async.eachLimit(fc.features, 10, (feature, done) => {
        if (feature.properties['Название_улицы'] && feature.properties['Номер_дома']) {
          db.Building
            .findOne({ 'properties.ID': feature.properties.ID, 'properties.RegisterNo': feature.properties.RegisterNo })
            .exec((err, doc) => {
              if (err) {
                return done(err);
              }
              if (!doc) {
                db.Building
                  .insert(feature, (err) => {
                    return done(err);
                  });
              } else {
                if (doc.properties['этажность'] !== feature.properties['этажность']) {
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
        } else {
          let objId;
           function getObjId (feature) {
             if (feature.properties.hasOwnProperty('"Object ID"')) {
               return objId = feature.properties['"Object ID"'];
             }
             if (feature.properties.hasOwnProperty('Object ID')) {
               return objId = feature.properties['Object ID'];
             }
             if (feature.properties.hasOwnProperty('OBJECTID')) {
               return objId = feature.properties['OBJECTID'];
             }
          }
          console.log('У строения нет адреса OBJECTID:', getObjId(feature));
          return done();
        }
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

export function pointsToNedb (fc, callback) {
  async.eachLimit(fc.features, 10, (feature, done) => {
    db.Point
      .findOne({
        'properties.oks_ID': feature.properties.oks_ID,
        'properties.Дом_код': feature.properties['Дом_код']
      })
      .exec((err, doc) => {
        if (err) {
          return done(err);
        }
        if (!doc) {
          db.Point
            .insert(feature, (err) => {
              return done(err);
            });
        } else {
          return done();
        }
      });
  }, (err) => {
    if (err) {
      return callback(err);
    }
    db.Point.find()
      .exec((err, docs) => {
        return callback(err, {
          type: 'FeatureCollection',
          features: docs
        });
      });
  });
}

export function addressesToNedb (fc, callback) {
  async.waterfall([
    (callback) => {
      const addresses = {};
      fc.features.forEach((feature) => {
        const address = feature.properties['Название_улицы'] + ', ' + feature.properties['Номер_дома'];
        addresses[address] = {
          RegisterNo: feature.properties.RegisterNo,
          ID: feature.properties.ID,
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
              db.Address
                .insert(addresses[addressKey], (err) => {
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
