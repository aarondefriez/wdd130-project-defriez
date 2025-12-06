const sampleImages = [
    {id:1, tag:'Architecture', thumb:'https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=800&q=60&auto=format&fit=crop', full:'https://unsplash.com/photos/1VqHRwxcCCw', creator:'Rafael Lovasian'},
    {id:2, tag:'Portrait', thumb:'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=800&q=60&auto=format&fit=crop', full:'https://unsplash.com/photos/VH8Q0Mb0o5Q', creator:'Ales Krivec'},
    {id:3, tag:'Landscapes', thumb:'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800&q=60&auto=format&fit=crop', full:'https://unsplash.com/photos/Jztmx9yqjBw', creator:'Daniel Frank'},
    {id:4, tag:'Gestures', thumb:'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=800&q=60&auto=format&fit=crop', full:'https://unsplash.com/photos/6anudmpILw4', creator:'Brady Harvey'},
    {id:5, tag:'Designs', thumb:'https://images.unsplash.com/photo-1503602642458-232111445657?w=800&q=60&auto=format&fit=crop', full:'https://unsplash.com/photos/6KsJcFJ1Qd8', creator:'Dan Burton'},
    {id:6, tag:'Architecture', thumb:'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=800&q=60&auto=format&fit=crop', full:'https://unsplash.com/photos/jFCViYFYcus', creator:'Rene Böhmer'}
];

function el(q){return document.querySelector(q)}
function elAll(q){return document.querySelectorAll(q)}

function renderGallery(filter){
    const g = el('#gallery');
    g.innerHTML='';
    const items = sampleImages.filter(i => !filter || filter==='all' ? true : i.tag===filter);
    items.forEach(img => {
        const card = document.createElement('article');
        card.className='card';
        card.innerHTML = `
            <img src="${img.thumb}" alt="${img.tag}">
            <div class="meta">
                <div class="creator">${img.creator}</div>
                <div>
                    <button class="preview" data-id="${img.id}">Preview</button>
                    <button class="add" data-id="${img.id}">Add</button>
                </div>
            </div>`;
        g.appendChild(card);
    })
}

// Helper to create unique numeric IDs
function makeId(){
    return Date.now() + Math.floor(Math.random()*1000);
}

// Import recent images saved by randomphoto.js into the gallery
function importRecentImages(){
    try{
        const raw = localStorage.getItem('recentUnsplashHistory');
        if(!raw) { alert('No recent images found. Load some images on the main gallery first.'); return; }
        const recent = JSON.parse(raw);
        let added = 0;
        recent.forEach(entry => {
            // entry expected shape from randomphoto.js: {imgUrl, id, name, username, userurl, alt}
            const fullUrl = entry.userurl || entry.imgUrl || entry.id;
            const thumbUrl = entry.imgUrl || entry.urls && entry.urls.small;
            // avoid duplicates by full url
            const exists = sampleImages.find(i => i.full === fullUrl || i.thumb === thumbUrl);
            if(exists) return;
            const obj = {
                id: makeId(),
                tag: 'Imported',
                thumb: thumbUrl,
                full: fullUrl,
                creator: entry.name || entry.creator || 'Unknown'
            };
            sampleImages.push(obj);
            added++;
        });
        if(added>0) renderGallery('all');
        alert(added + ' images imported from recent gallery.');
    }catch(e){
        console.error('Import failed', e);
        alert('Failed to import recent images. See console for details.');
    }
}

function loadMoodboard(){
    try{
        return JSON.parse(localStorage.getItem('moodboard')||'[]');
    }catch(e){return []}
}
function saveMoodboard(list){
    localStorage.setItem('moodboard', JSON.stringify(list));
}

function renderMoodboard(){
    const box = el('#moodItems');
    const empty = el('#emptyNotice');
    const items = loadMoodboard();
    box.innerHTML='';
    if(items.length===0){empty.style.display='block'} else {empty.style.display='none'}
    items.forEach(id => {
        const img = sampleImages.find(i=>i.id===id);
        if(!img) return;
        const d = document.createElement('div');
        d.className='mood-item';
        d.innerHTML = `<img src="${img.thumb}" alt="${img.tag}"><button class="remove" data-id="${img.id}">×</button>`;
        box.appendChild(d);
    })
}

function addToMood(id){
    const list = loadMoodboard();
    if(!list.includes(id)){
        list.push(id);
        saveMoodboard(list);
        renderMoodboard();
    }
}
function removeFromMood(id){
    let list = loadMoodboard();
    list = list.filter(i=>i!==id);
    saveMoodboard(list);
    renderMoodboard();
}

function clearMoodboard(){
    localStorage.removeItem('moodboard');
    renderMoodboard();
}

function openPreview(id){
    const img = sampleImages.find(i=>i.id===id);
    if(!img) return;
    el('#modalImg').src = img.thumb;
    el('#modalLink').href = img.full;
    el('#modalCreator').textContent = img.creator;
    el('#modalCreator').href = img.full;
    el('#previewModal').setAttribute('aria-hidden','false');
    el('#addToMood').dataset.id = id;
}
function closePreview(){
    el('#previewModal').setAttribute('aria-hidden','true');
}

function init(){
    renderGallery('all');
    renderMoodboard();

    // filter buttons
    elAll('.filter-btn').forEach(b=>{
        b.addEventListener('click',()=>{
            elAll('.filter-btn').forEach(x=>x.classList.remove('active'));
            b.classList.add('active');
            const tag = b.dataset.tag;
            renderGallery(tag);
        })
    })

    // delegate gallery clicks
    el('#gallery').addEventListener('click', (e)=>{
        const p = e.target.closest('button');
        if(!p) return;
        const id = Number(p.dataset.id);
        if(p.classList.contains('add')) addToMood(id);
        if(p.classList.contains('preview')) openPreview(id);
    })

    // moodboard remove
    el('#moodItems').addEventListener('click',(e)=>{
        const b = e.target.closest('button');
        if(!b) return;
        const id = Number(b.dataset.id);
        removeFromMood(id);
    })

    el('#clearMoodboard').addEventListener('click',clearMoodboard);
    el('#viewMoodboard').addEventListener('click',()=>{
        el('#moodboard').scrollIntoView({behavior:'smooth'});
    });
    const importBtn = el('#importRecent');
    if(importBtn) importBtn.addEventListener('click', importRecentImages);

    // modal
    el('#closeModal').addEventListener('click',closePreview);
    el('#addToMood').addEventListener('click',(e)=>{
        const id = Number(e.target.dataset.id);
        addToMood(id);
    })

    // initial active filter
    const allBtn = document.querySelector('.filter-btn[data-tag="all"]');
    if(allBtn) allBtn.classList.add('active');
}

window.addEventListener('DOMContentLoaded',init);
