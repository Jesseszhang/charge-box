// record.js
const http = require('../../utils/http.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    recordList:[],
    curPage: 1,
    nomoredata: false,
    loading: false
  },
  toPage(event) {
    console.log(event)
    let curOrderID = event.currentTarget.dataset.orderid
    let curStatus = event.currentTarget.dataset.status
    //充电中的订单直接跳转到计时页面
    console.log(curOrderID, curStatus)
    if (curStatus == 10 || curStatus == 20) {
      //此处最好请求完再跳转
      let url = 'xcx/chargeRecordDetail'
      let data = {
        "orderID": curOrderID
      }
      http.request(url, data, 'post', (res) => {
        console.log(res)
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
    } else if (curStatus == 30) {
      let url = 'xcx/chargeRecordDetail'
      let data = {
        "orderID": curOrderID
      }
      http.request(url, data, 'post', (res) => {
        if (res.code === 0) {
          wx.navigateTo({
            url: `/pages/chargingPay/chargingPay?orderDetail=${JSON.stringify(res.data)}`
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
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.setNavigationBarTitle({
      title: "充电记录"
    });
    this.getRecordList(this.data.curPage)
  },
  getRecordList: function(curpage) {
    let data = {
      page: curpage
    }
    let url = "xcx/chargeRecordList"
    http.request(url, data, 'post', (res) => {
      if (res.code == 0) {
        wx.stopPullDownRefresh()
        this.setData({
          recordList: res.data
        })
      } else {
        wx.showModal({
          title: '提示',
          confirmColor: '#E65454',
          content: res.message,
          showCancel: false
        })
      }
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
    console.log(111111)
    this.data.curPage = 1
    
    this.setData({
      curPage: 1,
      nomoredata: false
    })
    this.getRecordList()
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {    
    let requPage = this.data.curPage + 1
    let data = {
      page: requPage
    }
    let url = "xcx/chargeRecordList"
    if (!this.data.nomoredata) {
      this.setData({
        loading: true
      })
      http.request(url, data, 'post', (res) => {
        if (res.code == 0) {
          this.setData({
            loading: false
          })
          res.data.map((item) => {
            this.data.recordList.push(item)
          })
          this.setData({
            recordList: this.data.recordList
          })
          if (res.data.length !== 0) {
            this.setData({
              curPage: this.data.curPage + 1
            })
          } else {
            this.setData({
              nomoredata: true
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
      }, true)
    }
   
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  }
})