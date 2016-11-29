var http = require('http');
var path = require('path');
var fs = require('fs');
var url = require('url');
var sharp = require('sharp');
var prefix = "../../media"; // Location of the image directory

http.createServer(function (req, res) {
	var accepts = (typeof req.headers.accept != "undefined") ? req.headers.accept.split(",") : [];
	var webp = (accepts.indexOf("image/webp") >= 0) ? true : false; // Check to see webp is supported by the client
	var parts = url.parse(req.url, true);
	var path = prefix + parts.pathname; // Full pathname of the image

	fs.readFile(path, function (err, data) {
		if (err) { // Image file not found
			res.statusCode = 404;
			res.end("404 not found");
			return false;
		}

		var image = sharp(data);
		// Get the URL query values for width and height
		var width = (typeof parts.query.width != 'undefined') ? parseInt(parts.query.width) : null;
		var height = (typeof parts.query.height != 'undefined') ? parseInt(parts.query.height) : null;

		// Make sure width and height are within range
		if (width < 1 || width > 16383) {
			width = null;
		}
		if (height < 1 || height > 16383) {
			height = null;
		}

		// Resize, sharpen and set quality
		image.resize(width, height).max();
		image.sharpen();
		image.quality(95);

		if (webp) { // Return webp file if supported by client
			image.webp();
			res.setHeader("Content-Type", "image/webp");
		} else { // or return jpeg
			image.jpeg();
			res.setHeader("Content-Type", "image/jpeg");
		}

		image.toBuffer(function (err, buffer, info) { // Buffer the image file ready to send
			if (err) {
				res.statusCode = 500;
				res.end("500 internal server error");
				return false;
			} else {
				image.pipe(res); // Pipe the image out
			}
		});
	});
}).listen(3000);