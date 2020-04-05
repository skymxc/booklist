// miniprogram/pages/editbook/editbook.js
const app = getApp();
const Books = require('../../js/Book.js');
/**
 * 这里隐藏一个 bug，没有检测书名重复。
 */
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
      console.log('onload,',options)
      if(options.name){
          var book={
            name:options.name,
            description:options.description,
            _id:options._id,
            booklist_id:options.booklist_id,
            author:options.author
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
  /**
   * 去提交表单
   * @param {表单}} event 
   */
  formSubmit:function(event){
    var value = event.detail.value;
    var name = value.name;
    var author =value.author
    var description = value.description;
    if (name.length == 0) {
      wx.showToast({
        title: '书籍名称',
        icon:'none'
      })
      return;
    }
   
    this.data.book.name = name
    this.data.book.author = author
    this.data.book.description = description
    this.toUpdateBook()
  },
  toUpdateBook:function(){
    wx.showLoading({
      title: '保存中',
      mask:true
    })
    var book={
        name:this.data.book.name,
        author:this.data.book.author,
        description:this.data.book.description
    }
    Books.updateBook(this.data.book._id,book)
    .then(res=>{
      if(res){
        wx.hideLoading({
          complete: (res) => {},
        })
        console.log('保存书籍,',res)
        if(res.stats.updated==1){
            wx.showToast({
              title: '成功',
              icon:'success'
            })
        }else{
          wx.showToast({
            title: '没有成功',
            icon:"none"
          })
        }
      }
    })
    .catch(error=>{
      console.error('更改书籍-',error)
      wx.hideLoading({
        complete: (res) => {},
      })
      wx.showModal({
        title:'保存失败',
        content:error.errMsg,
        confirmText:'重试',
        success:res=>{
          if(res.confirm){
            this.toUpdateBook()
          }else if(ers.cancel){
            wx.showToast({
              title: '首页右下角「建议」可反馈哦',
              icon:'none'
            })
          }
        }
      })
    })
  },
  onTapDelete:function(event){
    wx.showModal({
      title:'删除确认',
      content:'确认删除 '+this.data.book.name+' ?',
      confirmColor:'red',
      success:res=>{
        if(res.confirm){
            this.toDeleteBook()
        }
      }
    })
  } ,
    toDeleteBook:function(){
      wx.showLoading({
        title: '删除中',
        mask:true
      })
      Books.deleteBook(this.data.book)
      .then(res=>{
        wx.hideLoading({
          complete: (res) => {},
        })
        console.log('删除书籍-',res)
            wx.showToast({
              title: '成功',
              icon:'success'
            })
            //要做刷新标志
            wx.navigateBack({
              complete: (res) => {},
            })
          
      }).catch(error=>{
        wx.hideLoading({
          complete: (res) => {},
        })
          console.log('删除书籍-',error)
          wx.showModal({
           title:'删除失败',
           content:error.errMsg,
           confirmText:'重试',
           success:res=>{
             if(res.confirm){
               this.toDeleteBook()
             }else if(res.cancel){
               wx.showToast({
                 title: '首页右下角「建议」可反馈哦',
                 icon:'none'
               })
             }
           }
          })
      })
    }
})