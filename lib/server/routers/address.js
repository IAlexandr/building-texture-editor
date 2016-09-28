import {Router} from 'express';
import db from './../nedb';

const router = Router();

router.get('/', function (req, res) {
  db.Address.find({}, (err, docs) => {
    if (err) {
      return res.status(500).json(err);
    }
    return res.json(docs);
  });
});
router.put('/', function (req, res) {
  const addressDoc = req.body;
  if (addressDoc.hasOwnProperty('_id')) {
    db.Address.update({ _id: addressDoc._id }, addressDoc, {}, (err, numReplaced) => {
      if (err) {
        return res.status(500).json(err);
      }
      if (numReplaced === 0) {
        return res.status(500).json({errmessage: 'неудалось обновить сведения по адресу. numReplaced: 0'});
      }
      return res.json(addressDoc);
    });
  } else {
    return res.status(500).json({errmessage: 'неверный формат документа'});
  }
});

export default {
  route: 'address',
  router
};
