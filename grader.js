#!/usr/bin/env node

var fs=require('fs');
var program=require('commander');
var util=require('util');
var cheerio=require('cheerio');
var rest=require('restler');
var HTMLFILE_DEFAULT="index.html";
var CHECKSFILE_DEFAULT="checks.json";
var URL_DEFAULT="http://junk.com";
var hresult;

var assertFileExists=function(infile) {
    var instr=infile.toString();
    if(!fs.existsSync(instr)) {
       console.log("%s does not exist. Exiting.", instr);
       process.exit(1);
     }
     return instr;
};

var assertURLExists=function(addy) {
    var instr=addy.toString();
//    if(!fs.existsSync(instr)) {
//       console.log("%s does not exist. Exiting.", instr);
//       process.exit(1);
//     }
     return instr;
};

var cheerioHtmlFile = function(htmlfile) {
   return cheerio.load(fs.readFileSync(htmlfile));
};

var cheerioURL = function(urladd,checksfile) {
   rest.get(urladd).on('complete',buildfn(checksfile));
};

var buildfn= function(checksfile) {
  var checks = loadChecks(checksfile).sort();
  var response2console = function(result, response) {
    //run after callback
    var out = {};
    if (result instanceof Error) {
	console.error('Error: ' + util.format(response.message));
    } else {
      $ = cheerio.load(result);
      for(var ii in checks) {
	var present = $(checks[ii]).length > 0;
	out[checks[ii]] = present;
      }
      var outJson= JSON.stringify(out, null, 4);
      console.log(outJson);

     }
   };
  return response2console;
};

var loadChecks = function(checksfile) {
  return JSON.parse(fs.readFileSync(checksfile));
};

var  checkHtmlFile = function(htmlfile, checksfile) {

  $ = cheerioHtmlFile(htmlfile);
  var checks = loadChecks(checksfile).sort();
  var out = {};
  for(var ii in checks) {
    var present = $(checks[ii]).length > 0;
    out[checks[ii]] = present;
  }
  return out;
};

var clone=function(fn) {
  return fn.bind({});
};

if(require.main==module) {
   program
     .option('-c, --checks <check_file>', 'Path to checks.json', clone(assertFileExists), CHECKSFILE_DEFAULT)
     .option('-f, --file <html_file>', 'Path to index.html', clone(assertFileExists), HTMLFILE_DEFAULT)
     .option('-u, --url <url_address>', 'Path to url', clone(assertURLExists), URL_DEFAULT)
     .parse(process.argv);
    if (program.url === null) {
     $ = cheerioHtmlFile(htmlfile);
     var checkJson = checkHtmlFile(program.file, program.checks);
     var outJson= JSON.stringify(checkJson, null, 4);
     console.log(outJson);
    }
    else
    {
   //  console.log("url is %s\n",urladd);
     $ = cheerioURL(program.url,program.checks);
    }
} else {
    exports.checkHtmlFile=checkHtmlFile;
}
