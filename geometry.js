class Plane{
	constructor(position, normal, orientation, size){
		this.c = position;
		this.n = norm(normal);
		this.s = size;

		let axis = {
			x: norm(orientation),
			y: norm(cross3(normal, orientation)),
			z: norm(normal)
		};
		let sq = [].concat(
			add(mult_scalar(axis.x, -size/2), mult_scalar(axis.y, -size/2)), [0, 0, 0],
			add(mult_scalar(axis.x,  size/2), mult_scalar(axis.y, -size/2)), [0, 0, 0],
			add(mult_scalar(axis.x,  size/2), mult_scalar(axis.y,  size/2)), [0, 0, 0],

			add(mult_scalar(axis.x, -size/2), mult_scalar(axis.y, -size/2)), [0, 0, 0],
			add(mult_scalar(axis.x,  size/2), mult_scalar(axis.y,  size/2)), [0, 0, 0],
			add(mult_scalar(axis.x, -size/2), mult_scalar(axis.y,  size/2)), [0, 0, 0]
		);
		let grid_size = 99;
		let grid = [];
		let sq_ind = 0;
		for(let x_d = -size*grid_size/2 + size/2; x_d < size*grid_size/2; x_d += size){
			let off_x = mult_scalar(axis.x, x_d);
			for(let y_d = -size*grid_size/2 + size/2; y_d < size*grid_size/2; y_d += size, sq_ind++){
				let offset = add(off_x, mult_scalar(axis.y, y_d)).concat((sq_ind % 2) == 0 ? [0, 0, 0] : [.4, .4, .4]);
				for(let i = 0; i < sq.length; i++){
						grid.push(sq[i] + offset[i % offset.length]);
				}
			}
		}
		this.data = new Float32Array(grid);
	}
}