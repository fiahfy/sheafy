const { remote, ipcRenderer } = require('electron')
const { Menu } = remote

const show = (menus = [], e = null) => {
  let template = []

  if (menus.length) {
    template = menus.concat([{ type: 'separator' }])
  }

  const { clientX: x, clientY: y } = e || window.event
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
      // TODO: https://github.com/electron/electron/issues/15728
      {
        label: 'Undo',
        click: () => ipcRenderer.sendToHost('undo')
      },
      {
        label: 'Redo',
        click: () => ipcRenderer.sendToHost('redo')
      },
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
  } else if (!target.parentElement) {
    e.stopPropagation()
    ipcRenderer.once('showContextMenu', (_, { canGoBack, canGoForward }) => {
      const selection = window.getSelection().toString()
      if (selection) {
        show(
          [
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
          ],
          e
        )
      } else {
        show(
          [
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
          ],
          e
        )
      }
    })
    ipcRenderer.sendToHost('requestContextMenu')
  } else {
    onContextMenu(e, target.parentElement)
  }
}

document.addEventListener('DOMContentLoaded', () => {
  document.addEventListener('contextmenu', onContextMenu)
  document.addEventListener('keydown', (e) => {
    ipcRenderer.sendToHost('keydown', { keyCode: e.keyCode })
  })
  document.addEventListener('dragover', (e) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'link'
  })
  document.addEventListener('drop', (e) => {
    e.preventDefault()
    const url = e.dataTransfer.getData('text')
    if (url) {
      location.href = url
    }
  })
})

window.focus = ((focus) => {
  return (...args) => {
    ipcRenderer.sendToHost('focus')
    return focus.apply(window, args)
  }
})(window.focus)

Notification.requestPermission = ((requestPermission) => {
  return (...args) => {
    // TODO: Handle requestPermission
    console.log('requestPermission')
    return requestPermission.apply(Notification, args)
  }
})(Notification.requestPermission)
