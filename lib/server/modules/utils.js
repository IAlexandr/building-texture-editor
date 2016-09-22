import fs from 'fs';

function writeToFile ({ data, filePath }, callback) {
  fs.writeFile(filePath, data, (err) => {
    console.log('(writeToFile) done.');
    return callback(err);
  });
}
export function rewriteToFile ({ data, filePath }, callback) {
  console.log('rewriteToFile', filePath);
  try {
    if (fs.statSync(filePath)) {
      fs.unlink(filePath, (err) => {
        if (err) {
          return callback(err);
        }
        writeToFile({filePath, data}, callback);
      });
      return callback(new Error('Файл по пути: ' + filePath + ' уже существует.'));
    }
  } catch (e) {
    writeToFile({filePath, data}, callback);
  }
}
export function splitArray (input, spacing) {
  var output = [];
  for (var i = 0; i < input.length; i += spacing)
    output[output.length] = input.slice(i, i + spacing);
  return output;
}

export function progressConsole (i, number, message) {
  if (i % number === 0) {
    console.log(message, i);
  }
}
