//
// Scott Clayton 2019
//

// Initialize app
var app = new PIXI.Application({ 
    autoResize: true,
    resolution: devicePixelRatio,
    backgroundColor: 0xD1FFD2
});
document.body.appendChild(app.view);

// Resize app to window size
window.addEventListener('resize', resize);
function resize() {
    app.renderer.resize(window.innerWidth, window.innerHeight);
    //rect.position.set(app.screen.width, app.screen.height);
}
resize();

// Initialize objects
var circle = new PIXI.Graphics();
circle.beginFill(0xFFFFFF);
circle.drawCircle(0, 0, 50);
app.stage.addChild(circle);

var dist = 0;

// Game loop
app.ticker.add((delta) => {
    dist += delta;
    circle.x = dist;
    circle.y = dist;
});