/** PascalCase 组件名校验 */
function validateComponentName(value) {
  if (!value || !value.trim()) {
    return '组件名称不能为空'
  }
  if (!/^[A-Z][a-zA-Z0-9]*$/.test(value.trim())) {
    return '请使用 PascalCase 命名，如 MyBarChart、MyBorder'
  }
  return true
}

/** 根据选项列表解析分类元数据 */
function resolveCategory(categories, value) {
  return categories.find((item) => item.value === value)
}

module.exports = {
  validateComponentName,
  resolveCategory,
}
