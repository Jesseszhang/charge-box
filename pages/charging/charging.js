// charging.js
const http = require('../../utils/http.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    hourfirst: 0,
    hoursecond: 0,
    minutefirst: 0,
    minutesecond: 0,
    secondfirst: 0,
    secondsecond: 0,
    chargeInfo: {},
    orderID:"",
    timer: "",
    chargeTimer:"",
    curPayment: "",
    startCount: true,
    username: "",
    userimg: "",
    animationInfo: "",
    animationBtn: "",
    animationInfoA: "",
    animationBtnA: "",
    animationMask: "",
    animationMaskA: "",
    showMask: false
  },
  finishCharge: function() {
    let _this = this
    wx.showModal({
      title: '提示',
      confirmColor: '#E65454',
      content: '是否结束充电？',
      success: function (res) {
        console.log(_this.data.chargeInfo)
        if (res.confirm) {
          _this.userStop()
        }
      }
    })
  },
  userStop(){
    let url = "xcx/stopCharge"
    let _this = this
    let data = {
      powerPointID: this.data.chargeInfo.powerPointID,
      pno: this.data.chargeInfo.powerPointNo,
      orderID: this.data.orderID
    }
    http.request(url, data, 'post', (res) => {
      if (res.code === 0) {
        clearInterval(_this.data.timer);
        clearInterval(_this.data.chargeTimer);
        console.log(res)
        let url = 'xcx/chargeRecordDetail'
        let data = {
          "orderID": _this.data.orderID
        }
        http.request(url, data, 'post', (res) => {
          if (res.code === 0) {
            let curdata = JSON.stringify(res.data) 
            wx.redirectTo({
              url: `/pages/chargingPay/chargingPay?orderDetail=${curdata}`
            })
          } else if (res.code === 7) {
            wx.redirectTo({
              url: '/pages/index/index'
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
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let fristDetail = JSON.parse(options.orderDetail)
    let _this = this
    this.setData({
      orderID: fristDetail.orderID,
      chargeInfo: fristDetail,
      curPayment: (parseFloat(fristDetail.curPayment) / 100).toFixed(2)
    })
    console.log(fristDetail.duration)
    //不判断duration是否大于0 直接开启计时
    if (this.data.startCount) {
      this.setData({
        startCount: false
      })
      this.startCount(fristDetail.duration)
    }
    //三秒后获取数据
    let charge = setInterval(() => {
      _this.getChargeInfo(fristDetail.orderID)
    }, 10000)
    this.data.chargeTimer = charge
    this.setData({
      chargeTimer: charge 
    })

    wx.getStorage({
      key: 'userInfo',
      success: function (res) {
        _this.setData({
          username: res.data.nickName
        })
        _this.setData({
          userimg: res.data.avatarUrl
        })
      }
    })
  },
  getChargeInfo(orderID) {
    let url = 'xcx/chargeRecordDetail'
    let data = {
      "orderID": orderID
    }
    let _this = this
    http.request(url, data, 'post', (res) => {
      console.log(res)
      if (res.code === 0) {
        let curChargedTime = res.data.duration
        if (this.data.startCount) {
          this.data.startCount = false
          this.setData({
            startCount: false
          })
          this.startCount(curChargedTime)
        }
        
        this.setData({ chargeInfo: res.data })

        this.setData({
          curPayment: (parseFloat(res.data.curPayment) / 100).toFixed(2)
        })
        if (res.data.status == 30 || res.data.status == 40) {
        //异常状态直接跳转到支付页面
        let curdata = JSON.stringify(_this.data.chargeInfo)
        clearInterval(this.data.chargeTimer);
        wx.redirectTo({
          url: `/pages/chargingPay/chargingPay?orderDetail=${curdata}`
        })
      } 
      } else {
        //其他弹窗提示然后在跳转
        clearInterval(this.data.chargeTimer);
        let curdata = JSON.stringify(_this.data.chargeInfo) 
        wx.showModal({
          title: '提示',
          confirmColor: '#E65454',
          content: res.message,
          showCancel: false,
          success: () => {
            wx.redirectTo({
              url: `/pages/chargingPay/chargingPay?orderDetail=${curdata}`
            })
          }
        })
      }
    }, true)
  },
  startCount: function (curChargedTime){
    if (curChargedTime) {
      let curhour = Math.floor(curChargedTime / 3600);
      let curhourfrist = parseInt(Math.floor(curChargedTime / 3600) / 10)
      let curhoursecond = Math.floor(curChargedTime / 3600) % 10
      let curmin = Math.floor(curChargedTime / 60) % 60;
      let curminfrist = parseInt(Math.floor(curChargedTime / 60) % 60 / 10);
      let curminsecond = Math.floor(curChargedTime / 60) % 60 % 10;
      let cursec = curChargedTime % 60;
      let cursecfrist = parseInt(curChargedTime % 60 / 10);
      let cursecsecond = curChargedTime % 60 % 10;
      this.data.hourfirst = curhourfrist
      this.setData({
        hourfirst: curhourfrist
      })
      this.data.hoursecond = curhoursecond
      this.setData({
        hoursecond: curhoursecond
      })
      this.data.minutefirst = curminfrist
      this.setData({
        minutefirst: curminfrist
      })
      this.data.minutesecond = curminsecond
      this.setData({
        minutesecond: curminsecond
      })
      this.data.secondfirst = cursecfrist
      this.setData({
        secondfirst: cursecfrist
      })
      this.data.secondsecond = cursecsecond
      this.setData({
        secondsecond: cursecsecond
      })
    }
    
    //开始计时
    clearInterval(timerInt);
    let timerInt = setInterval(()=>{
      this.data.secondsecond++;
      this.setData({
        secondsecond: this.data.secondsecond
      });
      if (this.data.secondsecond > 9) {
        this.setData({
          secondsecond: 0
        });
        this.data.secondfirst++;
        this.setData({
          secondfirst: this.data.secondfirst
        });
        if (this.data.secondfirst >= 6) {
          this.data.minutesecond ++;
          this.setData({
            minutesecond: this.data.minutesecond
          });
          this.setData({
            secondfirst: 0
          });
          this.data.secondfirst = 0;
          if (this.data.minutesecond >= 9) {
            this.data.minutesecond = 0;
            this.setData({
              minutesecond: 0
            });
            this.data.minutefirst++;
            this.setData({
              minutefirst: this.data.minutefirst
            });
            if (this.data.minutefirst >= 6) {
              this.data.hoursecond ++ ;
              this.setData({
                hoursecond: this.data.hoursecond
              });
              this.data.minutefirst =0;
              this.setData({
                minutefirst: 0
              });
              if (this.data.hoursecond >= 9) {
                this.data.hourfirst++;
                this.setData({
                  hourfirst: this.data.hourfirst
                });
                this.data.hoursecond = 0
                this.setData({
                  hoursecond: 0
                });
                if (hourfirst == this.data.maxTime) {
                  clearInterval(timer);
                }
              }
            }
          }
        }
      }
    }, 1000);
    this.setData({
      timer: timerInt
    })
    
  },
  showMyInfo: function () {
    wx.setNavigationBarTitle({
      title: "我的"
    });
    this.animationBtnA.left(-200).step();
    this.setData({
      animationBtn: this.animationBtnA.export()
    })
    this.setData({
      showMask: true
    })
    this.animationMaskA.opacity(0.4).step();
    this.animationInfoA.left(0).step();
    setTimeout(function () {
      this.setData({
        animationMask: this.animationMaskA.export()
      })
      this.setData({
        animationInfo: this.animationInfoA.export()
      })
    }.bind(this), 200)
  },
  hideInfo: function () {
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
  },

  /**
   * 生命周期函数--监听页面显示
   */
  toUse: function () {
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