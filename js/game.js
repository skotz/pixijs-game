//
// Scott Clayton 2019
//

// Initialize app
var app = new PIXI.Application({ 
    autoResize: true,
    resolution: devicePixelRatio,
    backgroundColor: 0xEEEEEE,
    antialias: true,
    resolution: 2
});
document.body.appendChild(app.view);

// Resize app to window size
window.addEventListener('resize', resize);
function resize() {
    app.renderer.resize(window.innerWidth, window.innerHeight);
    //rect.position.set(app.screen.width, app.screen.height);
}
resize();

// Settings
const growthFactor = 2.0;
const playerColors = [ 0x2fe02a, 0x2a88e0, 0xe02a63 ];

// Global
var selectedIndex = -1;

// Initialize planets
var planets = [];
// planets.push({
    // team: 1,
    // color: 0x2fe02a,
    // x: 300,
    // y: 250,
    // power: 100,
    // level: 2,
    // sprite: {},
    // ships: [],
    // updated: -1,
    // captured: -1
// },{
    // team: 2,
    // color: 0x2a88e0,
    // x: 700,
    // y: 450,
    // power: 50,
    // level: 1,
    // sprite: {},
    // ships: [],
    // updated: -1,
    // captured: -1
// },{
    // team: 3,
    // color: 0xe02a63,
    // x: 500,
    // y: 650,
    // power: 150,
    // level: 3,
    // sprite: {},
    // ships: [],
    // updated: -1,
    // captured: -1
// });

var generageMap = function (numTeams, numPlanets, minLevel, maxLevel, minPower, maxPower) {
    var border = 100;
    var minDist = 50;
    for (var t = 1; t <= numTeams; t++) {
        for (var p = 0; p < numPlanets; p++) {
            var level = Math.ceil(Math.random() * (maxLevel - minLevel) + minLevel);
            var power = Math.floor(Math.random() * (maxPower - minPower) + minPower);
            var x = 0;
            var y = 0;
            
            // Keep trying random location until we find one that doesn't overlap with another planet
            var tries = 10000;
            var done = false;
            while (!done && tries-- > 0) {
                x = Math.random() * (app.screen.width - border * 2) + border;
                y = Math.random() * (app.screen.height - border * 2) + border;
                
                done = true;
                for (var z = 0; z < planets.length; z++) {
                    var distance = Math.sqrt(Math.pow(planets[z].x - x, 2) + Math.pow(planets[z].y - y, 2));
                    distance -= getSizeFromPower(planets[z].power) / 2;
                    distance -= getSizeFromPower(power) / 2;
                    if (distance < minDist) {
                        done = false;
                        break;
                    }
                }
            }
            
            planets.push({
                team: t,
                color: playerColors[t - 1],
                x: x,
                y: y,
                power: power,
                level: level,
                sprite: {},
                ships: [],
                updated: -1,
                captured: -1
            });
        }
    }
}

// Get the size of a circle based on it's power level
var getSizeFromPower = function (power) {
    // The power is the area of a circle, so the size is the diameter
    return Math.sqrt(power / Math.PI) * 10;
}

var createPlanetSprite = function (planet) {
    const graphics = new PIXI.Graphics();
    const upscale = 1000;
    graphics.beginFill(planets[planet].color);
    graphics.lineStyle(0);
    graphics.drawCircle(upscale, upscale, upscale);
    graphics.endFill();

    const texture = PIXI.RenderTexture.create(graphics.width, graphics.height);
    app.renderer.render(graphics, texture);

    const sprite = new PIXI.Sprite(texture);
    sprite.x = planets[planet].x;
    sprite.y = planets[planet].y;
    sprite.anchor.set(0.5, 0.5);
    sprite.interactive = true;
    sprite.hitArea = new PIXI.Circle(0, 0, upscale);
    
    sprite.pointerdown = function () {
        // First selection
        selectedIndex = planet;
    }    
    sprite.pointerup = function () {
        // Attack
        if (selectedIndex != planet && selectedIndex != -1) {
            moveShips(selectedIndex, planet);
        }
        
        // Unselect
        selectedIndex = -1;
    }
    
    return sprite;
}

// Create a ship for a given player
var createShip = function (actor, dx, dy) {
    const graphics = new PIXI.Graphics();
    const size = 2;
    graphics.beginFill(actor.color);
    graphics.lineStyle(0);
    graphics.drawCircle(size, size, size);
    graphics.endFill();

    const texture = PIXI.RenderTexture.create(graphics.width, graphics.height);
    app.renderer.render(graphics, texture);

    const sprite = new PIXI.Sprite(texture);
    sprite.x = actor.x + dx;
    sprite.y = actor.y + dy;
    sprite.anchor.set(0.5, 0.5);
    
    var speed = 0;
    while (Math.abs(speed) < 0.25) {
        speed = Math.random() - 0.5;
    }
    
    return {
        team: actor.team,
        color: actor.color,
        angle: Math.random() * 360,
        speed: speed,
        sprite: sprite
    };
}

// Initialize planets
var initializePlanets = function () {
    for (var i = 0; i < planets.length; i++) {
        planets[i].sprite = createPlanetSprite(i);
        app.stage.addChild(planets[i].sprite);
    }
}

// Move all ships from one planet to another
var moveShips = function (source, target) {
    for (var s = planets[source].ships.length - 1; s >= 0; s--) {
        if (planets[source].ships[s].team == planets[source].team) {
            var ship = planets[source].ships[s];
            planets[source].ships.splice(s, 1);
            planets[target].ships.push(ship);
        } else {
            console.log('cool')
        }
    }
}

// Get the location of an orbiting ship
var getShipLocation = function (angle, centerx, centery, radius) {
    return {
        x: centerx + radius * Math.cos(angle),
        y: centery + radius * Math.sin(angle)
    }
}

// Get a point a specified number of pixels between two other points
var getMidPoint = function (x1, y1, x2, y2, dist) {
    var distx = x1 - x2;
    var disty = y1 - y2;
    var distActual = Math.sqrt(distx * distx + disty * disty);
    
    // Ratio of desired distance to the actual distance
    var t = Math.abs(dist) / distActual;
    
    if (t < 1) {
        return {
            x: (1 - t) * x1 + t * x2,
            y: (1 - t) * y1 + t * y2,
            orbit: false
        }
    }
    else {
        return {
            x: x2,
            y: y2,
            orbit: true
        }
    }
}

// Run
generageMap(3, 5, 1, 4, 10, 200);
initializePlanets();

// Game loop
var totalSeconds = 0;
app.ticker.add((delta) => {totalSeconds
    // Number of seconds since the last frame
    var seconds = app.ticker.elapsedMS / 1000;
    totalSeconds += seconds;
    
    for (var i = 0; i < planets.length; i++) {        
        // Update strengths
        // planets[i].power += planets[i].level * seconds * growthFactor;
        var size = getSizeFromPower(planets[i].power);
        planets[i].sprite.width = size;
        planets[i].sprite.height = size;
        
        // Add more ships (one per level per second)
        if (Math.floor(planets[i].updated) < Math.floor(totalSeconds)) {
            for (var lvl = 0; lvl < planets[i].level; lvl++) {
                if (planets[i].ships.length < planets[i].power) {
                    const ship = createShip(planets[i], 0, 0);
                    planets[i].ships.push(ship);
                    app.stage.addChild(ship.sprite);
                }
            }
            planets[i].updated = totalSeconds;
        }
        
        // Update selections
        planets[i].sprite.alpha = i == selectedIndex ? 0.5 : 1;
        
        // Update the ships
        for (var s = 0; s < planets[i].ships.length; s++) {
            
            // Get a point on the desired orbit path
            var orbit = getShipLocation(planets[i].ships[s].angle, planets[i].sprite.x, planets[i].sprite.y, size * 0.75);
            planets[i].ships[s].angle += planets[i].ships[s].speed * seconds;
            
            // Calculate a step towards the desired orbit path
            var midpoint = getMidPoint(planets[i].ships[s].sprite.x, planets[i].ships[s].sprite.y, orbit.x, orbit.y, planets[i].ships[s].speed);
            
            // Update ship location
            planets[i].ships[s].sprite.x = midpoint.x;
            planets[i].ships[s].sprite.y = midpoint.y;
            planets[i].ships[s].orbiting = midpoint.orbit;
            
            // Process battles
            for (var enemy = planets[i].ships.length - 1; enemy > s; enemy--) {
                if (enemy < planets[i].ships.length) {
                    if (planets[i].ships[enemy].team != planets[i].ships[s].team) {
                        // Get the distance to the enemy ship
                        var ex = planets[i].ships[enemy].sprite.x - planets[i].ships[s].sprite.x;
                        var ey = planets[i].ships[enemy].sprite.y - planets[i].ships[s].sprite.y;
                        var edist = Math.sqrt(ex * ex + ey * ey);
                        
                        // Destroy both ships
                        if (edist <= 2) {
                            app.stage.removeChild(planets[i].ships[enemy].sprite);
                            app.stage.removeChild(planets[i].ships[s].sprite);
                            planets[i].ships.splice(enemy, 1);
                            planets[i].ships.splice(s, 1);
                        }
                    }
                }
            }
        }
            
        // Process takeovers
        var majority = [0, 0, 0, 0, 0, 0, 0, 0];
        var colors = [0, 0, 0, 0, 0, 0, 0, 0];
        for (var s = 0; s < planets[i].ships.length; s++) {
            if (planets[i].ships[s].orbiting) {
                majority[planets[i].ships[s].team]++;
                colors[planets[i].ships[s].team] = planets[i].ships[s].color;
            }
        }
        var best = majority.indexOf(Math.max(...majority));
        if (best != 0 && best != planets[i].team && majority[best] * 1.5 > majority[planets[i].team] && planets[i].captured + 1 < totalSeconds) {
            // The enemy has a majority of ships, so capture the planet
            planets[i].team = best;
            planets[i].color = colors[best];
            planets[i].captured = totalSeconds;
            var old = planets[i].sprite;
            planets[i].sprite = createPlanetSprite(i);
            app.stage.addChild(planets[i].sprite);
            app.stage.removeChild(old);
        }
    }
});



