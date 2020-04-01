// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()
  const collection = db.collection('tag')
  const _ = db.command
 function update(tags){
  return  collection.where({
    name: _.in(tags)
  })
  .update({
    data: {
      use_num: _.inc(1)
    }
  })
}

 function insert(name){
  var data = {
    name: name,
    use_num: 1
  }
  return   collection.add({
    data: data
  })
}

// 云函数入口函数
/**
 * 这这里计算标签
 * 如果数据库没有这个标签，就存进去
 * 如果存在就把 use_num++
 */
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  
  var tags = event.tags

  var response = await collection.where({
    name: _.in(tags)
  }).get()

  if(response.data.length==tags.length){
    var res = await update(tags)
    console.log('updateTags',tags,res)
    return 'success'
  }
  var list = new Array()
  for(var i=0;i<response.data.length;i++){
    list.push(response.data[i].name)
  }

  var updateTags = new Array()
  for(var i=0;i<tags.length;i++){
    var tag = tags[i]
    if(list.indexOf(tag)==-1){
      //不在数据库中
      var addRes = await insert(tag)
      console.log('增加 ',tag, addRes)
    }else{
      //在数据库中
      updateTags.push(tag)
    }
  }
  var res = await update(updateTags)
  console.log('updateTags',updateTags,res)
  return 'success'
}