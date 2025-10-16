import { defineStore } from 'pinia'
import { getGroups } from '@/api/group'

export const useGroupStore = defineStore('group', {
  state: () => ({
    groups: [],
    currentGroup: null,
    loading: false,
    error: null
  }),

  getters: {
    groupsWithCount: (state) => state.groups.filter(g => g.articleCount > 0),
    groupById: (state) => (id) => state.groups.find(g => g.id === id)
  },

  actions: {
    async fetchGroups() {
      this.loading = true
      this.error = null
      
      try {
        const res = await getGroups()
        this.groups = res.data
        return res
      } catch (error) {
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    },

    setCurrentGroup(groupId) {
      this.currentGroup = this.groups.find(g => g.id === groupId) || null
    },

    clearCurrentGroup() {
      this.currentGroup = null
    }
  }
})

