'use strict';

require('should')
var assert= require('assert')
var levelup = require('levelup')
var memdown = require('memdown')
var Sublevel= require('level-sublevel');
var Superlevel = require( '../lib/level-superlevel.js' );

function populateDB(options,done)
{
  var db= Sublevel(Superlevel(levelup('testdb',{db: memdown}),
    {readonly: options.readonly}
  ));
  db.put('base','ball',function(err) {
    assert.ifError(err)
    var sub1= db.sublevel('alphabet')
    sub1.batch([
      {type: 'put', key:'a',value:'apple'},
      {type: 'put', key:'b',value:'binary'},
      {type: 'put', key:'c',value:'cookie'}
    ],function (err){
        assert.ifError(err)
        done(sub1,db)
      }
    )
  });
}
function sample1(done)
{
  populateDB({},done)
}
function readonly_sample(done)
{
  populateDB({readonly:true},done)
}

function readStream(stream,cb)
{
  var results= []
  stream
  .on('data', function(data) {
    results.push(data)
  })
  .on('end',function (err) {
    assert.ifError(err)
    cb(results.join('-'))
  })
}

describe( 'level-superlevel', function() {
  it( 'should be a function', function() {
    Superlevel.should.be.a( 'function' );
  } );
  it( 'should allow sublevel to isolate the root database', function(done) {
    sample1(function(sub,db) {
      readStream(db.createKeyStream(),function(results){
        results.should.equal('base')
        done()
      })
    })
  } );
  it( 'should allow sublevel to isolate the sub level', function(done) {
    sample1(function(sub,db) {
      readStream(sub.createKeyStream(),function(results){
        results.should.equal('a-b-c')
        done()
      })
    })
  } );
  it( 'should allow access to all the keys from the super level', function(done) {
    sample1(function(sub,db) {
      readStream(db.createSuperKeyStream(),function(results){
        results.should.equal('base-\xffalphabet\xffa-\xffalphabet\xffb-\xffalphabet\xffc')
        done()
      })
    })
  } );
  it( 'should allow access to all the values from the super level', function(done) {
    sample1(function(sub,db) {
      readStream(db.createSuperValueStream(),function(results){
        results.should.equal('ball-apple-binary-cookie')
        done()
      })
    })
  } );
  it( 'should allow access to all the data from the super level', function(done) {
    sample1(function(sub,db) {
      var results= []
      db.createSuperReadStream()
      .on('data', function(data) {
        results.push(data.key+':'+data.value)
      })
      .on('end',function (err) {
        assert.ifError(err)
        results.join('-').should.equal('base:ball-\xffalphabet\xffa:apple-\xffalphabet\xffb:binary-\xffalphabet\xffc:cookie')
        done()
      })
    })
  } );
  it( 'should support get at the super level: getting data out of a sublevel', function(done) {
    sample1(function(sub,db) {
      db.superGet('\xffalphabet\xffb',function(err,data){
        assert.ifError(err)
        data.should.equal('binary')
        done()
      })
    })
  } );
  it( 'should support put at the super level: putting data into a sublevel', function(done) {
    sample1(function(sub,db) {
      db.superPut('\xffalphabet\xffd','dinosaur',function(err){
        sub.get('d',function(err,data){
          assert.ifError(err)
          data.should.equal('dinosaur')
          done()
        })
      })
    })
  } );
  it( 'should support delete at the super level: deleting data from a sublevel', function(done) {
    sample1(function(sub,db) {
      sub.get('b',function(err,data){
        assert.ifError(err)
        data.should.equal('binary')
        db.superDel('\xffalphabet\xffb',function(err){
          sub.get('b',function(err,data){
            assert(err)
            done()
          })
        })
      })
    })
  } );
  it( 'should support batch at the super level', function(done) {
    sample1(function(sub,db) {
      db.superBatch([
        {type: 'del', key:'\xffalphabet\xffb'},
        {type: 'put', key:'\xffalphabet\xffd',value:'donut'},
        {type: 'put', key:'\xffalphabet\xffe',value:'elf'},
        {type: 'put', key:'\xffalphabet\xfff',value:'foot'}
      ],function (err){
        sub.get('b',function(err,data){
          assert(err)
          sub.get('d',function(err,data){
            assert.ifError(err)
            data.should.equal('donut')
            sub.get('f',function(err,data){
              assert.ifError(err)
              data.should.equal('foot')
              done()
            })
          })
        })
      })
    })
  } );
  it( 'should support a write stream at the super level', function(done) {
    sample1(function(sub,db) {
      var ws=db.createSuperWriteStream()
      ws.on('error',function(err){
        assert.ifError(err)
        done()
      })
      ws.write({key:'\xffalphabet\xffg',value:'ghost'})
      ws.write({key:'\xffalphabet\xffh',value:'help'})
      ws.write({key:'\xffalphabet\xffi',value:'iguana'})
      ws.end()
      ws.on('close',function (err){
        sub.get('g',function(err,data){
          assert.ifError(err)
          data.should.equal('ghost')
          sub.get('i',function(err,data){
            assert.ifError(err)
            data.should.equal('iguana')
            done()
          })
        })
      })
    })
  } );
  it( 'should not allow super put if the readonly option is specified', function(done) {
    readonly_sample(function(sub,db) {
      db.superPut('\xffalphabet\xffd','dinosaur',function(err){
        sub.get('d',function(err,data){
          assert(err)
          done()
        })
      })
    })
  } );

} );
