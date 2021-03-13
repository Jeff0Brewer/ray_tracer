var fovy = 70*(Math.PI/180);

function main(){
	c = document.getElementById('canvas');
	setup_gl(c);

	cam = new Camera([0, -10, 8], [0, 0, 4], [0, 0, 1], .01, .01, c.width/2, c.height);
	cam.rayPerspective(fovy, c.width/2/c.height, .1);

	model_matrix = mat4.create();
	view_matrix = mat4.create();
	proj_matrix = mat4.create();
	mat4.lookAt(view_matrix, cam.pos, cam.foc, cam.up);
	mat4.perspective(proj_matrix, fovy, c.width/2/c.height, .01, 500);

	switch_shader(0);
	u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
	u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix');
	u_ProjMatrix = gl.getUniformLocation(gl.program, 'u_ProjMatrix');
	gl.uniformMatrix4fv(u_ModelMatrix, false, model_matrix);
	gl.uniformMatrix4fv(u_ViewMatrix, false, view_matrix);
	gl.uniformMatrix4fv(u_ProjMatrix, false, proj_matrix);

	light0 = new PhongLight([0, -10, 20, 0], [1, 1, 1], [1, 1, 1]);
	light1 = new PhongLight([50, 0, 50, 0], [1, 1, 1], [1, 1, 1]);

	scene_ind = 0;
	geometries = [
		[
			new Plane(),
			new Disk(new PhongMat([1, 0, 1], [1, 0, 1], [1, .5, 1])),
			new Sphere(new PhongMat([.25, .5, 0], [1, 1, 0], [.75, .75, .5])),
			new Sphere(new PhongMat([.25, 1, .5], [1, 1, 1], [.75, .5, .75])),
			new Cube(new PhongMat([.5, .2, .2], [1, 0, 0], [1, .5, .5]))
		],
		[
			new Plane(),
			new Sphere(new PhongMat([.5, .2, .2], [1, 0, 0], [1, .5, .5])),
			new Sphere(new PhongMat([.2, .5, .2], [0, 1, 0], [.5, 1, .5])),
			new Sphere(new PhongMat([.2, .2, .5], [0, 0, 1], [.5, .5, 1])),
			new Cube(new PhongMat([.5, .5, .5], [1, 1, 1], [1, 1, 1]))
		],
		[
			new Plane(),
			new Cube(new PhongMat([1, 1, 1], [1, 1, 1], [.8, .8, .8])),
			new Cube(new PhongMat([.1, .1, .1], [.1, .1, .1], [.8, .8, .8])),
			new Disk(new PhongMat([.7, .7, 1], [.7, .7, 1], [.25, .25, 1]))

		],
		[
			new Plane(),
			new Sphere(new PhongMat([.5, .2, .2], [1, 0, 1], [1, .5, 1])),
			new Sphere(new PhongMat([.2, .5, .2], [1, 1, 1], [.75, .75, .75])),
			new Sphere(new PhongMat([.2, .2, .5], [0, 1, 0], [.6, 1, .6])),
			new Cube(new PhongMat([.1, .1, .1], [.1, 0, .1], [.1, .1, .1])),
		]
	];

	draw_modes = [
		[gl.TRIANGLES, gl.TRIANGLE_FAN, gl.TRIANGLES, gl.TRIANGLES, gl.TRIANGLES],
		[gl.TRIANGLES, gl.TRIANGLES, gl.TRIANGLES, gl.TRIANGLES, gl.TRIANGLES],
		[gl.TRIANGLES, gl.TRIANGLES, gl.TRIANGLES, gl.TRIANGLE_FAN],
		[gl.TRIANGLES, gl.TRIANGLES, gl.TRIANGLES, gl.TRIANGLES, gl.TRIANGLES]
	];

	geometries[0][1].modelRotate(Math.PI/16, [1, 0, 0]);
	geometries[0][1].modelTranslate([0, 0, 2]);
	geometries[0][1].modelScale([3, 2, 4]);
	geometries[0][2].modelTranslate([5, 5, 5]);
	geometries[0][2].modelScale([3, 3, 4]);
	geometries[0][3].modelTranslate([0, 0, 5]);
	geometries[0][3].modelRotate(Math.PI/4, [0, 1, 0]);
	geometries[0][3].modelScale([1, 1.25, 1.5]);
	geometries[0][4].modelRotate(Math.PI/8, [0, 0, 1]);
	geometries[0][4].modelTranslate([0, 5, 5]);
	geometries[0][4].modelScale([2, 2, 3]);

	let sc1r = 5;
	geometries[1][1].modelTranslate([Math.cos(0)*sc1r, Math.sin(0)*sc1r, 3]);
	geometries[1][1].modelScale([2, 2, 4]);
	geometries[1][2].modelTranslate([Math.cos(Math.PI)*sc1r, Math.sin(Math.PI)*sc1r, 3]);
	geometries[1][2].modelScale([2, 2, 6]);
	geometries[1][3].modelTranslate([Math.cos(.5*Math.PI)*sc1r, Math.sin(.5*Math.PI)*sc1r, 3]);
	geometries[1][3].modelScale([2, 2, 5]);
	geometries[1][4].modelTranslate([0, 0, 3]);
	geometries[1][4].modelRotate(Math.PI/4, [1, 1, 1]);

	geometries[2][1].modelTranslate([3, 0, 3]);
	geometries[2][1].modelRotate(Math.PI/4, [1, 0, 0]);
	geometries[2][1].modelScale([.25, 2, 2]);
	geometries[2][2].modelTranslate([-3, 0, 3]);
	geometries[2][2].modelRotate(Math.PI/8, [1, 0, 0]);
	geometries[2][2].modelScale([.25, 2, 2]);
	geometries[2][3].modelTranslate([0, 3, 2]);
	geometries[2][3].modelRotate(-.4*Math.PI, [1, 0, 0]);
	geometries[2][3].modelScale([3, 2, 1]);

	geometries[3][1].modelTranslate([2, 0, 3]);
	geometries[3][2].modelTranslate([0, 0, 3]);
	geometries[3][3].modelTranslate([-2, 0, 3]);
	geometries[3][4].modelTranslate([0, 0, 1]);
	geometries[3][4].modelScale([3, 1, 1]);


	scene =  new Scene(cam, geometries[scene_ind], [light0, light1], [.2, .2, .2], 3);

	u_Camera = gl.getUniformLocation(gl.program, 'u_Camera');
	u_Ambient = gl.getUniformLocation(gl.program, 'u_Ambient');
	u_Light0 = gl.getUniformLocation(gl.program, 'u_Light0');
	u_Light0Dif = gl.getUniformLocation(gl.program, 'u_Light0Dif');
	u_Light0Spe = gl.getUniformLocation(gl.program, 'u_Light0Spe');
	u_Light1 = gl.getUniformLocation(gl.program, 'u_Light1');
	u_Light1Dif = gl.getUniformLocation(gl.program, 'u_Light1Dif');
	u_Light1Spe = gl.getUniformLocation(gl.program, 'u_Light1Spe');
	gl.uniform4fv(u_Camera, [cam.pos[0], cam.pos[1], cam.pos[2], 0]);
	gl.uniform3fv(u_Ambient, scene.am);
	gl.uniform4fv(u_Light0, light0.pos);
	gl.uniform3fv(u_Light0Dif, light0.di);
	gl.uniform3fv(u_Light0Spe, light0.sp);
	gl.uniform4fv(u_Light1, light1.pos);
	gl.uniform3fv(u_Light1Dif, light1.di);
	gl.uniform3fv(u_Light1Spe, light1.sp);

	img = new ImgBuffer(c.width/2, c.height, .5);
	img.set_random();
	img_drawer = new ImgDrawer(1, img);

	vtx_sh = 0;
	vtx_drawers = [];
	for(let i = 0; i < geometries.length; i++){
		vtx_drawers.push([]);
		for(let j = 0; j < geometries[i].length; j++){
			vtx_drawers[i].push(new VertexDrawer(vtx_sh, geometries[i][j].data.length, draw_modes[i][j]));
			vtx_drawers[i][j].buffer_data(0, geometries[i][j].data);
		}
	}


	let last_t = Date.now();
	let tick = function(){
		let this_t = Date.now();
		let elapsed = this_t - last_t;
		last_t = this_t;

		cam.strafe(elapsed);
		mat4.lookAt(view_matrix, cam.pos, cam.foc, cam.up);
		switch_shader(0);
		gl.uniform4fv(u_Camera, [cam.pos[0], cam.pos[1], cam.pos[2], 0]);
		gl.uniformMatrix4fv(u_ViewMatrix, false, view_matrix);

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

	document.getElementById('L0t').onmouseup = function(){
		light0.on = !light0.on;
		this.innerHTML = light0.on ? 'on' : 'off';
		switch_shader(0);
		if(light0.on){
			gl.uniform3fv(u_Light0Dif, light0.di);
			gl.uniform3fv(u_Light0Spe, light0.sp);
		}
		else{
			gl.uniform3fv(u_Light0Dif, [0, 0, 0]);
			gl.uniform3fv(u_Light0Spe, [0, 0, 0]);
		}
	}
	document.getElementById('L1t').onmouseup = function(){
		light1.on = !light1.on;
		this.innerHTML = light1.on ? 'on' : 'off';
		switch_shader(0);
		if(light1.on){
			gl.uniform3fv(u_Light1Dif, light1.di);
			gl.uniform3fv(u_Light1Spe, light1.sp);
		}
		else{
			gl.uniform3fv(u_Light1Dif, [0, 0, 0]);
			gl.uniform3fv(u_Light1Spe, [0, 0, 0]);
		}
	}

	let L0x = document.getElementById('L0x');
	let L0y = document.getElementById('L0y');
	let L0z = document.getElementById('L0z');
	L0x.value = light0.pos[0];
	L0y.value = light0.pos[1];
	L0z.value = light0.pos[2];
	let L0_change = function(){
		let x = parseFloat(L0x.value);
		let y = parseFloat(L0y.value);
		let z = parseFloat(L0z.value);
		if(!(Number.isNaN(x) || Number.isNaN(y) || Number.isNaN(z))){
			light0.pos = [x, y, z, 0];
			switch_shader(0);
			gl.uniform4fv(u_Light0, light0.pos);
		}
	}
	L0x.onchange = L0_change;
	L0y.onchange = L0_change;
	L0z.onchange = L0_change;

	let L1x = document.getElementById('L1x');
	let L1y = document.getElementById('L1y');
	let L1z = document.getElementById('L1z');
	L1x.value = light1.pos[0];
	L1y.value = light1.pos[1];
	L1z.value = light1.pos[2];
	let L1_change = function(){
		let x = parseFloat(L1x.value);
		let y = parseFloat(L1y.value);
		let z = parseFloat(L1z.value);
		if(!(Number.isNaN(x) || Number.isNaN(y) || Number.isNaN(z))){
			light1.pos = [x, y, z, 0];
			switch_shader(0);
			gl.uniform4fv(u_Light1, light1.pos);
		}
	}
	L1x.onchange = L1_change;
	L1y.onchange = L1_change;
	L1z.onchange = L1_change;

	document.getElementById('samples').onchange = function(){
		let value = parseInt(this.value);
		if(!Number.isNaN(value)){
			cam.samples = value;
		}
	}

	document.getElementById('reflections').onchange = function(){
		let value = parseInt(this.value);
		if(!Number.isNaN(value)){
			scene.reflections = value;
		}
	}

	document.getElementById('scene').oninput = function(){
		scene_ind = this.value;
		scene.geometries = geometries[this.value];
	}
}

function update_trace(){
	scene.trace_image(img);
	img_drawer.buffer_img(img);
}

function draw(){
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	gl.viewport(0, 0, c.width/2, c.height);
	for(let i = 0; i < vtx_drawers[scene_ind].length; i++){
		vtx_drawers[scene_ind][i].set_transform(scene.geometries[i].model_to_world);
		vtx_drawers[scene_ind][i].draw();
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