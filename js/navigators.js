
var game = new Phaser.Game(1300, 700, Phaser.CANVAS, 'gameContainer');

var map;
var tileset;
var layer;
var pathfinder;
var mapStates = {};

var cursors;
var marker;
var blocked = false;
var delay = 0;
var agents = [];
var text;

var bootState = {
    preload: function(){
        game.load.image('tiles', 'assets/img/terrain_atlas.png');
        game.load.image('redsquare', 'assets/img/red.png');
        game.load.image('purplesquare', 'assets/img/purple.png');
        game.load.image('greensquare', 'assets/img/blue.png');

        maps.forEach(function(map){
            game.load.tilemap(map.name, 'assets/' + map.filename, null, Phaser.Tilemap.TILED_JSON);
            agents[map.name] = new MapState(map.name, map.walkables, map.agents);
            game.state.add(map.name, agents[map.name]);
        })
        
    },
    create: function(){
        game.state.start(maps[0].name);
    }
}

var MapState = function(mapName, walkables, agentPaths){
    return {
        preload: function(){

        },

        create: function(){
            game.physics.startSystem(Phaser.Physics.ARCADE);
            map = game.add.tilemap(mapName);
            map.addTilesetImage('terrain_atlas', 'tiles');
            currentTile = map.getTile(2, 3);
            layer = map.createLayer('floor');
            map.setCollisionBetween(1, 100000, true, 'floor');
            layer.resizeWorld();
            pathfinder = game.plugins.add(Phaser.Plugin.PathFinderPlugin);
            pathfinder.setGrid(map.layers[0].data, walkables);

            marker = game.add.graphics();
            marker.lineStyle(2, 0xFFFFFF, 1);
            marker.drawRect(0, 0, 32, 32);

            setupAgents(agentPaths.length);
            agentPaths.forEach(function(agentPath, index){
                findAgentPath(agentPath.start, agentPath.end, agents[index]);
                advanceTween(agents[index]);
            });

            var style = {
                font: '14px Arial',
                fill: '#fff',
                align: 'left'
            }
            text = game.add.text(game.world.width - 150, game.world.height - 100, '0, 0', style);

        },
        update: function() {
            marker.x = layer.getTileX(game.input.activePointer.worldX) * 32;
            marker.y = layer.getTileY(game.input.activePointer.worldY) * 32;

            if (game.input.mousePointer.isDown)
            {
                console.log(marker.x, marker.y);
                blocked = true;
                findPathTo(layer.getTileX(marker.x), layer.getTileY(marker.y));
            }

            text.text = marker.x/32 + ', ' + marker.y/32;

        },
        render: function(){

        }
    }
}


function findPathTo(tilex, tiley) {
    pathfinder.setCallbackFunction(function(path) {
        path = path || [];
        for(var i = 0, ilen = path.length; i < ilen; i++) {
            map.putTile(46, path[i].x, path[i].y);
        }
        blocked = false;
    });

    pathfinder.preparePathCalculation([0,0], [tilex,tiley]);
    pathfinder.calculatePath();
}

function setupAgents(count){
    agents = [];
    for(var i = 0; i < count; i++){
        var agentTypes = ['redsquare','purplesquare','greensquare'];
        randomSprite = agentTypes[Math.floor(Math.random() * agentTypes.length)];
        agents.push({
            steps: [],
            stepsIndex: 0,
            sprite: game.add.sprite(0, 0, randomSprite)
        });
    }
}

function findAgentPath(start, end, agent){
    pathfinder.setCallbackFunction(function(path) {
        path = path || [];
        for(var i = 0, ilen = path.length; i < ilen; i++) {
           agent.steps.push({
                x: path[i].x * 32,
                y: path[i].y * 32
           });
        }
        blocked = false;
    });

    pathfinder.preparePathCalculation([start.x, start.y], [end.x,end.y]);
    pathfinder.calculatePath();
}

function advanceTween(agent){
    agent.stepsIndex++;
    agent.stepsIndex %= agent.steps.length;
    if(agent.stepsIndex == 0){
        //reset to starting position
        agent.sprite.x = agent.steps[agent.stepsIndex].x;
        agent.sprite.y = agent.steps[agent.stepsIndex].y;
        advanceTween(agent);
    }else{
        agent.tween = game.add.tween(agent.sprite);
        agent.tween.to(agent.steps[agent.stepsIndex], 100, Phaser.Easing.Linear.None);
        agent.tween.onComplete.add(function(){
            advanceTween(agent);
        }, this);
        agent.tween.start();
    }
}

game.state.add('boot', bootState);
game.state.start('boot');
