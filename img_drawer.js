class ImgDrawer{
	constructor(shader_ind, img_buffer){
		let tex_w = 1;
		while(Math.pow(2, tex_w) < img_buffer.w) 
			tex_w++
		tex_w = Math.pow(2, tex_w);
		let tex_h = 1;
		while(Math.pow(2, tex_h) < img_buffer.h) 
			tex_h++
		tex_h = Math.pow(2, tex_h);

		this.sh = shader_ind;
		this.data = new Float32Array([
			-1, 1, 0, img_buffer.h/tex_h,
			-1, -1, 0, 0,
			1, 1, img_buffer.w/tex_w, img_buffer.h/tex_h,
			1, -1, img_buffer.w/tex_w, 0
		]);
		this.fsize = this.data.BYTES_PER_ELEMENT;

		switch_shader(this.sh);

		this.gl_buf = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this.gl_buf);
		gl.bufferData(gl.ARRAY_BUFFER, this.data, gl.STATIC_DRAW);

		this.gl_tex = gl.createTexture();
		this.u_Sampler = gl.getUniformLocation(gl.program, 'u_Sampler');
		this.a_Position = gl.getAttribLocation(gl.program, 'a_Position');
		this.a_TexCoord = gl.getAttribLocation(gl.program, 'a_TexCoord');

		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, this.gl_tex);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, tex_w, tex_h, 0, gl.RGB, gl.UNSIGNED_BYTE, new Uint8Array(tex_w*tex_h*3));
		gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, img_buffer.w, img_buffer.h, gl.RGB, gl.UNSIGNED_BYTE, img_buffer.int_buf);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
		gl.uniform1i(this.u_Sampler, 0);
	}

	buffer_img(img_buffer){
		gl.bindTexture(gl.TEXTURE_2D, this.gl_tex);
		gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, img_buffer.w, img_buffer.h, gl.RGB, gl.UNSIGNED_BYTE, img_buffer.int_buf);
	}

	draw(){
		switch_shader(this.sh);
		gl.bindBuffer(gl.ARRAY_BUFFER, this.gl_buf);
		gl.vertexAttribPointer(this.a_Position, 2, gl.FLOAT, false, 4*this.fsize, 0);
		gl.vertexAttribPointer(this.a_TexCoord, 2, gl.FLOAT, false, 4*this.fsize, 2*this.fsize);
		gl.enableVertexAttribArray(this.a_Position);
		gl.enableVertexAttribArray(this.a_TexCoord);
		gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
	}
}