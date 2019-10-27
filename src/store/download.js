export const state = () => ({
  downloads: []
})

export const getters = {
  getDownload(state) {
    return ({ id }) => state.downloads.find((download) => download.id === id)
  },
  canPause(state, getters) {
    return ({ id }) =>
      ['progressing'].includes(getters.getDownload({ id }).status)
  },
  canResume(state, getters) {
    return ({ id }) =>
      ['paused', 'interrupted'].includes(getters.getDownload({ id }).status)
  },
  canCancel(state, getters) {
    return ({ id }) =>
      ['progressing', 'paused', 'interrupted'].includes(
        getters.getDownload({ id }).status
      )
  },
  canShowInFolder(state, getters) {
    return ({ id }) =>
      ['completed'].includes(getters.getDownload({ id }).status)
  },
  canRetry(state, getters) {
    return ({ id }) =>
      ['cancelled', 'failed'].includes(getters.getDownload({ id }).status)
  },
  canDelete(state, getters) {
    return ({ id }) =>
      ['completed', 'cancelled', 'failed'].includes(
        getters.getDownload({ id }).status
      )
  }
}

export const actions = {
  updateDownload({ commit, state }, { id, ...params }) {
    let downloads
    if (state.downloads.find((download) => download.id === id)) {
      downloads = state.downloads.map((download) => {
        if (download.id !== id) {
          return download
        }
        return {
          ...download,
          ...params
        }
      })
    } else {
      downloads = [...state.downloads, { id, ...params }]
    }
    commit('setDownloads', { downloads })
  },
  deleteDownload({ commit, getters, state }, { id }) {
    const downloads = state.downloads.filter(
      (download) =>
        download.id !== id || !getters.canDelete({ id: download.id })
    )
    commit('setDownloads', { downloads })
  },
  clearDownloads({ commit, getters, state }) {
    const downloads = state.downloads.filter(
      (download) => !getters.canDelete({ id: download.id })
    )
    commit('setDownloads', { downloads })
  }
}

export const mutations = {
  setDownloads(state, { downloads }) {
    state.downloads = downloads
  }
}
