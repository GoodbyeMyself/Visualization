# Plop 代码脚手架使用指南

本项目使用 [Plop.js](https://plopjs.com/) 作为代码脚手架工具
用于快速生成符合项目规范的 **Store**、**图表组件**、**装饰组件**、**VChart 组件** 和 **信息类组件**。

配置文件入口：`plop/plopfile.js`

---

## 快速开始

### 交互式（推荐）

```bash
yarn new
# 或
npm run new
# 或
make new
```

执行后在终端选择生成器类型，按提示填写即可。

### 直接指定生成器

跳过选择步骤，直接进入对应生成器的问答流程：

```bash
npx plop store        --plopfile ./plop/plopfile.js
npx plop chart        --plopfile ./plop/plopfile.js
npx plop decorate     --plopfile ./plop/plopfile.js
npx plop vchart       --plopfile ./plop/plopfile.js
npx plop information  --plopfile ./plop/plopfile.js
```

---

## 生成器一览

| 生成器 | 说明 | 输出位置 |
|--------|------|----------|
| `store` | Pinia Store 模块 | `src/store/modules/{name}Store/` |
| `chart` | ECharts 图表组件 | `src/packages/components/Charts/{分类}/{name}/` |
| `decorate` | 装饰 / 边框组件 | `src/packages/components/Decorates/{分类}/{name}/` |
| `vchart` | VChart 图表组件 | `src/packages/components/VChart/{分类}/{name}/` |
| `information` | 信息类组件（文字 / 图片） | `src/packages/components/Informations/{Texts\|Mores}/{name}/` |

---

## 命名规范

组件类生成器（`chart` / `decorate` / `vchart` / `information`）统一要求 **PascalCase** 命名：

- 正确：`MyBarChart`、`VChartMyLine`、`MyBorder`、`MyText`
- 错误：`myBarChart`、`my-bar-chart`、`My_Bar`

| 生成器 | 额外要求 |
|--------|----------|
| `vchart` | 名称必须以 `VChart` 开头，如 `VChartMyBar` |
| `store` | 输入 camelCase 即可，如 `user`，会生成 `userStore` |

---

## 1. store — Pinia Store

### 交互问题

| 字段 | 说明 | 示例 |
|------|------|------|
| name | Store 名称 | `user` |

### 生成文件

```
src/store/modules/userStore/
├── userStore.ts      # defineStore 实现
└── userStore.d.ts    # TypeScript 类型定义
```

### 生成后

在需要使用的文件中手动引入：

```ts
import { useUserStore } from '@/store/modules/userStore/userStore'
```

---

## 2. chart — ECharts 图表组件

### 交互问题

| 字段 | 说明 | 示例 |
|------|------|------|
| name | 组件名称 (PascalCase) | `MyBarChart` |
| title | 左侧组件面板显示的中文标题 | `我的柱状图` |
| category | 分类目录 | 柱状图 / 饼图 / 折线图 / 散点图 / 地图 / 更多 |
| chartType | ECharts 图表类型 | `bar` / `line` / `pie` |
| image | 预览图文件名 | `bar_x.png`（有默认值） |

### 分类目录对照

| 选项 | 目录 | 枚举 |
|------|------|------|
| 柱状图 | `Bars` | `BAR` |
| 饼图 | `Pies` | `PIE` |
| 折线图 | `Lines` | `LINE` |
| 散点图 | `Scatters` | `SCATTER` |
| 地图 | `Maps` | `MAP` |
| 更多 | `Mores` | `MORE` |

### 默认预览图

| chartType | 默认 image |
|-----------|------------|
| bar | `bar_x.png` |
| line | `line.png` |
| pie | `pie.png` |

### 生成文件

```
src/packages/components/Charts/Bars/MyBarChart/
├── index.ts      # 组件注册配置 (ConfigType)
├── config.ts     # 默认 option 与 Config 类
├── index.vue     # 画布展示组件 (vue-echarts)
├── config.vue    # 右侧配置面板
└── data.json     # 示例 dataset 数据
```

同时自动更新 `src/packages/components/Charts/{分类}/index.ts`，注册新组件。

---

## 3. decorate — 装饰 / 边框组件

### 交互问题

| 字段 | 说明 | 示例 |
|------|------|------|
| name | 组件名称 (PascalCase) | `MyBorder` |
| title | 中文标题 | `我的边框` |
| category | 分类目录 | 边框 / 装饰 / 流程 / 三维 / 更多 |
| chartFrame | 框架类型 | `STATIC`（静态）/ `COMMON`（支持 dataset） |
| image | 预览图文件名 | `flow-circle.png`（有默认值） |

### 分类目录对照

| 选项 | 目录 |
|------|------|
| 边框 | `Borders` |
| 装饰 | `Decorates` |
| 流程 | `FlowChart` |
| 三维 | `Three` |
| 更多 | `Mores` |

### 生成文件

```
src/packages/components/Decorates/Borders/MyBorder/
├── index.ts
├── config.ts
├── index.vue     # SVG 占位装饰（可按需修改）
└── config.vue
```

同时自动更新 `src/packages/components/Decorates/{分类}/index.ts`。

---

## 4. vchart — VChart 图表组件

### 交互问题

| 字段 | 说明 | 示例 |
|------|------|------|
| name | 组件名称，**必须以 VChart 开头** | `VChartMyBar` |
| title | 中文标题 | `我的柱状图-VChart` |
| category | 分类目录 | 柱状图 / 饼图 / 折线图 / 面积图 / 漏斗图 / 词云图 / 散点图 |
| chartType | VChart 图表类型 | `bar` / `line` / `pie` |
| image | 预览图文件名 | `vchart_bar_x.png`（有默认值） |

### 分类目录对照

| 选项 | 目录 |
|------|------|
| 柱状图 | `Bars` |
| 饼图 | `Pies` |
| 折线图 | `Lines` |
| 面积图 | `Areas` |
| 漏斗图 | `Funnels` |
| 词云图 | `WordClouds` |
| 散点图 | `Scatters` |

### 默认预览图

| chartType | 默认 image |
|-----------|------------|
| bar | `vchart_bar_x.png` |
| line | `vchart_line.png` |
| pie | `vchart_pie.png` |

### 生成文件

```
src/packages/components/VChart/Bars/VChartMyBar/
├── index.ts      # 注册配置，chartFrame 为 VCHART
├── config.ts     # 使用 vChartOptionPrefixHandle
├── index.vue     # 基于 GoVChart 的展示组件
├── config.vue    # 对接 VChartItemSetting 配置面板
└── data.json     # VChart values 格式示例数据
```

同时自动更新 `src/packages/components/VChart/{分类}/index.ts`。

---

## 5. information — 信息类组件（文字 / 图片）

### 交互问题

| 字段 | 说明 | 示例 |
|------|------|------|
| infoType | 组件类型 | 文字组件 / 图片组件 |
| name | 组件名称 (PascalCase) | `MyText` / `MyImage` |
| title | 中文标题 | `我的文字` |
| image | 预览图文件名 | `text_static.png` / `photo.png`（有默认值） |

### 输出目录

| infoType | 目录 | 分类 |
|----------|------|------|
| 文字 (text) | `Informations/Texts/{name}/` | 文本 |
| 图片 (image) | `Informations/Mores/{name}/` | 更多 |

### 生成文件

**文字组件：**

```
src/packages/components/Informations/Texts/MyText/
├── index.ts
├── config.ts     # 含 dataset、字体、边框等 option
├── index.vue     # 支持数据请求绑定
└── config.vue
```

**图片组件：**

```
src/packages/components/Informations/Mores/MyImage/
├── index.ts
├── config.ts     # 含 dataset（默认 @/assets/logo.png）、fit、圆角
├── index.vue     # 基于 n-image
└── config.vue
```

同时自动更新对应分类的 `index.ts`（`Texts/index.ts` 或 `Mores/index.ts`）。

---

## 生成后的必做事项

脚手架生成的是**可运行的最小骨架**，上线前通常还需要：

1. **放置预览图**  
   将 `image` 字段对应的图片放入 `src/assets/images/chart/` 目录（或使用已有图片名）。

2. **完善业务逻辑**  
   修改 `index.vue` 的渲染逻辑和 `config.vue` 的配置项，复杂交互需手动补充。

3. **本地验证**  
   ```bash
   yarn dev
   ```
   打开可视化编辑器，在左侧组件面板中确认新组件是否出现、拖拽是否正常。

4. **（可选）调整默认数据**  
   图表类组件可编辑 `data.json`；信息类组件可修改 `config.ts` 中的 `option.dataset` 默认值。

---

## 目录结构

```
plop/
├── plopfile.js                 # 入口，注册所有 generator
├── plop.md                     # 本文档
├── utils/
│   └── helpers.js              # 公共校验（PascalCase 等）
├── store-template/             # Store 模板
├── chart-template/             # ECharts 图表模板
├── decorate-template/          # 装饰组件模板
├── vchart-template/            # VChart 图表模板
└── information-template/       # 信息类组件模板（文字 / 图片）
```

每个 `*-template/` 目录包含：

- `prompt.js` — 交互问答与文件生成规则
- `*.hbs` — [Handlebars](https://handlebarsjs.com/) 模板文件

---

## 扩展新生成器

1. 在 `plop/` 下新建 `{name}-template/` 目录，编写 `prompt.js` 和 `.hbs` 模板。
2. 在 `plop/plopfile.js` 中注册：

```js
const myGenerator = require('./my-template/prompt')

plop.setGenerator('my', myGenerator)
```

3. 运行 `yarn new` 或 `npx plop my --plopfile ./plop/plopfile.js` 验证。

---

## 常见问题

**Q: 生成后组件面板看不到新组件？**  
A: 检查分类 `index.ts` 是否已正确 import 并 export；确认 `image` 预览图是否存在；重启 dev 服务后再试。

**Q: 组件名称报错？**  
A: 必须使用 PascalCase（首字母大写、仅字母数字）；VChart 组件必须以 `VChart` 开头。

**Q: 重复运行生成器会怎样？**  
A: 若目标目录已存在，`add` 操作会失败；请勿对同一组件名重复生成。

**Q: 生成器会提交 Git 吗？**  
A: 不会，仅在本地产出文件，需自行 `git add` 和 commit。
