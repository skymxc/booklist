// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database();
// 云函数入口函数
exports.main = async (event, context) => {
  const listid = event.listid;
  console.log('删除书单里的书籍-',listid)
  return db.collection('book').where({ booklist_id:listid}).remove();
}