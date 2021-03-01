class Ray{
	constructor(){
		this.pos = vec4.fromValues(0, 0, 0, 1);
		this.dir = vec4.fromValues(0, 0, -1, 0);
	}
}

class Sphere{
	constructor(center, radius, color){
		this.c = vec4.fromValues(center[0], center[1], center[2], 0);
		this.r = Math.abs(radius);
		this.color = color;
		this.world_to_model = mat4.create();
		this.model_to_world = mat4.create();

		let iso = gen_iso(3, 'TRI');
		let tri = [];
		for(let i = 0; i < iso.length; i++){
			iso[i] = vec3.scaleAndAdd([0,0,0], this.c, iso[i], this.r);
			tri = tri.concat(iso[i]);
			tri = tri.concat(color);
		}
		this.data = new Float32Array(tri);
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
		vec4.normalize(ray.dir, ray.dir);

		//implement
		return -1;
	}
}

class Plane{
	constructor(position, normal, orientation, size){
		this.pos = position;
		this.n = vec3.normalize([0, 0, 0], normal);
		this.s = size;
		this.world_to_model = mat4.create();
		this.model_to_world = mat4.create();
		this.colors = [
			[.1, 0, .1],
			[.5, .5, .5]
		];

		let axis = {
			x: vec3.normalize([0, 0, 0], orientation),
			y: vec3.normalize([0, 0, 0], vec3.cross([0, 0, 0], normal, orientation)),
			z: vec3.normalize([0, 0, 0], normal)
		};
		let sq = [].concat(
			vec3.add([0, 0, 0], vec3.scale([0, 0, 0], axis.x, -size/2), vec3.scale([0, 0, 0], axis.y, -size/2)), [0, 0, 0],
			vec3.add([0, 0, 0], vec3.scale([0, 0, 0], axis.x,  size/2), vec3.scale([0, 0, 0], axis.y, -size/2)), [0, 0, 0],
			vec3.add([0, 0, 0], vec3.scale([0, 0, 0], axis.x,  size/2), vec3.scale([0, 0, 0], axis.y,  size/2)), [0, 0, 0],

			vec3.add([0, 0, 0], vec3.scale([0, 0, 0], axis.x, -size/2), vec3.scale([0, 0, 0], axis.y, -size/2)), [0, 0, 0],
			vec3.add([0, 0, 0], vec3.scale([0, 0, 0], axis.x,  size/2), vec3.scale([0, 0, 0], axis.y,  size/2)), [0, 0, 0],
			vec3.add([0, 0, 0], vec3.scale([0, 0, 0], axis.x, -size/2), vec3.scale([0, 0, 0], axis.y,  size/2)), [0, 0, 0]
		);
		let grid_size = 99;
		let grid = [];
		let sq_ind = 0;
		for(let x_d = -size*grid_size/2; x_d < size*grid_size/2; x_d += size){
			let off_x = vec3.add([0, 0, 0], vec3.scale([0, 0, 0], axis.x, x_d), this.pos);
			for(let y_d = -size*grid_size/2; y_d < size*grid_size/2; y_d += size, sq_ind++){
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