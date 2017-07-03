//app.js
const http = require('./utils/http.js');
App({
  onLaunch: function () {
    let _this = this
    if (wx.authorize) {
      wx.authorize({
        scope: 'scope.userInfo',
        success: (res) => {
          _this.getUserInfoAll();
        },
        fail: () => {
          wx.showModal({
            title: '提示',
            confirmColor: '#E65454',
            content: "授权失败，小程序部分功能将可能无法使用",
            showCancel: false
          })
        }
      })
    } else {
      wx.showModal({
        title: '提示',
        content: '当前微信版本过低，无法使用该功能，请升级到最新微信版本后重试。'
      })
    }
    wx.checkSession({
      success: function () {
        //登录态未过期
      },
      fail: function () {
        //登录态过期
        wx.getStorage({
          key: 'c_Token',
          success: function (res) {
            _this.getUserInfoAll(res.data);  
          }
        })
      }
    })
  },
  getUserInfoAll: function (token) {
    let _this = this
    wx.login({
      success:(res) => {
        console.log(res, 'app')
        if (res.code) {
          let loginCode = res.code
          wx.getUserInfo({
            withCredentials: true,
            success: (res) => {
              console.log(res,'app')
              wx.setStorage({
                key: "userInfo",
                data: res.userInfo
              })
              let data = {
                code: loginCode,
                encryptedData: res.encryptedData,
                iv: res.iv,
                rawData: res.rawData
              }
              wx.request({
                url: http.host + 'xcx/wxLogin',
                data: data,
                method: 'post',
                success: function (res) {
                  console.log(res, 'app')
                  let resData = res.data;
                  if (resData.code === 0) {
                    wx.setStorage({
                      key: "c_Token",
                      data: resData.data.c_Token
                    })
                  } else {
                    wx.showModal({
                      title: '提示',
                      confirmColor: '#E65454',
                      content: JSON.stringify(resData.message),
                      showCancel: false
                    })
                  }
                }
              });
            }
          })
        } else {
          console.log('获取用户登录态失败！' + res.errMsg)
        }
      },
      fail: (res)=> {
        console.log(res)
      }
    })
  },
  userData: {
    userInfo: {},
    profile: null,
    c_Token: ''
  }
})