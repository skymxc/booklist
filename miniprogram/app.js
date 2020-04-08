//app.js

// App(Object) 是一个函数 ；用来注册一个小程序；接受一个 object 参数；
// 这个函数的 Object 参数有几个系统规定的生命周期属性：onLaunch , onShow,onHide,onError,onPageNotFound; 这几个属性都是 函数类型的 ；下面是实例代码
// 我们还可以自己添加 属性； 
App({
  data:{
    markDeleteBooklist:'deleteBookList',
    markRefresh:false,
    markCreateBLClose:false
  },
  onLaunch: function(options) {
    
    // 初始化云能力 traceUser:true 记录用户
    if (!wx.cloud) {
      console.log('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        traceUser: true,
        env: 'release-5zcgc'
      })
    }

    this.globalData = {}
  },
  
  onPageNotFound: function(options) {
    console.log('onPageNotFound',options)

    wx.showModal({
      title: '提示',
      content: '暂时无法展示'+options.path,
      showCancel:false,
      success:function(){
        wx.redirectTo({
          url: '/pages/booklist/booklist',
          fail:function(err){
            wx.showToast({
              title: err.errMsg,
            })
          }
        })
      }
    })
   
    //this.navigateTo('pages/booklist/booklist')
  },
  formatDate: function(fmt, date) { //author: meizz   
    var o = {
      "M+": date.getMonth() + 1, //月份   
      "d+": date.getDate(), //日   
      "h+": date.getHours(), //小时   
      "m+": date.getMinutes(), //分   
      "s+": date.getSeconds(), //秒   
      "q+": Math.floor((date.getMonth() + 3) / 3), //季度   
      "S": date.getMilliseconds() //毫秒   
    };
    if (/(y+)/.test(fmt))
      fmt = fmt.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
      if (new RegExp("(" + k + ")").test(fmt))
        fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
  }
})