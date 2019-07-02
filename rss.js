require("./logger.js");
let Parser = require("rss-parser");
let parser = new Parser();
var ParseXbrl = require("parse-xbrl");

let rp = require("request-promise");
const fs = require("fs-extra");
const unzipper = require("unzipper");
var AdmZip = require("adm-zip");
const zlib = require("zlib");
const decompress = zlib.createGunzip();
let Listing_model = require("./models/filing_model.js");

// get_fillings();
async function get_fillings() {
  urls = [
    "https://www.sec.gov/Archives/edgar/usgaap.rss.xml",
    "https://www.sec.gov/Archives/edgar/xbrl-rr.rss.xml",
    "https://www.sec.gov/Archives/edgar/xbrl-inline.rss.xml",
    "https://www.sec.gov/Archives/edgar/xbrlrss.all.xml"
    /* EXTRA */
    // "https://www.sec.gov/Archives/edgar/monthly/xbrlrss-2014-03.xml"
  ];
  urls.map(async url => {
    let feed = await parser.parseURL(url);
    logger.log(feed.title);
    logger.log(feed.items.length);
    logger.log(`------------------------------------`.green);
    for (let x = 0; x < 1; x++) {
      logger.log(x);
      // logger.log(feed.items[x].title);
      logger.log(feed.items[x]);
      if (!feed.items[x].enclosure) return;
      // let title = feed.items[x].title.split(" ").join("-");

      // LOTS OF STUFF gets downlaoded
      let body = await rp(feed.items[x].enclosure.url, {
        gzip: true,
        encoding: null
      });
      // logger.log(zip)
      var zip = new AdmZip(body);
      var zip_entries = zip.getEntries();
      console.log(zip_entries);
      console.log(zip_entries.length);

      zip_entries.forEach(entry => {
        let name = entry.name;

        if (name.endsWith(".xlm", ".xsd")) {
          fs.writeFile(
            `./sec_fillings/${entry.name}`,
            zip.readAsText(entry),
            err => {
              if (err) console.log(err);
              logger.log(`File writtenn to ${entry.name}`);
            }
          );
        }
      });
    }
  });
}


async function process_filings(year, month) {
  try {
    // let current_dir = "/home/dave/Documents/sec_filling/sec/2009/05/";
    let current_dir = `/home/dave/code/python/sec-xbrl/sec/${year}/${month}/`;
    let zipped_files = await fs.readdir(current_dir);
    logger.log(zipped_files);
    zipped_files.map((zip_file, index) => {
      setTimeout(async () => {
        try {
          let fd = await fs.readFile(`${current_dir}${zip_file}`);
          // logger.log(fd);
          unzip_and_save(fd,year, month, zip_file);
        } catch (err) {
          logger.log("err".bgRed);
          logger.log(err);
        }
      }, 2000 * index);
    });

    // let dirs = await fs.readdir('/home/dave/code/python/sec-xbrl/sec/')
    // logger.log(dirs)
    // dirs.map(async dir =>{
    //   let dirs = await fs.readdir('/home/dave/code/python/sec-xbrl/sec/'+dir)
    //   logger.log(dirs)
    // })
  } catch (err) {
    logger.log("err".bgRed);
    logger.log(err);
  }
}

module.exports = {
  process_filings
};


function unzip_and_save(body, year, month, zip_file) {
  var zip = new AdmZip(body);
  var zip_entries = zip.getEntries();

  zip_entries.forEach(async entry => {
    let name = entry.name;

    if (
      !name.endsWith("_cal.xml") &&
      !name.endsWith("_lab.xml") &&
      !name.endsWith("_def.xml") &&
      !name.endsWith("_pre.xml") &&
      !name.endsWith(".htm") &&
      !name.endsWith(".xsd") &&
      name.endsWith(".xml")
    ) {
      logger.log({ name });

      let text = zip.readAsText(entry);

      try {

        let parsed_doc = await ParseXbrl.parseStr(text);
        parsed_doc.xml_filename = `${zip_file}/${name}`
        parsed_doc.year_month = `${year}/${month}`
        let res = await Listing_model.add_listing({
          ...parsed_doc
        });
      } catch (err) {
        logger.log("err".bgRed);
        logger.log(err);
        let res = await Listing_model.add_listing({
          xml_filename:`${zip_file}/${name}`,
          year_month: `${year}/${month}`,
          error_msg:err
        });
      }
    }
  });
}

// read_file_and_parse('./test/test_tel-20091225.xml')
async function read_file_and_parse(file) {
  try {
    let text = await fs.readFile(file, "utf8");
    ParseXbrl.parseStr(text);
  } catch (err) {
    logger.log("err".bgRed);
    logger.log(err);
  }
}



// read_specific_file()
async function read_specific_file() {
  let current_dir = `/home/dave/code/python/sec-xbrl/sec/2011/11/`;

  let files = await fs.readdir(current_dir);
  files.map(async zipped_files => {
    try {
      let fd = await fs.readFile(`${current_dir}${zipped_files}`);

      var zip = new AdmZip(fd);
      var zip_entries = zip.getEntries();
      zip_entries.forEach(async entry => {
        let name = entry.name;
        if (name == "ck0001528103-20110930.xml") {
          logger.log(zipped_files);
        }
      });
    } catch (err) {
      logger.log("err".bgRed);
      logger.log(err);
    }
  });
}
