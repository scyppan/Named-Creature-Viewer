async function fetchformdata(formId, bust = true) {
    const params = new URLSearchParams({ action: 'get_form_data', form: formId });
    if (bust) params.append('bust', '1');
    const res = await fetch(`/wp-admin/admin-ajax.php?${params}`, {
        credentials: 'same-origin'
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
}

async function fetchfresh(formid) {
    const findata = await fetchformdata(formid, true);
    return findata;
}