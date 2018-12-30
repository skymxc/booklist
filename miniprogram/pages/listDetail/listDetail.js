// miniprogram/pages/listDetail/listDetail.js
const app = getApp();
const db = wx.cloud.database();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    _id: '',
    booklist: {},
    empty: false,
    tapBook: {},
    tapIndex: -1,
    selectVisibleClass: 'hide',
    books: [
    ]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    if(options._id){
      this.setData({
        _id:options._id
      });
        this.loadBooklist();
    }else{
      wx.showModal({
        title: '提示',
        content: '书单_id 获取错误',
        showCancel:false,
        success:function(){
          wx.navigateBack({
            
          });
        }
      })
    }
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {
    return {
      title: this.data.booklist.name
    }
  },
  /**
   * 加载 书单
   */
  loadBooklist: function() {
    wx.showLoading({
      title: '加载中',
    });
    var that = this;
    db.collection('book_list').doc(this.data._id).get()
      .then(res => {
        wx.hideLoading();
        if (res.data) {
          that.setData({
            booklist: res.data
          });
          wx.setNavigationBarTitle({
            title: that.data.booklist.name
          });
          that.loadbooks();
        } else {
          wx.showModal({
            title: '提示',
            content: '书单可能已经被删除了',
            showCancel: false,
            success: function(res) {
              if (res.confirm) {
                wx.navigateBack({

                });
              }
            }
          })
        }
      }).catch(error => {
        console.error(error);
        wx.hideLoading();
        wx.showModal({
          title: '错误',
          content: error.errMsg,
          showCancel: false,
          success: function(res) {
            if (res.confirm) {
              wx.navigateBack({

              });
            }
          }
        })
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
      booklist_id: this.data._id,
      _openid: this.data.booklist._openid
    }).get().then(res => {
      wx.hideLoading();
      if (res.data.length > 0) {
        that.setData({
          books: res.data
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
  /**
   * 添加书单
   */
  tapAddBook: function() {
      if(this.data.books.length>=20){
        app.showErrNoCancel('提示','每个书单最多添加20本书');
          return;
      }

  },
  /**
   * 书籍被点击
   */
  tapBook: function(event) {
    var book = event.currentTarget.dataset.book;
    var index = event.currentTarget.dataset.index;
    this.setData({
      tapBook: book,
      tapIndex: index,
      selectVisibleClass: ''
    });

  },
  /**
   * 编辑书单
   */
  tapEdit: function() {

  },
  /**
   * 取消选择
   */
  tapCancelSelect: function() {
    this.setData({
      tapBook: {},
      tapIndex: -1,
      selectVisibleClass: 'hide'
    });
  },
  /**
   * 删除书籍
   */
  tapDelBook: function() {
    app.showLoadingMask('请稍后');
    var that =this;
    db.collection('book').doc(this.data.tapBook._id).remove()
      .then(res => {
        wx.hideLoading();
        if(res.stats.removed>0){
          that.data.books.splice(that.data.tapIndex,1);
            that.setData({
              books:that.data.books,
              tapBook:{},
              tapIndex:-1,
              selectVisibleClass: 'hide'
            })
        }else{
          app.showErrNoCancel('删除失败！','removed==0');
        }
      }).catch(error => {
        wx.hideLoading();
        app.showErrNoCancel('删除失败！', error.errMsg);
      });
  },
  /**
   * 编辑书籍
   */
  tapEditBook: function() {
    this.tapCancelSelect();
  }
})