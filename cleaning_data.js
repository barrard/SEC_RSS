require('./logger.js')
let fs = require('fs-extra')
var AdmZip = require("adm-zip");
var xmlParser = require("xml2json");
let rp = require('request-promise')
const cheerio = require('cheerio')


// query_xml('https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=0000050863&type=10-q&dateb=&owner=exclude&count=40')
async function query_xml(query_url){
  let resp = await rp(query_url)
  // logger.log(resp)
  const $ = cheerio.load(resp)
  let table = $('tbody','.tableFile2')
  logger.log(table)
  table.children().map((index, row) =>{
    /* get second td child */
    // logger.log(row)
    let data = $(row).children()
    // logger.log(data.length)
    let second_col = data[1]
    /* see how many children, if only 1, */
    // logger.log(second_col)
    let second_col_children = $(second_col).children()
    if(second_col_children.length == 2){
      logger.log('this should be our data')
      /* get the date */
      let date = $(data[3]).text()
      let links = $(data[1]).children()
      logger.log({date})
      let link = $(links[0]).attr('href')
      /* new function, Follow link, and get the instance document */
      load_link_and_get_instance_document(`https://www.sec.gov${link}`)

    }
    
  })

}

load_link_and_get_instance_document(`https://www.sec.gov/Archives/edgar/data/50863/000095012309028975/0000950123-09-028975-index.htm`)
async function load_link_and_get_instance_document(link){
  // let resp = await rp(link)

  // let write = await fs.writeFile('./archive_tables.htm', resp)
// return
  let resp = await fs.readFile('./archive_tables.htm')
  const $ = cheerio.load(resp)
  let tables = $('table')
  logger.log(tables.length)
  let data_table = $(tables[1]).children()
  Array.from($(data_table).children()).forEach(row=>{
    let td = $(row).children()
    if($(td[1]).text().includes('XBRL INSTANCE DOCUMENT')){
      let link = $(td[2]).children()
      let href = $(link).attr('href')
      /* fetch the link and download? */
      fetch_save_xbrl_instance(`https://www.sec.gov${href}`)
    }
  })


}

/* fetch and save xbrl link form web scrape query */
async function fetch_save_xbrl_instance(link){
  let body =await rp(link)
  let file = link.split('/')
  let filename = file[file.length-1]
  await fs.writeFile(`./xbrl_files/${filename}`, body)
}


// cleaning_files()
async function cleaning_files() {
  try {
    let current_dir = "/home/dave/Documents/sec_filling/sec/2005/04/";
    // let current_dir = `/home/dave/code/python/sec-xbrl/sec/2011/${month}/`;
    let files = await fs.readdir(current_dir);
    logger.log(files.length);
    files.map( async (zipped_files, index) => {
    // setTimeout(async()=>{
      if(index !=0) return
      try {
        let fd = await fs.readFile(`${current_dir}${zipped_files}`);
        // logger.log(fd);
        unzip(fd);
      } catch (err) {
        logger.log('err'.bgRed)
        logger.log(err)
      }
    // }, 2000*index)
    });
  
  
  } catch (err) {
    logger.log('err'.bgRed)
    logger.log(err)
  }
}




function unzip(body) {
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
      let str =  xmlParser.toJson(text);
      let json = JSON.parse(str)
      logger.log(typeof json)
      for(let k in json){
        //xbrli:xbrl
        logger.log(json[k]['bne:EarningsReleaseIntroduction'])
        for(let l in json[k]){
          // logger.log(l)
          // logger.log(`${l} = ${json[k][l]}`)
          /* 
          
          
bne:EarningsReleaseIntroduction 
bne:BusinessOutlook 
bne:BusinessOverview 

usfr-pte:SalesRevenueNet 
usfr-pte:CostGoodsServicesSold 
usfr-pte:SellingGeneralAdministrativeExpenses 
usfr-pte:Depreciation 
usfr-pte:Amortization 
usfr-pte:OperatingExpenses 
usfr-pte:OperatingProfit 
usfr-pte:InterestExpense 
usfr-pte:OtherOperatingExpense 
usfr-pte:IncomeLossContinuingOperationsBeforeIncomeTaxes 
usfr-pte:ProvisionIncomeTaxes 
usfr-pte:NetIncome 
usfr-pte:BasicEarningsPerShareNetIncome 
usfr-pte:DilutedEarningsPerShareNetIncome 
usfr-pte:WeightedAverageNumberSharesOutstanding 
usfr-pte:WeightedAverageNumberDilutedSharesOutstanding 
usfr-pte:StockholdersEquityAmountPerShareCommonStockCashDividends 
usfr-pte:IncomeLossContinuingOperations 
usfr-pte:IncomeLossDiscontinuedOperationsNetTaxEffect 
usfr-pte:IncomeLossDispositionDiscontinuedOperations 
usfr-pte:IncomeLossDiscontinuedOperations 
usfr-pte:IncomeLossContinuingOperationsPerOutstandingShare 
usfr-pte:IncomeLossContinuingOperationsPerDilutedShare 
usfr-pte:IncomeLossDispositionDiscontinuedOperationsPerOutstandingShare 
usfr-pte:IncomeLossDispositionDiscontinuedOperationsPerDilutedShare 
usfr-pte:AccountsReceivableTradeNet 
usfr-pte:InventoriesNet 
usfr-pte:AssetsHeldSaleCurrent 
usfr-pte:TotalCurrentAssets 
usfr-pte:PropertyPlantEquipmentNet 
usfr-pte:IntangibleAssetsGoodwillNet 
usfr-pte:OtherAssetsNoncurrent 
usfr-pte:AssetsHeldSaleNoncurrent 
usfr-pte:Assets 
usfr-pte:CurrentPortionLongTermDebt 
usfr-pte:CurrentLiabilities 
usfr-pte:LongTermDebt 
usfr-pte:StockholdersEquity 
usfr-pte:LiabilitiesStockholdersEquity 
usfr-pte:TotalDepreciationAmortization 
usfr-pte:AssetImpairmentCharge 
usfr-pte:ChangeOperatingAssetsLiabilities 
usfr-pte:NetCashFlowsProvidedUsedOperatingActivities 
usfr-pte:CapitalAdditionsNet 
usfr-pte:ProceedsSalePropertyPlantEquipment 
usfr-pte:NetCashFlowsProvidedUsedInvestingActivities 
usfr-pte:ProceedsShortTermBorrowings 
usfr-pte:CommonStockTransactionsNet 
usfr-pte:PaymentDividends 
usfr-pte:NetCashFlowsProvidedUsedFinancingActivities 
usfr-pte:NetIncreaseDecreaseCashCashEquivalents 
usfr-pte:CashCashEquivalents 
usfr-pte:ExtinguishmentDebt 
usfr-pte:ProceedsSaleBusiness 
usfr-pte:AcquisitionBusinessesNetCashAcquired 
usfr-pte:RepurchaseCommonStock 
usfr-pte:ProceedsStockOptionsExercised 

bne:ERFootnotes 

bne:CashAndMarketableSecurities 
bne:PrepaidExpensesOtherCurrentAssets 
bne:AccountsPayableAndAccruedLiabilities 
bne:LiabilitiesHeldForSaleCurrent 
bne:DeferredEmployeeCompensationOtherNoncurrentAssets 
bne:LiabilitiesHeldForSaleNoncurrent 
bne:BalanceSheetNote 
bne:GainOnSaleBuilding 
bne:RestructuringIntegrationAssetImpairmentChargeAbstracts 
bne:ProceedsFromSaleInvestmentFixedAssets 
bne:PaymentofDebt 
bne:NetCashFlowsProvidedByUsedOperatingActivitiesDiscontinuedOperations 
bne:SegmentProfit 
bne:CashFlowsNotes
          
          */
        }
      }

      // let first_keys = Object.keys(json)
      // logger.log(first_keys)
      // try {
      //   let file_write = await fs.writeFile(`./test/test_${name}`, text)

      //   // logger.log(text)
      //   let parsed_doc =  await ParseXbrl.parseStr(text);
      //   if(!parsed_doc.guid){
      //     if(parsed_doc.CIK) parsed_doc.guid = `${parsed_doc.CIK}-${name}`
      //     else if(parsed_doc.cik) parsed_doc.guid = `${parsed_doc.cik}-${name}`
      //     else parsed_doc.guid = name
      //   }
      //   let res = await Listing_model.add_listing({
      //     ...parsed_doc,

      //   });
      // } catch (err) {
      //   logger.log('err'.bgRed)
      //   logger.log(err)
      // }
    }
  });
}