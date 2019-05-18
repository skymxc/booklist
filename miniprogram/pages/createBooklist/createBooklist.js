// miniprogram/pages/createBookList/createBooklist.js
const app =getApp();
const db = wx.cloud.database();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    tagValue:'',
    pageIndex:0,
    pageSize:10,
    tagList:[]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
      this.loadTag();
  },
  tapTag:function(event){
    var tag = event.currentTarget.dataset.tag;
    var index = event.currentTarget.dataset.index;
    this.data.tagValue = this.data.tagValue+' '+tag.name;
    this.data.tagList.splice(index,1);
    this.setData({
      tagValue:this.data.tagValue,
      tagList: this.data.tagList
    });
    //如果没有了，就去数据库获取吧，获取下一页
    if(this.data.tagList.length==0){
      this.loadTag();
    }
  },
  inputTagEvent:function(event){
   
    this.data.tagValue = event.detail.value;
    
  },
  loadTag:function(){
    var that = this;
    db.collection('tag').orderBy('use_num','desc').skip(this.data.pageIndex).limit(this.data.pageSize).get()
    .then(res=>{
      // console.log(res);
      that.setData({
        tagList:res.data,
        pageIndex : that.data.pageIndex+res.data.length
      })
    }).catch(error=>{
      app.showErrNoCancel('加载异常',error.errMsg);
    })
  },
  formSubmit:function(event){
    console.log(event.detail);
    var value = event.detail.value;
    var name = value.name;
    var description = value.description;
    var tag = value.tag;
    var tagArray = [];
    if(tag.length>0){
        tagArray = tag.split(' ');
        
    }
    // var privateCB = value.private;
    // var publicCB = privateCB.length==0;

    if(name.length==0){
      wx.showToast({
        title: '书单名字未填写',
        icon:'none'
      })
      return;
    }
    
    var booklist = {
      name:name,
      description:description,
      tag:tagArray
      // public:publicCB
    };
    app.showLoadingMask('请稍后');
    db.collection('book_list').add({
      data:booklist
    }).then(res=>{
      wx.hideLoading();
      // console.log(res);
      
      app.showLoadingMask('跳转中')
      wx.reLaunch({
        url: '../booklist/booklist',
        success:function(){
          wx.hideLoading();
        },
        fail:function(error){
          app.showErrNoCancel('跳转失败',error.errMsg);
        }
      })
    }).catch(error=>{
     
      app.showErrNoCancel('创建失败！',error.errMsg);
    })


  }
})