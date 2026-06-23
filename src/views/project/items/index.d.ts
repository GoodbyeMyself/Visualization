export type Chartype = {
  id: number | string
  title: string // 标题
  label: string // 标签
  release: boolean // 0未发布 | 1已发布
  indexImage?: string // 画布缩略图
}

export type ChartList = Chartype[]