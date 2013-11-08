
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
  var proto= db.__proto__;
  proto.createSuperReadStream = function(options) {
    return db.createReadStream(options);
  };
  proto.createSuperKeyStream = function(options) {
    return db.createKeyStream(options);
  };
  proto.createSuperValueStream = function(options) {
    return db.createValueStream(options);
  };
  proto.superGet = function(key,options,cb) {
    return db.get(key,options,cb);
  };
  if (!options || !options.readonly) {
    proto.createSuperWriteStream = function(options) {
      return db.createWriteStream(options);
    };
    proto.superPut = function(key,value,options,cb) {
      return db.put(key,value,options,cb);
    };
    proto.superDel = function(key,options,cb) {
      return db.del(key,options,cb);
    };
    proto.superBatch = function() {
      return db.batch.apply(db,arguments);
    };
  }
  return db;
};
