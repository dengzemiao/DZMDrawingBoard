// DZMDrawingBoard/index.js
Component({

  // 组件的属性列表
  properties: {
    // 线宽度
    lineWidth: {
      type: Number,
      value: 1,
      observer (e) {
        if (this.data.ctx) { this.data.ctx.lineWidth = e }
      }
    },
    // 线颜色
    lineColor: {
      type: String,
      value: '#000',
      observer (e) {
        if (this.data.ctx) { this.data.ctx.strokeStyle = e }
      }
    },
    // 画板背景颜色, 默认透明
    bgColor: {
      type: String,
      value: 'rgba(255, 255, 255, 0)',
      observer () {
        if (this.data.ctx) { this.clear() }
      }
    }
  },

  // 组件的初始数据
  data: {
    // 画板
    canvas: undefined,
    // 画板上下文
    ctx: undefined,
    // 所有笔画
    strokes: []
  },

  // 组件的方法列表
  methods: {
    // ---------------------------- 公有方法 ----------------------------
    // 画板是否为空画板
    isEmpty () {
      return !!this.data.strokes.length
    },
    // 清空画板笔画
    clear () {
      if (this.data.ctx) {
        // 清空笔画
        this.setData({ strokes: [] })
        // 绘制背景
        this.reloadCtxBG()
        // 绘图变化回调
        this.callback()
      }
    },
    // 撤回到上一个笔画
    revoke () {
      if (this.data.ctx && this.data.strokes.length) {
        // 移除最后一笔
        this.data.strokes.pop()
        // 开始重新绘制
        this.redraw()
        // 绘图变化回调
        this.callback()
      }
    },
    // 生成图片
    createImage (result=undefined, save=false, saveResult=undefined) {
      wx.canvasToTempFilePath({
        canvasId: 'drawing-board-canvas',
        canvas: this.data.canvas,
        success (res) {
          // 图片链接
          const imagePath = res.tempFilePath || ''
          const isOK = !!imagePath
          if (result) { result(isOK, res) }
          // 保存相册
          if (save && isOK) {
            wx.saveImageToPhotosAlbum({
              filePath: imagePath,
              success (res) {
                if (saveResult) { saveResult(true, res) }
              },
              fail (err) {
                if (saveResult) { saveResult(false, err) }
              }
            })
          }
        },
        // 生成图片失败
        fail (err) {
          if (result) { result(false, err) }
        }
      })
    },


    // ---------------------------- 私有方法 ----------------------------

    // 获取画板及上下文
    getCanvas () {
      const query = wx.createSelectorQuery().in(this)
      query.select('#drawing-board-canvas')
      .fields({ node: true, size: true })
      .exec((res) => {
        // 获取画板
        const canvas = res[0].node
        // 获取上下文
        const ctx = canvas.getContext('2d')
        // 获取设备像素比例
        const dpr = wx.getSystemInfoSync().pixelRatio
        // 计算画板当前显示器宽高
        canvas.width = res[0].width * dpr
        canvas.height = res[0].height * dpr
        // 设置缩放比例
        ctx.scale(dpr, dpr)
        // 设置组件参数使用
        this.setData({
          canvas: canvas,
          ctx: ctx
        })
        // 刷新上下文属性
        this.reloadCtx()
        // 清空画板
        this.clear()
      })
    },
    // 手指触摸动作开始
    touchStart (e) {
      const touches = e.touches
      const touche = touches[0]
      let ctx = this.data.ctx
      ctx.beginPath()
      ctx.moveTo(touche.x, touche.y)
      // 记录笔画
      this.addStroke(touche, true)
    },
    // 手指触摸后移动
    touchMove (e) {
      const touches = e.touches
      const touche = touches[0]
      let ctx = this.data.ctx
      ctx.lineTo(touche.x, touche.y)
      ctx.stroke()
      // 记录笔画
      this.addStroke(touche, false)
    },
    // 手指触摸动作结束
    touchEnd (e) {
      let ctx = this.data.ctx
      ctx.closePath()
      // 绘图变化回调
      this.callback()
    },
    // 手指触摸动作被打断，如来电提醒，弹窗
    touchCancel (e) {
      let ctx = this.data.ctx
      ctx.closePath()
      // 绘图变化回调
      this.callback()
    },
    // 添加笔画
    addStroke (touche, isStart) {
      // 判断是否为开始笔画还是后续笔画
      if (isStart) {
        // 笔画属性
        const attr = {
          lineWidth: this.data.lineWidth,
          lineColor: this.data.lineColor
        }
        // 记录开始笔画
        this.data.strokes.push({
          // 笔画属性
          attr: attr,
          // 笔画坐标
          points: [{x: touche.x, y: touche.y}]
        })
      } else {
        // 后续笔画
        const lastStroke = this.data.strokes.pop()
        lastStroke.points.push({x: touche.x, y: touche.y})
        this.data.strokes.push(lastStroke)
      }
    },
    // 刷新上下文属性
    reloadCtx (attr={}) {
      let ctx = this.data.ctx
      ctx.lineWidth = attr.lineWidth || this.data.lineWidth
      ctx.strokeStyle = attr.lineColor || this.data.lineColor
    },
    // 刷新上下文背景
    reloadCtxBG () {
      if (this.data.ctx) {
        // 清空画板
        this.data.ctx.clearRect(0, 0, this.data.canvas.width, this.data.canvas.height)
        // 重新绘制画板背景
        let ctx = this.data.ctx
        let canvas = this.data.canvas
        ctx.fillStyle = this.data.bgColor
        ctx.fillRect(0, 0, canvas.width, canvas.height)
      }
    },
    // 重新绘制 - 更具当前笔画记录进行重新绘制
    redraw () {
      // 刷新画板背景
      this.reloadCtxBG()
      // 是否还有笔画
      if (this.data.strokes.length) {
        // 获取到上下文
        let ctx = this.data.ctx
        // 开始绘制
        this.data.strokes.forEach((stroke) => {
          // 笔画属性
          const attr = stroke.attr
          // 更新当前笔画属性到上下文
          this.reloadCtx(attr)
          // 笔画列表
          const points = [...stroke.points]
          // 获得第一笔
          const firstPoint = points.shift()
          // 开始绘制一笔
          ctx.beginPath()
          // 绘制第一笔
          ctx.moveTo(firstPoint.x, firstPoint.y)
          // 绘制后面剩余笔画
          points.forEach((point) => {
            ctx.lineTo(point.x, point.y)
          })
          // 绘制
          ctx.stroke()
          // 绘制一笔结束
          ctx.closePath()
        })
        // 恢复上下文默认属性
        this.reloadCtx()
      }
    },
    // 画板变化回调
    callback () {
      this.triggerEvent('change', {
        strokesNumber: this.data.strokes.length
      })
    }
  },

  // 组件生命周期函数 - 在组件布局完成后执行
  ready () {
    // 获取画板及上下文
    this.getCanvas()
  },

  // 组件生命周期函数 - 在组件实例被从页面节点树移除时执行
  detached () {
    // 画板销毁了
  }
})

