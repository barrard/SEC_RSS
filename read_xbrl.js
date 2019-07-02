var ParseXbrl = require("parse-xbrl");
var fs = require("fs-extra");
var xmlParser = require("xml2json");
let rp = require("request-promise");
let Parser = require("rss-parser");
let parser = new Parser();
require("./logger.js");
let Listing_model = require("./models/filing_model.js");

// urls = [
//   "https://www.sec.gov/Archives/edgar/usgaap.rss.xml",
//   "https://www.sec.gov/Archives/edgar/xbrl-rr.rss.xml",
//   "https://www.sec.gov/Archives/edgar/xbrl-inline.rss.xml",
//   "https://www.sec.gov/Archives/edgar/xbrlrss.all.xml"
//   /* EXTRA */
//   // "https://www.sec.gov/Archives/edgar/monthly/xbrlrss-2014-03.xml"
// ];

let ALL_FILLINGS_URL = "https://www.sec.gov/Archives/edgar/xbrlrss.all.xml";
async function get_latest_fillings() {
  let last_guid = await Listing_model.last_saved_filing();
  logger.log(last_guid);
  logger.log("Fetching latest filings for 10-k");

  /* TMP function form files */
  let most_recent_fillings_xml = await parse_xlm_file_to_json("./sample.xml");
  let items = most_recent_fillings_xml.rss.channel.item; /* TESTING ONLY */
  /* TMP function form files */

  // let most_recent_fillings_xml = await fetch_xml(ALL_FILLINGS_URL);

  logger.log(most_recent_fillings_xml);

  // let json = await parse_xml2json(most_recent_fillings_xml)
  // let items = most_recent_fillings_xml.items;

  /* gather data from item */


  items.map(async item => {
    let { link, pubDate, enclosure, content, guid, title } = item;
    let edgar = items[0]["edgar:xbrlFiling"];
    let cik = edgar["edgar:cikNumber"];
  
    let companyName = edgar["edgar:companyName"];
    let formType = edgar["edgar:formType"];
    let filingDate = edgar["edgar:filingDate"];
    let cikNumber = edgar["edgar:cikNumber"];
    let accessionNumber = edgar["edgar:accessionNumber"];
    let fileNumber = edgar["edgar:fileNumber"];
    let acceptanceDatetime = edgar["edgar:acceptanceDatetime"];
    let period = edgar["edgar:period"];
    let assistantDirector = edgar["edgar:assistantDirector"];
    let assignedSic = edgar["edgar:assignedSic"];
    let fiscalYearEnd = edgar["edgar:fiscalYearEnd"];
    let xbrlFiles = edgar["edgar:xbrlFiles"];
  logger.log(xbrlFiles['edgar:xbrlFile'].length)
  
    xbrlFiles["edgar:xbrlFile"].map(async xbrlfile => {
      if (
        !xbrlfile['edgar:url'].endsWith("_cal.xml") &&
        !xbrlfile['edgar:url'].endsWith("_lab.xml") &&
        !xbrlfile['edgar:url'].endsWith("_def.xml") &&
        !xbrlfile['edgar:url'].endsWith("_pre.xml") &&
        !xbrlfile['edgar:url'].endsWith(".htm") &&
        !xbrlfile['edgar:url'].endsWith(".xsd") &&
        xbrlfile['edgar:url'].endsWith(".xml") &&
        xbrlfile['edgar:description'] == 'XBRL INSTANCE DOCUMENT'
        ) {
  logger.log(xbrlfile)
  
        let parsed_doc = await parse_xrbl_from_url(xbrlfile['edgar:url'])
  
  
  
        let res = await Listing_model.add_listing({
          ...parsed_doc,
          cik,
          companyName,
          formType,
          filingDate,
          cikNumber,
          accessionNumber,
          fileNumber,
          acceptanceDatetime,
          period,
          assistantDirector,
          assignedSic,
          fiscalYearEnd,
          link,
          pubDate,
          enclosure,
          content,
          guid,
          title
        });
        
      }
    });
  });
}

async function parse_xbrl(xbrl) {
  return await ParseXbrl.parseStr(xbrl);
}
async function parse_xml2json(xml) {
  return await xmlParser.toJson(xml);
}

async function fetch_xml(xml_url) {
  try {
    let resp = await parser.parseURL(xml_url);
    return resp;
  } catch (err) {
    logger.log("err".bgRed);
    logger.log(err);
  }
}
// parse_xrbl_from_url(
//   "https://www.sec.gov/Archives/edgar/data/797871/000130861706000050/tsfg-20060930.xml"
// );
async function parse_xrbl_from_url(url) {
  let resp = await rp(url);
  var jsonObj = JSON.parse(xmlParser.toJson(resp));
  // logger.log(jsonObj);

  let parsedDoc = await ParseXbrl.parseStr(resp);
  // logger.log(parsedDoc);
  return parsedDoc;
}

// })
// path to locally accessible file, does not load file over http/https

// string of correctly formatted xml/xbrl
// ParseXbrl.parseStr(`<?xml version="1.0" encoding="US-ASCII"?><xbrli:xbrl xmlns:amzn="http://www.amazon.com/20151231" xmlns:country="http://xbrl.sec.gov/country/2013-01-31">`)
// .then(function(parsedString) {
// Use results...
// });

let rss_url = "https://www.sec.gov/Archives/edgar/usgaap.rss.xml";
// save_xml_url(rss_url);
async function save_xml_url(url) {
  let resp = await rp(url);
  var jsonObj = JSON.parse(xmlParser.toJson(resp));
  let { version, channel } = jsonObj.rss;

  let { title, link, lastBuildDate, pubDate } = channel;
  let items = channel.item;

  let edgar = items[0]["edgar:xbrlFiling"];
  let cik = edgar["edgar:cikNumber"];

  let companyName = edgar["edgar:companyName"];
  let formType = edgar["edgar:formType"];
  let filingDate = edgar["edgar:filingDate"];
  let cikNumber = edgar["edgar:cikNumber"];
  let accessionNumber = edgar["edgar:accessionNumber"];
  let fileNumber = edgar["edgar:fileNumber"];
  let acceptanceDatetime = edgar["edgar:acceptanceDatetime"];
  let period = edgar["edgar:period"];
  let assistantDirector = edgar["edgar:assistantDirector"];
  let assignedSic = edgar["edgar:assignedSic"];
  let fiscalYearEnd = edgar["edgar:fiscalYearEnd"];
  let xbrlFiles = edgar["edgar:xbrlFiles"];

  logger.log(edgar);
  logger.log(xbrlFiles);
}

async function parse_xlm_file_to_json(filename) {
  try {
    let fd = await fs.readFile(filename);
    var jsonObj = JSON.parse(xmlParser.toJson(fd));

    return jsonObj;
  } catch (err) {
    logger.log("err".bgRed);
    logger.log(err);
  }
}

module.exports = {
  get_latest_fillings
};
