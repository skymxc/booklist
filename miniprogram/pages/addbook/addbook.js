// miniprogram/pages/addbook/addbook.js
const app = getApp();
const db = wx.cloud.database();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    booklist_id:'XB9TWsDR1TiNDAap'
  },
  onLoad:function(event){
    
    this.setData({
      booklist_id:event.booklist_id
    })
  },
  formSubmit:function(event){
    var value = event.detail.value;
    var name = value.name;
    var description = value.description;
    if(name.length==0){
      app.showErrNoCancel('添加提示','书籍名称不能为空！');
      return;
    }
    var book={
      name:name,
      description:description,
      booklist_id:this.data.booklist_id
    };
    app.showLoadingMask('请稍后');
    db.collection('book').add({
      data:book
    }).then(res=>{
        wx.hideLoading();
        wx.showToast({
          title: '添加成功',
        })
        wx.navigateBack({
          
        })
    }).catch(error=>{
      app.showErrNoCancel('添加失败！', error.errMsg);
    });
  }
})