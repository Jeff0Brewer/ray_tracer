function Scene(camera, geometries, lights, ambient){
	this.camera = camera;
	this.geometries = geometries;
	this.lights = lights;
	this.am = ambient;
	this.e = -.0001;
}

Scene.prototype.trace_shadow = function(ray, d){
	for(let g = 0; g < this.geometries.length; g++){
		let hit = this.geometries[g].trace(ray);
		if(hit && d > vec3.length(vec3.subtract([0,0,0], ray.pos, hit.p))){
			return false;
		}
	}
	return true;
}

Scene.prototype.trace_ray = function(ray){
	let min_d = 1000000;
	let col = [0, 0, 0];
	let Se = 50;
	let shadow_ray = new Ray();
	for(let g = 0; g < this.geometries.length; g++){
		let hit = this.geometries[g].trace(ray);
		if(hit){
			let hit_d = vec3.length(vec3.subtract([0,0,0], ray.pos, hit.p))
			if(hit_d < min_d){
				min_d = hit_d;
				let N = vec3.normalize([0,0,0], hit.n);
				let V = vec3.normalize([0,0,0], vec3.subtract([0,0,0], ray.pos, hit.p));
				col = vec3.multiply([0,0,0], this.am, hit.mat.am);
				for(let l = 0; l < this.lights.length; l++){
					if(this.lights[l].on){
						let dL = vec3.subtract([0,0,0], this.lights[l].pos, hit.p);
						let L = vec3.normalize([0,0,0], dL);
						vec3.copy(shadow_ray.pos, vec3.scaleAndAdd([0,0,0], hit.p, ray.dir, this.e));
						vec3.copy(shadow_ray.dir, L);
						if(this.trace_shadow(shadow_ray, vec3.length(dL))){
							let R = vec3.normalize([0,0,0], vec3.scaleAndAdd([0,0,0], L, N, 2*vec3.dot(N, L)));
							vec3.scaleAndAdd(col, col, vec3.multiply([0,0,0], this.lights[l].di, hit.mat.di), Math.max(0, vec3.dot(N, L)));
							vec3.scaleAndAdd(col, col, vec3.multiply([0,0,0], this.lights[l].sp, hit.mat.sp), Math.pow(Math.max(0, vec3.dot(R, V)), Se));
						}
					}
				}
			}
		}
	}
	return col;
}

Scene.prototype.trace_image = function(img_buffer){
	let smp_frac = 1/this.camera.samples;
	let off = 0;
	if(this.camera.samples == 1){
		smp_frac = 0;
		off = .5;
	}
	let eye_ray = new Ray();
	for(let x = 0; x < this.camera.w; x++){
		for(let y = 0; y < this.camera.h; y++){
			let pix_col = [0, 0, 0];
			for(let sx = 0; sx < this.camera.samples; sx++){
				for(let sy = 0; sy < this.camera.samples; sy++){
					let hit_d = 1000000;
					this.camera.setEyeRay(eye_ray, x + sx*smp_frac + Math.random()*smp_frac + off, y + sy*smp_frac + Math.random()*smp_frac + off);
					vec3.add(pix_col, pix_col, this.trace_ray(eye_ray));
				}
			}
			if(smp_frac != 0){
				vec3.scale(pix_col, pix_col, smp_frac*smp_frac);
			}
			img_buffer.set_pixel_float(pix_col, x, y);
		}
	}
	img_buffer.float_to_int();
}


function Camera(cam, focus, up, rot_speed, zoom_speed, width, height){
	this.pos = cam;
	this.foc = focus;
	this.up = up;
	this.r_spd = Math.abs(rot_speed);
	this.z_spd = -Math.abs(zoom_speed);
	this.w = width;
	this.h = height;
	this.samples = 3;

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
		u: vec4.create(),
		v: vec4.create(),
		n: vec4.create()
	};
	let dir = vec3.subtract([0,0,0], this.foc, this.pos);
	vec4.normalize(this.axis.n, [-dir[0], -dir[1], -dir[2], 0]);
	vec4.normalize(this.axis.u, vec3.cross([0,0,0], this.up, this.axis.n).concat([0]));
	vec4.normalize(this.axis.v, vec3.cross([0,0,0], this.axis.n, this.axis.u).concat([0]));
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
		vec3.scale([0,0,0], vec2.normalize([0, 0], vec2.subtract([0,0], this.foc.slice(0, 2), this.pos.slice(0, 2))).concat([0]), this.strafe_sign.for*speed*elapsed/1000), 
		vec3.scale([0,0,0], vec3.normalize([0,0,0], vec3.cross([0,0,0], vec3.subtract([0,0,0], this.foc, this.pos), [0, 0, 1])), this.strafe_sign.lat*speed*elapsed/1000)
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
		
		let dir = vec3.subtract([0,0,0], this.foc, this.pos);

		mat4.rotate(this.rotation, mat4.create(), -dx, [0, 0, 1]);
		mat4.rotate(this.rotation, this.rotation, -dy, vec3.normalize([0,0,0], vec3.cross([0,0,0], dir, this.up)));

		vec3.add(this.foc, this.pos, vec3.transformMat4(dir, dir, this.rotation));
		vec3.transformMat4(this.up, this.up, this.rotation);

		this.mouse.x = e.clientX;
		this.mouse.y = e.clientY;

		vec4.normalize(this.axis.n, [-dir[0], -dir[1], -dir[2], 0]);
		vec4.normalize(this.axis.u, vec3.cross([0,0,0], this.up, this.axis.n).concat([0]));
		vec4.normalize(this.axis.v, vec3.cross([0,0,0], this.axis.n, this.axis.u).concat([0]));
	}
}

Camera.prototype.mouseup = function(e){
	this.dragging = false;
}

Camera.prototype.wheel = function(e){
	let d = vec3.scale([0,0,0], vec3.subtract([0,0,0], this.foc, this.pos), e.deltaY*this.z_spd);
	vec3.add(this.pos, this.pos, d);
	vec3.add(this.foc, this.foc, d);
}
