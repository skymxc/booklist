// miniprogram/pages/booklist/booklist.js
const app = getApp();
const db = wx.cloud.database();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    bookList: [],
    enableEmpty: false,
    modalTitle:'',
    modalVisible:false,
    modalContent:'请选择操作',
    modalActions:[{
      name:'删除',
      color:'red'
    },{
      name:'编辑',
      color:'green'
    },{
      name:'取消'
    }],
    modalBook:{},
    modalBookIndex:-1
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

      var that = this;
      app.showLoadingMask('正在检查授权');
      app.handlePermissionAndGetUserInfo().then(res => {
        if (res.auth) {

          app.showLoadingMask('登陆中');
          app.login().then(res => {
            wx.hideLoading();
            //获取数据 booklist
            that.loadBookList(true);
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

        wx.reLaunch({
          url: '../authorize/authorize',
          success: function () {
            wx.hideLoading();
          },
          fail: function (error) {

            app.showErrNoCancel("跳转授权页失败", error.errMsg);

          }
        });

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
        _openid: app.globalData.openid
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
    if(this.data.bookList.length>=20){
      app.showErrNoCancel('提示', '最多创建20个书单，目前：' + this.data.bookList.length)
      return;
    }
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
    app.showLoadingMask('请稍后');
    wx.navigateTo({
      url: '../listDetail/listDetail?_id='+book._id,
      success:function(){
        wx.hideLoading();
      }
    })
  },
  longTapBook: function (event){
    var book = event.currentTarget.dataset.book;
    var index = event.currentTarget.dataset.index;
    this.setData({
      modalBook:book,
      modalTitle:book.name,
      modalVisible:true,
      modalBookIndex:index
    })
  },
  handleModalClick: function ({ detail }){
    const index = detail.index;
    var that =this;
    if (index === 0) {
      
      app.showLoadingMask('删除中');
      var that =this;
      db.collection('book_list')
      .doc(this.data.modalBook._id).remove()
      .then(res=>this.handleDelBooklist(res))
      .then(res=>{
        console.log('删除所属书籍-',res)
        wx.hideLoading();
        if(res){
          wx.showToast({
            title: '删除成功',
          })
          that.data.bookList.splice(that.data.modalBookIndex, 1);
          that.setData({
            bookList: that.data.bookList
          })
        }
      })
      .catch(error=>{
        app.showErrNoCancel('删除失败',error.errMsg);
      })
    } else if (index === 1) {
      app.showLoadingMask('请稍后');
      wx.setStorage({
        key: 'editbooklist',
        data: that.data.modalBook,
        success:function(){
          app.navigateTo('../editBooklist/editBooklist')
        },
        fail:function(err){
          app.showErrNoCancel('编辑失败',err.errMsg);
        }
      })
    }

    this.setData({
      modalVisible: false
    });
  },
  handleDelBooklist(res){
    if (res.stats.removed == 1) {
      //删除书单里的书籍
      var that =this;
       return wx.cloud.callFunction({
        name:'delBookBylistId',
        data:{
          listid:that.data.modalBook._id
        }
      });
      
    } else {
     
      app.showToast('删除失败')
    }
  }
})