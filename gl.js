var gl;
var programs = [];

//load a shader from string
function load_shader(type, source){
	let s = gl.createShader(type);
	gl.shaderSource(s, source);
	gl.compileShader(s);
	return s;
}

//create a gl program from strings
function create_program(vs, fs){
	let p = gl.createProgram();
	let v = load_shader(gl.VERTEX_SHADER, vs);
	let f = load_shader(gl.FRAGMENT_SHADER, fs);
	gl.attachShader(p, v);
	gl.attachShader(p, f);
	gl.linkProgram(p);
	return p;
}

//switch to another shader program
function switch_shader(i){
	gl.useProgram(programs[i]);
	gl.program = programs[i];
}

//update all shaders using model, view, and projection matrixes
function update_mvp(model_matrix, view_matrix, proj_matrix){
	for(let i = 0; i < mvp_shaders.length; i++){
		switch_shader(mvp_shaders[i]);
		gl.uniformMatrix4fv(u_ModelMatrix[i], false, model_matrix);
		gl.uniformMatrix4fv(u_ViewMatrix[i], false, view_matrix);
		gl.uniformMatrix4fv(u_ProjMatrix[i], false, proj_matrix);
	}
}

//update all shaders using view matrix
function update_view(view_matrix){
	for(let i = 0; i < mvp_shaders.length; i++){
		switch_shader(mvp_shaders[i]);
		gl.uniformMatrix4fv(u_ViewMatrix[i], false, view_matrix);
	}
}

//initialize gl context
function setup_gl(canvas){
	gl = canvas.getContext('webgl', {preserveDrawingBuffer: false});
	gl.enable(gl.DEPTH_TEST);
	gl.enable(gl.BLEND);
	gl.disable(gl.CULL_FACE);
	gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
	gl.clearColor(0, 0, 0, 1);

	programs.push(create_program(document.getElementById('v_simple').text, document.getElementById('f_simple').text));

	mvp_shaders = [0];
	u_ModelMatrix = [];
	u_ViewMatrix = [];
	u_ProjMatrix = [];
	for(let i = 0; i < mvp_shaders.length; i++){
		switch_shader(mvp_shaders[i]);
		u_ModelMatrix.push(gl.getUniformLocation(gl.program, 'u_ModelMatrix'));
		u_ViewMatrix.push(gl.getUniformLocation(gl.program, 'u_ViewMatrix'));
		u_ProjMatrix.push(gl.getUniformLocation(gl.program, 'u_ProjMatrix'));
	}
}