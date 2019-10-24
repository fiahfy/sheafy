export const state = () => ({
  downloads: []
})

export const getters = {}

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
  }
}

export const mutations = {
  setDownloads(state, { downloads }) {
    state.downloads = downloads
  }
}
