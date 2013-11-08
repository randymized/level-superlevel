
/*
 * level-superlevel
 * https://github.com/randymized/node-level-superlevel
 *
 * Copyright (c) 2013 Randy McLaughlin
 * Licensed under the MIT license.
 */

'use strict';

var crypto= require('crypto');
var superlevel;

module.exports = superlevel = function(db,options) {
  var proto= db.__proto__;
  if (options && options.hash_everything) {
    var prefix = '\xff|hexindex|\xff';
    if (options.hash_everything.prefix && (toString.call(options.hash_everything['prefix']) == '[object String]')) {
      prefix= options.hash_everything
    }
    hash_index_key= function(key) {
      return prefix + crypto.createHash('md5').update(key).digest("hex");
    };
    db.on('put', function(key) {
      return db.put(hash_index_key(key), key);
    });
    db.on('del', function(key) {
      return db.del(hash_index_key(key));
    });
    proto.get_from_hash_index = function(hash, options, cb) {
      var callback;
      if (typeof options === 'function') {
        callback = options;
        options = {};
      }
      return db.get(hash_index_key(hash), function(err, data) {
        if (err) return cb(err);
        return db.get(data, options, cb);
      });
    };
    proto.hashize = function(key) {
      return hash_index_key(key);
    };
  }
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
