const path = require('path')
const { validateComponentName } = require('../utils/helpers')

const INFO_TYPES = [
  { name: '文字组件', value: 'text', categoryFolder: 'Texts', categoryEnum: 'TEXT', categoryEnumName: 'TEXT', defaultImage: 'text_static.png' },
  { name: '图片组件', value: 'image', categoryFolder: 'Mores', categoryEnum: 'MORE', categoryEnumName: 'MORE', defaultImage: 'photo.png' },
]

const CATEGORY_INDEX = (categoryFolder) =>
  path.join(process.cwd(), `src/packages/components/Informations/${categoryFolder}/index.ts`)

module.exports = {
  description: '创建信息类组件 (文字/图片)',
  prompts: [
    {
      type: 'list',
      name: 'infoType',
      message: '选择信息组件类型:',
      choices: INFO_TYPES.map((item) => ({ name: item.name, value: item.value })),
    },
    {
      type: 'input',
      name: 'name',
      message: '组件名称 (PascalCase)，如 MyText / MyImage:',
      validate: validateComponentName,
    },
    {
      type: 'input',
      name: 'title',
      message: '组件显示标题 (中文)，如 我的文字:',
      validate(value) {
        if (!value || !value.trim()) return '标题不能为空'
        return true
      },
    },
    {
      type: 'input',
      name: 'image',
      message: '预览图文件名 (assets/images/chart/ 下):',
      default(answers) {
        const meta = INFO_TYPES.find((item) => item.value === answers.infoType)
        return meta?.defaultImage || 'text_static.png'
      },
    },
  ],
  actions: (data) => {
    const name = data.name.trim()
    const meta = INFO_TYPES.find((item) => item.value === data.infoType)
    const componentDir = path.join(
      process.cwd(),
      `src/packages/components/Informations/${meta.categoryFolder}/${name}`
    )

    return [
      {
        type: 'add',
        path: `${componentDir}/index.ts`,
        templateFile: 'information-template/index.ts.hbs',
        data: {
          name,
          title: data.title.trim(),
          categoryEnum: meta.categoryEnum,
          categoryEnumName: meta.categoryEnumName,
          image: data.image.trim(),
        },
      },
      {
        type: 'add',
        path: `${componentDir}/config.ts`,
        templateFile: `information-template/config.${data.infoType}.ts.hbs`,
        data: { name, title: data.title.trim() },
      },
      {
        type: 'add',
        path: `${componentDir}/index.vue`,
        templateFile: `information-template/index.${data.infoType}.vue.hbs`,
        data: { name, title: data.title.trim() },
      },
      {
        type: 'add',
        path: `${componentDir}/config.vue`,
        templateFile: `information-template/config.${data.infoType}.vue.hbs`,
        data: { title: data.title.trim() },
      },
      {
        type: 'modify',
        path: CATEGORY_INDEX(meta.categoryFolder),
        pattern: /(\nexport default \[)/,
        template: "\nimport { {{name}}Config } from './{{name}}/index'$1",
      },
      {
        type: 'modify',
        path: CATEGORY_INDEX(meta.categoryFolder),
        pattern: /([\w]+Config)(\s*\n*\])/,
        template: '$1,\n  {{name}}Config$2',
      },
    ]
  },
}
