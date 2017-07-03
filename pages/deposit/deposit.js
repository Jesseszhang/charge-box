// deposit.js
const http = require('../../utils/http.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    hasDeposit: false,
    depositMoney: "",
    depositedMoney: "",
    toEqdetail: false,
    getdepositDetail: ""
  },
  whatis() {
    wx.showModal({
      title: '押金说明',
      confirmColor: '#E65454',
      content: '1.在使用设备充电前需缴纳押金\n\t\t2.可在我的-我的押金中进行管理\n3.可随时退回至付款账户\t\t\t\t\t\t\t\t\t\t',
      showCancel: false
    })
  },
  payment() {
    let url = "xcx/wxDepositPay"
    let _this = this
    let data = {
      amountNum: this.data.depositMoney*100
    }
    wx.getStorage({
      key: 'depositDetail',
      success: (res) => {
        this.setData({
          toEqdetail: true,
          getdepositDetail: res.data
        })
      }
    })
    http.request(url, data, 'post', (res) => {
      if (res.code === 0) {
        console.log(res)
        wx.requestPayment({
          'timeStamp': res.data.timeStamp,
          'nonceStr': res.data.nonceStr,
          'package': res.data.package,
          'signType': res.data.signType,
          'paySign': res.data.paySign,
          'success': function (res) {
            if (_this.data.toEqdetail) {
              wx.redirectTo({
                url: `/pages/eqDetail/eqDetail?resData=${JSON.stringify(_this.data.getdepositDetail)}`
              })
            } else {
              wx.redirectTo({
                url: "/pages/index/index"
              })
            }
          }
        })
      }
    }, false)
  },
  returnDeposit(e) {
    let curFormId = e.detail.formId
    console.log(e.detail.formId)
    //退还押金之前检测是否有异常和未支付订单等。
    let _this = this
    wx.showModal({
      title: '提示',
      confirmColor: '#E65454',
      content: '退还押金后您将无法充电。是否退还押金？',
      showCancel: true,
      success: (res) => {
        if (res.confirm) {
          let url = "xcx/wxRefundDepositPay"
          let data = {
            amountNum: _this.data.depositedMoney*100,
            formID: curFormId
          }
          http.request(url, data, 'post', (res) => {
            if (res.code === 0) {
              wx.redirectTo({
                url: "/pages/returnResult/returnResult?success=1"
              })
            } else if (res.code === 10) {
              // 存在充电中的订单 10
              let curOrderID = res.data.orderID
              wx.showModal({
                title: '提示',
                confirmColor: '#E65454',
                confirmText: "去结束",
                content: " 您有充电中订单，请结束充电并支付，再退还押金。",
                success: (res) => {
                  if (res.confirm) {
                    let url = 'xcx/chargeRecordDetail'
                    let data = {
                      "orderID": curOrderID
                    }
                    http.request(url, data, 'post', (res) => {
                      if (res.code === 0) {
                        wx.navigateTo({
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
                content: "您有异常订单，请24小时后进行支付，再退还押金。",
                showCancel: false
              })
            } else if (res.code === 12) {
              // 存在未支付订单 12
              let curOrderID = res.data.orderID
              wx.showModal({
                title: '提示',
                confirmColor: '#E65454',
                confirmText: "去支付",
                content: " 您有未支付订单，请支付后，再退还押金",
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
            } else {
              console.log(res.code)
              wx.redirectTo({
                url: "/pages/returnResult/returnResult?success=0"
              })
            }
          }, false)
        }
      }
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.setNavigationBarTitle({
      title: "押金"
    });
    //没有缴纳押金从开启充电跳转到此处要做处理
    let url = "xcx/getUserInfo"
    http.request(url, "", 'post', (res) => {
      if (res.code === 0) {
        console.log(res)
        //没有缴纳押金
        if (res.data.deposited_money == 0) {
          this.setData({
            hasDeposit: false
          })
          this.setData({
            depositMoney: res.data.deposit_money/100
          })
        } else {
          this.setData({
            hasDeposit: true
          })
          this.setData({
            depositedMoney: res.data.deposited_money/100
          })
        }
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