class VertexDrawer{
	constructor(shader_ind, buffer_len, draw_type){
		this.sh = shader_ind;
		this.len = buffer_len;
		this.typ = draw_type;
		this.model_matrix = mat4.create();
		this.normal_matrix = mat4.create();
		this.fpv = 9;

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

		this.a_Normal = gl.getAttribLocation(gl.program, 'a_Normal');
		gl.vertexAttribPointer(this.a_Normal, 3, gl.FLOAT, false, this.fsize*this.fpv, 6*this.fsize);
		gl.enableVertexAttribArray(this.a_Normal);

		this.u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
		this.u_NormalMatrix = gl.getUniformLocation(gl.program, 'u_NormalMatrix');
	}

	buffer_data = function(start_ind, data){
		gl.bindBuffer(gl.ARRAY_BUFFER, this.gl_buf);
		gl.bufferSubData(gl.ARRAY_BUFFER, start_ind, data);
	}

	set_transform = function(mat){
		mat4.copy(this.model_matrix, mat);
		mat4.transpose(this.normal_matrix, mat);
		this.normal_matrix[3] = 0;
		this.normal_matrix[7] = 0;
		this.normal_matrix[11] = 0;
	}

	draw(){
		gl.bindBuffer(gl.ARRAY_BUFFER, this.gl_buf);
		switch_shader(this.sh);
		gl.vertexAttribPointer(this.a_Position, 3, gl.FLOAT, false, this.fsize*this.fpv, 0);
		gl.vertexAttribPointer(this.a_Color, 3, gl.FLOAT, false, this.fsize*this.fpv, 3*this.fsize);
		gl.vertexAttribPointer(this.a_Normal, 3, gl.FLOAT, false, this.fsize*this.fpv, 6*this.fsize);

		gl.uniformMatrix4fv(this.u_ModelMatrix, false, this.model_matrix);
		gl.uniformMatrix4fv(this.u_NormalMatrix, false, this.normal_matrix);
		gl.drawArrays(this.typ, 0, this.len);
	}
}