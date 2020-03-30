// miniprogram/pages/booklist/booklist.js
const {
  $Message
} = require('../../dist/base/index');
const Users = require('../../js/User.js');

const app = getApp();
const db = wx.cloud.database();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    bookList: [],
    modalTitle: '',
    modalVisible: false,
    modalContent: '请选择操作',
    modalActions: [{
      name: '删除',
      color: 'red'
    }, {
      name: '编辑',
      color: 'green'
    }, {
      name: '取消'
    }],
    modalBook: {},
    modalBookIndex: -1,
    enableEmpty: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

    wx.showLoading({
      title: '加载中',
    })
    var openid = Users.getOpenid();
    openid.then(res => {
        console.log('openid->', res)
        if (res) {
          app.globalData.openid = res
          //从本地缓存中去数据
            this.loadBookListFromStorage()
        } else {
          wx.showModal({
            cancelColor: 'cancelColor',
            content: 'openid 错误'
          })
        }
      })
      .catch(error => {
        console.error("获取openID 出现错误-" + error)
        wx.showModal({
          showCancel: false,
          content: error,
          success: function (response) {

          }
        })
      });
  },
  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    wx.hideLoading()
    this.loadBookList();
  },
  /**
   * 从缓存里加载
   * 加载成功后后直接显示，然后从后台刷新出最新数据
   * 加载失败或者没有数据时出发刷新，从后台获取
   */
  loadBookListFromStorage: function () {
    var that = this;
    wx.getStorage({
      key: 'bookList',
    }).then(res => {
      console.log("storage data-", res)
      if (res) {
        that.data.bookList = res;
          wx.hideLoading()
        that.setData({
          bookList: that.data.bookList,
          enableEmpty: that.data.bookList.length == 0
        });
        //从后台刷新数据
        this.loadBookList()
      }else{
        wx.startPullDownRefresh()
      }
    }).catch(error => {
      console.error("从缓存里取书单错误，", error)
        wx.startPullDownRefresh()
    })
  },
  /**
   * 从后台加载数据并缓存到本地
   */
  loadBookList: function () {
    var that = this;
    
    db.collection('book_list').where({
        _openid: app.globalData.openid
      }).get()
      .then(res => {
        console.log("从后台获取到的书单",res)
        wx.stopPullDownRefresh();

        that.data.bookList = res.data;

        that.setData({
          bookList: that.data.bookList,
          enableEmpty: that.data.bookList.length == 0
        });

        this.saveBookListToStorage()

      }).catch(error => {
        wx.stopPullDownRefresh();
        console.error("书单加载错误->",error)
        wx.showModal({
          showCancel: false,
          content: error,
          title: "提示",
          success: (res) => {
            if (res.confirm) {
              wx.startPullDownRefresh()
            }
          }
        })
        // app.showErr("数据异常", error.errMsg)
      });
  },

  /**
   * 保存当前显示的书单到本地缓存
   */
  saveBookListToStorage:function(){
   var data = this.data.bookList;
    wx.setStorage({
      data: data,
      key: 'bookList',
      success:function(){
        console.log("缓存到本地成功-",data)
      },
      fail:function(err){
        console.error("缓存到本地失败",err)
      }
    })
  },
  /**
   * 创建书单被点击
   */
  tapCreateBooklist: function () {
    if (this.data.bookList.length >= 20) {
      app.showErrNoCancel('提示', '最多创建20个书单，目前：' + this.data.bookList.length)
      return;
    }
    wx.showLoading({
      title: '请稍后',
    })
    wx.navigateTo({
      url: '../createBooklist/createBooklist',
      success: function () {
        wx.hideLoading();
      },
      fail: function (error) {
        console.log("跳转到创建异常，",error)
        wx.showModal({
          showCancel:false,
          content:'跳转异常'
        })
        
      }
    })
  },

  /**
   * 书单被点击
   * @param {*} event 
   */
  tapBook: function (event) {
    var book = event.currentTarget.dataset.book;
    app.showLoadingMask('请稍后');
    wx.navigateTo({
      url: '../listDetail/listDetail?_id=' + book._id,
      success: function () {
        wx.hideLoading();
      }
    })
  },
  /**
   * 书单被长按
   * @param {*} event 
   */
  longTapBook: function (event) {
    var book = event.currentTarget.dataset.book;
    var index = event.currentTarget.dataset.index;
    this.setData({
      modalBook: book,
      modalTitle: book.name,
      modalVisible: true,
      modalBookIndex: index
    })
  },
  handleModalClick: function ({detail
  }) {
    const index = detail.index;
    var that = this;
    if (index === 0) {

      app.showLoadingMask('删除中');
      var that = this;
      db.collection('book_list')
        .doc(this.data.modalBook._id).remove()
        .then(res => this.handleDelBooklist(res))
        .then(res => {
          console.log('删除所属书籍-', res)
          wx.hideLoading();
          if (res) {
            wx.showToast({
              title: '删除成功',
            })
            that.data.bookList.splice(that.data.modalBookIndex, 1);
            that.setData({
              bookList: that.data.bookList
            })
          }
        })
        .catch(error => {
          app.showErrNoCancel('删除失败', error.errMsg);
        })
    } else if (index === 1) {
      app.showLoadingMask('请稍后');
      wx.setStorage({
        key: 'editbooklist',
        data: that.data.modalBook,
        success: function () {
          app.navigateTo('../editBooklist/editBooklist')
        },
        fail: function (err) {
          app.showErrNoCancel('编辑失败', err.errMsg);
        }
      })
    }

    this.setData({
      modalVisible: false
    });
  },
  handleDelBooklist(res) {
    if (res.stats.removed == 1) {
      //删除书单里的书籍
      var that = this;
      return wx.cloud.callFunction({
        name: 'delBookBylistId',
        data: {
          listid: that.data.modalBook._id
        }
      });

    } else {

      app.showToast('删除失败')
    }
  }
})