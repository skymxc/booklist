// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
const db = cloud.database();
// 云函数入口函数
exports.main = async (event, context) => {
  
  const wxContext = cloud.getWXContext();
 var result = await cloud.openapi.customerServiceMessage.send({
    touser: wxContext.OPENID,
    msgtype: 'text',
    text: {
      content: '收到,更多建议请发送至 skymxc@foxmail.com',
    },
  })
  var message = {
    reply:result,
    _openid:wxContext.OPENID,
    createTime: event.CreateTime,
    msgType: event.MsgType,
    msgId:event.MsgId,
    content: event.Content,
    picUrl: event.PicUrl
  }
   await db.collection('feedback').add(message);
 
  return "success"
}