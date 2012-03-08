echo('Building...')

mkdir('output')
cd('output')
echo(
	'//var DEBUG=1\n'
).to('in.js')
echo([
	'//include("in.js")'
,	'//if(DEBUG)console.log("debug")//endif'
,	'//if(!DEBUG)console.log("no debug")//endif'
].join('\n')
).to('out.js')

build({input: {include: 'output/*'}, output: {path: '.'}})
