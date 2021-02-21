class CameraController{
	constructor(cam, focus, up, rot_speed, zoom_speed){
		this.pos = cam;
		this.foc = focus;
		this.up = up;
		this.r_spd = Math.abs(rot_speed);
		this.z_spd = -Math.abs(zoom_speed);
		this.dragging = false;
		this.mouse = {
			x: 0,
			y: 0
		};
		this.rotation = mat4.create();
		this.strafe_sign = {
			lat: 0,
			for: 0
		};
	}

	strafe(elapsed){
		let speed = 10;
		let d = vec3.add(
			[0, 0, 0], 
			vec3.scale([0, 0, 0], vec2.normalize([0, 0], vec2.subtract([0, 0], this.foc.slice(0, 2), this.pos.slice(0, 2))).concat([0]), this.strafe_sign.for*speed*elapsed/1000), 
			vec3.scale([0, 0, 0], vec3.normalize([0, 0, 0], vec3.cross([0, 0, 0], vec3.subtract([0, 0, 0], this.foc, this.pos), [0, 0, 1])), this.strafe_sign.lat*speed*elapsed/1000)
		);
		vec3.add(this.pos, this.pos, d);
		vec3.add(this.foc, this.foc, d);
	}

	add_strafe(s){
		this.strafe_sign.lat = Math.sign(this.strafe_sign.lat + s[0]);
		this.strafe_sign.for = Math.sign(this.strafe_sign.for + s[1]);
	}

	mousedown(e){
		this.dragging = true;
		this.mouse.x = e.clientX;
		this.mouse.y = e.clientY;
	}

	mousemove(e){
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

	mouseup(e){
		this.dragging = false;
	}

	wheel(e){
		let d = vec3.scale([0, 0, 0], vec3.subtract([0, 0, 0], this.foc, this.pos), e.deltaY*this.z_spd);
		vec3.add(this.pos, this.pos, d);
		vec3.add(this.foc, this.foc, d);
	}
}
