'use strict';

var Tmux = {};
var Terminal;
var windows = [];
var index = 0;

Tmux.init = function (terminal) {
  Terminal = terminal;

  Terminal.container.innerHTML = '';
  Terminal.statusbar.innerHTML = '';
  windows = [];

  Terminal._container = Terminal.container;
  Terminal.container = null;

  var statusbar = Terminal.statusbar;
  Terminal.statusbar = null;

  var statusList = document.createElement('ul');
  this.rootTab = Tmux.createTabLabel(true).tab;
  statusbar.appendChild(statusList);
  Terminal._statusbar = statusList;

  this.newWindow();

  var _onkeydown = window.onkeydown || function () {};
  var waiting = false;
  window.onkeydown = function (event) {
    if (waiting) {
      waiting = false;

      switch (event.keyCode) {
        case 67: // C
          Tmux.newWindow();
          break;
        case 37: // left
        case 72: // H
          index--;

          if (index < 0) {
            index = windows.length - 1;
          }

          Tmux.use(windows[index]);
          break;
        case 39: // right
        case 76: // L
          index++;

          if (index >= windows.length) {
            index = 0;
          }

          Tmux.use(windows[index]);
          break;
      }

      return;
    }

    if (event.keyCode === 66 && event.ctrlKey) { // C-b
      waiting = true;
    } else {
      _onkeydown(event);
    }
  };

  Object.defineProperty(window, 'onkeydown', {
    set: function (value) {
      _onkeydown = value;
    },
    get: function () {
      return _onkeydown;
    }
  });
};

Tmux.createTabLabel = function (indexOnly) {
  var tab = document.createElement('li');

  var data = document.createElement('span');
  data.className = 'data';

  var index = document.createElement('span');
  index.className = 'index';
  index.innerText = windows.length;

  data.appendChild(index);
  tab.appendChild(data);

  var ps = null;
  if (!indexOnly) {
    ps = document.createElement('span');
    ps.className = 'ps';
    data.appendChild(ps);
  }

  return {
    tab: tab,
    ps: ps
  };
};

Tmux.newWindow = function () {
  var w = document.createElement('div');
  w.className = 'tmux';

  var window = {
    id: windows.count,
    window: w
  };

  windows.push(window);

  window.tab = this.createTabLabel();

  this.use(window);
  this.update();
};

var using = null;
Tmux.use = function (window) {
  if (using) {
    using.tab.tab.className = false;
  }

  Terminal._container.innerHTML = '';
  Terminal._container.appendChild(window.window);

  Terminal.container = window.window;
  Terminal.statusbar = window.tab.ps;

  window.tab.tab.className = 'active';
  Terminal.update();

  using = window;
};

Tmux.update = function () {
  windows = windows.sort(function (a, b) {
    return a.id - b.id;
  });

  Terminal._statusbar.innerHTML = '';
  Terminal._statusbar.appendChild(this.rootTab);

  windows.forEach(function (window) {
    Terminal._statusbar.appendChild(window.tab.tab);
  });
};

module.exports = Tmux;
