import Datastore from 'nedb';
const db = {};

const dbCollection = ['Address', 'Building', 'Point'];

dbCollection.forEach((colName) => {
  db[colName] = new Datastore('nedb/' + colName + '.db');
  db[colName].loadDatabase();
  db[colName].persistence.setAutocompactionInterval(1000 * 60* 20);
});

export default db;
