// miniprogram/pages/editBooklist/editBooklist.js
const app =getApp();
const db = wx.cloud.database();
Page({

  /**
   * 页面的初始数据
   */
  data: {
      bl:{},
      tagValue:'',
    tagList: [],
    pageIndex:0,
    pageSize:20
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
            tagValue:str
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
    //如果没有了，就去数据库获取吧，获取下一页
    if (this.data.tagList.length == 0) {
      this.loadTag();
    }
  },
  inputTagEvent: function (event) {

    this.data.tagValue = event.detail.value;

  },
  loadTag: function () {
    var that = this;
    db.collection('tag').orderBy('use_num', 'desc').skip(this.data.pageIndex).limit(this.data.pageSize).get()
      .then(res => {
        // console.log(res);
        that.setData({
          tagList: res.data,
          pageIndex: that.data.pageIndex + res.data.length
        })
      }).catch(error => {
        app.showErrNoCancel('加载异常', error.errMsg);
      })
  },
  formSubmit: function (event) {
    console.log(event.detail);
    var value = event.detail.value;
    var name = value.name;
    var description = value.description;
    var tag = value.tag;
    var tagArray = [];
    if (tag.length > 0) {
      tagArray = tag.split(' ');

    }
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
      tag: tagArray
      // public:publicCB
    };
    app.showLoadingMask('请稍后');
    db.collection('book_list').doc(this.data.bl._id).update({
      data:booklist
    }).then(res => {
      wx.hideLoading();
      // console.log(res);
        if(res.stats.updated==1){
            wx.showToast({
              title: '成功',
            })
        }else{
            app.showToast('失败！')
        }
      
    }).catch(error => {

      app.showErrNoCancel('创建失败！', error.errMsg);
    })


  },
  onUnload:function(){
    
      wx.removeStorage({
        key: 'editbooklist',
        success: function(res) {},
      })
  }
})