<template>
  <div class="login-container" @mousemove="onMouseMove">
    <canvas ref="canvasRef" class="bg-canvas"></canvas>
    <div class="login-box">
      <h2>果冻日记管<span @dblclick="setpow()">理</span></h2>
      <el-form :model="loginForm" :rules="rules" ref="loginFormRef" class="login-form">
        <el-form-item prop="username">
          <el-input
            v-model="loginForm.username"
            placeholder="请输入用户名"
            prefix-icon="User"
            size="large"
          />
        </el-form-item>
        <el-form-item prop="password">
          <el-input
            v-model="loginForm.password"
            type="password"
            placeholder="请输入密码"
            prefix-icon="Lock"
            size="large"
            show-password
            @keyup.enter="handleLogin"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" size="large" style="width: 100%" @click="handleLogin" :loading="loading">
            登录
          </el-button>
        </el-form-item>
      </el-form>
      <div class="tips">
        <!-- <p>默认账号: admin / 密码: 123456</p> -->
      </div>
    </div>
    <div style="position: fixed;bottom: 1px;width: 100%;text-align: center;background-color: #fff;height: 40px;padding-top: 10px;"> 
      ICP备案/许可证号：<a href="https://beian.miit.gov.cn/" target="_blank">蜀ICP备2026020313号-1</a> &emsp;&emsp;
      <img style="width: 15px;" src="./1.png" alt=""> <span>川公网安备&emsp; 
        <a href="https://www.beian.gov.cn/portal/registerSystemInfo?recordcode=51015602001790" target="_blank" rel="noopener noreferrer">51015602001790号</a> </span> </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { login as loginApi } from '@/api/user'

const router = useRouter()
const userStore = useUserStore()

const loginFormRef = ref<FormInstance>()
const loading = ref(false)
const canvasRef = ref<HTMLCanvasElement>()
let animationId = 0

// ========== 粒子网络动态背景 ==========
let mouseX = -9999, mouseY = -9999
const onMouseMove = (e: MouseEvent) => {
  mouseX = e.clientX
  mouseY = e.clientY
}

onMounted(() => {
  const canvas = canvasRef.value!
  const ctx = canvas.getContext('2d')!
  let w = canvas.width = window.innerWidth
  let h = canvas.height = window.innerHeight

  // --- 粒子 ---
  interface Particle {
    x: number; y: number
    vx: number; vy: number
    r: number
    color: string
    pulse: number // 呼吸相位
  }
  const palette = [
    { r: 120, g: 90, b: 220 },   // 紫
    { r: 80, g: 160, b: 255 },   // 蓝
    { r: 236, g: 72, b: 153 },   // 粉
    { r: 255, g: 120, b: 160 },  // 淡粉
    { r: 100, g: 200, b: 255 },  // 浅蓝
    { r: 180, g: 130, b: 255 },  // 淡紫
  ]

  const particles: Particle[] = []
  const count = Math.min(Math.floor((w * h) / 8000), 180)
  const connectionDist = 140

  for (let i = 0; i < count; i++) {
    const c = palette[Math.floor(Math.random() * palette.length)]
    particles.push({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.8,
      vy: (Math.random() - 0.5) * 0.8,
      r: Math.random() * 2 + 1.2,
      color: `${c.r},${c.g},${c.b}`,
      pulse: Math.random() * Math.PI * 2
    })
  }

  // --- 鼠标吸引粒子 (光标附近粒子被轻微吸引) ---
  const mouseRadius = 160

  let frame = 0
  const draw = () => {
    frame++
    // 淡色背景渐隐
    ctx.fillStyle = 'rgba(8, 8, 24, 0.15)'
    ctx.fillRect(0, 0, w, h)

    // === 更新粒子 ===
    for (const p of particles) {
      // 鼠标吸引力
      if (mouseX > 0) {
        const dx = mouseX - p.x
        const dy = mouseY - p.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < mouseRadius && dist > 0) {
          const force = (1 - dist / mouseRadius) * 0.015
          p.vx += dx * force
          p.vy += dy * force
        }
      }

      // 速度衰减
      p.vx *= 0.99
      p.vy *= 0.99

      // 速度限制
      const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy)
      if (speed > 2) {
        p.vx = (p.vx / speed) * 2
        p.vy = (p.vy / speed) * 2
      }

      p.x += p.vx
      p.y += p.vy
      p.pulse += 0.03

      // 边界反弹
      if (p.x < 0 || p.x > w) p.vx *= -1
      if (p.y < 0 || p.y > h) p.vy *= -1
      p.x = Math.max(0, Math.min(w, p.x))
      p.y = Math.max(0, Math.min(h, p.y))
    }

    // === 绘制连线 ===
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const a = particles[i], b = particles[j]
        const dx = a.x - b.x, dy = a.y - b.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < connectionDist) {
          const alpha = (1 - dist / connectionDist) * 0.25
          ctx.beginPath()
          ctx.moveTo(a.x, a.y)
          ctx.lineTo(b.x, b.y)
          ctx.strokeStyle = `rgba(${a.color},${alpha})`
          ctx.lineWidth = 0.6
          ctx.stroke()
        }
      }
      // 粒子到鼠标的连线
      if (mouseX > 0) {
        const dx = particles[i].x - mouseX
        const dy = particles[i].y - mouseY
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < mouseRadius) {
          const alpha = (1 - dist / mouseRadius) * 0.4
          ctx.beginPath()
          ctx.moveTo(particles[i].x, particles[i].y)
          ctx.lineTo(mouseX, mouseY)
          ctx.strokeStyle = `rgba(255,255,255,${alpha})`
          ctx.lineWidth = 0.8
          ctx.stroke()
        }
      }
    }

    // === 绘制粒子 ===
    for (const p of particles) {
      const pulseSize = Math.sin(p.pulse) * 0.5 + 1
      const size = p.r * pulseSize

      // 外发光
      const glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, size * 5)
      glow.addColorStop(0, `rgba(${p.color},0.2)`)
      glow.addColorStop(1, `rgba(${p.color},0)`)
      ctx.beginPath()
      ctx.arc(p.x, p.y, size * 5, 0, Math.PI * 2)
      ctx.fillStyle = glow
      ctx.fill()

      // 粒子核心
      ctx.beginPath()
      ctx.arc(p.x, p.y, size, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(${p.color},0.85)`
      ctx.fill()

      // 高光
      ctx.beginPath()
      ctx.arc(p.x - size * 0.2, p.y - size * 0.2, size * 0.35, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(255,255,255,0.6)`
      ctx.fill()
    }

    // === 鼠标光晕 ===
    if (mouseX > 0) {
      const glow = ctx.createRadialGradient(mouseX, mouseY, 0, mouseX, mouseY, mouseRadius)
      glow.addColorStop(0, 'rgba(120,90,220,0.06)')
      glow.addColorStop(0.5, 'rgba(80,160,255,0.03)')
      glow.addColorStop(1, 'transparent')
      ctx.beginPath()
      ctx.arc(mouseX, mouseY, mouseRadius, 0, Math.PI * 2)
      ctx.fillStyle = glow
      ctx.fill()
    }

    animationId = requestAnimationFrame(draw)
  }

  // 初始背景
  ctx.fillStyle = '#080818'
  ctx.fillRect(0, 0, w, h)
  draw()

  window.addEventListener('resize', () => {
    w = canvas.width = window.innerWidth
    h = canvas.height = window.innerHeight
    ctx.fillStyle = '#080818'
    ctx.fillRect(0, 0, w, h)
  })
})

onUnmounted(() => {
  cancelAnimationFrame(animationId)
})

const loginForm = reactive({
  username: '',
  password: ''
})

const rules: FormRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
  ]
}
const setpow = () => {
  loginForm.username = 'admin'
  loginForm.password = '123456'
}
const handleLogin = async () => {
  if (!loginFormRef.value) return

  await loginFormRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true

      try {
        const res: any = await loginApi({
          username: loginForm.username,
          password: loginForm.password
        })
        console.log(res);
        
        if (res.code === 0) {
          userStore.setToken(res.data.token)
          userStore.setUserInfo(res.data.user)
          ElMessage.success('登录成功')
          router.push('/dashboard')
        }
      } catch (error) {
        console.error('登录失败:', error)
      } finally {
        loading.value = false
      }
    }
  })
}
</script>

<style scoped>
.login-container {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: #080818;
  overflow: hidden;
}

.bg-canvas {
  position: absolute;
  top: 0; left: 0;
  width: 100%; height: 100%;
  z-index: 0;
}

.login-box {
  position: relative;
  z-index: 1;
  width: 420px;
  padding: 45px 40px;
  background: rgba(12, 12, 35, 0.55);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border: 1px solid rgba(120, 90, 220, 0.2);
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4),
              0 0 80px rgba(120, 90, 220, 0.08),
              inset 0 1px 0 rgba(255, 255, 255, 0.05);
}

.login-box h2 {
  text-align: center;
  margin-bottom: 35px;
  font-size: 28px;
  font-weight: 700;
  background: linear-gradient(135deg, #b49aff, #7eb4ff, #ff8fb1);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: 3px;
}

:deep(.el-input__wrapper) {
  background: rgba(255, 255, 255, 0.06) !important;
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
  box-shadow: 0 2px 12px rgba(120, 90, 220, 0.06) !important;
  border-radius: 10px !important;
  transition: all 0.3s ease;
}

:deep(.el-input__wrapper:hover),
:deep(.el-input__wrapper.is-focus) {
  border-color: rgba(120, 90, 220, 0.35) !important;
  box-shadow: 0 0 20px rgba(120, 90, 220, 0.12) !important;
}

:deep(.el-input__inner) {
  color: #e2e8f0 !important;
  font-size: 14px;
}

:deep(.el-input__inner::placeholder) {
  color: rgba(255, 255, 255, 0.3) !important;
}

:deep(.el-input__prefix .el-icon) {
  color: rgba(180, 154, 255, 0.6);
}

:deep(.el-form-item__error) {
  color: #f87171;
}

:deep(.el-button--primary) {
  background: linear-gradient(135deg, #7c5cbf, #5b8def, #ec4899) !important;
  border: none !important;
  border-radius: 10px !important;
  font-weight: 600;
  font-size: 15px;
  letter-spacing: 4px;
  height: 44px;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

:deep(.el-button--primary::before) {
  content: '';
  position: absolute;
  top: 0; left: -100%;
  width: 100%; height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
  transition: left 0.6s ease;
}

:deep(.el-button--primary:hover::before) {
  left: 100%;
}

:deep(.el-button--primary:hover) {
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(120, 90, 220, 0.35);
}

:deep(.el-button--primary:active) {
  transform: translateY(0);
}

.tips {
  margin-top: 20px;
  text-align: center;
  color: rgba(255, 255, 255, 0.3);
  font-size: 14px;
}

.tips p {
  margin: 0;
}
</style>
