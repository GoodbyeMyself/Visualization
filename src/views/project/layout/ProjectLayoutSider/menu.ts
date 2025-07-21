import { reactive, h } from 'vue'
import { renderIcon } from '@/utils'
import { RouterLink } from 'vue-router'
import { PageEnum } from '@/enums/pageEnum'
import { MenuOption } from 'naive-ui'
import { icon } from '@/plugins'

const { TvOutlineIcon } = icon.ionicons5
const { ObjectStorageIcon } = icon.carbon

export const renderMenuLabel = (option: MenuOption) => {
    return option.label
}

export const expandedKeys = () => []

export const menuOptionsInit = () => {
    const t = window['$t']

    return reactive([
        {
            label: () =>
                h(
                    RouterLink,
                    {
                        to: {
                            name: PageEnum.BASE_HOME_ITEMS_NAME,
                        },
                    },
                    { default: () => t('project.all_project') }
                ),
            key: PageEnum.BASE_HOME_ITEMS_NAME,
            icon: renderIcon(TvOutlineIcon),
        },
        {
            label: () =>
                h(
                    RouterLink,
                    {
                        to: {
                            name: PageEnum.BASE_HOME_TEMPLATE_NAME,
                        },
                    },
                    { default: () => t('project.my_template') }
                ),
            key: PageEnum.BASE_HOME_TEMPLATE_NAME,
            icon: renderIcon(ObjectStorageIcon),
        },
    ])
}
