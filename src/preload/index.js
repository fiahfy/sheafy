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
  console.log(window.getSelection(), window.getSelection().toString())
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
})

window.addEventListener('contextmenu', (e) => {
  storeEvent = e
  ipcRenderer.sendToHost('requestContextMenu')
})

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('a').forEach((element) => {
    element.addEventListener('click', (e) => {
      if ((e.ctrlKey && !e.metaKey) || (!e.ctrlKey && e.metaKey)) {
        e.preventDefault()
        ipcRenderer.sendToHost('newTab', element.href)
      }
    })
    element.addEventListener('contextmenu', (e) => {
      e.stopPropagation()
      show([
        {
          label: 'Open Link in a New Tab',
          click: () => ipcRenderer.sendToHost('newTab', element.href)
        },
        {
          label: 'Copy Link',
          click: () => navigator.clipboard.writeText(element.href)
        }
      ])
    })
  })
})
