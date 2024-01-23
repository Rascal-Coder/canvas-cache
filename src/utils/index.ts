export function getRandom(a: number, b: number) {
  return Math.random() * (b - a) + a
}

export function getZ(num: number) {
  let rounded
  rounded = (0.5 + num) | 0
  // A double bitwise not.
  rounded = ~~(0.5 + num)
  // Finally, a left bitwise shift.
  rounded = (0.5 + num) << 0

  return rounded
}
// 定义一个函数，该函数根据浏览器环境选择合适的 requestAnimationFrame 函数
window.RAF = (function () {
  // 选择性地使用不同浏览器的 requestAnimationFrame 函数
  return (
    window.requestAnimationFrame
    || function (callback: FrameRequestCallback) {
      // 如果以上都不支持，使用 setTimeout 模拟动画帧
      return window.setTimeout(callback, 1000 / 60)
    }
  )
})()
