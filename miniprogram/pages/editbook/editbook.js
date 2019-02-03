// miniprogram/pages/editbook/editbook.js
const app = getApp();
const db = wx.cloud.database();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    book:{}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
      if(options.name){
          var book={
            name:options.name,
            description:options.description,
            _id:options._id,
            booklist_id:options.booklist_id
          }
          this.setData({
            book:book
          });
      }else{
        wx.showModal({
          title: '提示',
          content: '书籍获取错误',
          showCancel: false,
          success: function () {
            wx.navigateBack({

            });
          }
        })
      }
  },
  formSubmit:function(event){
    var value = event.detail.value;
    var name = value.name;
    var description = value.description;
    if (name.length == 0) {
      app.showErrNoCancel('添加提示', '书籍名称不能为空！');
      return;
    }

    app.showLoadingMask('请稍后');
    db.collection('book').doc(this.data.book._id).update({
      data:{
        name:name,
        description:description
      }
    }).then(res => {
      wx.hideLoading();
      wx.showToast({
        title: '保存成功',
      })
    }).catch(error => {
      app.showErrNoCancel('保存失败！', error.errMsg);
    });
  }
})