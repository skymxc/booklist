const db = wx.cloud.database();
/**
 * 删除书单内的所有书籍，调用云函数删除。
 * @param {书单ID}} id 
 */
function delBookBylistId(id) {
  console.log('delBookBylistId-',id)
  return wx.cloud.callFunction({
    name: 'delBookBylistId',
    data: {
      listid: id
    }
  })
}

/**
 * 删除书单
 * @param {书单ID} id 
 */
function delBookListById(id) {
  console.log('delBookListById-',id)
  return db.collection('book_list')
    .doc(id).remove()
}

/**
 * 从后台加载常用标签
 */
function loadCommonTag(){
  return db.collection('tag')
  .orderBy('use_num','desc')
  .limit(10).get()
}
/**
 * 保存书单到后台
 * @param {书单} booklist 
 */
function addBookList(booklist){
  console.log('addBookList ',booklist)
  return db.collection('book_list').add({
    data:booklist
  })
}
/**
 * 统计书单数量条件是书单名称
 * @param {书单名字} name 
 */
function countBooklistByName(name) {
   
  var where={
    name :name,
    _openid:getApp().globalData.openid
  }
  console.log('countBooklist,',where)
  return db.collection('book_list')
  .where(where)
  .count()
}
/**
 * 将使用的标签发送到后台进行计算
 * @param { 标签数组} tags 
 */
function addBookListTag(tags) {
  wx.cloud.callFunction({
    name:'calculateTag',
    data:{
      tags:tags
    },
    success:res=>console.log('addBookListTag',res),
    fail:error=>console.error('addBookListTag',error)
  })
}

/**
 * 统计书数量条件是书单名称和书单ID
 * @param {书单名字} name 
 */
function countBook(booklistId,name) {
   
  var where={
    name :name,
    _openid:getApp().globalData.openid,
    booklist_id:booklistId
  }
  console.log('countBook,',where)
  return db.collection('book')
  .where(where)
  .count()
}

/**
 * 保存书到后台
 * @param {书} book 
 */
function addBook(book){
  console.log('addBook ',book)
  return db.collection('book').add({
    data:book
  })
}
/**
 * 更改书籍信息
 * @param {需要更改的书}} book 
 * @param {id} 书籍的 ID
 */
function updateBook(id,book){
  console.log('updateBook,',book)
  return db.collection('book').doc(id).update({data:book})
}
/**
 * 删除书籍
 * @param {书籍} book 
 */
function deleteBook(book){
  console.log('deleteBook-',book)
  return db.collection('book').doc(book._id).remove()
}


module.exports = {
  delBookBylistId : delBookBylistId,
  delBookListById: delBookListById,
  loadCommonTag:loadCommonTag,
  addBookList:addBookList,
  countBooklistByName:countBooklistByName,
  calculateTag:addBookListTag,
  countBook:countBook,
  addBook:addBook,
  updateBook:updateBook,
  deleteBook:deleteBook
}