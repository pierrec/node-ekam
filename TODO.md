# TODO

* Provide file streams hooks: currently, files are directly streamed to the filesystem, allow custom stream processing before writing to the fs. This would allow template processing for instance.
* Better error reporting


## Features

* New commands
	* CSS
		* //minify
		* //render(stylus/less/...)
	* HTML
		* //minify
		* //render(jade/...)
* --watch option


## Bugs

* //var x=1 //if(y): fails as y is undefined
	-> proper //var parsing: extract single variables?