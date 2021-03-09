class PhongMat{
	constructor(ambient, diffuse, specular, emissive){
		this.am = ambient.slice();
		this.di = diffuse.slice();
		this.sp = specular.slice();
		this.em = emissive.slice();
	}
}

class PhongLight{
	constructor(position, diffuse, specular){
		this.pos = position.slice();
		this.di = diffuse.slice();
		this.sp = specular.slice();
	}
}