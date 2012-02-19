# Package builder

## Synopsis

Ekam is yet another package builder for node, designed to handle file includes, regardless of the file format, although it is primarily aimed at building javascript, html and css files.

As of version 0.0.0, only javascript is supported, although html and css are planned and easy to add, as well as other formats.

## Download

It is published on node package manager (npm). To install, do:

    npm install ekam -g

## Usage

Ekam takes a json file containing information about what it has to do.

	ekam --build src/build.json

A sample build.json file can be produced with the option `init`

	ekam --init

``` javascript
{
	"input": {
		"include": "**/*.js"
	, "exclude": "*.json"
	}
,	"output": {
		"path": "../build"
	, "mode": "0755"
	, "clean": true
	}
,	"uglify": {
		"mangle": {
			"defines": {
				"DEBUG": [ "name", "false" ]
			}
		}
	,	"squeeze": {
			"make_seqs": true
		,	"dead_code": true
		}
	,	"gen": {
		}
	}
}
```

The following properties are required:

* `input.include`: list of expressions or files to be processed
* `input.exclude`: list of expressions or files to be excluded

The following properties are optional:

* `uglify`: contains the options object passed to the `uglify()` method

To run the tool with DEBUG information, set the DEBUG environment variable to a list of comma separated values:

* ekam
* build
* include
* file
* js-ast

## Example

Let's say we have to build a single javascript file split up in two files as well as its minified and debug versions. The example is provided in the examples/ directory.

The input files are defined under the src/ directory:

* src/file1.js
* src/file2.js

The output files are to be defined as (yes they are defined in the input directory!):

* src/file.js

``` javascript
//include("file1.js", "file2.js")
```

* src/file.debug.js

``` javascript
//var DEBUG=true
//include("file1.js", "file2.js")
```

The files file1.js and file2.js should contain a line like the following one to include some debug traces:

``` javascript
//if(DEBUG)
console.log('DEBUG', ...)
//endif
```

* src/file.min.js

``` javascript
//uglify("file.js")
```

When the `ekam` command is run with  it creates the following files. Note that the www/ directory is automatically created if it does not exist already.

* www/file.js - concatenation of file1.js and file2.js
* www/file.debug.js - same as file.js but with debug commands
* www/file.min.js - minified version of file.js
