var mapSelect = document.getElementById('mapSelect');

var option;
maps.forEach(function(map){
	option = document.createElement('option');
	option.innerHTML = map.name;
	option.value = map.name;
	mapSelect.appendChild(option);
});

mapSelect.addEventListener('change', function(event){
	if(event.target.value){
		game.state.start(event.target.value);
	}
});