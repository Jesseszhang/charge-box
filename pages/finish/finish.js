// finish.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    chargeInfo: {},
    amountNum: 0,
    returnAmount: 0,
    payway: 0,
    curPayment: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options.chargeInfo)
    let curData = JSON.parse(options.chargeInfo)
    this.setData({
      chargeInfo: curData
    })
    let amountNums = (parseFloat(curData.amountNum) / 100).toFixed(2)
    let curPayments = (parseFloat(curData.curPayment) / 100).toFixed(2)
    let returnAmounts = (parseFloat(curData.returnAmount) / 100).toFixed(2)
    let payways = (parseFloat(curData.payway) / 100).toFixed(2)   
    this.data.amountNum = amountNums
    this.data.returnAmount = returnAmounts
    this.data.curPayment = curPayments
    this.data.payway = payways
    this.setData({
      amountNum: amountNums
    })
    this.setData({
      payway: payways
    })
    this.setData({
      returnAmount: returnAmounts
    })
    this.setData({
      curPayment: curPayments
    })
  },
  backIndex() {
    wx.redirectTo({
      url: '/pages/index/index'
    })
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