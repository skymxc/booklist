// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database();
// 云函数入口函数
exports.main = async (event, context) => {
  
  const wxContext = cloud.getWXContext();
 var result = await cloud.openapi.customerServiceMessage.send({
    touser: wxContext.OPENID,
    msgtype: 'text',
    text: {
      content: '收到,感谢意见！如果有更多的建议关注公众号「 佛系编码 」留言即可。',
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
  await db.collection('feedback').add({ data: message});
 
  return "success"
}