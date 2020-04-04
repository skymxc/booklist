// miniprogram/pages/booklistshare/booklistshare.js
/**
 * 这是一个从分享打开的书单
 */
const app = getApp();
const db = wx.cloud.database();
const Books = require('../../js/Book.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    _id: '',
    books: [],
    bl: {},
    empty: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    console.log('options', options);
    this.data._id = options._id;
    this.loadBooklist();
    wx.startPullDownRefresh({
      complete: (res) => {},
    })
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {
    return {
      title: this.data.booklist.name,
      path:'/pages/booklistshare/booklistshare?_id='+this.data._id
    }
  },
  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {
    this.loadbooks()
  },
  loadBooklist: function() {
    wx.showLoading({
      title: '加载中',
      mask:true
    })
    var that = this;
    Books.getBookList(this.data._id)
      .then(res => {
        wx.hideLoading();
          console.log('getBookList-',res)
        if (res.data) {
          that.setData({
            bl: res.data
          })
          
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
        console.error('getBookList-',error)
        wx.hideLoading();
        wx.showModal({
          title: '提示',
          content: error.errMsg,
          cancelText: '重试',
          confirmText: '首页',
          success: function(res) {
            if (res.confirm) {
              wx.redirectTo({
                url: '../booklist/booklist',
              })
            } else if(res.cancel) {
              this.loadBooklist()
              wx.startPullDownRefresh({
                complete: (res) => {},
              })
            }
          }
        })
      })
  },
  /**
   * 加载书单的书
   */
  loadbooks: function() {
   
    var that = this;
    Books.loadBooks(this.data._id)
    .then(res => {
     wx.stopPullDownRefresh({
       complete: (res) => {},
     })
     console.log('loadbooks-',res)
      if (res.data.length > 0) {
        that.setData({
          books: res.data,
          empty: false
        });
      } else {
        that.setData({
          empty: true
        });
        wx.showToast({
          title: '还没有添加书籍哦！',
          icon:'none'
        })
      }
    }).catch(error => {
      console.log('loadbooks-',error)
      wx.stopPullDownRefresh({
        complete: (res) => {},
      })
      wx.showModal({
        title: '书籍加载错误',
        content: error.errMsg,
      confirmText:'重试',
        success: function(res) {
          if (res.confirm) {
            wx.startPullDownRefresh({
              complete: (res) => {},
            })
          }else if(res.cancel){
            that.setData({
              empty: true
            });
          }
        }
      })
    });
  },
  onTapBook:function(event){
    var book = event.currentTarget.dataset.book;
    wx.showLoading({
      title: '加载中',
      mask:true
    })
    wx.navigateTo({
      url: '../bookDetail/bookDetail?_id='+book._id+'&name='+book.name+'&description='+book.description+'&booklist_id='+book.booklist_id+'&author='+book.author,
      success:function(){
        wx.hideLoading();
      },
      fail:function(error){
        console.error('跳转错误',error.errMsg);
        wx.hideLoading({
          complete: (res) => {},
        })
        wx.showToast({
          title: error.errMsg,
          icon:'none'
        })
      }
    })
  }
})