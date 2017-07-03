// payment.js
const http = require('../../utils/http.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userAjaxData:{},
    payDetail:{},
    time: "",
    amountNum: 0.00,
    payway: 0.00
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.setNavigationBarTitle({
      title: "充电支付"
    });
    console.log(options)
    var curId = ""
    var pid = ""
    if (decodeURIComponent(options.q.replace(/\+/g, '%20')).split('?')[1]) {
       curId = decodeURIComponent(options.q.replace(/\+/g, '%20')).split('?')[1]
       pid = curId.split('=')[1]
    } else {
      wx.showModal({
        title: '提示',
        confirmColor: '#E65454',
        content: '你扫描的二维码信息有误，请核实再扫',
        showCancel: false,
        success: () => {
          wx.redirectTo({
            url: "/pages/index/index"
          })
        }
      })
      return false;
    }
    let qrcode = options.q
    let _this = this
    if (wx.getSetting) {
      wx.getSetting({
        success(res) {
          console.log(res, 'getSetting')
          if (!res.authSetting['scope.userInfo']) {
            console.log('未授权')
            if (wx.authorize) {
              wx.authorize({
                scope: 'scope.userInfo',
                success: (res) => {
                  console.log('授权')
                  _this.getPowerPointDetail(pid, qrcode);
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
          } else {
            console.log('已授权')
            _this.getPowerPointDetail(pid, qrcode);
          }
        }
      })
    }
    
  },
  getCToken(){
    wx.login({
      success: (res) => {
        console.log(res, 'pay')
        if (res.code) {
          let loginCode = res.code
          wx.getUserInfo({
            withCredentials: true,
            success: (res) => {
              console.log(res, 'pay')
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
                  console.log(res, 'pay')
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
      fail: (res) => {
        console.log(res)
      }
    })
  },
  getPowerPointDetail(pid, qrcode) {
    let url = "xcx/getPowerPointDetail"
    let data = {
      pid: pid,
      qrcode: qrcode
    }
    let _this = this
    console.log(pid, qrcode, 'getPowerPointDetail')
    http.request(url, data, 'post', (res) => {
      console.log(res)
      if (res.code === 0) {
        this.setData({
          payDetail: res.data
        });
        let curNum = (parseFloat(res.data.amountNum) / 100).toFixed(2)
        let paywayNum = (parseFloat(res.data.payway) / 100).toFixed(2)
        console.log(curNum)
        this.data.amountNum = curNum
        this.data.payway = paywayNum
        this.setData({
          amountNum: curNum
        })
        this.setData({
          payway: paywayNum
        })

        _this.getwxPrePay(res.data.powerPointID, res.data.amountNum)

      } else if (res.code == 10) {
          wx.redirectTo({
            url: `/pages/charging/charging?orderID=${res.data.orderID}`
          })
      } else {
        wx.showModal({
          title: '提示',
          confirmColor: '#E65454',
          content: JSON.stringify(res.message),
          showCancel: false,
          success: () => {
            wx.redirectTo({
              url: "/pages/index/index"
            })
          }
        })
      }
    }, false)
  },
  getwxPrePay(pid, num) {
    let url = "xcx/wxPrePay"
    let data = {
      pid: pid,
      amountNum: num
    }
    console.log('wxPrePay')
    http.request(url, data, 'post', (res)=>{
      console.log(res)
      if (res.code === 0) {
        this.setData({userAjaxData: res.data})
      } else {
        wx.showModal({
          title: '提示',
          confirmColor: '#E65454',
          content: JSON.stringify(res.message),
          showCancel: false
        })
      }
    }, false)
  },
  
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
  
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
  
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
  
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    wx.stopPullDownRefresh()
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
  
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  }
})