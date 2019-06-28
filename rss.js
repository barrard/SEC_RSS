require("./logger.js");
let Parser = require("rss-parser");
let parser = new Parser();
let rp = require("request-promise");
const fs = require("fs-extra");
const unzipper = require("unzipper");
var AdmZip = require("adm-zip");
const zlib = require("zlib");
const decompress = zlib.createGunzip();

get_fillings();
async function get_fillings() {
  urls = [
    // "https://www.sec.gov/Archives/edgar/usgaap.rss.xml",
    // "https://www.sec.gov/Archives/edgar/xbrl-rr.rss.xml",
    // "https://www.sec.gov/Archives/edgar/xbrl-inline.rss.xml",
    // "https://www.sec.gov/Archives/edgar/xbrlrss.all.xml",
    /* EXTRA */
    "https://www.sec.gov/Archives/edgar/monthly/xbrlrss-2014-03.xml"
  ];
  urls.map(async url => {
    let feed = await parser.parseURL(url);
    logger.log(feed.title);
    logger.log(feed.items.length);
    logger.log(`------------------------------------`.green);
    for (let x = 0; x < feed.items.length; x++) {
logger.log(x)
      logger.log(feed.items[x].title)
      if(feed.items[x].enclosure){

        logger.log(feed.items[x].enclosure.url)
      }else{
        logger.log('WTF??'.red)
      }
      // let title = feed.items[x].title.split(" ").join("-");






      //LOTS OF STUFF gets downlaoded
      // let body = await rp(feed.items[x].enclosure.url, {
      //   gzip: true,
      //   encoding: null
      // });
      // // logger.log(zip)
      // var zip = new AdmZip(body);
      // var zipEntries = zip.getEntries();
      // console.log(zipEntries.length);
      // zipEntries.forEach(entry => {
      //   logger.log(entry.entryName);
      //   logger.log(entry.name);
      //   // if (entry.entryName.match(/readme/i))
      //   // console.log(zip.readAsText(entry));
      //   fs.writeFile(`./${entry.name}`, zip.readAsText(entry), err => {
      //     if (err) console.log(err);
      //     logger.log(`File writtenn to ${entry.name}`);
      //   });
      // });
    }
  });
}
