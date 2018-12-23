// miniprogram/pages/authorize/authorize.js
const app = getApp();
/**
 *  使用 wx.reLaunch(Object object)；可以关闭之前所有的页面，这样就算不同意也可以 很直接退出了。
 * 
 * 在授权后 使用 wx.redirectTo(Object object) 跳转回去，这样就把当前页面关闭了。就不会返回回来了。
 */
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
      //检查 当前用户是否拥有 获取用户信息的权限
    var that = this;
    wx.showLoading({
      title: '拉取授权信息',
      mask:true
    })
    app.handlePermissionAndGetUserInfo().then(res=>{
      wx.hideLoading();
      if(res.auth){
        that.login();
      }
      
    }).catch(error=>{
      wx.hideLoading();
      wx.showModal({
        title: '权限获取失败！',
        content: error.errMsg,
        showCancel:false
      });
    });
  },
  onGetUserInfo:function(event){
    app.globalData.userInfo = event.detail.userInfo;
    app.globalData.logged = true;
    this.login();
    
  },
  login:function(){
    wx.showLoading({
      title: '正在登陆，请稍后',
      mask: true
    })

    var that = this;

    //登陆 获取openID
    app.login().then(res => {
          wx.hideLoading();
          //返回首页
          that.toReturn();
       
    }).catch(error => {
      wx.hideLoading();

      wx.showModal({
        title: '网络异常！',
        content: error.errMsg,
        showCancel: false
      });
    });
  },
  toReturn:function(){
    //返回首页
    wx.showLoading({
      title: '登陆成功，返回中',
      mask:true
    })
    wx.redirectTo({
      url: '../booklist/booklist',
      success: function () {
        wx.hideLoading();
      },
      fail: function (err) {
        console.error(err);
        wx.showModal({
          title: '异常！',
          content: err.errMsg,
          showCancel: false
        });
      }
    });
  },
  tapAuthLogin:function(){
    wx.showLoading({
      title: '请稍后',
      mask:true
    })
  }
})