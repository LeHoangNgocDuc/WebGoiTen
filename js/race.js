window.RaceGameVisual = {
  mount(scene){
    scene.innerHTML = `
      <div class="race-scene" style="position:absolute;inset:0">
        <div class="race-stars"></div><div class="race-track"></div><div class="race-finish"></div>
        <div class="race-lane-label a">LÀN ĐỘI XANH</div><div class="race-lane-label b">LÀN ĐỘI ĐỎ</div>
        <div class="race-car a"><div class="body"></div><div class="cabin"></div><div class="wheel l"></div><div class="wheel r"></div></div>
        <div class="race-car b"><div class="body"></div><div class="cabin"></div><div class="wheel l"></div><div class="wheel r"></div></div>
        ${Array.from({length:7},(_,i)=>`<span class="race-speedline" style="left:${3+i*12}%;top:${180+i%3*50}px;animation-delay:${i*.12}s"></span>`).join('')}
      </div>`;
  },
  update(scene,a,b,win){
    const pA=Math.max(0,Math.min(1,a/Math.max(1,win)));
    const pB=Math.max(0,Math.min(1,b/Math.max(1,win)));
    scene.style.setProperty('--carA-left',`calc(8% + ${pA*70}%)`);
    scene.style.setProperty('--carB-left',`calc(8% + ${pB*70}%)`);
  },
  pulse(scene,team){
    const car=scene.querySelector('.race-car.'+team.toLowerCase());
    if(!car)return;car.classList.add('boost');setTimeout(()=>car.classList.remove('boost'),450);
  }
};
