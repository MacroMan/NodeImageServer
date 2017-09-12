## Synopsis

A lightning fast image processing server with on-the-fly resizing and automatic webp support

## Usage

Update the variable `prefix` in `main.js` to point to the directory containing your images

Update the variable `mainCache` in `main.js` to point to the cache directory, which is recommended to be an ephemeral ramdisk drive for maximum efficiency.

By default, a basic http server is run on port 3000. It is recommended to run a reverse proxy, such as Nginx to serve the content.

If this is the only server running, then you can change the `port` in the `listen(3000)` function at the end of `main.js` to `80` and it will function as a basic webserver on it's own.

## Motivation

Images today need to be available in any size, fast, and in the best possible file format for the client.

This node server provides a basic image server, utilising `sharp` for fast image resizing and format conversion.

## PREREQUISITES

C++11 compatible compiler such as gcc 4.8+, clang 3.0+ or MSVC 2013+

## DEPENDENCIES

node-gyp & sharp

Both of which are in the package.json and can be installed by running `npm install`

## License

BSD-2-Clause

See LICENSE