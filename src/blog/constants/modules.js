/**
 * 知识库模块注册表
 * 定义所有可用模块的元数据和动态导入配置
 */

export const MODULE_REGISTRY = {
  latest: {
    id: 'latest',
    label: '最新',
    icon: 'mdi:clock-time-eight-outline',
    component: () => import('../components/desktop/modules/latest/LatestModule.vue'),
  },
  document: {
    id: 'document',
    label: '文档',
    icon: 'mdi:file-document-multiple-outline',
    component: () => import('../components/desktop/modules/document/DocumentModule.vue'),
  },
  // 未来扩展示例：
  // favorites: {
  //   id: 'favorites',
  //   label: '收藏',
  //   icon: 'mdi:star-outline',
  //   component: () => import('../components/desktop/modules/favorites/FavoritesModule.vue'),
  // },
};

/**
 * 模块配置数组（用于渲染导航）
 */
export const MODULES = Object.values(MODULE_REGISTRY);

/**
 * 默认模块ID
 */
export const DEFAULT_MODULE_ID = 'latest';
