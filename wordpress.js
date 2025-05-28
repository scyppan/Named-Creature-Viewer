const version = 'a25.5.28.001'
const baseUrl = 'https://cdn.jsdelivr.net/gh/scyppan/Named-Creature-Viewer';

document.addEventListener('DOMContentLoaded', function () {

  var mainScript = document.createElement('script')
  mainScript.src   = baseUrl + '@' + version + '/main.js'
  mainScript.defer = true
  mainScript.onload = function() {
    initapp(baseUrl, version)
  }
  document.head.appendChild(mainScript)
})