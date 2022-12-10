const time_line = gsap.timeline({defaults: {duration: 0.75, ease: 'power1.out'}});
//tips
const tipsClose = document.getElementsByClassName("close-tips");
const tipsContainer  = document.getElementsByClassName("visible-state");
const tipsNext = document.getElementsByClassName("next-btn");


document.getElementById('tips-btn').addEventListener('click', (e) => {
    window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'smooth'
      });

    time_line.set('.tips', {visibility: 'visible'})
    time_line.to('#tips-container', {visibility: 'visible', opacity: 1, y: 0});
    time_line.fromTo('.tips-content', {scale: 0}, {scale: 1, ease: 'elastic.out(1, 1)', duration: 1.5});
});

for(let i = 0; i < tipsClose.length; i++){
    tipsClose[i].addEventListener('click', (e) => {
        for(let j = 0; j < tipsContainer.length; j++){
            if(tipsContainer[j].style.visibility == 'visible'){
                time_line.fromTo(tipsContainer[j], {autoAlpha: 1}, {autoAlpha: 0, ease: 'sine.out', y:-100, duration: 0.2});
                time_line.set('.tips', {visibility: 'hidden'});
            }
        }
    });
}

for(let i = 0; i < tipsNext.length; i++){
    tipsNext[i].addEventListener('click', function(e) {
        for(let j = 0; j < tipsContainer.length; j++){
            if(tipsContainer[j].style.visibility == 'visible'){
                console.log(tipsContainer[j])
                time_line.fromTo(tipsContainer[j], {autoAlpha: 1}, {autoAlpha: 0, ease: 'sine.out', x:-100, duration: 0.2}, '>');
                time_line.fromTo(tipsContainer[j+1] , {autoAlpha: 0, x: 100}, {visibility: 'visible', autoAlpha: 1, ease: 'sine.out', x:0, duration: 0.2});
                if(j == 2){
                    time_line.set('.tips', {visibility: 'hidden'});
                }
                break;
            }
        }
    });
}

