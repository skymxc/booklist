// miniprogram/pages/editBooklist/editBooklist.js
const app =getApp();
const db = wx.cloud.database();
const Books = require('../../js/Book.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
      bl:{},
      tagValue:'',
    tagList: [],
    pageIndex:0,
    pageSize:20,
    updateBl:{},
    modalTitle: '保存失败',
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
    saving:false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that =this;
    wx.getStorage({
      key: 'editbooklist',
      success: function(res) {
        var array = res.data.tag;
        var size = array.length;
        var str = '';
        for(var i=0;i<size;i++){
          str +=array[i]+' ';
        }
          that.setData({
            bl:res.data,
            tagValue:str,
            tagList:array
          })
        that.loadTag();
      },
      fail:function(error){
        wx.showModal({
          title: '提示',
          content: error.errMsg,
          showCancel:false,
          success:function(res){
            if(res.confirm){
              wx.navigateBack({
                
              })
            }
          }
        })
      }
    })
   
  },
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
  inputTagEvent: function (event) {

    this.data.tagValue = event.detail.value;

  },
  loadTag: function () {
    var that = this;
    Books.loadCommonTagNotInArray(this.data.tagList)
      .then(res => {
        console.log('常用标签',res);
        that.setData({
          tagList: res.data
        })
      }).catch(error => {
        console.error('常用标签,',error)
        wx.showToast({
          title: error.errMsg,
          icon:'none'
        })
      })
  },
  formSubmit: function (event) {
    console.log(event.detail);
    var value = event.detail.value;
    var name = value.name;
    var description = value.description;
    var tag = value.tag.trim();
    var tagArray = [];
    if (tag.length > 0) {
      tagArray = tag.split(' ')

    }
       //将 空字符去掉
       var tags = tagArray.filter(tag=>tag.length>0)
 
    // var privateCB = value.private;
    // var publicCB = privateCB.length==0;

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
      // public:publicCB
    };
    this.data.updateBl = booklist
    
    this.toUpdate()

  },
  toUpdate:function(){
    wx.showLoading()
    this.setData({
      saving:true
    })
    Books.updateBookListById(this.data.bl._id,this.data.updateBl)
    .then(res=>{
      wx.hideLoading();
      console.log('保存书单',res);
      this.setData({
        saving:false
      })
      if(res.stats.updated==1){
        wx.showToast({
          title: '成功',
        })
        app.data.refresh = true
    }else{
       wx.showToast({
         title: '没有保存成功哦',
         icon:'none'
       })
    }
    }).catch(error=>{
      wx.hideLoading({
        complete: (res) => {},
      })
      console.error('保存失败',error)
      this.setData({
        modalVisible:true,
        modalContent:error.errMsg,
        modalTitle:'保存失败',
        saving:false
      })
    })
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
     
      if(this.data.modalTitle=='删除失败'){
        this.toDelete()
      }else{
        this.toUpdate()
      }
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
  onUnload:function(){
    
      wx.removeStorage({
        key: 'editbooklist',
        success: function(res) {},
      })
  },
  onDeleteTap:function(event){
      wx.showModal({
        title:'删除确认',
        content:'确认删除 '+this.data.bl.name+'吗？会连带删除书单内的书籍',
        success:res=>{
            if(res.confirm){
              this.toDelete()
            }else if(res.cancel){

            }
        }
      })
  },
  toDelete:function(){
    wx.showLoading({
      title: '删除中',
      mask:true
    })
    Books.delBookListById(this.data.bl._id)
    .then(res=>this.handleDelBooklist(res))
    .then(res=>{
          console.log('删除所属书籍-', res)
          wx.hideLoading();
          if (res) {
            wx.showToast({
              title: '删除成功',
            })
           wx.showModal({
             title:'删除成功',
             content:'成功删除 「'+this.data.bl.name+'」及书籍',
             showCancel:false,
             success:res=>{
               if(res.confirm){
                this.handleDeleteBack()
               }
             }
           })
          }
    })
    .catch(error=>{
        console.error('删除失败',error)
        wx.hideLoading({
          complete: (res) => {},
        })
        this.setData({
          modalTitle:'删除失败',
          modalContent:error.errMsg,
          modalVisible:true
        })
    })
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
      return Books.delBookBylistId(this.data.bl._id)

    } else if(res.stats.removed==0){
      wx.hideLoading()
      //数据可能不存在了
      wx.showModal({
        title:'删除成功',
        content:'成功删除 「'+this.data.bl.name+'」及书籍',
        showCancel:false,
        success:res=>{
          if(res.confirm){
            this.handleDeleteBack()
          }
        }
      })
    }else {
      wx.hideLoading()
      wx.showModal({
        content: '网路可能不稳定或者是重复删除',
        title: '删除失败',
        showCancel: false
      })

    }
  },
  /**
   * 保存删除标示并返回
   */
  handleDeleteBack:function(){
    wx.showLoading({
      title: '加载中',
      mask:true
    })
    
    wx.setStorage({
      data: 'true',
      key: app.data.markDeleteBooklist
    }).then(res=>{
      wx.navigateBack({
        complete: (res) => {},
      })
    }).catch(error=>{
      console.error('handleDeleteBack',error)
      wx.navigateBack({
        complete: (res) => {},
      })
    })
   
  }
})