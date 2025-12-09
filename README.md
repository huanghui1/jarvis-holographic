# J.A.R.V.I.S. Holographic Interface v2.0
一个受钢铁侠 HUD 启发的全息交互界面：实时摄像头画面、手势识别控制地球与战术地形、分层式 HUD 信息面板与声效反馈，并集成 LLM 对话（DeepSeek API）与高德地图（AMap）控制，开箱配置即用的前端演示项目。

很高兴将本项目的完整代码开源！这是我近期探索“AI+交互”的一个趣味实践，希望能为同样对AI应用开发感兴趣的朋友提供一些参考和灵感。

关于代码使用，有几个温馨提醒：

## 📖 最佳起点
- 我已尽力完善README.md` 文档
- 请务必先阅读文档，预计能解决80%的配置问题

---

## ⏳ 精力有限，望您理解
- 作为普通AI小博主，我白天要处理公司事务，晚上维护项目和社群
- 无法提供一对一的无偿技术咨询，尤其是环境配置、API申请等基础问题
- 如果遇到问题，建议先查看 Issues 或搜索相关错误信息

---

## 🤝 我们可以这样互动
- 发现Bug或有改进建议 → 欢迎提交 Pull Request 或 Issue
- 有共性的技术问题 → 我可能会在社群或视频中统一解答
- 想深入交流 → 可以关注我的抖音进粉丝群（老雷AI洞见），那里有更多同好一起讨论

---

开源是为了分享与启发，而非提供免费技术支持。相信理解独立开发者时间宝贵的朋友，一定能体谅这份约定的初衷。

感谢您的理解与支持！如果这个项目给您带来了灵感，记得给个 Star ⭐️ 鼓励哦～

## 功能特性

- 实时摄像头背景层，叠加手部骨架、指尖瞄准与状态徽标
- 右手水平位移控制地球旋转速度；左手拇指-食指捏合控制“扩展/缩放”并在高阈值切换至战术地形
- 右手捏合弹出“GEO_INTEL_LIVE”情报面板，随指尖位置漂移并有锁定/释放音效
- 3D 地球（纹理、云层、线框、轨道、卫星粒子）与战术斜视地形（网格、峰值标记、雷达环）
- 全屏 HUD 叠层：系统标题与时钟、仪表盘、目录/状态面板、通讯订阅列表、扫描线与暗角效果
- 声效与 TTS：启动提示、伺服电机感、地图切换、锁定/释放，以及“Hello. I am Jarvis.” 语音

## 技术栈

- 前端框架：`React 18`、`TypeScript`
- 构建工具：`Vite 6`（开发端口 `3000`，网络可访问）
- 3D/渲染：`three`、`@react-three/fiber`、`@react-three/drei`、`@react-three/postprocessing`、`postprocessing`
- 手势识别：`@mediapipe/tasks-vision`（通过 CDN 加载 WASM，GPU 委托）
- 样式：`Tailwind CSS`（CDN 运行时配置自定义主题/动画）
- 音频：WebAudio API 与 `SpeechSynthesis` 需科学上网才能调用
- 地图：`AMap Web JS API v2.0`

## 目录结构

```
├─ components/
│  ├─ VideoFeed.tsx         # 摄像头采集与每帧识别、手势状态派发
│  ├─ HolographicEarth.tsx  # 地球与战术地形的 3D 场景
│  ├─ HUDOverlay.tsx        # 叠层式 HUD 与手势 UI 联动
│  ├─ JarvisIntro.tsx       # 启动引导屏动画
│  ├─ HolographicSuit.tsx   # 战甲模型与喷射/光束特效
│  ├─ AMapView.tsx          # 高德地图视图与手势/语音联动
│  ├─ EyeTargetOverlay.tsx  # 右眼瞄准环 HUD（人脸地标联动）
│  └─ ObjectScanOverlay.tsx # 物体检测扫描 HUD（演示效果）
├─ services/
│  ├─ mediapipeService.ts   # MediaPipe 初始化与识别器管理
│  ├─ llmService.ts         # LLM 对话封装（OpenAI/DeepSeek 兼容接口）
│  ├─ soundService.ts       # 音效与 TTS 封装
│  ├─ faceLandmarkerService.ts      # 人脸地标识别
│  └─ objectDetectionService.ts     # 物体检测（演示）
├─ App.tsx                  # 应用根视图与引导/主界面切换
├─ index.tsx                # React 入口
├─ index.html               # 宿主文档、Tailwind CDN、importmap 与样式
├─ types.ts                 # 手势与面板等类型定义
├─ vite.config.ts           # 开发服务配置与环境变量注入
├─ package.json             # 依赖与脚本
└─ .env.local               # 环境变量（LLM 与 AMap 配置）
```

## 快速开始

1. 安装依赖：
   ```bash
   npm install
   ```
2. 配置环境变量：在项目根目录创建 `.env.local`（或使用系统环境变量），并设置下述键值（详见下文“配置说明”）：
   ```bash
   # DeepSeek / OpenAI 兼容 LLM 接口
   LLM_BASE_URL=https://api.deepseek.com
   LLM_API_KEY=<你的 DeepSeek API Key>
   LLM_MODEL=deepseek-chat   # 或 deepseek-reasoner 等

   # 高德地图 Web JS API
   AMAP_KEY=<你的高德 key>
   AMAP_SECURITY_CODE=<你的安全码>  # 或 AMAP_SECRET
   ```
3. 启动开发服务器：
   ```bash
   npm run dev
   # 访问 http://localhost:3000/
   ```

> Node 版本建议：推荐 `Node >= 20`（避免某些插件的引擎警告）。在 `Node 18` 下仍可正常运行但可能提示警告。

## 手势与交互说明

- 右手横向位移（`landmarks[9].x` 中心锚点）映射到旋转速度：向左为负、向右为正（`components/HolographicEarth.tsx:321`）
- 左手捏合距离（拇指尖 `4` 与食指尖 `8` 的距离）归一化为扩展因子：低值近似最大扩展，高值近似最小（`components/VideoFeed.tsx:71`）
- 当扩展因子 > 0.55，触发地形模式与“地图切换”音效（`components/HolographicEarth.tsx:364`）
- 右手捏合（距离阈值 < 0.05）弹出情报面板，松开则隐藏，并播放锁定/释放音效（`components/HUDOverlay.tsx:270`）
- 启动流程：点击“初始化 J.A.R.V.I.S.”后播放启动音、引导屏语音，再进入主界面（`App.tsx:499`）

### 语音与命令

- 唤醒与会话：`hello jarvis` / `hey jarvis` / `jarvis` / `你好 jarvis`
- 地图控制：`map` 打开，`map off` 关闭；`定位到 北京` 或 `locate to Beijing`
- 扫描：`scan` 开启，`scan off` 关闭
- 标记与战甲：`show mark` 显示战甲，`mark off` 关闭
- 缩放：`zoom in` / `zoom out`（也可左手握拳/张开触发）
- 任务：`reset` / `stop` / `fly` / `landing`（分别复位/停止/飞行/降落；战甲与地图均响应）
- 右眼瞄准环：`eye` 开启，`eye off` 关闭
- 结束会话：`over`

### 键盘文字交互

- `Enter` 打开/提交命令输入框，`Esc` 关闭输入框
- 可以通过文字方式跟 J.A.R.V.I.S 交互，例如：`hello jarvis`、`fly`、`show mark` 等

## 开发说明

- MediaPipe 初始化：
  - 首选从 `jsDelivr` 加载 WASM，失败时回退到 `unpkg`（`services/mediapipeService.ts:18`、`services/mediapipeService.ts:25`）
  - 识别器运行模式为 `VIDEO`，`numHands: 2`（`services/mediapipeService.ts:30`）
- 视频播放与权限：自动播放可能被浏览器阻止，代码在 `VideoFeed` 中做了元数据与交互回退（`components/VideoFeed.tsx:31`）
- 音频与 TTS：首次交互后通过 `SoundService.initialize()` 恢复 `AudioContext`；TTS 优先选用英式男声（`services/soundService.ts:96-143`、`services/soundService.ts:22-35`）
- 样式：`index.html` 内通过 Tailwind CDN 配置自定义颜色与动画，避免额外构建步骤
- 外部资源：地球纹理来自 three 官方示例仓库；网络不可用时可能降级

## 配置说明（DeepSeek API 与高德地图）

### DeepSeek API（LLM 对话）
- 官网：[https://www.deepseek.com/](https://www.deepseek.com/)
- 环境变量读取位置：`services/llmService.ts:6-10`（`LLM_BASE_URL`、`LLM_API_KEY`、`LLM_MODEL`）
- 请求路径：`/v1/chat/completions`（OpenAI 兼容）
- 示例 `.env.local` 配置：
  ```bash
  LLM_BASE_URL=https://api.deepseek.com
  LLM_API_KEY=sk-xxxxx
  LLM_MODEL=deepseek-chat
  ```
- 说明：在 DeepSeek 控制台申请 API Key；本项目以非流式响应展示文本，并通过浏览器 `SpeechSynthesis` 播读

### 高德地图（AMap Web JS API）
- 官网：[https://lbs.amap.com/](https://lbs.amap.com/)
- 环境变量读取位置：`components/AMapView.tsx:115-127`（`AMAP_KEY`、`AMAP_SECURITY_CODE` 或 `AMAP_SECRET`）
- 加载方式：运行时注入 `<script src="https://webapi.amap.com/maps?v=2.0&key=...">`（`components/AMapView.tsx:121-131`）
- 示例 `.env.local` 配置：
  ```bash
  AMAP_KEY=xxxxxxxxxxxxxxxxxxxxxxxx
  AMAP_SECURITY_CODE=yyyyyyyyyyyyyyyy
  ```
- 说明：在高德开放平台创建应用并启用 Web 端；若使用安全码，需启用安全校验。地图打开后可通过手势捏合、右手拖拽与语音指令控制缩放/平移/

### 环境变量注入（Vite）

- 注入位置：`vite.config.ts:15-22` 使用 `define` 将 `.env.local` 键映射到 `process.env.*`，供前端使用。

## 常见问题

- 摄像头无法工作：确保浏览器已授予摄像头权限；在系统层面未被占用；HTTPS/本地环境下的安全策略允许访问。
- 无声或语音不播放：浏览器可能在未交互前暂停 `AudioContext` 或 `SpeechSynthesis`；点击“初始化 J.A.R.V.I.S.”后即可恢复。
- 引擎警告：在 `npm install` 时可能提示 `@vitejs/plugin-react` 的 Node 引擎要求；升级至 Node 20+ 可消除警告。
- CDN 资源加载失败：检查网络并重试；MediaPipe 有内置回退源；也可自建静态资源镜像。
- 浏览器兼容性：Chrome 89+ 才支持 `SpeechSynthesis`；Firefox 95+ 才支持 `MediaPipe`。
- 语音模式需要`科学上网`，否则会出现语音识别和播放失败的情况。
- 语音模式不支持的情况下，可以使用文字模式跟 J.A.R.V.I.S 交互。

## 开源与授权

- 本项目用于学习与演示科幻 HUD 交互，严禁用于任何违反法律法规的场景。
- 本项目使用的钢铁侠模型（`models/ironman.glb`）来自第三方模型库，仅用于演示与交互，不得用于任何商业用途。
- 本项目不提供免费咨询服务，如需商业合作请联系项目维护者，联系方式：微信 xxjun9527。

## 构建与部署

```bash
npm run build    # 生成静态文件（默认输出到 dist/）
npm run preview  # 本地预览构建产物
```

构建后的站点可部署至任意静态托管（需网络以加载外部纹理与 WASM，或改为本地托管这些资源）。

## 鸣谢

- [three.js](https://threejs.org/)、[react-three-fiber](https://github.com/pmndrs/react-three-fiber)
- [MediaPipe Tasks Vision](https://developers.google.com/mediapipe)
- [LLIypuk-钢铁侠模型博主](https://www.youtube.com/@LLIypuk)
- 声效与 HUD 视觉灵感来源于科幻 UI 设计与开源社区作品