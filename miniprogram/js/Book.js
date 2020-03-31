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

module.exports = {
  delBookBylistId : delBookBylistId,
  delBookListById: delBookListById
}