import {Router} from 'express';
import path from 'path';
import fs from 'fs';
import async from 'async';
import options from './../../../options';
import db from './../mongo/db';

const router = Router();

router.get('/', function (req, res) {
  db.Building.find({}, (err, docs) => {
    if (err) {
      return res.status(500).json({ errmessage: err.message });
    }
    return res.json(docs);
  });
});

router.get('/:RegisterNo', function (req, res) {
  db.Building.find({
    'properties.ParentRegisterNo': req.params.RegisterNo,
    'properties.Площадь': { '$gt': 15 }
  }, (err, docs) => {
    if (err) {
      return res.status(500).json({ errmessage: err.message });
    }
    return res.json(docs);
  });
});

router.put('/:RegisterNo/:ID', function (req, res) {
  if (!req.body) {
    return res.status(500).json(new Error('Нет данных для изменения!'));
  }
  const newBuilding = req.body;
  db.Building.findOneAndUpdate({
    'properties.ParentRegisterNo': req.params.RegisterNo,
    'properties.ID': req.params.ID
  }, newBuilding, { upsert: true, new: true }, (err, doc) => {
    if (err) {
      return res.status(500).json({ errmessage: err.message });
    }
    return res.json(doc);
  });
});

router.get('/:RegisterNo/:ID/:wallId', function (req, res) {
  const { RegisterNo, ID, wallId } = req.params;
  let filePath = path.resolve(options.sourceDirPath, RegisterNo + '_' + ID + '_' + wallId + '.png');
  try {
    fs.statSync(filePath);
  } catch (err) {
    filePath = path.resolve(options.sourceDirPath, 'default.png');
  }
  const rs = fs.ReadStream(filePath);
  rs.pipe(res);
});

router.post('/:RegisterNo', function (req, res) {
  const wallsTextures = req.body;
  async.eachLimit(wallsTextures, 1, (texture, done) => {
    const { registerNo, ID, wallId, image } = texture;
    let filePath = path.resolve(options.sourceDirPath, registerNo + '_' + ID + '_' + wallId + '.png');
    try {
      const st = fs.statSync(filePath);
      fs.unlinkSync(filePath);
    } catch (err) {
      if (err.code === 'ENOENT') {
        console.log();
      }
    }
    const base64Data = image.replace(/^data:image\/png;base64,/, "");
    fs.writeFile(filePath, base64Data, 'base64', function (err) {
      return done(err);
    });
  }, (err) => {
    if (err) {
      return res.status(500).json({ errmessage: err.message });
    }
    return res.send();
  });
});

export default {
  route: 'buildings',
  router
};
