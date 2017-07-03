// eqDetail.js
const http = require('../../utils/http.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    payway: "",
    powerPointNo: "",
    supportEqu: "",
    maxCurrent: "",
    powerPointID:"",
    scanPowerPointID:"",
    depositDetail: ""
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options)
    console.log(JSON.parse(options.resData || null))
    let _this = this
    if (JSON.parse(options.resData || null)) {
      let detailData = JSON.parse(options.resData)
      this.setData({
        payway: detailData.payway / 100,
        powerPointNo: detailData.powerPointNo,
        supportEqu: detailData.supportEqu,
        maxCurrent: detailData.maxCurrent,
        powerPointID: detailData.powerPointID,
        scanPowerPointID: detailData.powerPointID,
        depositDetail: detailData
      })
    } else if (options.q && decodeURIComponent(options.q.replace(/\+/g, '%20')).split('?')[1]) {
      let curId = decodeURIComponent(options.q.replace(/\+/g, '%20')).split('?')[1]
      let pid = curId.split('=')[1]
      this.setData({
        powerPointID: pid
      })
      let qrcode = options.q
      if (wx.getSetting) {
        wx.getSetting({
          success(res) {
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
    } else if (options.depositId) {
      this.getPowerPointDetail(options.depositId, qrcode);
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
  },
  getPowerPointDetail(pid, qrcode) {
    let url = "xcx/getPowerPointDetail"
    let data = {
      qrcode: qrcode
    }
    let _this = this
    http.request(url, data, 'post', (res) => {
      if (res.code === 0) {
        this.setData({
          payway: res.data.payway / 100,
          powerPointNo: res.data.powerPointNo,
          supportEqu: res.data.supportEqu,
          maxCurrent: res.data.maxCurrent,
          scanPowerPointID: res.data.powerPointID,
          depositDetail: res.data
        })
      } else if (res.code == 10) {
        wx.redirectTo({
          url: `/pages/charging/charging?orderID=${res.data.orderID}`
        })
      } else {
        wx.showModal({
          title: '提示',
          confirmColor: '#E65454',
          content: res.message,
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
  startCharging(e) {
    console.log(e)
    // debugger
    console.log('//////////')
    let curFormId = e.detail.formId
    console.log(e.detail.formId)
    console.log('\\\\\\\\\\')
    //开启充电之前 首先检测枪头是否插入 检测是否缴纳押金，是否有异常订单，未支付订单，充电中订单等。
    let url = "xcx/startCharge"
    console.log(this.data.scanPowerPointID)
    let data = {
      powerPointID: this.data.scanPowerPointID,
      formID: curFormId
    }
    let _this = this
    http.request(url, data, 'post', (res) => {
      console.log(res)
      let curOrderID = res.data.orderID
      if (res.code === 0) {
        //此处最好请求完再跳转体验会比较好
        let url = 'xcx/chargeRecordDetail'
        let data = {
          "orderID": curOrderID
        }
        http.request(url, data, 'post', (res) => {
          if (res.code === 0) {
            wx.redirectTo({
              url: `/pages/charging/charging?orderDetail=${JSON.stringify(res.data)}`
            })
          } else {
            wx.showModal({
              title: '提示',
              confirmColor: '#E65454',
              content: res.message,
              showCancel: false
            })
          }
        }, false)
      } else if (res.code === 10) {
        // 存在充电中的订单 10
        wx.showModal({
          title: '提示',
          confirmColor: '#E65454',
          confirmText: "查看订单",
          content: " 您有充电中订单，请结束充电并支付，再开启充电。",
          success: (res) => {
            if (res.confirm) {
              let url = 'xcx/chargeRecordDetail'
              let data = {
                "orderID": curOrderID
              }
              http.request(url, data, 'post', (res) => {
                if (res.code === 0) {
                  wx.redirectTo({
                    url: `/pages/charging/charging?orderDetail=${JSON.stringify(res.data)}`
                  })
                } else {
                  wx.showModal({
                    title: '提示',
                    confirmColor: '#E65454',
                    content: res.message,
                    showCancel: false
                  })
                }
              }, false)
            }
          }
        })
      } else if (res.code === 11) {
        // 存在异常订单 11
        wx.showModal({
          title: '提示',
          confirmColor: '#E65454',
          confirmText: "我知道了",
          content: "您当前有三笔异常订单，请24小时后进行支付，再开启充电。",
          showCancel: false
        })
      } else if (res.code === 12) {
        // 存在未支付订单 12
        wx.showModal({
          title: '提示',
          confirmColor: '#E65454',
          confirmText: "去支付",
          content: " 您当前有未支付订单，请支付后再开启充电。",
          success: (res) => {
            if (res.confirm) {
              let url = 'xcx/chargeRecordDetail'
              let data = {
                orderID: curOrderID
              }
              http.request(url, data, 'post', (res) => {
                if (res.code === 0) {
                  let curdata = JSON.stringify(res.data)
                  wx.redirectTo({
                    url: `/pages/chargingPay/chargingPay?orderDetail=${curdata}`
                  })
                }
              }, false)
            }
          }
        })
      } else if (res.code === 20) {
        // 定金没有缴纳 20
        wx.showModal({
          title: '提示',
          confirmColor: '#E65454',
          confirmText: "确定",
          content: "请缴纳押金后再开启充电",
          success: (res) => {
            if (res.confirm) {
              wx.setStorage({
                key: "depositDetail",
                data: this.data.depositDetail,
                success: () =>{
                  wx.redirectTo({
                    url: '/pages/deposit/deposit'
                  }) 
                }
              })             
            }
          }
        })
       
      } else if (res.code === 20) {
        // 定金没有缴纳 20
        wx.showModal({
          title: '提示',
          confirmColor: '#E65454',
          confirmText: "已插好",
          content: "请插入充电插头",
          success: (res) => {
            if (res.confirm) {
              _this.startCharging();
            }
          }
        })

      } else {
        wx.showModal({
          title: '提示',
          confirmColor: '#E65454',
          content: res.message,
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