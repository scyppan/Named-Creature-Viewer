let fuse;

async function initsearchbox() {
    fuse = new Fuse(named, {
        keys: ['meta.namedcreaturesname'],
        threshold: 0.3
    });

    let searchbox=document.getElementById('searchbox')
    searchbox.addEventListener('input', handlesearchinput);
    searchbox.classList.remove('hidden');
}

function handlesearchinput(e) {console.log(e);
    const query = e.target.value.trim();

    // Remove old suggestions
    document.getElementById('suggestions')?.remove();

    if (!query) return;

    getsuggestions(query, e);
}

function getsuggestions(query, e) {console.log(query)
    const results = Object.values(named).filter(c =>
        c.meta.namedcreaturesname && c.meta.namedcreaturesname.toLowerCase().includes(query.toLowerCase())
    );

console.log(results);

    showresults(results, e);
}

function createsuggestionbox(e) {
    const suggestions = document.createElement('ul');
    suggestions.id = 'suggestions';
    suggestions.classList.add('suggestions-container');

    const rect = e.target.getBoundingClientRect();
    suggestions.style.top = `${rect.bottom + window.scrollY}px`;
    suggestions.style.left = `${rect.left + window.scrollX}px`;

    document.getElementById('searchbox').parentElement.appendChild(suggestions);
    return suggestions;
}

function showresults(results, e) {
    const suggestionbox = createsuggestionbox(e);

    results.forEach(result => {
        const li = createresultlisting(result);
        suggestionbox.appendChild(li);
    });
}

function createresultlisting(result) {
    const li = document.createElement('li');
    li.dataset.id = result.meta.namedcreaturesname;
    li.classList.add("suggestion");
    li.textContent = result.meta.namedcreaturesname;
    li.addEventListener('click', () => {
        document.getElementById('suggestions').remove();
        loadcreature(result.meta.namedcreaturesname);
    });
    return li;
}