class Ray{
	constructor(){
		this.pos = vec4.fromValues(0, 0, 0, 1);
		this.dir = vec4.fromValues(0, 0, -1, 0);
	}
}

class Disk{
	constructor(){
		this.pos = [0, 0, 0];
		this.n = [0, 0, 1];
		this.r = 1;
		this.color = [1, 0, 1];
		this.world_to_model = mat4.create();
		this.model_to_world = mat4.create();

		let detail = 30;
		let tri = [];
		tri = tri.concat([0, 0, 0]);
		tri = tri.concat(this.color);
		for(let i = 0; i <= detail; i++){
			let a = i/detail*Math.PI*2;
			tri = tri.concat([Math.cos(a), Math.sin(a), 0]);
			tri = tri.concat(this.color);
		}

		this.data = new Float32Array(tri);
	}

	modelIdentity(){
		this.model_to_world = mat4.create();
		mat4.invert(this.world_to_model, this.model_to_world);
	}

	modelTranslate(vec){
		mat4.translate(this.model_to_world, this.model_to_world, vec);
		mat4.invert(this.world_to_model, this.model_to_world);
	}

	modelRotate(rad, axis){
		mat4.rotate(this.model_to_world, this.model_to_world, rad, axis);
		mat4.invert(this.world_to_model, this.model_to_world);
	}

	modelScale(vec){
		mat4.scale(this.model_to_world, this.model_to_world, vec);
		mat4.invert(this.world_to_model, this.model_to_world);
	}

	trace(ray){
		vec4.transformMat4(ray.pos, ray.pos, this.world_to_model);
		vec4.transformMat4(ray.dir, ray.dir, this.world_to_model);

		let t = (this.pos[2] - ray.pos[2])/ray.dir[2];
		if(t <= 0)
			return -1;
		let intersect = [
			ray.pos[0] + ray.dir[0]*t,
			ray.pos[1] + ray.dir[1]*t,
			this.pos[2]
		]
		let hit_d = vec3.length(vec3.transformMat4([0,0,0], vec3.subtract([0,0,0], intersect, ray.pos), this.model_to_world));
		let hit_r = vec3.length(vec3.subtract([0,0,0], intersect, this.pos));
		if(hit_r > this.r)
			return -1;
		return [hit_d, this.color];
	}
}

class Plane{
	constructor(){
		this.pos = [0, 0, 0];
		this.n = [0, 0, 1];
		this.s = 1;
		this.world_to_model = mat4.create();
		this.model_to_world = mat4.create();
		this.colors = [
			[.1, 0, .1],
			[.5, .5, .5]
		];

		let axis = {
			x: [1, 0, 0],
			y: [0, 1, 0],
			z: [0, 0, 1]
		};
		let sq = [].concat(
			vec3.add([0, 0, 0], vec3.scale([0, 0, 0], axis.x, -this.s/2), vec3.scale([0, 0, 0], axis.y, -this.s/2)), [0, 0, 0],
			vec3.add([0, 0, 0], vec3.scale([0, 0, 0], axis.x,  this.s/2), vec3.scale([0, 0, 0], axis.y, -this.s/2)), [0, 0, 0],
			vec3.add([0, 0, 0], vec3.scale([0, 0, 0], axis.x,  this.s/2), vec3.scale([0, 0, 0], axis.y,  this.s/2)), [0, 0, 0],

			vec3.add([0, 0, 0], vec3.scale([0, 0, 0], axis.x, -this.s/2), vec3.scale([0, 0, 0], axis.y, -this.s/2)), [0, 0, 0],
			vec3.add([0, 0, 0], vec3.scale([0, 0, 0], axis.x,  this.s/2), vec3.scale([0, 0, 0], axis.y,  this.s/2)), [0, 0, 0],
			vec3.add([0, 0, 0], vec3.scale([0, 0, 0], axis.x, -this.s/2), vec3.scale([0, 0, 0], axis.y,  this.s/2)), [0, 0, 0]
		);
		let grid_size = 99;
		let grid = [];
		let sq_ind = 0;
		for(let x_d = -this.s*grid_size/2; x_d < this.s*grid_size/2; x_d += this.s){
			let off_x = vec3.add([0, 0, 0], vec3.scale([0, 0, 0], axis.x, x_d), this.pos);
			for(let y_d = -this.s*grid_size/2; y_d < this.s*grid_size/2; y_d += this.s, sq_ind++){
				let offset = vec3.add([0, 0, 0], off_x, vec3.scale([0, 0, 0], axis.y, y_d)).concat(this.colors[sq_ind % 2]);
				for(let i = 0; i < sq.length; i++){
						grid.push(sq[i] + offset[i % offset.length]);
				}
			}
		}
		this.data = new Float32Array(grid);
	}

	vtxLoadIdentity(){
		this.model_to_world = mat4.create();
	}

	vtxTranslate(vec){
		mat4.translate(this.model_to_world, this.model_to_world, vec);
	}

	vtxRotate(rad, axis){
		mat4.rotate(this.model_to_world, this.model_to_world, rad, axis);
	}

	vtxScale(vec){
		mat4.scale(this.model_to_world, this.model_to_world, vec);
	}

	rayLoadIdentity(){
		this.world_to_model = mat4.create();
	}

	rayTranslate(vec){
		mat4.translate(this.world_to_model, this.world_to_model, vec3.scale([0,0,0], vec, -1));
	}

	rayRotate(rad, axis){
		mat4.rotate(this.world_to_model, this.world_to_model, -rad, axis);
	}

	rayScale(vec){
		mat4.scale(this.world_to_model, this.world_to_model, vec3.divide([0,0,0], [1, 1, 1], vec));
	}

	trace(ray){
		vec4.transformMat4(ray.pos, ray.pos, this.world_to_model);
		vec4.transformMat4(ray.dir, ray.dir, this.world_to_model);

		let t = (this.pos[2] - ray.pos[2])/ray.dir[2];
		if(t <= 0)
			return -1;
		let intersect = [
			ray.pos[0] + ray.dir[0]*t,
			ray.pos[1] + ray.dir[1]*t,
			this.pos[2]
		]
		let hit_d = vec3.length(vec3.transformMat4([0,0,0], vec3.subtract([0,0,0], intersect, ray.pos), this.model_to_world));
		vec3.subtract(intersect, intersect, this.pos);
		if(((Math.floor(intersect[0]/this.s) % 2) + (Math.floor(intersect[1]/this.s) % 2)) % 2 == 0)
			return [hit_d, this.colors[0]];
		return [hit_d, this.colors[1]];
	}
}