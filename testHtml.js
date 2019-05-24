const fs = require('fs');
const puppeteer = require('puppeteer');
const mergePdfComm = require('./mergePdfCommon');
const mergePdfConfig = require('./mergePdfConfig');
let AipOcrClient = require("baidu-aip-sdk").ocr;
// 新建一个对象，建议只保存一个对象调用服务接口
let client = new AipOcrClient('16212625','Yhu2R9SSAHxzrObWEMi4sPZK','YvLU9z5XCjqgFmtoqFUNGpgrsuQ7uN71');

(async () => {
    /*const browser = await puppeteer.launch({
        // 关闭无头模式，方便我们看到这个无头浏览器执行的过程
        headless: false
    });*/
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setViewport({
        width:1300,
        height:1000
    })
    await page.goto('https://www.interotc.com.cn');
    await page.emulateMedia("screen");
    let isNeedLogin = mergePdfConfig.isNeedLogin;
    let noLoginHtml = mergePdfConfig.module.noLoginHtml;
    //如果需要登录
    if(isNeedLogin==="true"){
        //点击登录跳转按钮跳转到登录页面
        await page.click('.login_btn');
        await page.waitFor(3000);//等待3秒，等待新窗口打开

        //输入用户名
        await  mergePdfComm.inputUsername(page);
        await page.waitFor(3000);//等待3秒以便用户名输入完毕

        //输入密码
        await mergePdfComm.inputPassword(page);
        await page.waitFor(3000);//等待3秒以便密码输入完毕

        //调用evaluate 方法返回id 为form元素的位置信息
        let clip = await mergePdfComm.getYzmclip(page);
        await page.waitFor(3000);//等待3秒以便位置信息获取完毕

        //对选中的区域进行截图
        await mergePdfComm.yzmPic(page,clip);
        await page.waitFor(3000);//等待图片截图完成

        //设置识别文字的参数
        let yzmVal = await mergePdfComm.analyseYzm(fs,client);
        await page.waitFor(3000);//等待获取验证码的值yzmVal

        //输入验证码
        await mergePdfComm.inputYzm(page,yzmVal);
        await page.waitFor(3000);//等待验证码输入完毕

        //点击登录按钮
        await page.click('.loginBtn');
        await page.waitFor(3000);//等待3秒，等待接口处理完成
        let errowMsg = "";
        //如果登录失败
        console.log("page.url()=="+page.url());
        if(page.url().indexOf("CASServer/login")>0){
            console.log("登录失败了")
            //获取登录失败信息
            errowMsg= await mergePdfComm.getErrorMsg(page);
            console.log("登录失败原因:"+errowMsg);
            if(errowMsg!==""){
                //循环登录
                for(let i=0;i<4;i++){
                    console.log("重新尝试登录第（"+(i+1)+"）次");
                    //输入用户名
                    await  mergePdfComm.inputUsername(page);
                    await page.waitFor(3000);//等待3秒以便用户名输入完毕

                    //输入密码
                    await mergePdfComm.inputPassword(page);
                    await page.waitFor(3000);//等待3秒以便密码输入完毕

                    //调用evaluate 方法返回id 为form元素的位置信息
                    let clip = await mergePdfComm.getYzmclip(page);
                    await page.waitFor(3000);//等待3秒以便位置信息获取完毕

                    //对选中的区域进行截图
                    await  mergePdfComm.yzmPic(page,clip);
                    await page.waitFor(3000);//等待图片截图完成

                    //设置识别文字的参数
                    let yzmVal = await mergePdfComm.analyseYzm(fs,client);
                    await page.waitFor(3000);//等待获取验证码的值yzmVal

                    //输入验证码
                    await mergePdfComm.inputYzm(page,yzmVal);
                    await page.waitFor(3000);//等待验证码输入完毕

                    //点击登录按钮
                    await page.click('.loginBtn');
                    await page.waitFor(3000);//等待3秒，等待接口处理完成
                    if(page.url().indexOf("CASServer/login")>0){
                        //获取登录失败信息
                        errowMsg= await mergePdfComm.getErrorMsg(page);
                        console.log("errowMsg=="+errowMsg);
                        if(errowMsg===""){
                            break;
                        }
                    }else{
                        console.log("登录成功");
                        await mergePdfComm.getMergePDF(page);
                        break;
                    }
                }
            }
        }else{
            //登录成功
            console.log("登录成功");
            await mergePdfComm.getMergePDF(page);
        }
 }else{
        //不需要登录
        await mergePdfComm.getMergePDF(page);
 }
 await browser.close();
})(); 














