const path = require('path')
const { validateComponentName, resolveCategory } = require('../utils/helpers')

const CATEGORIES = [
  { name: '边框', value: 'Borders', enum: 'BORDER', enumName: 'BORDER' },
  { name: '装饰', value: 'Decorates', enum: 'DECORATE', enumName: 'DECORATE' },
  { name: '流程', value: 'FlowChart', enum: 'FlowChart', enumName: 'FlowChart' },
  { name: '三维', value: 'Three', enum: 'THREE', enumName: 'THREE' },
  { name: '更多', value: 'Mores', enum: 'MORE', enumName: 'MORE' },
]

const CHART_FRAMES = [
  { name: '静态 (static) - 无数据请求', value: 'STATIC' },
  { name: '通用 (common) - 支持 dataset', value: 'COMMON' },
]

const CATEGORY_INDEX = (categoryFolder) =>
  path.join(process.cwd(), `src/packages/components/Decorates/${categoryFolder}/index.ts`)

module.exports = {
  description: '创建装饰/边框组件',
  prompts: [
    {
      type: 'input',
      name: 'name',
      message: '组件名称 (PascalCase)，如 MyBorder:',
      validate: validateComponentName,
    },
    {
      type: 'input',
      name: 'title',
      message: '组件显示标题 (中文)，如 我的边框:',
      validate(value) {
        if (!value || !value.trim()) return '标题不能为空'
        return true
      },
    },
    {
      type: 'list',
      name: 'category',
      message: '选择组件分类目录:',
      choices: CATEGORIES.map((item) => ({ name: item.name, value: item.value })),
    },
    {
      type: 'list',
      name: 'chartFrame',
      message: '选择组件框架类型:',
      choices: CHART_FRAMES,
    },
    {
      type: 'input',
      name: 'image',
      message: '预览图文件名 (assets/images/chart/ 下):',
      default: 'flow-circle.png',
    },
  ],
  actions: (data) => {
    const name = data.name.trim()
    const categoryMeta = resolveCategory(CATEGORIES, data.category)
    const componentDir = path.join(
      process.cwd(),
      `src/packages/components/Decorates/${data.category}/${name}`
    )

    return [
      {
        type: 'add',
        path: `${componentDir}/index.ts`,
        templateFile: 'decorate-template/index.ts.hbs',
        data: {
          name,
          title: data.title.trim(),
          categoryEnum: categoryMeta.enum,
          categoryEnumName: categoryMeta.enumName,
          chartFrame: data.chartFrame,
          image: data.image.trim(),
        },
      },
      {
        type: 'add',
        path: `${componentDir}/config.ts`,
        templateFile: 'decorate-template/config.ts.hbs',
        data: { name, chartFrame: data.chartFrame },
      },
      {
        type: 'add',
        path: `${componentDir}/index.vue`,
        templateFile: 'decorate-template/index.vue.hbs',
        data: { name, title: data.title.trim() },
      },
      {
        type: 'add',
        path: `${componentDir}/config.vue`,
        templateFile: 'decorate-template/config.vue.hbs',
        data: { title: data.title.trim() },
      },
      {
        type: 'modify',
        path: CATEGORY_INDEX(data.category),
        pattern: /(\nexport default \[)/,
        template: "\nimport { {{name}}Config } from './{{name}}/index'$1",
      },
      {
        type: 'modify',
        path: CATEGORY_INDEX(data.category),
        pattern: /([\w]+Config)(\s*\n*\])/,
        template: '$1,\n  {{name}}Config$2',
      },
    ]
  },
}
