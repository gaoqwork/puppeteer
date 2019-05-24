
const fs = require('fs');
const puppeteer = require('puppeteer');
var AipOcrClient = require("baidu-aip-sdk").ocr;
// 新建一个对象，建议只保存一个对象调用服务接口
var client = new AipOcrClient('16212625','Yhu2R9SSAHxzrObWEMi4sPZK','YvLU9z5XCjqgFmtoqFUNGpgrsuQ7uN71');


(async () => {
    const browser = await (puppeteer.launch({headless: false}));//打开浏览器
    const page = await browser.newPage();
    await page.setViewport({width:1280,height:1000});
    // 进入门户页面
    await page.goto('https://www.interotc.com.cn');
    // 获取页面标题
    let title = await page.title();
    console.log(title);
    //点击产品中心（没判断是否登录，默认是未登录）
    await page.click('#cpzx');
    //跳转到登录页面
    await page.waitFor(3000);//等待3秒，等待新窗口打开

    //获取浏览器的第二个页面，也就是新打开的登录页面
    const page2 = ( await browser.pages() )[2];//得到所有窗口使用列表索引得到新的窗口
    await page2.setViewport({width:1280,height:800});
    //输入用户名
    await page2.type('.loginMain #username', '888888026',{
        delay: 50, // 控制 keypress 也就是每个字母输入的间隔
    });
    //输入密码
    await page2.type('.loginMain #password_text', 'q1w2e3r4',{
        delay: 50, // 控制 keypress 也就是每个字母输入的间隔
    });

    //调用evaluate 方法返回id 为form元素的位置信息
    let clip = await page2.evaluate(() => {
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

    //对选中的区域进行截图
    await  page2.screenshot({
        path:'22.png',
        clip:clip //设置clip 属性
    });
    console.log("clip:"+clip.x +","+ clip.y+"," + clip.width+"," + clip.height);

    await page2.waitFor(13000);//等待图片截图完成

    //设置识别文字的参数
    var options = {};
    options["language_type"] = "CHN_ENG";
    options["detect_direction"] = "true";
    options["detect_language"] = "true";
    options["probability"] = "true";

    var image = fs.readFileSync("22.png").toString("base64");
    // 带参数调用通用文字识别
    client.generalBasic(image, options).then(function (result) {
        console.log(JSON.stringify(result));
        const resultVal=JSON.stringify(result);
        const wordsResult=resultVal.words_result;
        console.log("wordsResult:"+wordsResult);
        for(let i=0;i<wordsResult.length;i++){
            const words=resultVal.words_result[i].words;
            console.log("words:"+words);
        }


    }).catch(function (err) {
        // 如果发生网络错误
        console.log(err);
    });

})();