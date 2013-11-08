
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
  Superlevel.prototype.createReadStream = function() {
    return db.createReadStream.apply(db,arguments);
  };
  Superlevel.prototype.createKeyStream = function(options) {
    return db.createKeyStream.apply(db,arguments);
  };
  Superlevel.prototype.createValueStream = function(options) {
    return db.createValueStream.apply(db,arguments);
  };
  Superlevel.prototype.get = function(key,options,cb) {
    return db.get.apply(db,arguments);
  };
  if (!options || !options.readonly) {
    Superlevel.prototype.createWriteStream = function(options) {
      return db.createWriteStream.apply(db,arguments);
    };
    Superlevel.prototype.put = function(key,value,options,cb) {
      return db.put.apply(db,arguments);
    };
    Superlevel.prototype.del = function(key,options,cb) {
      return db.del.apply(db,arguments);
    };
    Superlevel.prototype.batch = function() {
      return db.batch.apply(db,arguments);
    };
  }
  db.superlevel= new Superlevel();
  return db;
};
