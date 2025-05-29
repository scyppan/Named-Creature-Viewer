let currentnamed;

function loadcreature(named) {
    currentnamed = named;

    const container = document.getElementById("creaturecontainer");
    container.innerHTML = ''; // clear old content

    const matchingspecies = Object.values(creatures).filter(cr =>
        cr.meta?.creaturename === currentnamed.meta?.namedcreaturesspecies
    )[0];

    container.appendChild(renderdemographics(matchingspecies));
    container.appendChild(renderwoundstats());
    container.appendChild(renderdescription(matchingspecies));
    container.appendChild(renderintelligenceandmovement());
    container.appendChild(rendersocialrules(matchingspecies));
    container.appendChild(renderabilities(matchingspecies));
    container.appendChild(renderattacks(matchingspecies));

    window.parent.postMessage(
        { eventtype: 'charassigned', name: currentnamed.meta.namedcreaturesname },
        '*'
    );
}

function randbetween(lo, hi) {
    lo = parseInt(lo);
    hi = parseInt(hi);
    return Math.floor(Math.random() * (hi - lo + 1)) + lo;
}

function renderdemographics(species) {
    const el = document.createElement('div');
    el.classList.add('creature-section', 'demographics');
    el.textContent = `${currentnamed.meta.namedcreaturesname} (${species.meta.creaturename} | ${species.meta.creaturetype} | Size: ${currentnamed.meta.namedcreaturessize})`;
    return el;
}

function renderwoundstats() {

    let text = `Heavy Wound Cap: ${currentnamed.meta.namedcreaturesheavywoundcap}`;

    if (currentnamed.meta.namedcreaturesresistance) {
        text += ` | Res. ${currentnamed.meta.namedcreaturesresistance}`;
    }

    const el = document.createElement('div');
    el.classList.add('creature-section', 'woundstats');
    el.textContent = text;
    return el;
}

function renderdescription(species) {
    const el = document.createElement('div');
    el.classList.add('creature-section', 'description');
    el.textContent = species.meta.description || '[No description]';
    return el;
}

function renderintelligenceandmovement() {
    const m = currentnamed.meta;
    let text = '';

    if (m.namedcreaturesbeastintel) {
        text += `Beastial Intel: ${m.namedcreaturesbeastintel}`;
    } else if (m.namedcreatureshumanintel) {
        text += `Human Intel: ${m.namedcreatureshumanintel}`;
    }

    if (m.namedcreatureshumansocial) {
        text += ` | Human Social Skills: ${m.namedcreatureshumansocial}`;
    }

    const ground = (m.namedcreaturesground)
        ? m.namedcreaturesground
        : "Can't move";

    const water = (m.namedcreatureswater)
        ? m.namedcreatureswater
        : "Will drown";

    const air = (m.namedcreaturesair)
        ? m.namedcreaturesair
        : "Will fall";

    text += `\nMovement: Ground: ${ground} | Water: ${water} | Air: ${air}`;

    const el = document.createElement('div');
    el.classList.add('creature-section', 'intelmove');
    el.textContent = text;
    return el;
}

function rendersocialrules(species) {
    let text = 'Social Rules\n';

    const lured = species.meta.lured && species.meta.lured !== 'No' ? 'Can be lured' : 'Cannot be lured';
    const tamed = species.meta.tamed && species.meta.tamed !== 'No' ? 'Can be tamed' : 'Cannot be tamed';
    const bond = species.meta.bond && species.meta.bond !== 'No' ? 'Can bond' : 'Cannot bond';

    text += `${lured} | ${tamed} | ${bond}`;

    if (species.meta.independence)
        text += `\nIndependence: ${species.meta.independence}`;

    if (species.meta.addtlrules)
        text += `\nAdditional Rules: ${species.meta.addtlrules}`;

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

function renderabilities(species) {
    const abilities = species.meta.creatureability || [];
    const el = document.createElement('div');
    el.classList.add('creature-section', 'abilities');
    el.textContent = 'Abilities';

    let modslist = [];
    if (currentnamed.meta.specialability) {
        for (let i = 0; i < currentnamed.meta.specialability.length; i++) {
            modslist.push({
                ability: currentnamed.meta.specialability[i],
                mod: currentnamed.meta.abilitymod[i]
            });
        }
    }

    abilities.forEach((name, i) => {
        const wrapper = document.createElement('div');
        const btn = document.createElement('button');
        const res = document.createElement('span');
        const desc = species.meta.abilitydescription?.[i] || '';
        const baseLines = [name, desc].filter(Boolean).join('\n');

        // 1) Find mod
        const modentry = modslist.find(m => m.ability === name);
        let capRating = "Typical";
        if (modentry) {
            capRating = modentry.mod;
        }

        // 2) build tooltip with rating at the top
        btn.title = `${name} (${capRating})` + (baseLines ? '\n' + baseLines : '');

        btn.textContent = name;
        btn.addEventListener('click', () => {
            // 3) use the same rating for every roll of this button
            const lo = parseInt(species.meta.creatureabilitylo?.[i]);
            const hi = parseInt(species.meta.creatureabilityhi?.[i]);
            if (isNaN(lo) || isNaN(hi)) {
                res.textContent = ' — Invalid range';
                return;
            }

            const [adjLo, adjHi] = adjustRange(lo, hi, capRating.toLowerCase());
            const rolled = randbetween(adjLo, adjHi);
            res.textContent = ` → ${rolled}`;

            window.parent.postMessage(
                `A ${currentnamed.meta.namedcreaturesname} the ${species.meta.creaturename} rolls ${rolled} on ${name} [${capRating}] (range ${adjLo}–${adjHi}).`,
                '*'
            );
        });

        wrapper.appendChild(btn);
        wrapper.appendChild(res);
        el.appendChild(wrapper);
    });

    return el;
}

function renderattacks(species) {
    const attacks = species.meta.creatureattack || [];
    const el = document.createElement('div');
    el.classList.add('creature-section', 'attacks');
    el.textContent = 'Attacks';

    let modslist = [];
    if (currentnamed.meta.specialattack) {
        for (let i = 0; i < currentnamed.meta.specialattack.length; i++) {
            modslist.push({
                attack: currentnamed.meta.specialattack[i],
                mod: currentnamed.meta.attackmod[i]
            });
        }
    }

    attacks.forEach((name, i) => {
        const wrapper = document.createElement('div');
        const btn = document.createElement('button');
        const res = document.createElement('span');

        const desc = species.meta.attackdescription?.[i] || '';
        const iwtype = species.meta.immediatewoundtype?.[i];
        const iwamt = species.meta.immediatewoundamtnum?.[i];
        const iwcat = species.meta.immediatewoundamtcat?.[i];
        const dotwtype = species.meta.dotwoundtype?.[i];
        const dotwamt = species.meta.dotwoundamtnum?.[i];
        const dotwcat = species.meta.dotwoundamtcat?.[i];

        // build the base tooltip (without rating)
        const parts = [name];
        if (desc) parts.push(desc);
        if (iwtype) parts.push(`Immediate Wounds: ${iwamt} ${iwcat} (${iwtype})`);
        if (dotwtype) parts.push(`Damage over Time: ${dotwamt} ${dotwcat} (${dotwtype})`);
        const base = parts.join('\n');

        // 1) Find mod
        const modentry = modslist.find(m => m.ability === name);
        let capRating = "Typical";
        if (modentry) {
            capRating = modentry.mod;
        }

        // 2) build tooltip with rating at the top
        btn.title = `${name} (${capRating})` + (base ? '\n' + base : '');

        btn.textContent = name;
        btn.addEventListener('click', () => {
            const lo = parseInt(species.meta.creatureattacklo?.[i]);
            const hi = parseInt(species.meta.creatureattackhi?.[i]);
            if (isNaN(lo) || isNaN(hi)) {
                res.textContent = ' — Invalid range';
                return;
            }

            const [adjLo, adjHi] = adjustRange(lo, hi, capRating.toLowerCase());
            const rolled = randbetween(adjLo, adjHi);
            res.textContent = ` → ${rolled}`;

            // send the same postMessage as before
            const cname = `${currentnamed.meta.namedcreaturesname} the ${curretnamed.meta.namedcreaturesspecies}`;
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