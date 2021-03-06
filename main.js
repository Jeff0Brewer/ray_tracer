var fovy = 70*(Math.PI/180);

function main(){
	c = document.getElementById('canvas');
	setup_gl(c);

	cam = new Camera([0, 20, 3], [0, 0, 3], [0, 0, 1], .01, .01, c.width/2, c.height);
	cam.rayPerspective(fovy, c.width/2/c.height, .1);

	model_matrix = mat4.create();
	view_matrix = mat4.create();
	proj_matrix = mat4.create();
	mat4.lookAt(view_matrix, cam.pos, cam.foc, cam.up);
	mat4.perspective(proj_matrix, fovy, c.width/2/c.height, .01, 500);
	update_mvp(model_matrix, view_matrix, proj_matrix);

	img = new ImgBuffer(c.width/2, c.height, .5);
	img.set_random();
	img_drawer = new ImgDrawer(1, img);

	plane = new Plane();
	disk = new Disk();
	sphere = new Sphere();
	cube = new Cube();

	disk.modelRotate(Math.PI/8, [1, 0, 0]);
	disk.modelTranslate([0, 0, 3]);
	disk.modelScale([4, 4, 4]);

	sphere.modelTranslate([5, 5, 5]);
	sphere.modelScale([3, 3, 4]);

	cube.modelRotate(Math.PI/8, [0, 0, 1]);
	cube.modelTranslate([-5, 5, 5]);
	cube.modelScale([3, 2, 1]);

	scene = [plane, disk, sphere, cube];
	vtx_drawers = [
		new VertexDrawer(0, plane.data.length, gl.TRIANGLES),
		new VertexDrawer(0, disk.data.length, gl.TRIANGLE_FAN),
		new VertexDrawer(0, sphere.data.length, gl.TRIANGLES),
		new VertexDrawer(0, cube.data.length, gl.TRIANGLES)
	];
	vtx_drawers[0].buffer_data(0, plane.data);
	vtx_drawers[1].buffer_data(0, disk.data);
	vtx_drawers[2].buffer_data(0, sphere.data);
	vtx_drawers[3].buffer_data(0, cube.data);


	let last_t = Date.now();
	let tick = function(){
		let this_t = Date.now();
		let elapsed = this_t - last_t;
		last_t = this_t;

		cam.strafe(elapsed);
		mat4.lookAt(view_matrix, cam.pos, cam.foc, cam.up);
		update_view(view_matrix);
		draw();
	}
	setInterval(tick, 1000/60);

	c.onmousedown = function(e){
		cam.mousedown(e);
	}

	c.onmousemove = function(e){
		cam.mousemove(e)
	}

	c.onmouseup = function(e){
		cam.mouseup(e);
	}

	c.onwheel = function(e){
		cam.wheel(e);
	}

	window.addEventListener('keydown', key_down, false);
	window.addEventListener('keyup', key_up, false);
}

function update_trace(){
	cam.trace(scene, img);
	img_drawer.buffer_img(img);
}

function draw(){
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	gl.viewport(0, 0, c.width/2, c.height);
	for(let i = 0; i < vtx_drawers.length; i++){
		vtx_drawers[i].set_transform(scene[i].model_to_world);
		vtx_drawers[i].draw();
	}

	gl.viewport(c.width/2, 0, c.width/2, c.height);
	img_drawer.draw();
}

function key_down(e){
	let char = String.fromCharCode(e.keyCode);
	switch(char){
		case 'W':
			cam.add_strafe([0, 1]);
			break;
		case 'A':
			cam.add_strafe([-1, 0]);
			break;
		case 'S':
			cam.add_strafe([0, -1]);
			break;
		case 'D':
			cam.add_strafe([1, 0]);
			break;
		case 'T':
			update_trace();
			break;
	}
}

function key_up(e){
	let char = String.fromCharCode(e.keyCode);
	switch(char){
		case 'W':
			cam.add_strafe([0, -1]);
			break;
		case 'A':
			cam.add_strafe([1, 0]);
			break;
		case 'S':
			cam.add_strafe([0, 1]);
			break;
		case 'D':
			cam.add_strafe([-1, 0]);
			break;
	}
}

document.getElementById('samples').onchange = function(){
	let value = parseInt(this.value);
	if(!Number.isNaN(value)){
		cam.samples = value;
	}
}