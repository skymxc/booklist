// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: 'release-5zcgc'
})

const db = cloud.database();
// 云函数入口函数
exports.main = async (event, context) => {
  const listid = event.listid;

  return db.collection('book').where({ booklist_id:listid}).remove();
}