let creatures;
let named;

const cssfiles = ['searchbox.css', 'creature.css'];
const jsfiles  = ['api.js', 'searchbox.js', 'creature.js'];

function loadAssets(baseUrl, version) {
    return new Promise((resolve, reject) => {
        const head = document.head;
        const fullPath = baseUrl + '@' + version + '/';
        const total = cssfiles.length + jsfiles.length;
        let loaded = 0;

        function checkDone() {
            if (++loaded === total) resolve();
        }

        if (total === 0) return resolve();

        cssfiles.forEach(function (file) {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = fullPath + 'css/' + file;
            link.onload = checkDone;
            link.onerror = reject;
            head.appendChild(link);
        });

        jsfiles.forEach(function (file) {
            const script = document.createElement('script');
            script.src = fullPath + 'js/' + file;
            script.defer = true;
            script.onload = checkDone;
            script.onerror = reject;
            head.appendChild(script);
        });
    });
}

async function initapp(baseUrl, version) {
    await loadAssets(baseUrl, version);
    creatures = await fetchfresh(48);
    named = await fetchfresh(170);
    document.getElementById('char-count')?.remove();
    initsearchbox();
}