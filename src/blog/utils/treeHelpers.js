/**
 * 树形结构相关工具函数
 */

/**
 * 通用的树遍历工具函数
 * @param {Array} nodes - 树节点数组
 * @param {Function} callback - 回调函数，返回 undefined 继续遍历，返回其他值则停止并返回该值
 * @returns {*} 返回首个非 undefined 的回调结果
 */
export function traverseTree(nodes, callback) {
  if (!nodes?.length) return undefined;
  
  for (const node of nodes) {
    const result = callback(node);
    if (result !== undefined) return result;
    
    if (node.children?.length > 0) {
      const found = traverseTree(node.children, callback);
      if (found !== undefined) return found;
    }
  }
  
  return undefined;
}

/**
 * 扁平化树结构
 * @param {Array} nodes - 树节点数组
 * @returns {Array} 扁平化的节点数组
 */
export function flattenTree(nodes) {
  const result = [];
  traverseTree(nodes, (node) => {
    result.push(node);
    return undefined; // 继续遍历
  });
  return result;
}

/**
 * 在树中查找节点
 * @param {Array} nodes - 树节点数组
 * @param {number} id - 节点ID
 * @param {string} [type] - 节点类型（可选）
 * @returns {Object|null} 找到的节点或 null
 */
export function findNodeById(nodes, id, type = null) {
  return traverseTree(nodes, (node) => {
    const matchType = !type || node.nodeType?.toUpperCase() === type.toUpperCase();
    return (node.id === id && matchType) ? node : undefined;
  }) || null;
}

/**
 * 过滤树节点（搜索）
 * @param {Array} nodes - 树节点数组
 * @param {string} keyword - 搜索关键词（小写）
 * @param {Array} expandedKeys - 展开的节点ID数组
 * @param {Function} expandNode - 展开节点的回调
 * @returns {Array} 过滤后的节点数组
 */
export function filterTree(nodes, keyword, expandedKeys, expandNode) {
  if (!nodes?.length || !keyword) return nodes;
  
  return nodes.reduce((filtered, node) => {
    const nameMatch = node.name.toLowerCase().includes(keyword);
    const isGroup = node.nodeType?.toUpperCase() === 'GROUP';
    const filteredChildren = isGroup && node.children?.length
      ? filterTree(node.children, keyword, expandedKeys, expandNode)
      : [];
    
    if (nameMatch || filteredChildren.length > 0) {
      const filteredNode = { ...node };
      
      if (filteredChildren.length > 0) {
        filteredNode.children = filteredChildren;
        // 自动展开包含匹配结果的分组
        if (!expandedKeys.includes(node.id) && expandNode) {
          expandNode(node.id);
        }
      }
      
      filtered.push(filteredNode);
    }
    
    return filtered;
  }, []);
}

/**
 * 获取节点路径（从根到该节点的所有父节点）
 * @param {Array} nodes - 树节点数组
 * @param {number} targetId - 目标节点ID
 * @returns {Array} 节点路径数组
 */
export function getNodePath(nodes, targetId) {
  const path = [];
  
  function findPath(nodes, targetId, currentPath) {
    for (const node of nodes) {
      const newPath = [...currentPath, node];
      
      if (node.id === targetId) {
        path.push(...newPath);
        return true;
      }
      
      if (node.children?.length > 0) {
        if (findPath(node.children, targetId, newPath)) {
          return true;
        }
      }
    }
    return false;
  }
  
  findPath(nodes, targetId, []);
  return path;
}

