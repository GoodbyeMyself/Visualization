const path = require('path')
const { validateComponentName, resolveCategory } = require('../utils/helpers')

const CHART_TYPES = [
  { name: '柱状图 (bar)', value: 'bar' },
  { name: '折线图 (line)', value: 'line' },
  { name: '饼图 (pie)', value: 'pie' },
]

const CATEGORIES = [
  { name: '柱状图', value: 'Bars', enum: 'BAR', enumName: 'BAR' },
  { name: '饼图', value: 'Pies', enum: 'PIE', enumName: 'PIE' },
  { name: '折线图', value: 'Lines', enum: 'LINE', enumName: 'LINE' },
  { name: '面积图', value: 'Areas', enum: 'AREA', enumName: 'AREA' },
  { name: '漏斗图', value: 'Funnels', enum: 'FUNNEL', enumName: 'FUNNEL' },
  { name: '词云图', value: 'WordClouds', enum: 'WORDCLOUD', enumName: 'WORDCLOUD' },
  { name: '散点图', value: 'Scatters', enum: 'SCATTER', enumName: 'SCATTER' },
]

const DEFAULT_IMAGES = {
  bar: 'vchart_bar_x.png',
  line: 'vchart_line.png',
  pie: 'vchart_pie.png',
}

const OPTION_TYPES = {
  bar: 'IBarOption',
  line: 'ILineOption',
  pie: 'IPieOption',
}

const INCLUDES = {
  bar: "['legends', 'tooltip', 'label', 'bar']",
  line: "['legends', 'tooltip', 'label', 'line', 'point']",
  pie: "['legends', 'tooltip']",
}

const CATEGORY_INDEX = (categoryFolder) =>
  path.join(process.cwd(), `src/packages/components/VChart/${categoryFolder}/index.ts`)

function validateVChartName(value) {
  const result = validateComponentName(value)
  if (result !== true) return result
  if (!value.startsWith('VChart')) {
    return 'VChart 组件建议以 VChart 开头，如 VChartMyBar'
  }
  return true
}

module.exports = {
  description: '创建 VChart 图表组件',
  prompts: [
    {
      type: 'input',
      name: 'name',
      message: '组件名称 (PascalCase)，如 VChartMyBar:',
      validate: validateVChartName,
    },
    {
      type: 'input',
      name: 'title',
      message: '组件显示标题 (中文)，如 我的柱状图-VChart:',
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
      name: 'chartType',
      message: '选择 VChart 图表类型:',
      choices: CHART_TYPES,
    },
    {
      type: 'input',
      name: 'image',
      message: '预览图文件名 (assets/images/chart/ 下):',
      default(answers) {
        return DEFAULT_IMAGES[answers.chartType] || 'vchart_bar_x.png'
      },
    },
  ],
  actions: (data) => {
    const name = data.name.trim()
    const categoryMeta = resolveCategory(CATEGORIES, data.category)
    const componentDir = path.join(
      process.cwd(),
      `src/packages/components/VChart/${data.category}/${name}`
    )

    return [
      {
        type: 'add',
        path: `${componentDir}/index.ts`,
        templateFile: 'vchart-template/index.ts.hbs',
        data: {
          name,
          title: data.title.trim(),
          categoryEnum: categoryMeta.enum,
          categoryEnumName: categoryMeta.enumName,
          image: data.image.trim(),
        },
      },
      {
        type: 'add',
        path: `${componentDir}/config.ts`,
        templateFile: 'vchart-template/config.ts.hbs',
        data: {
          name,
          chartType: data.chartType,
          categoryEnum: categoryMeta.enum,
          optionType: OPTION_TYPES[data.chartType],
          includes: INCLUDES[data.chartType],
        },
      },
      {
        type: 'add',
        path: `${componentDir}/index.vue`,
        templateFile: 'vchart-template/index.vue.hbs',
        data: { name },
      },
      {
        type: 'add',
        path: `${componentDir}/config.vue`,
        templateFile: 'vchart-template/config.vue.hbs',
        data: { chartType: data.chartType },
      },
      {
        type: 'add',
        path: `${componentDir}/data.json`,
        templateFile: 'vchart-template/data.json.hbs',
        data: { chartType: data.chartType },
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
