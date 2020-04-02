// miniprogram/pages/addbook/addbook.js
const app = getApp();

const Books = require('../../js/Book.js');


Page({

  /**
   * 页面的初始数据
   */
  data: {
    booklist_id:'',
    book:{}
  },
  onLoad:function(event){
    // app.globalData.openid = 'okOSP4ucoDqhYq98HB3sfRDUW_0s'
    console.log('onLoad',event)
    this.setData({
      booklist_id:event.booklist_id
    })
  },
  formSubmit:function(event){
    var value = event.detail.value;
    var name = value.name;
    var author = value.author
    var description = value.description;
    if(name.length==0){
      appwx.showToast({
        title: '请输入书籍名称',
        icon:'none'
      })
      return;
    }
    var book={
      name:name,
      description:description,
      booklist_id:this.data.booklist_id,
      author :author
    };
    this.data.book = book
   this.toAddBook()
  },
  toAddBook:function(){
    wx.showLoading({
      title: '添加中',
      mask:true
    })
    Books.countBook(this.data.booklist_id,this.data.book.name)
    .then(res=>this.addBook(res))
    .then(res=>{
      wx.hideLoading({
        complete: (res) => {},
      })
        if(res){
            console.log('添加书籍->',res)
            if(res._id){
              wx.showModal({
                title:'提示',
                content:'添加成功',
                confirmText:'继续添加',
                cancelText:'返回',
                success:res=>{
                  if(res.confirm){
                    
                  }else if(res.cancel){
                      wx.navigateBack({
                        complete: (res) => {},
                      })
                  }
                }
              })
            }else{
              
              wx.showToast({
                title: '请稍后重试',
                icon:'none'
              })
            }
        }
       
    }).catch(error=>{
      console.error('添加书失败',error)
      wx.hideLoading({
        complete: (res) => {},
      })
        wx.showModal({
          title:'添加失败',
          content:error.errMsg,
          confirmText:'重试',
          success:res=>{
            if(res.confirm){
                this.toAddBook()
            }else if(res.cancel){

            }
          }
        })
    });
    
  },
  addBook:function(res){
    console.log('countBook-',res)
    if(res.total!=0){
      wx.hideLoading({
        complete: (res) => {},
      })
      wx.showModal({
        title:'重复提示',
        content:this.data.book.name+' 已存在书单中',
        showCancel:false
      })
    }else{
     return Books.addBook(this.data.book)
    }
  }
})