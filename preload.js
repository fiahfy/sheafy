const { remote, ipcRenderer } = require('electron')
const { Menu } = remote

let storeEvent

const show = (menus = []) => {
  let template = []

  if (menus.length) {
    template = menus.concat([{ type: 'separator' }])
  }

  const { clientX: x, clientY: y } = window.event ? window.event : storeEvent
  template = template.concat([
    {
      label: 'Inspect Element',
      click: () => ipcRenderer.sendToHost('inspectElement', x, y)
    }
  ])

  Menu.buildFromTemplate(template).popup(remote.getCurrentWindow(), {
    async: true
  })
}

ipcRenderer.on('showContextMenu', (e, { canGoBack, canGoForward }) => {
  const selection = window.getSelection().toString()
  if (selection) {
    show([
      {
        label: `Look Up “${selection}”`,
        click: () => ipcRenderer.sendToHost('lookUp')
      },
      { type: 'separator' },
      { role: 'copy' },
      {
        label: `Search Google for “${selection}”`,
        click: () => ipcRenderer.sendToHost('search', selection)
      }
    ])
  } else {
    show([
      {
        label: 'Back',
        click: () => history.back(),
        enabled: canGoBack
      },
      {
        label: 'Forward',
        click: () => history.forward(),
        enabled: canGoForward
      },
      {
        label: 'Reload',
        click: () => location.reload()
      }
    ])
  }
})

window.addEventListener('contextmenu', (e) => {
  storeEvent = e
  ipcRenderer.sendToHost('requestContextMenu')
})

const onContextMenu = (e, target) => {
  target = target || e.target
  if (target.tagName.toLowerCase() === 'a') {
    e.stopPropagation()
    show([
      {
        label: 'Open Link in a New Tab',
        click: () => ipcRenderer.sendToHost('newTab', target.href)
      },
      {
        label: 'Open Link in a Default Browser',
        click: () => ipcRenderer.sendToHost('openDefaultBrowser', target.href)
      },
      { type: 'separator' },
      {
        label: 'Copy Link',
        click: () => navigator.clipboard.writeText(target.href)
      },
      { type: 'separator' },
      { role: 'copy' },
      {
        label: `Search Google for “${target.textContent}”`,
        click: () => ipcRenderer.sendToHost('search', target.textContent)
      }
    ])
  } else if (['input', 'textarea'].includes(target.tagName.toLowerCase())) {
    e.stopPropagation()
    show([
      { role: 'undo' },
      { role: 'redo' },
      { type: 'separator' },
      { role: 'cut' },
      { role: 'copy' },
      { role: 'paste' },
      { role: 'pasteAndMatchStyle' },
      { role: 'selectAll' },
      { type: 'separator' },
      {
        label: `Search Google for “${target.textContent}”`,
        click: () => ipcRenderer.sendToHost('search', target.textContent)
      }
    ])
  } else {
    if (target.parentElement) {
      onContextMenu(e, target.parentElement)
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  document.addEventListener('contextmenu', onContextMenu)
  document.addEventListener('dragover', (e) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'link'
  })
  document.addEventListener('drop', (e) => {
    e.preventDefault()
    const effectAllowed = e.dataTransfer.effectAllowed
    if (effectAllowed === 'move') {
      return
    }
    const url = e.dataTransfer.getData('text')
    if (url) {
      location.href = url
    }
  })
})
