let history = [];
let index = 0;
let failsafe = 0;
let prompt = "architecture"; 
let username = "";
let locked = false;
let playing = false;
var timer = startTimer(30, "timer", function() {loadNext()});

async function init() {
    // Initilize elements
    document.getElementById("pausesymbol").className = "fa-solid fa-pause";
    timer.reset();
    history = [];
    index = 0;
    // Fetch first image
    await fetchImage();
    await updateImage(); 
    fetchImage(); // preload next
}

// Load in a random image
async function loadNext() {
  if (index > history.length - 2) return;
  if (index == history.length - 2) {
    // Load new image
    index++;
    await updateImage();
    fetchImage();
    timer.reset();
  } else {
    // Go forward in history
    index++;
    updateImage();
    timer.reset();
  }
}

async function fetchImage(){
  // Fetch next image
  const res = await fetch(`https://nodejs-serverless-function-e-git-2e5a20-aaron-defriezs-projects.vercel.app/api/fetchRandomImage?prompt=${prompt}&username=${username}&f=high`);
  const data = await res.json();
  const entry = {
    imgUrl: data.urls.regular,
    id: data.id,
    name: `${data.user.first_name} ${data.user.last_name}`,
    username: data.user.username,
    userurl: `${data.user.links.html}/?utm_source=artist_reference_site&utm_medium=website`,
    alt: data.description
  };

  for (const element of history) {
    if(element.id == entry.id && failsafe < 3){
      // prevents too many requests
      failsafe++;
      fetchImage();
      return;
    }
  };

  history.push(entry);
  failsafe = 0;
}

// Update current image
function updateImage() {
  const entry = history[index];
  document.getElementById("photo").src = entry.imgUrl;
  document.getElementById("hotlink").href = entry.imgUrl;

  // Enable/disable buttons depending on position
  document.getElementById("backBtn").disabled = index <= 0;
  document.getElementById("nextBtn").innerText = 
    index === history.length - 1 ? "Next (new)" : "Next (new)";
  // Add creators information
  document.getElementById("creator").href = entry.userurl;
  document.getElementById("creator").innerText = entry.name;
}

// Button functionality
const buttons = document.getElementsByClassName("navigation");

for (const btn of buttons) {
  btn.addEventListener("click", () => {
    prompt = btn.dataset.prompt;
    init();
  });
}

function search(ele) {
  if(event.key === 'Enter') {
    prompt = ele.value;
    init();
  }
}

document.getElementById("lock").addEventListener("click", () => {
  locked = !locked;
  if (locked == true) {
    username = history[index].username;
    document.getElementById("locksymbol").className = "fa-solid fa-lock";
    history = history.slice(0, (index + 1));
    fetchImage();
  } else {
    username = "";
    history.pop();
    fetchImage();
    document.getElementById("locksymbol").className = "fa-solid fa-unlock";
  }
});

document.getElementById("backBtn").addEventListener("click", () => {
  if (index > 0) {
    index--;
    updateImage();
    timer.reset();
  }
});

document.getElementById("nextBtn").addEventListener("click", () => {
  loadNext();
});

// Timer
function startTimer(seconds, container, oncomplete) {
    var startTime, timer, finished, obj, ms = seconds*1000,
        display = document.getElementById(container);
    obj = {};
    obj.resume = function() {
        playing = true;
        if (timer) clearInterval(timer);
        startTime = new Date().getTime();
        timer = setInterval(obj.step,250);
        obj.interval = timer;
    };
    obj.pause = function() {
        playing = false;
        ms = obj.step();
        clearInterval(timer);
    };
    obj.step = function() {
      var now = Math.max(0,ms-(new Date().getTime()-startTime)),
        m = Math.floor(now/60000), s = Math.floor(now/1000)%60;
      s = (s < 10 ? "0" : "")+s;
      display.innerHTML = m+":"+s;
      if( now == 0 && finished == false) {
        finished = true;
        clearInterval(timer);
        if( oncomplete) oncomplete();
      }
      return now;
    };
    obj.reset = function() {
      finished = false;
      ms = seconds*1000;
      startTime = new Date().getTime();
      obj.resume();
    }
    obj.resume();
    return obj;
}

document.getElementById("pause").addEventListener("click", () => {
  if (playing){
    timer.pause();
    document.getElementById("pausesymbol").className = "fa-solid fa-play";
  }
  else{
    timer.resume();
    document.getElementById("pausesymbol").className = "fa-solid fa-pause";
  }
});

var time = document.getElementById("timeselect");
time.addEventListener('change', handleSelect) 
function handleSelect() {
  clearInterval(timer.interval);
    var seconds = time.options[time.selectedIndex].value;
    timer = startTimer(seconds, "timer", function() {loadNext()});
    timer.reset();
}   

// Load first image
init();