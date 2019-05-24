const merge = require('easy-pdf-merge');
const timerLoginConfig = require('./timerLoginConfig');
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
            console.log("result=="+result);
            const wordsResult=result.words_result;
            if(wordsResult!=null && wordsResult.length>0){
                yzmVal=wordsResult[0].words;
                console.log("yzmVal1:"+yzmVal);
                resolve(yzmVal);
            }
            //return yzmVal;
        }).catch(function (err) {
            // 如果发生网络错误
            console.log(err);
        });

    }).then(function(value){
        console.log("value=="+value);
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
function checkParam (){
    let envObj=new Object();
    let envList = timerLoginConfig.environment;
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
    console.log("envObj=="+envObj);
    return envObj;
}

module.exports.inputUsername = inputUsername;
module.exports.inputPassword = inputPassword;
module.exports.getYzmclip = getYzmclip;
module.exports.yzmPic = yzmPic;
module.exports.analyseYzm = analyseYzm;
module.exports.inputYzm = inputYzm;
module.exports.getErrorMsg = getErrorMsg;
