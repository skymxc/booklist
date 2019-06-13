// miniprogram/pages/booklistshare/booklistshare.js
/**
 * 这是一个从分享打开的书单
 */
const app = getApp();
const db = wx.cloud.database();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    _id: '',
    books: [],
    bl: {},
    author: {},
    empty: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    console.log('options', options);
    this.data._id = options._id;
    this.load();
  },
  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },
  load: function() {
    this.loadBooklist();
    // this.loadAuthor();
    this.loadbooks();
    wx.stopPullDownRefresh();
  },
  loadBooklist: function() {
    app.showLoading('加载中');
    var that = this;
    console.log('_id',this.data._id)
    db.collection('book_list').doc(this.data._id).get()
      .then(res => {
        wx.hideLoading();
        if (res.data) {
          that.setData({
            bl: res.data
          })
          that.loadAuthor(res.data._openid);
        } else {
          wx.showModal({
            title: '提示',
            content: '书单不存在，可能已经被作者删除',
            showCancel: false,
            success: function() {
              wx.redirectTo({
                url: '../booklist/booklist',
              })
            }
          })
        }
      }).catch(error => {
        
        wx.hideLoading();
        wx.showModal({
          title: '提示',
          content: error.errMsg,
          cancelText: '重试',
          confirmText: '返回',
          success: function(res) {
            if (res.confirm) {
              wx.redirectTo({
                url: '../booklist/booklist',
              })
            } else {
              that.load();
            }
          }
        })
      })
  },
  /**
   * 加载作者
   */
  loadAuthor: function(authorid) {
    wx.showLoading({
      title: '加载中',
    });
    var that = this;
    db.collection('user').where({
      _openid: authorid
      }).get()
      .then(res => {
        wx.hideLoading();
        if (res.data.length > 0) {
          that.setData({
            author: res.data[0]
          })
        }
      }).catch(error => {
        wx.hideLoading();
        app.showToast(error.errMsg);
      });
  },
  /**
   * 加载书单的书
   */
  loadbooks: function() {
    wx.showLoading({
      title: '加载中',
    });
    var that = this;
    db.collection('book').where({
      booklist_id: this.data._id
    }).get().then(res => {
      wx.hideLoading();
      if (res.data.length > 0) {
        that.setData({
          books: res.data
        });
        that.setData({
          empty: false
        });
      } else {
        that.setData({
          empty: true
        });
      }
    }).catch(error => {
      wx.hideLoading();
      wx.showModal({
        title: '错误',
        content: error.errMsg,
        showCancel: false,
        success: function(res) {
          if (res.confirm) {
            that.setData({
              empty: true
            });
          }
        }
      })
    });
  },
  tapIndex:function(){
    wx.redirectTo({
      url: '../booklist/booklist',
    })
  }
})