// miniprogram/pages/createBookList/createBooklist.js
/**
 * 
 */
const app = getApp();


const Books = require('../../js/Book.js');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    tagValue: '',
    pageIndex: 0,
    pageSize: 10,
    tagList: [],
    saving: false,
    modalTitle: '创建失败',
    modalVisible: false,
    modalActions: [{
      name: '取消'
    }, {
      name: '重试',
      color: 'black'
    }, {
      name: '去反馈',
      color: 'green'
    }],
    modalContent: '',

    booklist:{}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.loadTag();
    
  },
  onShow:function(event){
    if(app.data.markCreateBLClose){
      app.data.markCreateBLClose =false
      wx.navigateBack({
        complete: (res) => {},
      })
    }
  },

  /**
   * 书单标签被点击
   * 被点击后会将被点击的标签追加在现在标签输入框的后面
   * 如果常用标签被点击完了就隐藏掉吧。
   * @param {标签点击事件} event 
   */
  tapTag: function (event) {
    var tag = event.currentTarget.dataset.tag;
    var index = event.currentTarget.dataset.index;
    this.data.tagValue = this.data.tagValue + ' ' + tag.name;
    this.data.tagList.splice(index, 1);
    this.setData({
      tagValue: this.data.tagValue,
      tagList: this.data.tagList
    });
  },

  /**
   * 标签输入事件侦听
   * @param {输入事件} event 
   */
  inputTagEvent: function (event) {

    this.data.tagValue = event.detail.value;

  },
  /**
   * 从后台加载常用标签
   */
  loadTag: function () {
    var that = this;
    Books.loadCommonTag()
      .then(res => {
        // console.log(res);
        that.setData({
          tagList: res.data,
          pageIndex: that.data.pageIndex + res.data.length
        })
      }).catch(error => {
        console.error('标签加载错误', error)
      })
  },

  /**
   * 提交表单
   * @param {表单提交事件} event 
   */
  formSubmit: function (event) {
    console.log(event.detail);
    var value = event.detail.value;
    var name = value.name;
    var description = value.description;
    var tag = value.tag.trim();
    var tagArray = [];
    if (tag.length > 0) {
      tagArray = tag.split(' ');
    }
    //将 空字符去掉
    var tags = tagArray.filter(tag=>tag.length>0)
 
    if (name.length == 0) {
      wx.showToast({
        title: '书单名字未填写',
        icon: 'none'
      })
      return;
    }

    var booklist = {
      name: name,
      description: description,
      tag: tags
    };
   
    this.toAddBookList(booklist)
  },
  /**
   * 去增加书单了
   * @param {书单}} booklist 
   */
  toAddBookList:function(booklist){
    wx.showLoading({
      title: '保存中',
      mask: true
    })
    var data = this.data
    data.saving = true
    data.booklist = booklist
    this.setData(data)
    Books.countBooklistByName(booklist.name)
      .then(res => this.addBookList(res, booklist))
    .then(res => {
      console.log('保存书单结果，', res)
      if(res){
        wx.hideLoading();
        this.handleAddResult(res)
      }
     
    }).catch(error => {
      console.error('书单创建失败', error)
      this.addBookListFail(error.errMsg)
    })

  },
  /**
   * 增加书单到后台 
   * @param {当前书单名称的数量} res 
   * @param {要增加的书单} booklist 
   */
  addBookList(res, booklist) {
    console.log('count-',res)
    if (res.total == 0) {
      return Books.addBookList(booklist)
    } else {
      wx.hideLoading({
        complete: (res) => {},
      })
      this.setData({
        saving: false
      })
      wx.showModal({
        title:'提示',
        showCancel: false,
        content: booklist.name + ' 已存在'
      })
    }
  },
  /**
   * 处理增加结果，添加成功后弹出选择框，处理去添加书籍和去书单详情
   * 添加失败后弹出提示框
   * @param {添加书单结果}} res 
   */
  handleAddResult: function (res) {
    this.setData({
      saving:false
    })
    if (res._id) {
      //创建成功
      app.data.markRefresh =true
      app.data.markCreateBLClose =true
      var _id = res._id;
      Books.calculateTag(this.data.booklist.tag)
      wx.showModal({
        title: '提示',
        content: '创建成功！',
        cancelText: '添加书籍',
        confirmText: '稍后添加',
        success: function (res) {
          if (res.confirm) {
            //去书单详情吧
            wx.showLoading({
              title: '请稍后',
              mask:true
            })
            wx.navigateTo({
              url: '../listDetail/listDetail?_id=' + _id,
              success: function () {
                wx.hideLoading();
              }
            })
          } else {
            //去添加书籍界面
            wx.showLoading({
              title: '请稍后',
              mask:true
            })
            wx.navigateTo({
              url:'../addbook/addbook?booklist_id='+_id+"&src=create",
              success:function(){
                
                wx.hideLoading();
              }
            });
          }
        }
      })
    } else {
      this.addBookListFail('未知异常');
    }
  },
  /**
   * 处理反馈和重试点击
   * @param {失败提示选项点击处理} detail 
   */
  handleModalClick: function ({
    detail
  }) {
    const index = detail.index;
   this.setData({
     modalVisible:false
   })
    if (index == 1) {
      //重试
      this.toAddBookList(this.data.booklist)
    } else if (index == 2) {
      //去反馈
      wx.showModal({
        title: '反馈提示',
        content: '首页右下角点击「建议」进入反馈界面',
        success: function (res) {
          if (res.confirm) {
            wx.reLaunch({
              url: '../booklist/booklist',
              success: function () {

              },
              fail: function (error) {
                console.error('去反馈失败了，', error)
              }
            })
          } else {
            
          }
        }
      })
    }

  },
  /**
   * 增加失败后的处理，弹出一个模态框和错误提示
   * @param {添加失败消息} msg 
   */
  addBookListFail: function (msg) {
    var data = this.data;
    data.modalVisible = true
    data.modalContent = msg
    data.saving =false
    this.setData(data)
  }
})