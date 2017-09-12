var http = require('http');
var path = require('path');
var fs = require('fs');
var url = require('url');
var sharp = require('sharp');
var prefix = "../../media";
var mainCache = "/media/images";

http.createServer(function (req, res) {
	var accepts = (typeof req.headers.accept != "undefined") ? req.headers.accept.split(",") : [];
	var webp = (accepts.indexOf("image/webp") >= 0) ? true : false;
	var parts = url.parse(req.url, true);

	var width = (typeof parts.query.width != 'undefined') ? parseInt(parts.query.width) : null;
	if (width < 1 || width > 16383) {
		width = null;
	}

	var height = (typeof parts.query.height != 'undefined') ? parseInt(parts.query.height) : null;
	if (height < 1 || height > 16383) {
		height = null;
	}

	var type = (typeof parts.query.type != 'undefined') ? parts.query.type : false;

	var file1 = mainCache + parts.pathname;
	file1 += (width) ? '.w' + width : '';
	file1 += (height) ? '.h' + height : '';
	if (type == 'png') {
		file1 += '.' + type;
	} else if (webp) {
		file1 += '.webp';
	}

	var file2 = mainCache + parts.pathname;
	var file3 = prefix + parts.pathname;

	console.log(file1);
	console.log(file2);
	console.log(file3);

	[file1, file2].forEach(function (file) {
		var path = file.split('/');
		path.pop();
		path = path.join('/');
		if (!fs.existsSync(path)) {
			fs.mkdirSync(path);
		}
	});

	if (fs.existsSync(file1)) {
		serveStatic(file1);
	} else if (fs.existsSync(file2)) {
		processImage(file2);
	} else if (fs.existsSync(file3)) {
		processImage(file3, true);
	} else {
		res.statusCode = 404;
		res.end("404 not found");
	}

	function serveStatic(path) {
		if (type == 'png') {
			res.setHeader("Content-Type", "image/png");
		} else if (webp) {
			res.setHeader("Content-Type", "image/webp");
		} else {
			res.setHeader("Content-Type", "image/jpeg");
		}
		fs.createReadStream(path).pipe(res);
	}

	function processImage(path, cache) {
		fs.readFile(path, function (err, data) {
			if (err) {
				res.statusCode = 404;
				res.end("404 not found");
				return;
			}

			var image = sharp(data);
			image.resize(width, height).max();
			image.sharpen();
			image.normalise();
			image.quality(96);
			if (type == 'png') {
				image.png({adaptiveFiltering: false});
				res.setHeader("Content-Type", "image/png");
			} else if (webp) {
				image.webp();
				res.setHeader("Content-Type", "image/webp");
			} else {
				image.background({r: 255, g: 255, b: 255, alpha: 1}).flatten().jpeg();
				res.setHeader("Content-Type", "image/jpeg");
			}

			image.pipe(fs.createWriteStream(file1));
			image.pipe(res);

			if (cache) {
				fs.createReadStream(path).pipe(fs.createWriteStream(file2));
			}
		});
	}
}).listen(3000);