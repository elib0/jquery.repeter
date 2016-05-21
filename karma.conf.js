module.exports = function( config ) {

	config.set( {
		files: [
			"bower_components/jquery/dist/jquery.js",
			"dist/jquery.repeter.min.js",
			"test/setup.js",
			"test/spec/*"
		],
		frameworks: [ "qunit" ],
		autoWatch: true
	} );
};
