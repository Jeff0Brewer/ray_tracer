class Ray{
	constructor(){
		this.pos = vec4.fromValues(0, 0, 0, 1);
		this.dir = vec4.fromValues(0, 0, -1, 0);
	}
}

class Plane{
	constructor(position, normal, orientation, size){
		this.pos = position;
		this.n = vec3.normalize([0, 0, 0], normal);
		this.s = size;
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

	trace(ray){
		let t = (this.pos[2] - ray.pos[2])/ray.dir[2];
		if(t <= 0)
			return [0, 0, 0];
		let intersect = [
			ray.pos[0] + ray.dir[0]*t,
			ray.pos[1] + ray.dir[1]*t,
			this.pos[2]
		]
		vec3.subtract(intersect, intersect, this.pos);
		if(((Math.floor(intersect[0]/this.s) % 2) + (Math.floor(intersect[1]/this.s) % 2)) % 2 == 0)
			return this.colors[0];
		return this.colors[1];
	}
}