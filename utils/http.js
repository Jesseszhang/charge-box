var host = "https://x86.chargerlink.com/"

function http(url, data, type='GET', func, hide) {
  var token = ""
  wx.getStorage({
    key: 'c_Token',
    success: function (res) {
      token = res.data
      if (!token) {
        getToken(url, data, type, hide, func, requestSend)
      } else { 
        requestSend(token, url, data, type, hide, func)
      }
    },
    fail: function(res) {
      getToken(url, data, type, hide, func, requestSend)
    }
  })
}

function requestSend(token, url, data, type, hide, func) {
  let ContentType = 'application/json';
  if (type == 'POST') {
    ContentType = 'application/x-www-form-urlencoded';
  }
  if (!hide) {
    wx.showToast({
      title: '正在加载',
      icon: 'loading',
      duration: 10000,
      mask: true
    });
  }

  console.log(token, 'token')

  wx.request({
    url: host + url,
    data: data,
    method: type,
    header: {
      "Content-Type": ContentType,
      "token": token
    },
    success: function (res) {
      if (res.data.code === 2) {
        wx.checkSession({
          success: function () {
            //session 未过期，并且在本生命周期一直有效
          },
          fail: function () {
            //登录态过期 重新登录
            _this.wxLogin(url, data, type, hide, func)
          }
        })
      }
      let data = res.data;
      func(data); 
    },
    complete: function () {
      wx.hideToast()
    }
  });
}
function getToken(url, data, type, hide, func, cb) {
  let _this = this
  wx.login({
    success: (res) => {
      if (res.code) {
        let loginCode = res.code
        wx.getUserInfo({
          withCredentials: true,
          success: (res) => {
            wx.setStorage({
              key: "userInfo",
              data: res.userInfo
            })
            let curdata = {
              code: loginCode,
              encryptedData: res.encryptedData,
              iv: res.iv,
              rawData: res.rawData
            }
            wx.request({
              url: host + "xcx/wxLogin",
              data: curdata,
              method: 'post',
              success: (res) => {
                console.log(res)
                let resData = res.data
                if (resData.code === 0) {
                  cb && cb(resData.data.c_Token, url, data, type, hide, func)
                  wx.setStorage({
                    key: "c_Token",
                    data: res.data.c_Token
                  })
                } else {
                  wx.showModal({
                    title: '提示',
                    confirmColor: '#E65454',
                    content: JSON.stringify(resData.message),
                    showCancel: false
                  })
                } 
              },
              fail: function (res) {
                wx.showModal({
                  title: '提示',
                  confirmColor: '#E65454',
                  content: JSON.stringify(res),
                  showCancel: false,
                  success: () => {
                    wx.redirectTo({
                      url: '/pages/index/index'
                    })
                  }
                })
              }
            });
          },
          fail: function (res) {
            wx.showModal({
              title: '提示',
              confirmColor: '#E65454',
              content: JSON.stringify(res),
              showCancel: false
            })
          }
        })
      } else {
        console.log('获取用户登录态失败！' + res.errMsg)
      }
    },
    fail: function (res) {
      wx.showModal({
        title: '提示',
        confirmColor: '#E65454',
        content: JSON.stringify(res),
        showCancel: false,
        success: () => {
          wx.redirectTo({
            url: '/pages/index/index'
          })
        }
      })
    }
  })
}
function wxLogin(url, data, type, hide, func, cb) {
  let _this = this
  if (wx.authorize) {
    wx.authorize({
      scope: 'scope.userInfo',
      success: (res) => {
        _this.getToken(url, data, type, hide, func, cb);
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
}
module.exports = {
	request: http,
  host
}