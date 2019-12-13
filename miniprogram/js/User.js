 function getOpenidFromStroage() {
   return new Promise(function(resolve,reject){
     var res = wx.getStorageInfoSync();
     if (res.keys.indexOf('openid') != -1) {
       var resposne = wx.getStorageSync("openid");
       resolve(resposne.data)

     } else {
       reject({
         code: -1
       })
     }
   })
 }

 function getOpenidFromServer(){
   return new Promise(function(resolve,reject){
     wx.cloud.callFunction({
       name:"login"
     }).then(res=>{
       resolve(res.result.openid)
     }).catch(error=>reject({code:-2,error:error}))
   })
 }

 function getOpenid(){
   return new Promise(function(resolve,reject){
     getOpenidFromStroage().then(res=>{
        //本地就有
        resolve(res)
     }).catch(error=>{
       //本地没有，从服务器获取吧
       getOpenidFromServer().then(res=>{
         //存储在本地
          saveOpenid(res)
          resolve(res)
       }).catch(error=>{
          reject(error)
       })
     })
   })
 }

 function saveOpenid(openid){
   wx.setStorage({
     key: 'openid',
     data: openid,
   })
 }


 module.exports = {
   getOpenid: getOpenid
 }