// miniprogram/pages/booklist/booklist.js
const app = getApp();
const db = wx.cloud.database();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    bookList: [],
    enableEmpty: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {

    /**
     * 检查权限 
     */
    // wx.showLoading({
    //   title: '正在检查授权信息',
    //   mask: true
    // });
    if (app.globalData.logged) {
      this.loadBookList(true);
    } else {


      app.showLoadingMask('正在检查授权');
      app.handlePermissionAndGetUserInfo().then(res => {
        if (res.auth) {

          app.showLoadingMask('登陆中');
          app.login().then(res => {
            wx.hideLoading();
            //获取数据 booklist
            wx.startPullDownRefresh({

            });
          }).catch(error => {

            app.showErrNoCancel("登陆失败", error.errMsg);
          });
        } else {
          // 去授权页

          wx.reLaunch({
            url: '../authorize/authorize',
            success: function() {
              wx.hideLoading();
            },
            fail: function(error) {

              app.showErrNoCancel("跳转授权页失败", error.errMsg);

            }
          });
        }
      }).catch(error => {

        app.showErrNoCancel("授权异常！", error.errMsg);

      });
    }
  },
  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {
    
    this.loadBookList(true);
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {
    // this.loadBookList(false);
  },
  loadBookList: function(refresh) {
    app.showLoading("加载中");
    var that = this;
    db.collection('book_list').where({
        _openid: app.globalData.opendid
      }).get()
      .then(res => {
        wx.hideLoading();
        wx.stopPullDownRefresh();

        if (refresh) {
          that.data.bookList = res.data;
          that.data.pageIndex = res.data.length;
        } else {
          that.data.bookList = that.data.bookList.concat(res.data);
          that.data.pageIndex = that.data.pageIndex + res.data.length;
        }
        that.setData({
          bookList: that.data.bookList,
         
          enableEmpty: that.data.bookList.length == 0
        });
      }).catch(error => {
        app.showErr("数据异常", error.errMsg)
      });
  },
  tapCreateBooklist: function() {
    app.showLoadingMask('请稍后');
    wx.navigateTo({
      url: '../createBooklist/createBooklist',
      success: function() {
        wx.hideLoading();
      },
      fail: function(error) {

        app.showErrNoCancel('跳转异常', error.errMsg);
      }
    })
  },
  tapBook: function(event) {
    var book = event.currentTarget.dataset.book;
    console.log(book);
  }
})