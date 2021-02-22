var fovy = 70*(Math.PI/180);

function main(){
	c = document.getElementById('canvas');
	setup_gl(c);

	cam = new Camera([0, 0, 10], [0, 0, 0], [0, 1, 0], .01, .01, c.width/2, c.height);
	cam.rayPerspective(fovy, c.width/2/c.height, .1);

	model_matrix = mat4.create();
	view_matrix = mat4.create();
	proj_matrix = mat4.create();
	mat4.lookAt(view_matrix, cam.pos, cam.foc, cam.up);
	mat4.perspective(proj_matrix, fovy, c.width/2/c.height, .01, 500);
	update_mvp(model_matrix, view_matrix, proj_matrix);

	img = new ImgBuffer(c.width/2, c.height);
	img.set_random();
	img_drawer = new ImgDrawer(1, img);

	plane = new Plane([0, 0, 0], [0, 0, 1], [1, 0, 0], 1);
	vtx_drawer = new VertexDrawer([0], [plane.data.length], [gl.TRIANGLES]);
	vtx_drawer.buffer_data(0, plane.data);


	update_trace();
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
	cam.trace(plane, img);
	img_drawer.buffer_img(img);
}

function draw(){
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	gl.viewport(0, 0, c.width/2, c.height);
	vtx_drawer.draw();

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