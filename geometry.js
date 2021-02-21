class Plane{
	constructor(position, normal, orientation, size){
		this.c = position;
		this.n = vec3.normalize([0, 0, 0], normal);
		this.s = size;

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
		for(let x_d = -size*grid_size/2 + size/2; x_d < size*grid_size/2; x_d += size){
			let off_x = vec3.scale([0, 0, 0], axis.x, x_d);
			for(let y_d = -size*grid_size/2 + size/2; y_d < size*grid_size/2; y_d += size, sq_ind++){
				let offset = vec3.add([0, 0, 0], off_x, vec3.scale([0, 0, 0], axis.y, y_d)).concat((sq_ind % 2) == 0 ? [0, 0, 0] : [.4, .4, .4]);
				for(let i = 0; i < sq.length; i++){
						grid.push(sq[i] + offset[i % offset.length]);
				}
			}
		}
		this.data = new Float32Array(grid);
	}
}