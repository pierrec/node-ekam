var resolve = require('path').resolve

var async = require('async')
var debug = require('debug')('js-parser')
var fileset = require('fileset')
var ast = require('./js-ast')

var list = []

atok
	.setDefaultHandler(handler)
	// Potential command found
	.next('cmd')
		.addRule('', '//', 'checkCmd')
	.next()
		.addRule('', 'end')
	.saveRuleSet('checkCmd')

	.clearRule()
	.setDefaultHandler(handler)
	// Process the commands
	.next('checkCmd')
		.addRule('var ', '\n', 'vars')
	.next('include').ignore(true)
		.addRule('include', 'include')
	.next('skip').ignore()
		.addRule('if(', ')', 'ifStart')
		.addRule('endif', 'ifEnd')
	.next('uglify').ignore(true)
		.addRule('uglify', 'uglify')
	// It was a comment...
	.next('skip').ignore()
		.trim(false)
			.next('checkCmd')
				.addRule('', '\n', 'comment')
		.trim(true)
	.saveRuleSet('cmd')

	.clearRule()
	.setDefaultHandler(handler)
	// Skip spaces after a command
	.ignore(true)
		.addRule([' ','\t'], 'skip')
		// A newline indicates the end of the command(s)
		.next('checkCmd')
			.addRule(['\n','\r\n'], 'endSkip')
	.ignore()
	// Process same inlined command
	.next('cmd')
		.addRule('//', 'checkCmd')
	.saveRuleSet('skip')

	.clearRule()
	.next('skip')
		.stringList(function (list) {
			processFileList(list, 'include')
		})
	.saveRuleSet('include')

	.clearRule()
	.next('skip')
		.stringList(function (list) {
			processFileList(list, 'uglify')
		})
	.saveRuleSet('uglify')

	.on('end', function (token, idx, rule) {
		if (token) data.push( rule === 'cmd' ? '//' + token : token)
		self.emit('end')
	})

atok.loadRuleSet('checkCmd')

var data = scope.data
var path = scope.path
var deps = scope.deps
this.stack = []
var stack = this.stack

function handler (token, idx, type) {
	debug('type='+type, 'token='+token)
	switch (type) {
		case 'checkCmd':
		case 'end':
			if (token.length > 0) data.push(token)
		break
		case 'comment':
			data.push('//' + token)
		break
		case 'vars':
			data.push( new ast.Var(token) )
		break
		case 'ifStart': // New branch starts
			stack.push(data)
			data.push( new ast.If(token) )
			data = data[ data.length-1 ].data
		break
		case 'ifEnd': // Current branch ends
			if (stack.length > 0) {
				data = stack.pop()
			} else {
				console.error('Error: endif without if()')
			}
		break
		// case 'uglify':
		// 	var file = resolve(path, token)
		// 	data.push( new ast.Uglify(file, options.uglify) )
		// break
		default:
			throw new Error('Unknown type: ' + type)
	}
}

function processFileList (list, type) {
	// We need to process the list of files which might be regexp
	// Pause the stream until we have figured out all files
	atok.pause()

	async.forEach(
		list
	, function (item, cb) {
			fileset(
				resolve(path, item)
			, function (err, expandedList) {
					if (err) return cb(err)

					expandedList.forEach(function (item) {
						var file = resolve(item)

						switch (type) {
							case 'include':
								if ( deps.indexOf(file) < 0 ) deps.push(file)
								data.push(
									'// include("' + item + '")\n'
								, new ast.Include(file)
								)
							break
							case 'uglify':
								data.push(
									new ast.Uglify(file, options.uglify)
								)
							break
							default:
								throw new Error('Unknown command type: ' + type)
						}
					})
					cb()
				}
			)
		}
	, function (err) {
			if (err) return atok.emit('error', err)
			// Now, resume the stream
			atok.resume()
		}
	)
}