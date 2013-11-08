# superlevel [![Build Status](https://secure.travis-ci.org/randymized/level-superlevel.png?branch=master)](http://travis-ci.org/randymized/level-superlevel)

> Sublevel partitions the database.  Superlevel adds a super level to the root partition that allows accessing the entire database. This allows things like discovering sublevels and browsing the database content without knowledge of the sublevel structure.

## Getting Started
Install the module with: `npm install level-superlevel`

```javascript
var assert= require('assert')
var Superlevel= require('level-superlevel');
var Sublevel= require('level-sublevel');
var db= Sublevel(Superlevel(levelup('testdb'),{writable:true} ));
var sub1= db.sublevel('alphabet')
sub1.put('a','apple',function(err) {
  assert.ifError(err)
  db.superlevel.get('\xffalphabet\xffa',function(err,data){
    assert.ifError(err)
    console.log(data)
  })
})
```

## Documentation
Superlevel adds a superlevel property to a levelDB object.  The superlevel
function adds a `superlevel` object to the database object.  The superlevel object includes a get method and methods to create read, key and value streams.  The get method can get any object in the database, unrestrained by sublevel's partitioning.  Likewise the steam methods can access any object in the database.

By default, the super level is read only.  If the writable option is true, put, del, batch and createWriteStream methods will also be added.

The superlevel function must be called with the database object before sublevel's initialization function or that of other libraries, such as subindex, that invoke sublevel.  Superlevel is added to the original database object but not to the sublevels.

The purpose of superlevel is not to break sublevel's partitioning, but to allow it to be opened up when needed for purposes like browsing or backup where the sublevel structure may not be known.

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com/).

## Release History
0.1.0: Newly released

## License
Copyright (c) 2013 Randy McLaughlin
Licensed under the MIT license.
