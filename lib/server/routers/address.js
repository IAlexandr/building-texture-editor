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

export default {
  route: 'address',
  router
};
