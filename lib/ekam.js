var fs = require('fs')
var path = require('path')
var isArray = require('util').isArray

var async = require('async')
var fileset = require('fileset')
var fstream = require('fstream')
var debug = require('debug')('build')

var Include = require('./include')

module.exports = Builder

function Builder (configData, configPath, callback) {
	// Allow multiple builds in one config
	isArray(configData)
		? async.forEach(
				configData
			, function (configData, cb) {
				builder(configData, configPath, cb)
			}
			, callback
			)
		: builder(configData, configPath, callback)
}

function error (err) {
	throw err
}

function builder (config, configPath, callback) {
	var inc = new Include(config)
	inc
		.on('drain', function () {
			// All files and their dependencies loaded, root files (files with no parent file) built
			inc.build(function () {

				var input = path.resolve( configPath, config.input.path )
				var output = path.resolve( configPath, config.output.path )
				debug('Include DONE: %d roots found output=%s', inc.roots.length, output)
				async.forEach(
					inc.roots
				, function (file, cb) {
						var relfile = path.relative(configPath, file.id)
						debug('Include WRITING: file=%s', relfile)
						var w = fstream
							.Writer({
								path: path.join( output, relfile )
							, mode: config.output.mode
							})
							w
							.on('error', error)
							.on('close', cb)

							if (file.content)
								w.end(file.content)
							else
								fs.createReadStream(file.id).pipe(w)
				  }
				, function (err) {
					if (err) return callback(err)
					debug('%d files written out to %s', inc.roots.length, output)
					callback()
				})
			})
		})
		.on('error', error)

	debug( path.resolve( configPath, config.input.include || '*.js' ) )
	fileset(
		path.resolve( configPath, config.input.include || '*.js' )
	, path.resolve( configPath, config.input.exclude || '' )
	, function (err, files) {
			if (err) return error(err)

			debug('files', files)
			files
				.forEach(function (file) {
					inc.add( file )
				})
		}
	)
}