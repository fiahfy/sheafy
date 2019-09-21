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
        label: 'Copy',
        click: () => navigator.clipboard.writeText(selection)
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
})
