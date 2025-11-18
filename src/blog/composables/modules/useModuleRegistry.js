/**
 * 模块注册表管理
 * 提供模块元数据查询和动态加载能力
 */

import { computed } from 'vue';
import { MODULE_REGISTRY, MODULES } from '../../constants/modules';

export function useModuleRegistry() {
  /**
   * 获取所有模块配置
   */
  const modules = computed(() => MODULES);

  /**
   * 根据ID获取模块配置
   */
  const getModuleById = (moduleId) => {
    return MODULE_REGISTRY[moduleId] || null;
  };

  /**
   * 检查模块是否存在
   */
  const hasModule = (moduleId) => {
    return moduleId in MODULE_REGISTRY;
  };

  /**
   * 动态加载模块组件
   */
  const loadModuleComponent = async (moduleId) => {
    const moduleConfig = getModuleById(moduleId);
    if (!moduleConfig) {
      throw new Error(`Module not found: ${moduleId}`);
    }
    return await moduleConfig.component();
  };

  return {
    modules,
    getModuleById,
    hasModule,
    loadModuleComponent,
  };
}
