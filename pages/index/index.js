// pages/index/index.js
const http = require('../../utils/http.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    imgUrls: [
      '/res/img/ic_guid_1.png',
      '/res/img/ic_guid_2.png',
      '/res/img/ic_guid_3.png'
    ],
    indicatorDots: false,
    autoplay: true,
    interval: 2500,
    duration: 600,
    username: "",
    userimg: "",
    animationInfo: "",
    animationBtn: "",
    animationInfoA: "",
    animationBtnA: "",
    animationMask: "",
    animationMaskA: "",
    animationModalA: "",
    animationModal:"",
    showMask: false,
    currentDot: 0,
    canComfirm: false,
    codeNum: "",
    showModal: false
  },
  inputCode(e) {
    this.setData({
      codeNum: e.detail.value.replace(/[^\-?\d.]/g, '')
    })
    if (this.data.codeNum !== "") {
      this.setData({
        canComfirm: true
      })
    } else {
      this.setData({
        canComfirm: false
      })
    }
  },
  enterCode() {
    this.setData({
      showModal: true
    })
    this.animationModalA.opacity(1).step();
    this.setData({
      animationModal: this.animationModalA.export()
    })
  },
  cancleCode() {
    this.animationModalA.opacity(0).step();
    this.setData({
      animationModal: this.animationModalA.export()
    })
    setTimeout(()=>{
      this.setData({
        showModal: false
      })
    },600);
  },
  comfirmCode() {
    let _this = this
    let url = "xcx/getPowerPointDetail"
    let paramData = {
      pno: this.data.codeNum
    }
    if (this.data.canComfirm) {
      http.request(url, paramData, 'post', (res) => {
        if (res.code === 0) {
          _this.cancleCode()
          wx.navigateTo({
            url: `/pages/eqDetail/eqDetail?resData=${JSON.stringify(res.data)}`
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
  changeDot(res) {
    this.setData({
      currentDot: res.detail.current
    })
  },
  scancode: function () {
    let _this = this
    let url = "xcx/getPowerPointDetail"
    wx.scanCode({
      onlyFromCamera: true,
      success: (res) => {
        console.log(res)
        let codeUrl = encodeURIComponent(res.result)
        console.log(res.result)
        let curpid = res.result.split('?')[1].split('=')[1]
        let paramData = {
          qrcode: codeUrl
        }
        http.request(url, paramData, 'post', (res) => {
          if (res.code === 0) {
            wx.navigateTo({
              url: `/pages/eqDetail/eqDetail?resData=${JSON.stringify(res.data)}`
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
    })
  },
  showMyInfo: function () {
    wx.setNavigationBarTitle({
      title: "我的"
    });
    let _this = this
    wx.getStorage({
      key: 'userInfo',
      success: function (res) {
        console.log(res, 'userInfo')
        _this.setData({
          username: res.data.nickName
        })
        _this.setData({
          userimg: res.data.avatarUrl
        })
      },
      fail: function (res) {
        wx.showModal({
          title: '提示',
          confirmColor: '#E65454',
          content: JSON.stringify(res.message),
          showCancel: false
        })
      }
    })
    this.animationBtnA.left(-200).step();
    this.setData({
      animationBtn: this.animationBtnA.export()
    })
    this.setData({
      showMask: true
    })
    this.animationMaskA.opacity(0.4).step();
    this.animationInfoA.left(0).step();
    setTimeout(function() {
      this.setData({
        animationMask: this.animationMaskA.export()
      })
      this.setData({
        animationInfo: this.animationInfoA.export()
      })
    }.bind(this), 200)
  },
  hideInfo: function() {
    wx.setNavigationBarTitle({
      title: "充电小程序"
    });
    this.animationMaskA.opacity(0).step();
    this.setData({
      animationMask: this.animationMaskA.export()
    })
    this.animationInfoA.left(-350).step();
    this.setData({
      animationInfo: this.animationInfoA.export()
    })
    this.animationBtnA.left(0).step();
    setTimeout(function () {
      this.setData({
        showMask: false
      })
      this.setData({
        animationBtn: this.animationBtnA.export()
      })
    }.bind(this), 200)
  },
  toUse: function() {
    wx.navigateTo({
      url: "/pages/guide/guide"
    })
  },
  toRecord: function () {
    wx.navigateTo({
      url: "/pages/record/record"
    })
  },
  toDeposit() {
    wx.navigateTo({
      url: "/pages/deposit/deposit"
    })
  },
  changeIndicatorDots: function (e) {
    this.setData({
      indicatorDots: !this.data.indicatorDots
    })
  },
  changeAutoplay: function (e) {
    this.setData({
      autoplay: !this.data.autoplay
    })
  },
  intervalChange: function (e) {
    this.setData({
      interval: e.detail.value
    })
  },
  durationChange: function (e) {
    this.setData({
      duration: e.detail.value
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    this.animationBtnA = wx.createAnimation({
      duration: 800,
      timingFunction: 'ease'
    })
    this.animationInfoA = wx.createAnimation({
      duration: 600,
      timingFunction: 'ease'
    })
    this.animationMaskA = wx.createAnimation({
      duration: 600,
      timingFunction: 'ease'
    })
    this.animationModalA = wx.createAnimation({
      duration: 600,
      timingFunction: 'ease'
    })
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