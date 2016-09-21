const version = require('./package.json').version;
const optionsSpec = {
  sourceDirPath: {
    required: true,
    default: 'data/',
    env: 'BTE_SOURCE_DIR_PATH'
  },
  dbType: {
    required: true,
    default: 'nedb', // nedb, mongodb
    env: 'BTE_DB_TYPE'
  },
  PORT: {
    required: true,
    default: '3001',
    env: 'BTE_PORT'
  }
};

let options = {
  version
};

export default {...options, ...Object.keys(optionsSpec).map((key) => {
  if (!optionsSpec[key].preprocess) {
    optionsSpec[key].preprocess = function preprocess (str) {
      return str;
    };
  }
  const opt = { name: key };
  if (process.env[optionsSpec[key].env]) {
    opt.value = optionsSpec[key].preprocess(process.env[optionsSpec[key].env]);
  } else if (optionsSpec[key].default) {
    opt.value = optionsSpec[key].preprocess(optionsSpec[key].default);
  } else if (optionsSpec[key].required) {
    throw new Error('!!! REQUIRED OPTION NOT SET: ' + key);
  }
  return opt;
}).reduce((prev, cur) => {
  prev[cur.name] = cur.value;
  return prev;
}, {})};
