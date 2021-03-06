class Hit{
	constructor(d, color){
		this.d = d;
		this.color = color;
	}
}

class Ray{
	constructor(){
		this.pos = vec4.fromValues(0, 0, 0, 1);
		this.dir = vec4.fromValues(0, 0, -1, 0);
	}
}

class Cube{
	constructor(){
		this.pos = [0, 0, 0];
		this.s = 1;
		this.color = [1, 0, 0];
		this.world_to_model = mat4.create();
		this.model_to_world = mat4.create();

		let s = this.s;
		let tri = [
			[-s, -s, -s], [s, -s, -s], [s, s, -s],
			[-s, -s, -s], [s, s, -s], [-s, s, -s],
			[-s, -s, s], [s, -s, s], [s, s, s],
			[-s, -s, s], [s, s, s], [-s, s, s],
			[-s, -s, -s], [-s, -s, s], [-s, s, s],
			[-s, -s, -s], [-s, s, s], [-s, s, -s],
			[s, -s, -s], [s, -s, s], [s, s, s],
			[s, -s, -s], [s, s, s], [s, s, -s],
			[-s, -s, -s], [-s, -s, s], [s, -s, s],
			[-s, -s, -s], [s, -s, s], [s, -s, -s],
			[-s, s, -s], [-s, s, s], [s, s, s],
			[-s, s, -s], [s, s, s], [s, s, -s]
		];
		let data = [];
		for(let i = 0; i < tri.length; i++){
			data = data.concat(tri[i]);
			data = data.concat(this.color);
		}

		this.data = new Float32Array(data);
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
		let ray_p = vec4.create();
		let ray_d = vec4.create();
		vec4.transformMat4(ray_p, ray.pos, this.world_to_model);
		vec4.transformMat4(ray_d, ray.dir, this.world_to_model);

		let hit_d = 1000000;
		let hit_p = vec3.create();
		let hit = false;

		for(let i = 0; i < 3; i++){
			let inds = [0, 1, 2]
			inds.splice(i, 1);
			for(let s = -1; s <= 1; s += 2){
				let t = (this.pos[i] + s - ray_p[i])/ray_d[i];
				if(t > 0 && t < hit_d){
					let intersect = vec3.scaleAndAdd([0,0,0], ray_p, ray_d, t);
					intersect[i] = this.pos[i] + s;
					if(Math.abs(intersect[inds[0]]) < this.s && Math.abs(intersect[inds[1]]) < this.s){
						hit_d = t;
						hit_p = intersect;
						hit = true;
					}
				}
			}
		}
		if(!hit){
			return;
		}

		vec3.transformMat4(hit_p, hit_p, this.model_to_world);
		return new Hit(vec3.length(vec3.subtract([0,0,0], hit_p, ray.pos)), this.color);
	}
}

class Sphere{
	constructor(){
		this.pos = [0, 0, 0];
		this.r = 1;
		this.color = [1, 1, 0];
		this.world_to_model = mat4.create();
		this.model_to_world = mat4.create();

		let iso = gen_iso(2, 'TRI');
		let tri = [];
		for(let i = 0; i < iso.length; i++){
			tri = tri.concat(iso[i]);
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
		let ray_p = vec4.create();
		let ray_d = vec4.create();
		vec4.transformMat4(ray_p, ray.pos, this.world_to_model);
		vec4.transformMat4(ray_d, ray.dir, this.world_to_model);

		let r2s = vec4.subtract([0,0,0,0], [0,0,0,1], ray_p);
		let L2 = vec3.dot(r2s, r2s);
		if(L2 <= 1){
			return;
		}
		let tcaS = vec3.dot(ray_d, r2s);
		if(tcaS < 0){
			return;
		}
		let DL2 = vec3.dot(ray_d, ray_d);
		let tca2 = tcaS*tcaS / DL2;

		let LM2 = L2 - tca2;
		if(LM2 > 1){
			return;
		}
		let L2hc = (1 - LM2);
		let hit_d = tcaS/DL2 - Math.sqrt(L2hc/DL2);

		let hit_p = vec3.scaleAndAdd([0,0,0], ray_p, ray_d, hit_d);
		vec3.transformMat4(hit_p, hit_p, this.model_to_world);
		return new Hit(vec3.length(vec3.subtract([0,0,0], hit_p, ray.pos)), this.color);
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
		let ray_p = vec4.create();
		let ray_d = vec4.create();
		vec4.transformMat4(ray_p, ray.pos, this.world_to_model);
		vec4.transformMat4(ray_d, ray.dir, this.world_to_model);

		let t = (this.pos[2] - ray_p[2])/ray_d[2];
		if(t <= 0)
			return;
		let intersect = [
			ray_p[0] + ray_d[0]*t,
			ray_p[1] + ray_d[1]*t,
			this.pos[2]
		]
		let hit_d = vec3.length(vec3.transformMat4([0,0,0], vec3.subtract([0,0,0], intersect, ray_p), this.model_to_world));
		let hit_r = vec3.length(vec3.subtract([0,0,0], intersect, this.pos));
		if(hit_r > this.r)
			return;
		return new Hit(hit_d, this.color);
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
		let ray_p = vec4.create();
		let ray_d = vec4.create();
		vec4.transformMat4(ray_p, ray.pos, this.world_to_model);
		vec4.transformMat4(ray_d, ray.dir, this.world_to_model);

		let t = (this.pos[2] - ray_p[2])/ray_d[2];
		if(t <= 0)
			return;
		let intersect = [
			ray_p[0] + ray_d[0]*t,
			ray_p[1] + ray_d[1]*t,
			this.pos[2]
		]
		let hit_d = vec3.length(vec3.transformMat4([0,0,0], vec3.subtract([0,0,0], intersect, ray_p), this.model_to_world));
		vec3.subtract(intersect, intersect, this.pos);
		if(((Math.floor(intersect[0]/this.s) % 2) + (Math.floor(intersect[1]/this.s) % 2)) % 2 == 0)
			return new Hit(hit_d, this.colors[0]);
		return new Hit(hit_d, this.colors[1]);
	}
}