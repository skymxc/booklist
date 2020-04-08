// miniprogram/pages/booklist/booklist.js
const {
  $Message
} = require('../../dist/base/index');
const Users = require('../../js/User.js');
const Books = require('../../js/Book.js');
const app = getApp();
const db = wx.cloud.database();

var startX, endX;

var moveFlag = true;// 判断执行滑动事件


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
      mask:true
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
  onShow:function(options){
    console.log('onShow')
    if(app.globalData.openid){
     if(app.data.markRefresh){
       wx.startPullDownRefresh({
         complete: (res) => {
           app.data.markRefresh =false
         },
       })
     }
    }
    
  
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
      } else {
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
        console.log("从后台获取到的书单", res)
        wx.stopPullDownRefresh();

        that.data.bookList = res.data;

        that.setData({
          bookList: that.data.bookList,
          enableEmpty: that.data.bookList.length == 0
        });

        this.saveBookListToStorage()

      }).catch(error => {
        wx.stopPullDownRefresh();
        console.error("书单加载错误->", error)
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
  saveBookListToStorage: function () {
    var data = this.data.bookList;
    wx.setStorage({
      data: data,
      key: 'bookList',
      success: function () {
        console.log("缓存到本地成功-", data)
      },
      fail: function (err) {
        console.error("缓存到本地失败", err)
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
        console.log("跳转到创建异常，", error)
        wx.showModal({
          showCancel: false,
          content: '跳转异常'
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
    wx.showLoading({
      title: '请稍后',
      mask:true
    })
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
  /**
   * 根据点击的按钮顺序处理相应的点击事件
   * 处理的事件有，0，删除，1编辑，
   * @param {点击事件} param0 
   */
  handleModalClick: function ({
    detail
  }) {
    const index = detail.index;
    var that = this;
    if (index === 0) {
      wx.showLoading({
        title: '删除中',
        mask:true
      })
      var that = this;
      Books.delBookListById(this.data.modalBook._id)
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
            this.saveBookListToStorage()
          }
        })
        .catch(error => {
          console.error('删除书单失败', error)
          wx.hideLoading()
          wx.showModal({
            content: error.errMsg,
            title: '删除失败',
            showCancel: false
          })
        })
    } else if (index === 1) {
      wx.showLoading({
        title: '加载中',
        mask:true
      })
      wx.setStorage({
        key: 'editbooklist',
        data: that.data.modalBook,
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
    }

    this.setData({
      modalVisible: false
    });
  },
  /**
   * 根据删除书单的结果删除书籍，
   * 如果书单删除成功就删除书籍。否则就给出提示
   * @param {删除书单的结果} res 
   */
  handleDelBooklist(res) {
    console.log('删除书单，',res)
    if (res.stats.removed == 1) {
      //删除书单里的书籍
      return Books.delBookBylistId(this.data.modalBook._id)

    } else {
      wx.hideLoading()
      wx.showModal({
        content: '网路可能不稳定或者是重复删除',
        title: '删除失败',
        showCancel: false
      })

    }
  },
  onTouchStart:function(event){
    startX = event.touches[0].pageX; // 获取触摸时的原点
    console.log('onTouchStart',event)
    moveFlag = true;

  },
  onTouchMove:function(event){
    endX = event.touches[0].pageX; // 获取触摸时的原点

    if (moveFlag) {

      if (endX - startX > 50) {

        console.log("move right");

        moveFlag = false;

      }

      if (startX - endX > 50) {

        console.log("move left");

        moveFlag = false;

      }

    }
  },
  onTouchEnd:function(event){
    moveFlag = true; // 恢复滑动事件
  }
})