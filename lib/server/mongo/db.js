import mngs from 'mongoose';
import options from '../../../options';
import address from './models/address';
import building from './models/building';
import nezhil_pomesh_point from './models/nezhil_pomesh_point';

export const mongoose = mngs;
export const Address = address;
export const Building = building;
export const NezhilPomeshPoint = nezhil_pomesh_point;

const conChecker = {
  checkTO: null,
  to: null,
  setProcExitTO: function() {
    var _this = this;
    _this.clearTO();
    _this.to = setTimeout(function() {
      console.error('process.exit(1)');
      process.exit(1);
    }, 60 * 1000);
    debug('setProcExitTO');
  },
  clearTO: function() {
    clearTimeout(this.to);
    debug('clearTO');
  },
  check: function() {
    var _this = this;
    _this.checkTO = setTimeout(function() {
      console.log('checkTO mongoose.connection.readyState:', mongoose.connection.readyState);
      if (mongoose.connection.readyState === 0) {
        _this.setProcExitTO();
        _this.conOpen();
      } else {
        _this.clearTO();
      }
      _this.check();
    }, 10 * 1000);
  }
};

mongoose.connection.on('connected', function() {
  console.log('Mongoose default connection open to ' + options.mongoDbUrl);
  conChecker.clearTO();
});

// // If the connection throws an error
mongoose.connection.on('error', function(err) {
  console.error('Mongoose default connection error: ' + err);
  // conChecker.setProcExitTO();
});

// // When the connection is disconnected
mongoose.connection.on('disconnected', function() {
  console.error('Mongoose default connection disconnected');
  conChecker.setProcExitTO();
});
