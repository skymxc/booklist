// miniprogram/pages/listDetail/listDetail.js
const app = getApp();
const db = wx.cloud.database();
const Books = require('../../js/Book.js');


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
    console.log("_id->",options)
    if(options._id){
      this.setData({
        _id:options._id
      });
        
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
  onShow:function(){
    var res = wx.getStorageInfoSync()
    console.log('res',res,res.keys.indexOf(app.data.markDeleteBooklist),app.data.markDeleteBooklist)
    if(res.keys.indexOf(app.data.markDeleteBooklist)!=-1){
      wx.removeStorageSync(app.data.markDeleteBooklist)
      app.data.refresh =true
        wx.navigateBack({
          complete: (res) => {},
        })
    }else{
      if(this.data._id.length>0){
        this.loadBooklist();
      }
    }
   
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {
    return {
      title: this.data.booklist.name,
      path:'/pages/booklistshare/booklistshare?_id='+this.data.booklist._id
    }
  },
  onPullDownRefresh:function(){
    this.loadbooks()
  },
  /**
   * 加载 书单
   */
  loadBooklist: function() {
    wx.showLoading({
      title: '加载中',
      mask:true
    });
    var that =this
    Books.getBookList(this.data._id)
      .then(res => {
        wx.hideLoading();
        if (res.data) {
          this.setData({
            booklist: res.data
          });
          wx.setNavigationBarTitle({
            title: this.data.booklist.name
          });
          wx.startPullDownRefresh()
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
        console.error('书单加载',error);
        wx.hideLoading();
        wx.showModal({
          title: '错误',
          content: error.errMsg,
          confirmText:'重试',
          cancelText:'取消',
          success: function(res) {
            if (res.confirm) {
              that.loadBooklist()
            }else if(res.cancel){
              wx.navigateBack({
                complete: (res) => {},
              })
            }
          }
        })
      });
  },
  /**
   * 加载书单的书
   */
  loadbooks: function() {
    Books.loadBooks(this.data._id)
    .then(res => {
      console.log('书籍加载',res)
     wx.stopPullDownRefresh()
      if (res.data.length > 0) {
        this.setData({
          books: res.data,
          empty:false
        });
      } else {
        this.setData({
          empty: true,
          books:[]
        });
        wx.showToast({
          title: '还没有添加书籍',
          icon:'none'
        })
      }
    }).catch(error => {
      console.error('加载书籍错误',error)
      wx.stopPullDownRefresh()
      wx.showModal({
        title: '书籍加载错误',
        content: error.errMsg,
        confirmText:'重试',
        success: function(res) {
          if (res.confirm) {
            wx.startPullDownRefresh()
          }else if(res.cancel){
            this.setData({
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
      app.showLoadingMask('请稍候')
      wx.navigateTo({
        url:'../addbook/addbook?booklist_id='+this.data._id+"&src=detail",
        success:function(){
          wx.hideLoading();
        },
        fail:function(error){
          app.showErrNoCancel('跳转异常',error.errMsg);
        }
      });

  },
  /**
   * 书籍被点击
   */
  onTapBook: function(event) {
    var book = event.currentTarget.dataset.book;
    wx.showLoading({
      title: '加载中',
      mask:true
    })
    var url ='../editbook/editbook?_id='+book._id+'&name='+book.name+'&description='+book.description+'&booklist_id='+book.booklist_id
    if(book.author){//兼容之前版本没有作者
      url ='../editbook/editbook?_id='+book._id+'&name='+book.name+'&description='+book.description+'&booklist_id='+book.booklist_id+'&author='+book.author
    }
    wx.navigateTo({
      url: url,
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
  },
  /**
   * 编辑书单
   */
  onTapEditBookList: function() {
    wx.showLoading({
      title: '加载中',
      mask:true
    })
    wx.setStorage({
      key: 'editbooklist',
      data: this.data.booklist,
      success: function () {
        wx.hideLoading()
        app.navigateTo('../editBooklist/editBooklist')
      },
      fail: function (err) {
        console.error('跳转到编辑失败', err)
        wx.hideLoading()
        wx.showModal({
          cancelColor: 'cancelColor',
          showCancel: false,
          content: err.errMsg,
          title: '跳转失败'
        })

      }
    })
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
              selectVisibleClass: 'hide',
              empty:that.data.books.length==0
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
    var book = this.data.tapBook;
    this.tapCancelSelect();
    app.showLoadingMask('请稍候');
    wx.navigateTo({
      url: '../editbook/editbook?_id='+book._id+'&name='+book.name+'&description='+book.description+'&booklist_id='+book.booklist_id,
      success:function(){
        wx.hideLoading();
      },
      fail:function(error){
        app.showErrNoCancel('跳转错误',error.errMsg);
      }
    })
  
  }
})