// payment.js
const http = require('../../utils/http.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    payDetail: {},
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.setNavigationBarTitle({
      title: "充电支付"
    });
    console.log(options.orderDetail)
    let chargeInfo = JSON.parse(options.orderDetail)
    console.log(chargeInfo)
    this.setData({
      payDetail: chargeInfo
    })
  },
  paymoney(e) {
    let curFormId = e.detail.formId
    console.log(e.detail.formId)
    let url = 'xcx/wxPayChargeOrder'
    let data = {
      orderID: this.data.payDetail.orderID,
      amountNum: this.data.payDetail.curPayment,
      formID: curFormId
    }
    http.request(url, data, 'post', (res) => {
      if (res.code === 0) {
        wx.requestPayment({
          'timeStamp': res.data.timeStamp,
          'nonceStr': res.data.nonceStr,
          'package': res.data.package,
          'signType': res.data.signType,
          'paySign': res.data.paySign,
          'success': function (res) {
            //支付成功跳转到首页
            wx.redirectTo({
              url: '/pages/index/index'
            })
          },
          'fail': function (res) {
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