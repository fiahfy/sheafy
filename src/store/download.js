export const state = () => ({
  downloads: []
})

export const getters = {
  isDeletable() {
    return ({ download }) =>
      ['completed', 'cancelled', 'failed'].includes(download.status)
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
      (download) => download.id !== id || !getters.isDeletable({ download })
    )
    commit('setDownloads', { downloads })
  },
  clearDownloads({ commit, getters, state }) {
    const downloads = state.downloads.filter(
      (download) => !getters.isDeletable({ download })
    )
    commit('setDownloads', { downloads })
  }
}

export const mutations = {
  setDownloads(state, { downloads }) {
    state.downloads = downloads
  }
}
