#!/usr/bin/env node

var fs = require("fs");
var SourceMapConsumer = require("source-map").SourceMapConsumer;
var convert = require("convert-source-map");
require("colors");

var argv = require('minimist')(process.argv.slice(2), {
    default: {
        padding: 10
    },
    alias: {
        p: "padding",
        h: "help"
    },
    boolean: "help"
});

if (argv.help) {
    process.stdout.write(fs.readFileSync(__dirname + "/README.md"));
    process.exit(0);
}

var line = 0;
var column = 0;

// remove file:// prefix if any
var file = argv._[0].replace(/^file\:\/\//, "");

var match;
if (match = file.match(/^(.*?)(\:[0-9]+)(\:[0-9]+|$)/)) {
    file = match[1];
    line = parseInt(match[2].slice(1), 10);
    if (match[3]) column = parseInt(match[3].slice(1), 10);
}

var source = fs.readFileSync(file).toString();

var converter = convert.fromSource(source);

if (!converter.sourcemap) {
    console.error("Cannot find source map from", file);
    process.exit(1);
}

var smc = new SourceMapConsumer(converter.sourcemap);

var origpos = smc.originalPositionFor({ line: line, column: column });


var preview = fs.readFileSync(origpos.source)
    .toString()
    .split("\n")
    .map(function(line, i) {
        var linenum = i + 1;
        var out = linenum + ": " + line;
        if (linenum == origpos.line) out = out.red;
        return out;
    })
    .slice(origpos.line - argv.padding, origpos.line + argv.padding)
    .join("\n")
    ;

console.log(preview);
console.log();
console.log("file", origpos.source);
console.log("line:", origpos.line, "column:", origpos.column);
