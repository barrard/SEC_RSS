/* require db */
require("./db.js");
require('./logger.js')
let rss_feed = require('./rss.js')
let read_xrbl = require('./read_xbrl.js')


main()

function main(){
  logger.log('Main start')
  /* Read the rss feed */
  // read_xrbl.get_latest_fillings()


  /* Process current files */
  let month_counter = 0
let timer = setInterval(()=>{
  month_counter++
  let month = month_counter < 10 ?
    `0${month_counter}`: month_counter
    rss_feed.process_filings('2010' , month)
  if(month_counter == 12) clearInterval(timer)
  console.log({month_counter})


}, 26000)

}

