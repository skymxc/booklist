//app.js

// App(Object) 是一个函数 ；用来注册一个小程序；接受一个 object 参数；
// 这个函数的 Object 参数有几个系统规定的生命周期属性：onLaunch , onShow,onHide,onError,onPageNotFound; 这几个属性都是 函数类型的 ；下面是实例代码
// 我们还可以自己添加 属性； 
App({
  onLaunch: function(options) {
    
    // 初始化云能力 traceUser:true 记录用户
    if (!wx.cloud) {
      console.log('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        traceUser: true,
        env: 'test-37b711'
      })
    }

    this.globalData = {}
  },
  
  onPageNotFound: function(options) {
    console.log('onPageNotFound',options)

    wx.showModal({
      title: '提示',
      content: '暂时无法展示'+options.path,
      showCancel:false,
      success:function(){
        wx.redirectTo({
          url: '/pages/booklist/booklist',
          fail:function(err){
            wx.showToast({
              title: err.errMsg,
            })
          }
        })
      }
    })
   
    //this.navigateTo('pages/booklist/booklist')
  },
  formatDate: function(fmt, date) { //author: meizz   
    var o = {
      "M+": date.getMonth() + 1, //月份   
      "d+": date.getDate(), //日   
      "h+": date.getHours(), //小时   
      "m+": date.getMinutes(), //分   
      "s+": date.getSeconds(), //秒   
      "q+": Math.floor((date.getMonth() + 3) / 3), //季度   
      "S": date.getMilliseconds() //毫秒   
    };
    if (/(y+)/.test(fmt))
      fmt = fmt.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
      if (new RegExp("(" + k + ")").test(fmt))
        fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
  },
  countUser: function() {
    console.log('count user')
    var that = this;
    return new Promise((resolve, reject) => {
      var db = wx.cloud.database();

      db.collection('user').where({
        _openid: that.globalData.openid
      }).get().then(res => {

        if (res.data.length == 0) {
          reject();
        } else {
          resolve(res.data[0]);
        }
      }).catch(err => {
        console.error(err);
        reject();
      });
    });


  },
  /**
   * 
   */
  addUser: function() {
    console.log('add user')

    var db = wx.cloud.database();
    var user = {
      info: this.globalData.userInfo,
      nickName:this.globalData.userInfo.nickName
    };
    return db.collection('user').add({
      data: user
    });
  },
  updateUser: function(user) {

    // console.log(user);
    this.globalData._id = user._id;

    var db = wx.cloud.database();
    return db.collection('user').doc(user._id).update({
      data: {
        info: this.globalData.userInfo
      }
    });
  },
  /**
   * 登陆后台
   * 1. 获取 openid
   * 2. 查看数据库是否注册该用户
   * 3. 没有注册的话就 添加到数据库
   * 4. 原本已经在的花就更新最新的用户信息
   * 5. 返回
   * 
   * reject() 中 error.errMsg;
   */
  login: function() {
    var that = this;
    return new Promise((resolve, reject) => {
      //登陆 获取openID
      wx.cloud.callFunction({
        name: 'login',

      }).then(res => {

        that.globalData.openid = res.result.openid;
        //查看用户是否在数据库注册
        that.countUser().then(res => {
          //更新用户信息
          that.updateUser(res).then(res => {
            //返回首页
            resolve();
          }).catch(error => {
            console.log(error);
            reject(error);
          });
        }).catch(error => {
          //添加用户信息
          that.addUser().then(res => {

            resolve();
          }).catch(error => {

            console.error(error);
            reject(error);
          });
        });

      }).catch(error => {

        console.error(error);
        reject(error);
        // wx.showModal({
        //   title: '网络异常！',
        //   content: error.errMsg,
        //   showCancel: false
        // });
      });
    });
  },
  /**
   * 检查 用户信息是否授权
   */
  checkUserPermission: function() {

    return this.checkPermission('scope.userInfo');
  },
  /**
   * 检查 当前是否拥有某项权限
   * @scope 某项权限
   * resolve(auth) auth:true?false;
   */
  checkPermission: function(scope) {
    return new Promise((resolve, reject) => {
      wx.getSetting({
        success: res => {
         

          resolve(res.authSetting[scope]);

        },
        fail: error => {
          reject(error)
        }
      })
    });
  },
  /**
   * 获取用户信息，前提是已经拿到 用户信息权限
   * resolve(user);
   * reject(err) err.errMsg;
   */
  getUserInfo: function() {
    var that =this;
    return new Promise((resolve,reject)=>{
      wx.getUserInfo({ //获取用户信
        success: response => {
          that.globalData.userInfo = response.userInfo;
          that.globalData.logged = true;
          resolve(response.userInfo);
        },
        fail: err => {
          reject(err);
        }

      })
    });
    
  },
  /**
   * 权限判断 获取用户信息如果权限没有回去获取，获取失败则是 reject()
   * resolve（res）
   */
  handlePermissionAndGetUserInfo:function(){
    var that =this;
    return new Promise((resolve,reject)=>{
      //检查权限
      that.checkUserPermission().then(res => {
          //获取用户信息
          if(res){
            that.getUserInfo().then(user => {
              var response ={
                auth:true,
                userInfo: user
              }
              resolve(response);
            }).catch(error => {
              reject(error);
            });
          }else{
            var response = {
              auth: false
            }
            resolve(response);
          }
      
      }).catch(error => {
        reject(error);
      });
    });
    
  },
  showErr:function(title,msg,showCancel){
    wx.hideLoading();
    wx.showModal({
      title: title,
      content: msg,
      showCancel: showCancel
    });
  },
  showErrNoCancel:function(title,msg){
    this.showErr(title,msg,false);
  },
  showLoadingMask(title){
    wx.showLoading({
      title: title,
      mask:true
    })
  },
  showLoading(title){
    wx.showLoading({
      title: title,
    })
  },
  navigateTo:function(url){
    this.showLoadingMask('请稍后');
    var that =this;
    wx.navigateTo({
      url: url,
      success:function(){
        wx.hideLoading()
      },
      fail:function(error){
        that.showErrNoCancel('跳转失败',error.errMsg);
      }
    })
  },
  showToast:function(txt){
    wx.showToast({
      title: txt,
      icon:'none'
    })
  }
})