const axios = require("axios")
const cheerio = require("cheerio")
const fs = require("node:fs")
const xlsx = require("xlsx")

let pageUrl = "https://in.jobsora.com/jobs-for-12th-pass-indore"
let headers = {
    "content-type": "text/html"
}

let getWebpageData = async (url) => {
    try {
        let response = await axios.get(url, {
            headers,
        })
        console.log(response);
        const strData = response.data
        fs.writeFileSync("techJobPostingsWs/webPagedata.txt", strData)
    } catch (error) {
        console.log("error", error);
    }
}

// getWebpageData(pageUrl)

let getDatafromFile = () => {
    return fs.readFileSync("techJobPostingsWs/webPagedata.txt", { encoding: "utf-8" })
}

let htmlPageData = getDatafromFile()

let $ = cheerio.load(htmlPageData)
let allJobDetails = []
let jobsDetails = $("main article")
    .each((i, e) => {
        let jobTitle = $(e).find("header h2 a.u-text-double-line").text();
        let companyName = $(e).find("table div.c-job-item__info-item a").text();
        let location = $(e).find("table div div.c-job-item__info-item").text();
        let locationParts = location.split('\n').map(part => part.trim());
        let desiredLocation = locationParts[locationParts.length - 1];
        let postedDate = $(e).find("div.c-job-item__date").text().trim();
        let jobDescription = $(e).find("p.c-job-item__description").text().trim()
        if (jobTitle && companyName && location && postedDate && jobDescription) {
            allJobDetails.push({
                job: jobTitle,
                companyName: companyName,
                location: desiredLocation,
                postedDate: postedDate,
                jobDescription: jobDescription,
            })
        }
    })
// console.log(allJobDetails);


let workbook = xlsx.utils.book_new()
const worksheet = xlsx.utils.json_to_sheet(allJobDetails)
xlsx.utils.book_append_sheet(workbook, worksheet, "Sheet1")

 xlsx.writeFile(workbook, "techJobPostingsWs/jobDetails.xlsx");