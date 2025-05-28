let currentnamed;

function loadcreature(named) {
    currentnamed = Object.values(named).find(
        c => c.meta?.namedcreaturesname === named
    );

    const container = document.getElementById("creaturecontainer");
    container.innerHTML = ''; // clear old content

    const species = c.meta?.namedcreaturesspecies;
    const matchingspecies = Object.values(creatures).filter(cr =>
        cr.meta?.creaturename === c.meta?.namedcreaturesspecies
    );

    container.appendChild(renderdemographics(matchingspecies));
    //container.appendChild(renderwoundstats());
    //container.appendChild(renderdescription());
    //container.appendChild(renderintelligenceandmovement());
    //container.appendChild(rendersocialrules());
    //container.appendChild(renderabilities());
    //container.appendChild(renderattacks());

    window.parent.postMessage(
        { eventtype: 'charassigned', name: currentnamed.meta.namedcreaturesname },
        '*'
    );
}

function randbetween(lo, hi) {
    const lo = parseInt(lo);
    const hi = parseInt(hi);

    return Math.floor(Math.random() * (hi - lo + 1)) + lo;
}

function renderdemographics(species) {

    const el = document.createElement('div');
    el.classList.add('creature-section', 'demographics');
    el.textContent = `${currentnamed.meta.namedcreaturesname} (${species} | ${species.meta.creaturetype} | Size: ${currentnamed.meta.namedcreaturessize})`;
    return el;
}

function renderwoundstats() {
    const { woundcaplo, woundcaphi, magicalresistlo, magicalresisthi } = currentcreature.meta;

    const cap = randbetween(woundcaplo, woundcaphi);
    let text = `Heavy Wound Cap: ${cap}`;

    if (magicalresistlo && magicalresisthi) {
        const res = randbetween(magicalresistlo, magicalresisthi);
        text += ` | Res. ${res}`;
    }

    const el = document.createElement('div');
    el.classList.add('creature-section', 'woundstats');
    el.textContent = text;
    return el;
}

function renderdescription() {
    const el = document.createElement('div');
    el.classList.add('creature-section', 'description');
    el.textContent = currentcreature.meta.description || '[No description]';
    return el;
}

function renderintelligenceandmovement() {
    const m = currentcreature.meta;
    let text = '';

    if (m.beastintello && m.beastintelhi) {
        const val = randbetween(m.beastintello, m.beastintelhi);
        text += `Beastial Intel: ${val}`;
    } else if (m.humanintello && m.humanintelhi) {
        const val = randbetween(m.humanintello, m.humanintelhi);
        text += `Human Intel: ${val}`;
    }

    if (m.sociallo && m.socialhi) {
        const val = randbetween(m.sociallo, m.socialhi);
        text += ` | Human Social Skills: ${val}`;
    }

    const ground = (m.groundlo && m.groundhi)
        ? randbetween(m.groundlo, m.groundhi)
        : "Can't move";

    const water = (m.waterlo && m.waterhi)
        ? randbetween(m.waterlo, m.waterhi)
        : "Will drown";

    const air = (m.airlo && m.airhi)
        ? randbetween(m.airlo, m.airhi)
        : "Will fall";

    text += `\nMovement: Ground: ${ground} | Water: ${water} | Air: ${air}`;

    const el = document.createElement('div');
    el.classList.add('creature-section', 'intelmove');
    el.textContent = text;
    return el;
}

function rendersocialrules() {
    const m = currentcreature.meta;
    let text = 'Social Rules\n';

    const lured = m.lured && m.lured !== 'No' ? 'Can be lured' : 'Cannot be lured';
    const tamed = m.tamed && m.tamed !== 'No' ? 'Can be tamed' : 'Cannot be tamed';
    const bond = m.bond && m.bond !== 'No' ? 'Can bond' : 'Cannot bond';

    text += `${lured} | ${tamed} | ${bond}`;

    if (m.independence)
        text += `\nIndependence: ${m.independence}`;

    if (m.addtlrules)
        text += `\nAdditional Rules: ${m.addtlrules}`;

    const el = document.createElement('div');
    el.classList.add('creature-section', 'socialrules');
    el.textContent = text;
    return el;
}

function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function adjustRange(lo, hi, category) {
    lo = parseInt(lo);
    hi = parseInt(hi);
    if (isNaN(lo) || isNaN(hi) || lo > hi) return [lo, hi];

    let newLo, newHi;
    switch (category) {
        case 'inept':
            newLo = 1;
            newHi = Math.max(1, Math.floor(hi * 0.5));
            break;
        case 'unskilled':
            newLo = lo;
            newHi = Math.max(lo, Math.floor(hi * 0.75));
            break;
        case 'skilled':
            newLo = Math.min(hi, Math.ceil(lo * 1.25));
            newHi = hi;
            break;
        case 'exceptional':
            newLo = Math.ceil(lo * 1.5);
            newHi = Math.ceil(hi * 1.5);
            break;
        default: // 'typical' or any unknown
            newLo = lo;
            newHi = hi;
    }

    // guard newLo/newHi sanity
    if (newLo > newHi) newLo = newHi;
    return [newLo, newHi];
}

function pickRating() {
    const pct = randbetween(1, 100);
    if (pct < 10) return 'inept';
    if (pct < 25) return 'unskilled';
    if (pct > 90) return 'exceptional';
    if (pct > 75) return 'skilled';
    return 'typical';
}

function renderabilities() {
    const abilities = currentcreature.meta.creatureability || [];
    const el = document.createElement('div');
    el.classList.add('creature-section', 'abilities');
    el.textContent = 'Abilities';

    abilities.forEach((name, i) => {
        const wrapper = document.createElement('div');
        const btn = document.createElement('button');
        const res = document.createElement('span');
        const desc = currentcreature.meta.abilitydescription?.[i] || '';
        const baseLines = [name, desc].filter(Boolean).join('\n');

        // 1) pick a static rating now
        const rating = pickRating();
        const capRating = capitalize(rating);

        // 2) build tooltip with rating at the top
        btn.title = `${name} (${capRating})` + (baseLines ? '\n' + baseLines : '');

        btn.textContent = name;
        btn.addEventListener('click', () => {
            // 3) use the same rating for every roll of this button
            const lo = parseInt(currentcreature.meta.creatureabilitylo?.[i]);
            const hi = parseInt(currentcreature.meta.creatureabilityhi?.[i]);
            if (isNaN(lo) || isNaN(hi)) {
                res.textContent = ' — Invalid range';
                return;
            }

            const [adjLo, adjHi] = adjustRange(lo, hi, rating);
            const rolled = randbetween(adjLo, adjHi);
            res.textContent = ` → ${rolled}`;

            window.parent.postMessage(
                `A ${currentcreature.meta.creaturename} rolls ${rolled} on ${name} [${capRating}] (range ${adjLo}–${adjHi}).`,
                '*'
            );
        });

        wrapper.appendChild(btn);
        wrapper.appendChild(res);
        el.appendChild(wrapper);
    });

    return el;
}

function renderattacks() {
    const attacks = currentcreature.meta.creatureattack || [];
    const el = document.createElement('div');
    el.classList.add('creature-section', 'attacks');
    el.textContent = 'Attacks';

    attacks.forEach((name, i) => {
        const wrapper = document.createElement('div');
        const btn = document.createElement('button');
        const res = document.createElement('span');

        const desc = currentcreature.meta.attackdescription?.[i] || '';
        const iwtype = currentcreature.meta.immediatewoundtype?.[i];
        const iwamt = currentcreature.meta.immediatewoundamtnum?.[i];
        const iwcat = currentcreature.meta.immediatewoundamtcat?.[i];
        const dotwtype = currentcreature.meta.dotwoundtype?.[i];
        const dotwamt = currentcreature.meta.dotwoundamtnum?.[i];
        const dotwcat = currentcreature.meta.dotwoundamtcat?.[i];

        // build the base tooltip (without rating)
        const parts = [name];
        if (desc) parts.push(desc);
        if (iwtype) parts.push(`Immediate Wounds: ${iwamt} ${iwcat} (${iwtype})`);
        if (dotwtype) parts.push(`Damage over Time: ${dotwamt} ${dotwcat} (${dotwtype})`);
        const base = parts.join('\n');

        // 1) pick a static rating now
        const rating = pickRating();
        const capRating = capitalize(rating);

        // 2) build tooltip with rating at the top
        btn.title = `${name} (${capRating})` + (base ? '\n' + base : '');

        btn.textContent = name;
        btn.addEventListener('click', () => {
            const lo = parseInt(currentcreature.meta.creatureattacklo?.[i]);
            const hi = parseInt(currentcreature.meta.creatureattackhi?.[i]);
            if (isNaN(lo) || isNaN(hi)) {
                res.textContent = ' — Invalid range';
                return;
            }

            const [adjLo, adjHi] = adjustRange(lo, hi, rating);
            const rolled = randbetween(adjLo, adjHi);
            res.textContent = ` → ${rolled}`;

            // send the same postMessage as before
            const cname = currentcreature.meta.creaturename;
            const an = /^[aeiou]/i.test(cname) ? 'an' : 'a';
            let msg = `${an} ${cname} attempts a ${name} [${capRating}] with a set value of ${rolled}.`;
            if (iwtype && dotwtype) {
                msg += ` If successful, the attack causes ${iwamt} ${iwcat} wound(s) of ${iwtype} damage, and over time, ${dotwamt} ${dotwcat} wound(s) of ${dotwtype} damage.`;
            } else if (iwtype) {
                msg += ` If successful, the attack causes ${iwamt} ${iwcat} wound(s) of ${iwtype} damage.`;
            } else if (dotwtype) {
                msg += ` If successful, the attack causes ${dotwamt} ${dotwcat} wound(s) of ${dotwtype} damage over time.`;
            }
            window.parent.postMessage(msg, '*');
        });

        wrapper.appendChild(btn);
        wrapper.appendChild(res);
        el.appendChild(wrapper);
    });

    return el;
}