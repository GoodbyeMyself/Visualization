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
  { name: '散点图', value: 'Scatters', enum: 'SCATTER', enumName: 'SCATTER' },
  { name: '地图', value: 'Maps', enum: 'MAP', enumName: 'MAP' },
  { name: '更多', value: 'Mores', enum: 'MORE', enumName: 'MORE' },
]

const DEFAULT_IMAGES = {
  bar: 'bar_x.png',
  line: 'line.png',
  pie: 'pie.png',
}

const CHART_COMPONENTS = {
  bar: 'BarChart',
  line: 'LineChart',
  pie: 'PieChart',
}

const CATEGORY_INDEX = (categoryFolder) =>
  path.join(process.cwd(), `src/packages/components/Charts/${categoryFolder}/index.ts`)

module.exports = {
  description: '创建 ECharts 图表组件',
  prompts: [
    {
      type: 'input',
      name: 'name',
      message: '组件名称 (PascalCase)，如 MyBarChart:',
      validate: validateComponentName,
    },
    {
      type: 'input',
      name: 'title',
      message: '组件显示标题 (中文)，如 我的柱状图:',
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
      message: '选择 ECharts 图表类型:',
      choices: CHART_TYPES,
    },
    {
      type: 'input',
      name: 'image',
      message: '预览图文件名 (assets/images/chart/ 下):',
      default(answers) {
        return DEFAULT_IMAGES[answers.chartType] || 'bar_x.png'
      },
    },
  ],
  actions: (data) => {
    const name = data.name.trim()
    const categoryMeta = resolveCategory(CATEGORIES, data.category)
    const componentDir = path.join(
      process.cwd(),
      `src/packages/components/Charts/${data.category}/${name}`
    )

    return [
      {
        type: 'add',
        path: `${componentDir}/index.ts`,
        templateFile: 'chart-template/index.ts.hbs',
        data: {
          name,
          title: data.title.trim(),
          categoryEnum: categoryMeta.enum,
          categoryEnumName: categoryMeta.enumName,
          chartType: data.chartType,
          image: data.image.trim(),
        },
      },
      {
        type: 'add',
        path: `${componentDir}/config.ts`,
        templateFile: 'chart-template/config.ts.hbs',
        data: { name, chartType: data.chartType },
      },
      {
        type: 'add',
        path: `${componentDir}/index.vue`,
        templateFile: 'chart-template/index.vue.hbs',
        data: {
          name,
          chartType: data.chartType,
          chartComponent: CHART_COMPONENTS[data.chartType],
        },
      },
      {
        type: 'add',
        path: `${componentDir}/config.vue`,
        templateFile: 'chart-template/config.vue.hbs',
        data: { name, title: data.title.trim(), chartType: data.chartType },
      },
      {
        type: 'add',
        path: `${componentDir}/data.json`,
        templateFile: 'chart-template/data.json.hbs',
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
