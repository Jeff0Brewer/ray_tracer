class VertexDrawer{
	constructor(shader_ind, buffer_len, draw_type){
		this.sh = shader_ind;
		this.len = buffer_len;
		this.typ = draw_type;
		this.trans = mat4.create()
		this.fpv = 6;

		let buffer = new Float32Array(this.len*this.fpv);
		this.fsize = buffer.BYTES_PER_ELEMENT;

		this.gl_buf = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this.gl_buf);
		gl.bufferData(gl.ARRAY_BUFFER, buffer, gl.DYNAMIC_DRAW);

		switch_shader(this.sh);
		this.a_Position = gl.getAttribLocation(gl.program, 'a_Position');
		gl.vertexAttribPointer(this.a_Position, 3, gl.FLOAT, false, this.fsize*this.fpv, 0);
		gl.enableVertexAttribArray(this.a_Position);

		this.a_Color = gl.getAttribLocation(gl.program, 'a_Color');
		gl.vertexAttribPointer(this.a_Color, 3, gl.FLOAT, false, this.fsize*this.fpv, 3*this.fsize);
		gl.enableVertexAttribArray(this.a_Color);

		this.u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
	}

	buffer_data = function(start_ind, data){
		gl.bindBuffer(gl.ARRAY_BUFFER, this.gl_buf);
		gl.bufferSubData(gl.ARRAY_BUFFER, start_ind, data);
	}

	set_transform = function(mat){
		mat4.copy(this.trans, mat);
	}

	draw(){
		gl.bindBuffer(gl.ARRAY_BUFFER, this.gl_buf);
		switch_shader(this.sh);
		gl.vertexAttribPointer(this.a_Position, 3, gl.FLOAT, false, this.fsize*this.fpv, 0);
		gl.vertexAttribPointer(this.a_Color, 3, gl.FLOAT, false, this.fsize*this.fpv, 3*this.fsize);

		gl.uniformMatrix4fv(this.u_ModelMatrix, false, this.trans);
		gl.drawArrays(this.typ, 0, this.len);
	}
}