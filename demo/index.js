// demo1/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    // 当前画板
    drawingBoard: undefined,
    // 画板生成的图片
    imageUrl: '',
    // 线宽度
    lineWidth: 5,
    // 线颜色
    lineColor: '#fff',
    // 背景颜色： 透明
    bgColor: 'rgba(255, 255, 255, 0)'
  },

  // 线宽
  lineWidthChange (e) {
    this.setData({ lineWidth: e.detail.value })
  },

  // 线颜色
  lineColorChange (e) {
    this.setData({ lineColor: e.currentTarget.dataset.color })
  },
  
  // 背景颜色
  bgColorChange (e) {
    this.setData({ bgColor: e.currentTarget.dataset.color })
  },

  // 清空
  touchClear () {
    // 清空画板
    this.data.drawingBoard.clear()
  },

  // 撤销
  touchRevoke () {
    this.data.drawingBoard.revoke()
  },

  // 生成图片
  touchCreateImage () {
    // 记录图片不保存相册
    this.data.drawingBoard.createImage((isOK, res) => {
      // 生成图片成功
      if (isOK) {
        this.setData({ imageUrl: res.tempFilePath || '' })
      }
    })
  },

  // 保存相册
  touchSave () {
    // 记录图片并保存相册
    this.data.drawingBoard.createImage((isOK, res) => {
      // 生成图片成功
      if (isOK) {
        this.setData({ imageUrl: res.tempFilePath || '' })
      }
    }, true, (isOK, res) => {
      // 保存相册回调
      if (isOK) {
        wx.showToast({
          title: '保存成功',
          icon:'none'
        })
      } else {
        wx.showToast({
          title: '保存失败',
          icon:'none'
        })
      }
    })
  },

  // 画板变化
  drawingBoardChange (e) {
    console.log('当前画板存在的笔画数：', e.detail.strokesNumber)
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    this.data.drawingBoard = this.selectComponent('#drawing-board')
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

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