function Camera(cam, focus, up, rot_speed, zoom_speed, width, height){
	this.pos = cam;
	this.foc = focus;
	this.up = up;
	this.r_spd = Math.abs(rot_speed);
	this.z_spd = -Math.abs(zoom_speed);
	this.w = width;
	this.h = height;

	this.rotation = mat4.create();
	this.dragging = false;
	this.mouse = {
		x: 0,
		y: 0
	};
	this.strafe_sign = {
		lat: 0,
		for: 0
	};
	this.axis = {
		u: vec4.fromValues(1, 0, 0, 0),
		v: vec4.fromValues(0, 1, 0, 0),
		n: vec4.fromValues(0, 0, 1, 0)
	};
	this.frustum = {
		near: 1,
		left: -1,
		right: 1,
		bottom: -1,
		top: 1
	}
	this.u_step = (this.frustum.right - this.frustum.left)/this.w;
	this.v_step = (this.frustum.top - this.frustum.bottom)/this.h;
}

Camera.prototype.trace = function(plane, img_buffer){
	let eye_ray = new Ray();
	for(let x = 0; x < this.w; x++){
		for(let y = 0; y < this.h; y++){
			this.setEyeRay(eye_ray, x + .5, y + .5);
			img_buffer.set_pixel_float(plane.trace(eye_ray), x, y);
		}
	}
	img_buffer.float_to_int();
}

Camera.prototype.setEyeRay = function(out_ray, x_pix, y_pix){
	let pos_u = this.frustum.left + x_pix*this.u_step;
	let pos_v = this.frustum.bottom + y_pix*this.v_step;

	let dir = vec4.create();
	vec4.scaleAndAdd(dir, dir, this.axis.u, pos_u);
	vec4.scaleAndAdd(dir, dir, this.axis.v, pos_v);
	vec4.scaleAndAdd(dir, dir, this.axis.n, -this.frustum.near);
	vec4.copy(out_ray.dir, dir);
	vec4.copy(out_ray.pos, [this.pos[0], this.pos[1], this.pos[2], 1]);
}

Camera.prototype.rayLookAt = function(pos, foc, up){
	this.pos = pos;
	this.foc = foc;
	this.up = up;
}

Camera.prototype.rayFrustum = function(near, left, right, bottom, top){
	this.frustum.near = near;
	this.frustum.left = left;
	this.frustum.right = right;
	this.frustum.bottom = bottom;
	this.frustum.top = top;

	this.u_step = (this.frustum.right - this.frustum.left)/this.w;
	this.v_step = (this.frustum.top - this.frustum.bottom)/this.h;
}

Camera.prototype.rayPerspective = function(fovy, aspect, near){
	this.frustum.near = near;
	this.frustum.top = near * Math.tan(fovy/2);
	this.frustum.bottom = -this.frustum.top;
	this.frustum.right = this.frustum.top*aspect;
	this.frustum.left = -this.frustum.right;

	this.u_step = (this.frustum.right - this.frustum.left)/this.w;
	this.v_step = (this.frustum.top - this.frustum.bottom)/this.h;
}

Camera.prototype.strafe = function(elapsed){
	let speed = 10;
	let d = vec3.add(
		[0, 0, 0], 
		vec3.scale([0, 0, 0], vec2.normalize([0, 0], vec2.subtract([0, 0], this.foc.slice(0, 2), this.pos.slice(0, 2))).concat([0]), this.strafe_sign.for*speed*elapsed/1000), 
		vec3.scale([0, 0, 0], vec3.normalize([0, 0, 0], vec3.cross([0, 0, 0], vec3.subtract([0, 0, 0], this.foc, this.pos), [0, 0, 1])), this.strafe_sign.lat*speed*elapsed/1000)
	);
	vec3.add(this.pos, this.pos, d);
	vec3.add(this.foc, this.foc, d);
}

Camera.prototype.add_strafe = function(s){
	this.strafe_sign.lat = Math.sign(this.strafe_sign.lat + s[0]);
	this.strafe_sign.for = Math.sign(this.strafe_sign.for + s[1]);
}

Camera.prototype.mousedown = function(e){
	this.dragging = true;
	this.mouse.x = e.clientX;
	this.mouse.y = e.clientY;
}

Camera.prototype.mousemove = function(e){
	if(this.dragging){
		let dx = this.r_spd * (e.clientX - this.mouse.x);
		let dy = this.r_spd * (e.clientY - this.mouse.y);
		
		let dir = vec3.subtract([0, 0, 0], this.foc, this.pos);

		mat4.rotate(this.rotation, mat4.create(), -dx, [0, 0, 1]);
		mat4.rotate(this.rotation, this.rotation, -dy, vec3.normalize([0, 0, 0], vec3.cross([0, 0, 0], dir, this.up)));

		vec3.add(this.foc, this.pos, vec3.transformMat4([0, 0, 0], dir, this.rotation));
		vec3.transformMat4(this.up, this.up, this.rotation);

		this.mouse.x = e.clientX;
		this.mouse.y = e.clientY;
	}
}

Camera.prototype.mouseup = function(e){
	this.dragging = false;
}

Camera.prototype.wheel = function(e){
	let d = vec3.scale([0, 0, 0], vec3.subtract([0, 0, 0], this.foc, this.pos), e.deltaY*this.z_spd);
	vec3.add(this.pos, this.pos, d);
	vec3.add(this.foc, this.foc, d);
}
