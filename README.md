# Evo Game

一个轻量的 2D 卡通海底世界进化小游戏，包含生物生态、进化与掉级、攻击/吞噬判定、暂停弹窗、道具与战斗、移动端摇杆等功能。适合展示 Canvas 渲染、简单 AI 与配置驱动的游戏玩法。

## 功能概览
- 地图与背景
  - 卡通海底背景（淡蓝水体、左侧沙地/右侧岩石、海草与石块装饰）
  - 顶部动态光束、水体漂浮微粒、底部气泡效果
- 生物生态
  - 基于玩家等级的生物生成与数量维持，可配置攻击性比例
  - 视野内高等级生物概率攻击（可配 `ai.js`），视野外不判定
  - 吞噬与碰撞：弱者被吞噬，强者接触玩家会扣经验并推开
- 进化与掉级
  - 升级弹出进化预览面板，确认后切换形态
  - 掉级逻辑：经验为负时回退等级并承载欠缺经验
  - 进化路径扩展至鲨鱼终形（多种鱼类绘制）
- 游戏结束
  - 等级 1 且经验 < 0 时触发“游戏结束”覆盖层，可重开
- 道具与战斗
  - 宝箱：随机生成，打开后可获得经验与临时加速（可配置），可奖励飞镖弹药
  - 加速（Boost）：键盘或按钮触发，消耗次数、按配置持续与倍率
  - 飞镖（Darts）：键盘或按钮发射，命中可获得经验；对高等级目标需按“等级差×系数”额外消耗弹药
- 交互与 HUD
  - 桌面：键盘移动（WASD/箭头）、Shift/Space 加速、E 发射飞镖
  - 移动端：左下虚拟摇杆、右下圆形按钮（加速/飞镖，显示剩余次数）
  - HUD 显示等级、经验、生态数量、吞噬计数、时间，以及加速与飞镖资源

## 运行
- 需要任意静态服务器；推荐 Python 简单服务：
  - 在项目根目录执行：
    - `python3 -m http.server 8001`
  - 打开浏览器访问：
    - `http://localhost:8001/`

## 控制
- 桌面键位
  - 移动：`WASD` 或 `方向键`
  - 加速：`Shift` 或 `Space`
  - 飞镖：`E`
- 移动端
  - 左下摇杆：方向移动（支持多指，不影响按钮）
  - 右下按钮：圆形“加速”“飞镖”按钮，显示可用次数；`pointerdown` 即刻触发

## 主要配置
- 生成与生态：`src/config/spawn.js`
  - `spawnRules.maxCreatures`：维持的生物上限
  - `spawnRules.spawnIntervalSec`：补量生成间隔（秒）
  - `spawnRules.biasAroundPlayerLevel`：围绕玩家等级的生成偏移范围
  - `spawnRules.aggressiveRatioTarget`：攻击性（`behavior: 'chase'`）比例目标
- 物种：`src/config/species.js`
  - 定义各物种的 `id/baseLevel/behavior/radius/speed/shape/color`
- AI 攻击：`src/config/ai.js`
  - `probability`：视野内触发攻击概率
  - `levelAdvantage`：至少高出多少等级才有资格攻击
  - `durationSec/cooldownSec/speedMultiplier`：攻击持续、冷却与加速
- 进化：`src/config/evolution.js`
  - `evolutionForms`：等级到形态的映射（形状与颜色）
- 经验与升级：`src/config/progression.js`
  - `baseExp/growth/expMultiplier/tierMultipliers`：升级所需经验曲线
  - `devourExp`：吞噬经验奖励规则
  - `contactPenalty`：接触强者的经验扣减与冷却
- 战斗：`src/config/combat.js`
  - 加速 `boost.durationSec/multiplier/baseUsesOnStart/addUsesPerLevel`
  - 飞镖 `darts.baseAmmoOnStart/addAmmoPerLevel/speed/lifetimeSec/radius/fireCooldownSec/expOnHit/levelDiffCostFactor`
    - `levelDiffCostFactor`：打更高等级目标时的额外弹药消耗系数
- 宝箱：`src/config/chest.js`
  - `maxCount/spawnIntervalSec/spawnProbability`
  - 奖励：`expReward/speedBoostMultiplier/speedBoostDuration/ammoReward`

## 代码结构（节选）
- `src/Game.js`：主循环（更新/渲染/碰撞/生成/覆盖层）
- `src/Player.js`：玩家逻辑（经验、进化、加速、朝向）
- `src/Creature.js`：生物逻辑与渲染
- `src/Renderer.js`：各鱼类绘制函数
- `src/Background.js`：水体、底部地形与装饰、动态光束
- `src/Bubbles.js` / `src/WaterParticles.js`：气泡与水体微粒
- `src/Dart.js`：飞镖实体
- `src/TouchJoystick.js`：多指兼容的虚拟摇杆
- `src/ui/*.js`：进化与游戏结束、宝箱弹窗

## 注意事项
- 性能
  - 采用视口裁剪：仅绘制屏幕内对象（生物、文本、粒子、气泡、宝箱、飞镖）
  - 资源简单、绘制轻量，适合中低端设备
- 交互
  - 移动端按钮使用 `pointerdown + preventDefault`，摇杆按 `pointerId` 区分多指，避免互相干扰
- 可扩展
  - 可继续加入区域生态偏好、光纹贴图、更多鱼类精灵、伤害/血量系统、连发/连击 UI 等

---
如需调整节奏或玩法（例如更稀有宝箱、更强飞镖或更高攻击性比例），修改上述配置文件即可；若需要我直接给出一套“快节奏/慢节奏”的参数方案，也可以告诉我目标体验。