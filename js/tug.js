window.TugGameVisual = {
  mount(scene){
    scene.innerHTML = `
      <div class="tug-scene" style="position:absolute;inset:0">
        <div class="tug-crowd" id="tugCrowd"></div>
        <div class="tug-zone a"></div><div class="tug-zone b"></div>
        <div class="tug-midline"></div><div class="tug-rope"></div>
        <div class="tug-flag"><div class="pole"></div><div class="cloth"></div></div>
        <div class="tug-team a">${this.players()}</div>
        <div class="tug-team b">${this.players()}</div>
      </div>`;
    const colors=['#48dcff','#ff6682','#ffd45f','#ffffff'];
    const crowd=scene.querySelector('#tugCrowd');
    for(let i=0;i<55;i++){
      const d=document.createElement('i');
      d.style.left=(Math.random()*96+2)+'%'; d.style.top=(Math.random()*85+4)+'%';
      d.style.background=colors[i%colors.length]; d.style.animationDelay=(Math.random()*2)+'s';
      crowd.appendChild(d);
    }
  },
  players(){
    const p=`<div class="tug-player"><div class="hair"></div><div class="head"></div><div class="arm l"></div><div class="arm r"></div><div class="body"></div><div class="leg l"></div><div class="leg r"></div></div>`;
    return p+p+p;
  },
  update(scene,a,b,win){
    const delta=(a-b)/Math.max(1,win);
    const clamp=Math.max(-1,Math.min(1,delta));
    scene.style.setProperty('--flag-shift',(clamp*112)+'px');
    scene.style.setProperty('--teamA-shift',(Math.max(0,clamp)*28)+'px');
    scene.style.setProperty('--teamB-shift',(Math.min(0,clamp)*28)+'px');
  },
  pulse(scene,team){
    const group=scene.querySelector('.tug-team.'+team.toLowerCase());
    if(!group)return;group.animate([{transform:getComputedStyle(group).transform},{filter:'brightness(1.35)'},{filter:'brightness(1)'}],{duration:520,easing:'ease-out'});
  }
};
