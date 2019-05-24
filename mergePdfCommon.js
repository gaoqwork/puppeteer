const merge = require('easy-pdf-merge');
const fs = require('fs');
const mergePdfConfig = require('./mergePdfConfig');
const inputUsername = (page) => {
    return new Promise((resolve, reject) => {
        page.type('.loginMain #username', checkParam ().username,{
            delay: 50, // 控制 keypress 也就是每个字母输入的间隔
        });
        resolve();
    });
};
const inputPassword = (page) => {
    return new Promise((resolve, reject) => {
        page.type('.loginMain #password_text', checkParam ().password,{
            delay: 50, // 控制 keypress 也就是每个字母输入的间隔
        });
        resolve();
    });
};


const getYzmclip = (page) => {
        return page.evaluate(() => {
            let {
                x,
                y,
                width,
                height
            } = document.getElementById('j_captcha_response_img').getBoundingClientRect();
            return {
                x,
                y,
                width,
                height
            };
        });
};

const analyseYzm = (fs,client) => {
    return new Promise((resolve, reject) => {
        let yzmVal='';
        //设置识别文字的参数
        let options = {};
        options["language_type"] = "CHN_ENG";
        options["detect_direction"] = "true";
        options["detect_language"] = "true";
        options["probability"] = "true";

        let image = fs.readFileSync("yzm.png").toString("base64");
        // 带参数调用通用文字识别
        client.generalBasic(image, options).then(function (result) {
            console.log("文字识别后的结果:"+result);
            const wordsResult=result.words_result;
            if(wordsResult!=null && wordsResult.length>0){
                yzmVal=wordsResult[0].words;
                console.log("验证码为:"+yzmVal);
                resolve(yzmVal);
            }
            //return yzmVal;
        }).catch(function (err) {
            // 如果发生网络错误
            console.log(err);
        });

    }).then(function(value){
        //console.log("value=="+value);
        return value;
    });
};

const inputYzm = (page,yzmVal) => {
    return new Promise((resolve, reject) => {
        page.type('.loginMain #j_captcha_response', yzmVal,{
            delay: 50, // 控制 keypress 也就是每个字母输入的间隔
        });
        resolve();
    });
};

const yzmPic= (page,clip) => {
    return new Promise((resolve, reject) => {
        page.screenshot({
            path:'yzm.png',
            clip:clip //设置clip 属性
        });
        resolve();
    });
};

const getErrorMsg= (page) => {
    return new Promise((resolve, reject) => {
        let errowMsg = page.$eval(".errowMsg", el => el.innerText);
        console.log("登录失败原因："+errowMsg);
        resolve(errowMsg);
    }).then(function(value){
        return value;
    });
};


//
async function getMergePDF(page) {
    await mkdirResult();
    await mkdirSingle();
    let envBaseUrl=checkParam().envBaseUrl;
    let isNeedLogin = mergePdfConfig.isNeedLogin;
    console.log("isNeedLogin:"+isNeedLogin);
    let noLoginHtml = getHtmlUrl();
    console.log("noLoginHtml:"+noLoginHtml);
    let LoginHtml = getLoginHtmlUrl();
    console.log("LoginHtml:"+LoginHtml);
    let pdfFiles=[];
    let pdfUrls = [];
    let loginPdfUrls = [];
    if(isNeedLogin === "true"){
        if(typeof noLoginHtml !== "undefined"){
            if(noLoginHtml.length>0){
                pdfUrls = getHtmlUrl();
                for(let i=0; i<pdfUrls.length; i++){
                    //console.log(envBaseUrl+pdfUrls[i]);
                    await page.goto(envBaseUrl+pdfUrls[i], {waitUntil: 'networkidle0'});//不再有网络连接时触发（至少500毫秒后）
                    await page.waitFor(3000);
                    let pdfFileName =  mergePdfConfig.version+'--'+new Date().getHours()+'-'
                        +new Date().getMinutes()+'-'+new Date().getSeconds()+'.pdf';
                    pdfFiles.push('../singlePdf/'+pdfFileName);
                    //console.log("pdfFiles:"+pdfFiles);
                    await page.pdf({path: '../singlePdf/'+pdfFileName, format: 'A4',printBackground: true});
                }
            }
        }
        if( typeof LoginHtml !== "undefined"){
            if(LoginHtml.length>0){
                loginPdfUrls = getLoginHtmlUrl();
                for(let i=0; i<loginPdfUrls.length; i++){
                    //console.log(envBaseUrl+pdfUrls[i]);
                    await page.goto(loginPdfUrls[i], {waitUntil: 'networkidle0'});//不再有网络连接时触发（至少500毫秒后）
                    await page.waitFor(3000);
                    let pdfFileName =  mergePdfConfig.version+'--'+new Date().getHours()+'-'
                        +new Date().getMinutes()+'-'+new Date().getSeconds()+'.pdf';
                    pdfFiles.push('../singlePdf/'+pdfFileName);
                    await page.pdf({path: '../singlePdf/'+pdfFileName, format: 'A4',printBackground: true});
                }
            }
        }

    }else{
        pdfUrls = getHtmlUrl();
        for(let i=0; i<pdfUrls.length; i++){
            //console.log(envBaseUrl+pdfUrls[i]);
            await page.goto(envBaseUrl+pdfUrls[i], {waitUntil: 'networkidle0'});//不再有网络连接时触发（至少500毫秒后）
            await page.waitFor(3000);
            let pdfFileName =  mergePdfConfig.version+'--'+new Date().getHours()+'-'
                +new Date().getMinutes()+'-'+new Date().getSeconds()+'.pdf';
            pdfFiles.push('../singlePdf/'+pdfFileName);
            await page.pdf({path: '../singlePdf/'+pdfFileName, format: 'A4',printBackground: true});
        }
    }
    console.log("合并的文件为："+pdfFiles);
   await mergeMultiplePDF(pdfFiles);
}

//合并pdf用
const mergeMultiplePDF = (pdfFiles) => {
    return new Promise((resolve, reject) => {
        try {
            merge(pdfFiles,'../'+mergePdfConfig.version+'/'+mergePdfConfig.version+'--'+new Date().getHours()+'-'
                +new Date().getMinutes()+'-'+new Date().getSeconds()+'.pdf',function(err){
                if(err){
                    console.log("err=="+err);
                    reject(err)
                    return;
                }
                console.log('合并pdf成功');
                resolve();
            })
        }catch (error) {
            console.log("error=="+error);
        }
        ;
    });
};

//
function checkParam (){
    let envObj= new Object();
    let envList = mergePdfConfig.environment;
    let envBaseUrl="";
    let username="";
    let password="";
    if(envList.length>0){
        let count=0;
        for(let i=0;i<envList.length;i++){
            if(envList[i].run==="true"){
                count++;
            }
        }
        if(count>1){
            console.log("只能执行一个环境下的页面任务");
            return ;
        }else if(count === 1){
            for(let i=0;i<envList.length;i++){
                if(envList[i].run==="true"){
                    envBaseUrl=envList[i].url;
                    username=envList[i].username;
                    password=envList[i].password;

                    envObj.envBaseUrl = envBaseUrl;
                    envObj.username = username;
                    envObj.password = password;
                }
            }
        }else{
            console.log("请选择一个环境下的页面任务进行执行");
            return ;
        }
    }
    return envObj;
}

//
function getHtmlUrl(){
    let moduleList = mergePdfConfig.module;
    let runModule = mergePdfConfig.runModule;
    let pdfUrls= [];
    if(moduleList.length>0){
        for(let i=0;i<moduleList.length;i++){
            if(moduleList[i].name === runModule){
                pdfUrls=moduleList[i].noLoginHtml;
            }
        }
    }
    //console.log("pdfUrls=="+pdfUrls);
    return pdfUrls;
}

function getLoginHtmlUrl(){
    let moduleList = mergePdfConfig.module;
    let runModule = mergePdfConfig.runModule;
    let pdfUrls= [];
    if(moduleList.length>0){
        for(let i=0;i<moduleList.length;i++){
            if(moduleList[i].name === runModule){
                pdfUrls=moduleList[i].loginHtml;
            }
        }
    }
    //console.log("pdfUrls=="+pdfUrls);
    return pdfUrls;
}

async function  mkdirResult(){
    let isexist = fs.existsSync( '../'+mergePdfConfig.version );
    if(!isexist){
        //2. fs.mkdir  创建目录
        fs.mkdir('../'+mergePdfConfig.version,function(error){
            if(error){
                console.log(error);
                return false;
            }
            console.log('创建目录成功');
        });
    }
}
async function  mkdirSingle(){
    let isexist = fs.existsSync( '../singlePdf');
    if(!isexist){
        //2. fs.mkdir  创建目录
        fs.mkdir('../singlePdf',function(error){
            if(error){
                console.log(error);
                return false;
            }
            console.log('创建目录成功');
        });
    }
}

module.exports.inputUsername = inputUsername;
module.exports.inputPassword = inputPassword;
module.exports.getYzmclip = getYzmclip;
module.exports.yzmPic = yzmPic;
module.exports.analyseYzm = analyseYzm;
module.exports.inputYzm = inputYzm;
module.exports.getErrorMsg = getErrorMsg;
module.exports.mergeMultiplePDF = mergeMultiplePDF;
module.exports.getMergePDF = getMergePDF;