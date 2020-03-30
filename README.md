# sky书单
记录与分享自己喜欢的书单。

# todo
- 云函数接受不到客服消息
- 标签用起来
- 关注书单
- 关注作者
- 个人主页


扫码体验

![书单](picture/二维码.jpg)

## 我的书单
![我的书单](picture/我的书单-list.png)
![我的书单-empty](picture/书单详情-empty.png)
![我的书单](picture/我的书单-modal.png)

## 创建书单
![创建书单](picture/创建书单.png)
## 书单
![书单-empty](picture/书单详情-empty.png)

## 添加书籍

![添加书籍](picture/添加书籍.png)

## 删除&修改书籍

![书单](picture/书单-书-编辑等.png)

## 分享页

![分享](picture/书单-分享-0.png)
![分享](picture/书单-分享.png)

## 流程
### booklist 首页
1.获取到 openID （从缓存或者从服务器）
2.获取书单，这里分两步同时进行。
2.1 从本地缓存读取，
2.2 从云数据库读取，然后更新到本地缓存，再从本地缓存渲染到视图。


