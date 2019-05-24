const puppeteer = require('puppeteer');
const merge = require('easy-pdf-merge');

let pdfUrls = ["https://www.interotc.com.cn/portal/newportal/index.html",
               "https://www.interotc.com.cn/portal/newportal/jgxx.html",
                "https://www.interotc.com.cn/portal/newportal/scgl.html",
                "https://bond.interotc.com.cn/",
                "https://pe.interotc.com.cn/",
                "https://derivatives.interotc.com.cn/cmis-web/a/index",
                "https://www.interotc.com.cn/portal/newportal/xxfb.html"];

(async () => { 
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.emulateMedia("screen");//改变页面的css媒体类型。支持的值仅包括 'screen', 'print' 和 null。传 null 禁用媒体模拟
    let pdfFiles=[];

    for(let i=0; i<pdfUrls.length; i++){
        await page.goto(pdfUrls[i], {waitUntil: 'networkidle2'});
       // await page.waitFor(8000);//8秒
        let pdfFileName =  'sample'+(i+1)+'.pdf';
        pdfFiles.push(pdfFileName);
        await page.pdf({path: pdfFileName, format: 'A4',printBackground: true});
    }

    await browser.close();

    await mergeMultiplePDF(pdfFiles);
})();

const mergeMultiplePDF = (pdfFiles) => {
    return new Promise((resolve, reject) => {
        merge(pdfFiles,'final.pdf',function(err){
            if(err){
                console.log(err);
                reject(err)
            }
            console.log('合并pdf成功');
            resolve();
        });
    });
}; 
