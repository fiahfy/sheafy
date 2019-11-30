const { remote, ipcRenderer } = require('electron')
const { Menu } = remote

let contextmenuFired = false

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
    const result = contextmenuFired
    contextmenuFired = false
    if (result) {
      return
    }
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

// event listener

document.addEventListener('DOMContentLoaded', () => {
  document.addEventListener('contextmenu', onContextMenu)
  document.addEventListener('keydown', (e) => {
    ipcRenderer.sendToHost('onkeydown', { key: e.key })
  })
  document.addEventListener('dragover', (e) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'link'
  })
  document.addEventListener('drop', (e) => {
    e.preventDefault()
    const url = e.dataTransfer.getData('text')
    if (url.match(/^https?:\/\//)) {
      location.href = url
    }
  })
  document.addEventListener('click', () => {
    ipcRenderer.sendToHost('activateView')
  })
  document.querySelectorAll('iframe').forEach((el) => {
    try {
      el.contentWindow.addEventListener('click', () => {
        ipcRenderer.sendToHost('activateView')
      })
    } catch (e) {}
  })
})

// method override

window.focus = ((func) => {
  return function(...args) {
    ipcRenderer.sendToHost('activateTab')
    return func.apply(this, args)
  }
})(window.focus)

window.open = ((func) => {
  return function(url, ...args) {
    // Prevent custom window.open on like Google Calendar
    if (
      !url &&
      window.event &&
      window.event.target &&
      window.event.target.href
    ) {
      url = window.event.target.href
    }
    return func.apply(this, [url, ...args])
  }
})(window.open)

Notification.requestPermission = ((func) => {
  return function(...args) {
    // TODO: Handle requestPermission
    // eslint-disable-next-line no-console
    console.log('requestPermission')
    return func.apply(this, args)
  }
})(Notification.requestPermission)

// override event listener

function hashCode(type, func) {
  if (!func) {
    return 0
  }
  return Array.from(type + func.toString()).reduce(
    (s, c) => (Math.imul(31, s) + c.charCodeAt(0)) | 0,
    0
  )
}

const listeners = {}

document.addEventListener = ((func) => {
  return function(type, listener, ...args) {
    const code = hashCode(type, listener)
    const newListener = function(e) {
      // prevent event for global shortcuts
      if (
        type === 'keydown' &&
        ((e.ctrlKey && !e.metaKey) || (!e.ctrlKey && e.metaKey)) &&
        e.key === 'p'
      ) {
        e.stopPropagation()
        return
      }
      if (type === 'click') {
        ipcRenderer.sendToHost('click')
      }
      return listener && listener.apply(this, [e])
    }
    listeners[code] = newListener
    return func.apply(this, [type, newListener, ...args])
  }
})(document.addEventListener)

document.removeEventListener = ((func) => {
  return function(type, listener, ...args) {
    const code = hashCode(type, listener)
    const newListener = listeners[code]
    delete listeners[code]
    return func.apply(this, [type, newListener, ...args])
  }
})(document.removeEventListener)

const elementListeners = {}

HTMLElement.prototype.addEventListener = ((func) => {
  return function(type, listener, ...args) {
    const code = hashCode(type, listener)
    const newListener = function(e) {
      // detect contextmenu listener on web application fired
      if (type === 'contextmenu') {
        contextmenuFired = true
      }
      return listener && listener.apply(this, [e])
    }
    elementListeners[code] = newListener
    return func.apply(this, [type, newListener, ...args])
  }
})(HTMLElement.prototype.addEventListener)

HTMLElement.prototype.removeEventListener = ((func) => {
  return function(type, listener, ...args) {
    const code = hashCode(type, listener)
    const newListener = elementListeners[code]
    delete elementListeners[code]
    return func.apply(this, [type, newListener, ...args])
  }
})(HTMLElement.prototype.removeEventListener)
