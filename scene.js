'use strict';
(() => {
  document.documentElement.classList.add('js');
  document.getElementById('year').textContent = new Date().getFullYear();
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const hero = document.querySelector('.hero');
  const detail = document.getElementById('detail-frame');
  const contact = document.querySelector('.contact');
  const progress = document.getElementById('progress');
  const reveals = document.querySelectorAll('.reveal');
  const clamp = (n,a,b) => Math.max(a,Math.min(b,n));
  if (!reduced.matches && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) if (entry.isIntersecting) {
        entry.target.classList.add('visible'); observer.unobserve(entry.target);
      }
    }, { threshold:.09, rootMargin:'0px 0px -4% 0px' });
    reveals.forEach(el => observer.observe(el));
  } else reveals.forEach(el => el.classList.add('visible'));
  let scheduled = false;
  function render() {
    scheduled = false;
    const y = scrollY, height = innerHeight;
    progress.style.transform = `scaleX(${clamp(y/Math.max(1,document.documentElement.scrollHeight-height),0,1)})`;
    if (reduced.matches) return;
    // The full-bleed sculpture moves in perspective while the text remains fixed.
    const heroT = clamp(y / Math.max(1,hero.offsetHeight),0,1);
    hero.style.setProperty('--hero-scale',(1.14 + heroT*.28).toFixed(3));
    hero.style.setProperty('--hero-shift',`${Math.round(-heroT*70)}px`);
    hero.style.setProperty('--hero-rotation',`${(-3+heroT*11).toFixed(2)}deg`);
    // A second physical layer tilts toward the visitor as its chapter enters view.
    const r = detail.getBoundingClientRect();
    const t = clamp((height-r.top)/(height+r.height),0,1);
    detail.style.setProperty('--frame-rotate',`${(-15+t*25).toFixed(2)}deg`);
    detail.style.setProperty('--frame-pitch',`${(7-t*11).toFixed(2)}deg`);
    const cr = contact.getBoundingClientRect();
    const ct = clamp((height-cr.top)/(height+cr.height),0,1);
    contact.style.setProperty('--contact-scale',(1.24-ct*.15).toFixed(3));
  }
  function requestRender(){if(!scheduled){scheduled=true;requestAnimationFrame(render)}}
  addEventListener('scroll',requestRender,{passive:true});
  addEventListener('resize',requestRender,{passive:true});
  reduced.addEventListener('change',() => { reveals.forEach(el=>el.classList.add('visible'));requestRender(); });
  render();
})();
