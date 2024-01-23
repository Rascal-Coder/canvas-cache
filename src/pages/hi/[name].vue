<script setup lang="ts">
import Stats from 'stats.js'
import { USwitch } from 'unocss-ui'
import { getRandom, getZ } from '~/utils/index'

const router = useRouter()
const route = useRoute('/hi/[name]')
const user = useUserStore()
const { t } = useI18n()
const stats = new Stats()
const isUseCache = ref(false)
stats.showPanel(0)
Object.assign(stats.dom.style, {
  position: 'absolute',
  right: '0px',
  top: '0px',
  left: '', // 或者 'auto'，根据你的需求
})
document.body.appendChild(stats.dom)
const counter = computed(() => {
  return isUseCache.value ? 1000 : 100
})
const description = computed(() => {
  const cacheText = isUseCache.value ? '使用缓存' : '未使用缓存'
  const isLaggings = isUseCache.value ? '也不卡' : '就开始卡'
  return `${cacheText},${counter.value}个圈圈对象${isLaggings}`
})
const testBox = function () {
  const canvas = document.getElementById('cas') as HTMLCanvasElement
  const ctx = canvas.getContext('2d')
  const borderWidth = 2
  const Balls: Ball[] = []

  class Ball {
    x: number
    y: number
    vx: number
    vy: number
    r: number
    color: string[]
    cacheCanvas: HTMLCanvasElement
    cacheCtx: CanvasRenderingContext2D
    useCache: boolean

    constructor(x: number, y: number, vx: number, vy: number, useCache: boolean) {
      this.x = x
      this.y = y
      this.vx = vx
      this.vy = vy
      this.r = getZ(getRandom(20, 40))
      this.color = []
      this.cacheCanvas = document.createElement('canvas')
      this.cacheCtx = this.cacheCanvas.getContext('2d')!
      this.cacheCanvas.width = 2 * this.r
      this.cacheCanvas.height = 2 * this.r
      const num = getZ(this.r / borderWidth)
      for (let j = 0; j < num; j++)
        this.color.push(`rgba(${getZ(getRandom(0, 255))},${getZ(getRandom(0, 255))},${getZ(getRandom(0, 255))},1)`)

      this.useCache = useCache
      if (useCache)
        this.cache()
    }

    paint(ctx: CanvasRenderingContext2D) {
      if (!this.useCache) {
        ctx.save()
        let j = 0
        ctx.lineWidth = borderWidth
        for (let i = 1; i < this.r; i += borderWidth) {
          ctx.beginPath()
          ctx.strokeStyle = this.color[j]
          ctx.arc(this.x, this.y, i, 0, 2 * Math.PI)
          ctx.stroke()
          j++
        }
        ctx.restore()
      }
      else {
        ctx.drawImage(this.cacheCanvas, this.x - this.r, this.y - this.r)
      }
    }

    cache() {
      this.cacheCtx.save()
      let j = 0
      this.cacheCtx.lineWidth = borderWidth
      for (let i = 1; i < this.r; i += borderWidth) {
        this.cacheCtx.beginPath()
        this.cacheCtx.strokeStyle = this.color[j]
        this.cacheCtx.arc(this.r, this.r, i, 0, 2 * Math.PI)
        this.cacheCtx.stroke()
        j++
      }
      this.cacheCtx.restore()
    }

    move() {
      this.x += this.vx
      this.y += this.vy
      if (this.x > (canvas.width - this.r) || this.x < this.r) {
        this.x = this.x < this.r ? this.r : (canvas.width - this.r)
        this.vx = -this.vx
      }
      if (this.y > (canvas.height - this.r) || this.y < this.r) {
        this.y = this.y < this.r ? this.r : (canvas.height - this.r)
        this.vy = -this.vy
      }

      this.paint(ctx!)
    }
  }

  const Game = {
    init() {
      for (let i = 0; i < counter.value; i++) {
        const b = new Ball(getRandom(0, canvas.width), getRandom(0, canvas.height), getRandom(-10, 10), getRandom(-10, 10), isUseCache.value)
        Balls.push(b)
      }
    },

    update() {
      ctx!.clearRect(0, 0, canvas.width, canvas.height)
      for (let i = 0; i < Balls.length; i++)
        Balls[i].move()
    },

    loop() {
      this.update()
      stats.update()

      window.RAF(() => {
        this.loop()
      })
    },

    start() {
      this.init()
      this.loop()
    },
  }

  return Game
}

onMounted(() => {
  testBox().start()
})
watch(() => isUseCache.value, () => {
  testBox().start()
})
watchEffect(() => {
  user.setNewName(route.params.name)
})
</script>

<template>
  <div>
    <div text-4xl>
      <div i-carbon-pedestrian inline-block />
    </div>
    <p>
      {{ t('intro.hi', { name: user.savedName }) }}
    </p>

    <p text-sm opacity-75>
      <em>{{ t('intro.dynamic-route') }}</em>
    </p>

    <template v-if="user.otherNames.length">
      <p mt-4 text-sm>
        <span opacity-75>{{ t('intro.aka') }}:</span>
        <ul>
          <li v-for="otherName in user.otherNames" :key="otherName">
            <RouterLink :to="`/hi/${otherName}`" replace>
              {{ otherName }}
            </RouterLink>
          </li>
        </ul>
      </p>
    </template>

    <div>
      <button
        m="3 t6" text-sm btn
        @click="router.back()"
      >
        {{ t('button.back') }}
      </button>
    </div>
    <div class="flex flex-justify-center flex-items-center">
      <USwitch
        v-model="isUseCache"
      >
        <span>是否使用缓存</span>
      </USwitch>
    </div>
    <div class="flex flex-justify-center flex-items-center">
      <canvas id="cas" width="800" height="600">浏览器不支持canvas</canvas>
    </div>
    <p>
      {{ description }}
    </p>
  </div>
</template>
