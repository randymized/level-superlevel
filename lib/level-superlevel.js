
/*
 * level-superlevel
 * https://github.com/randymized/level-superlevel
 *
 * Copyright (c) 2013 Randy McLaughlin
 * Licensed under the MIT license.
 */

'use strict';

var crypto= require('crypto');
var superlevel;

module.exports = superlevel = function(db,options) {
  function Superlevel() {}
  Superlevel.prototype.createReadStream = function(options) {
    return db.createReadStream(options);
  };
  Superlevel.prototype.createKeyStream = function(options) {
    return db.createKeyStream(options);
  };
  Superlevel.prototype.createValueStream = function(options) {
    return db.createValueStream(options);
  };
  Superlevel.prototype.get = function(key,options,cb) {
    return db.get(key,options,cb);
  };
  if (options && options.writable) {
    Superlevel.prototype.createWriteStream = function(options) {
      return db.createWriteStream(options);
    };
    Superlevel.prototype.put = function(key,value,options,cb) {
      return db.put(key,value,options,cb);
    };
    Superlevel.prototype.del = function(key,options,cb) {
      return db.del(key,options,cb);
    };
    Superlevel.prototype.batch = function(array,options,cb) {
      return db.batch(array,options,cb);
    };
  }
  db.superlevel= new Superlevel();
  return db;
};
