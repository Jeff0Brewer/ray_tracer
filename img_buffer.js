function ImgBuffer(width, height, scale){
	this.w = Math.floor(width*scale);
	this.h = Math.floor(height*scale);
	this.scl = scale;
	this.pix_size = 3;
	this.int_buf = new Uint8Array(this.w*this.h*this.pix_size);
	this.flt_buf = new Float32Array(this.w*this.h*this.pix_size);
}

ImgBuffer.prototype.int_to_float = function(){
	for(let i = 0; i < this.int_buf.length; i++){
		this.flt_buf[i] = this.int_buf[i] / 255;
	}
}

ImgBuffer.prototype.float_to_int = function(){
	for(let i = 0; i < this.flt_buf.length; i++){
		this.int_buf[i] = Math.min(255, Math.floor(Math.min(1.0, Math.max(0.0, this.flt_buf[i]))*256.0));
	}
}

ImgBuffer.prototype.set_pixel_float = function(color, x, y){
	x = Math.floor(this.scl*x);
	y = Math.floor(this.scl*y);
	let ind = (y*this.w + x)*this.pix_size;
	this.flt_buf[ind    ] = color[0];
	this.flt_buf[ind + 1] = color[1];
	this.flt_buf[ind + 2] = color[2];
}

ImgBuffer.prototype.set_random = function(){
	for(let i = 0; i < this.flt_buf.length; i++){
		this.flt_buf[i] = Math.random();
	}
	this.float_to_int();
}