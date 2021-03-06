'use strict';

const express=require('express');
const mysql=require('mysql');
const bcrypt=require('bcrypt-nodejs');
var session = require('client-sessions');
var multipart = require('connect-multiparty');
var fs = require('fs');
var multipartMiddleware = multipart();
const {Client} = require('pg');

const client = new Client({
	connectionString: 'postgres://rxiywncegnqvxy:274c6952c5063bc9f478ed65b3593a2b9aba5330bca2304d6e723179c09681c4@ec2-54-235-132-202.compute-1.amazonaws.com:5432/dc77qldvmu2f64'
})
//postgres://lfkrclwzdnszkh:0d40c3a9681df3a956f34f3700076d4288cb3d3b6c465b78429abe729c5d0c4e@ec2-54-204-39-46.compute-1.amazonaws.com:5432/d1see1r23f8l46
client.connect();
var app=express();
app.set('view engine','pug');
var bodyParser=require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended:true
}));
app.use(express.static('public'));
app.use(session({
  cookieName: 'session',
  secret: 'awadeuwu',
  duration: 30 * 60 * 1000,
  activeDuration: 5 * 60 * 1000,
  mail:'',
  pass:'',
  httpOnly:true,
  secure:false,
  ephemeral:true
}));
//app.set('port', (process.env.PORT || 5000));
app.listen(process.env.PORT || 8080);
	console.log('servidor iniciado en el puerto 8080');
//});
		//registro de usuario
app.post('/agregarUsuario',(req,res)=>{
	let nombre=String(req.body.nombre).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');;
	let mail= String(req.body.mail).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
	let hashed = bcrypt.hashSync(req.body.pass);
	let ap=String(req.body.apellidos).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
	/*
	con.query('insert into usuario values(1,"'+mail+'","'+pass+'","'+nombre+'","'+ap+'")',(err,respuesta,fields)=>{
		if (err) {
			console.log('ERROR: ',err);
			return;
		}
		return res.send('Usuario agregado');
	});
	*/
	var text = 'INSERT INTO usuario(mail,pass,nombre,apellido,img) VALUES($1,$2,$3,$4,$5)';
	var values = [mail,hashed,nombre,ap,'../img/user.png'];
	client.query(text,values,(err,respuesta)=>{
		if (err) {
			console.log('ERROR: ',err);
			return;
		}		
		res.redirect('/i_sesion.html');
	});
});
app.post('/agregarOferta',(req,res)=>{
	let nombre=String(req.body.tit).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');;
	let mail= String(req.body.Trabajo).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');	
	let ap=String(req.body.Contacto).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
	var text = 'INSERT INTO Oferta(tit,des,contact) VALUES($1,$2,$3)';
	var values = [nombre,mail,ap];
	client.query(text,values, (err,respuesta)=>{
		if (err) {
			console.log('ERROR: ',err);
			return;
		}else{		
		res.redirect('/i_sesion.html');
	}});
});
app.post('/consultarUsuario',(req,res)=>{
	let mail=String(req.body.mail).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
	let pass=req.body.pass;
	var q = 'SELECT id_usu, mail, pass FROM usuario WHERE mail=$1';
	var values =[mail];
	client.query(q, values,(err,respuesta)=>{
		if (err){
 			console.log('Error: ',err);
			return res.send('Error. Intente de nuevo más tarde');
		}else{
			try{
				var resp = JSON.stringify(respuesta.rows[0]);
			}catch(err){
				console.log('Error: '+err);
				res.send('Error. Usuario no encontrado');
			}
			if (resp === 'undefined') {
				console.log('Error. No existe el usuario');
				return res.send('No existe el usuario');
			}else{
				try{
					var JSPAR = JSON.parse(resp);
					var ok = bcrypt.compareSync(pass,JSPAR.pass);
					if (mail===JSPAR.mail&&ok) {
						req.session.mail=JSPAR.mail;
						req.session.pass=JSPAR.pass;
						req.session.id=JSPAR.id_usu;
						return res.send('Sí existe el usuario');
						return res.send('Oferta Agregada');
					}else{
						res.send('Usuario no encontrado');
						return;
					}
				} catch(err){
					console.log('Error: '+err);
					res.send('Usuario no existente');
				}
			}
		}
	});
});
app.get('/*',(req,res)=>{
	let busca = false;
	var mail = req.session.mail;
	var id = req.session.id;
	if (req.path.toString().trim()=='/logout') {
		req.session.reset();
		res.redirect('../');
		busca = true;
	}
	var pass = req.session.pass;
	if (req.session&&mail&&!busca) {
		var q = 'SELECT mail, pass FROM usuario WHERE id_usu=$1 AND pass=$2';
		var values =[id,pass];
		client.query(q, values,(err,respuesta)=>{
			var isUser;
			try{
				var resp = JSON.stringify(respuesta.rows[0]);
			}catch(er){
				console.log('Error: '+er);
			}
			if (resp==='undefined') {
				isUser = false;
			}else{
				try{
					var JSPAR = JSON.parse(resp);
					if (err) {
						isUser=false;
					}
					if (mail===JSPAR.mail&&pass===JSPAR.pass) {
						isUser=true;
					}else{
						isUser=false;
					}
				}catch(err){
					console.log('Error: '+err);
					isUser=false;
				}
			}
			if (!isUser) {
				res.redirect('../registro.html');
			}else{
				var path = req.path;
				if (path.indexOf('css')!=-1) {
					res.send('vaia');
				}else if (path.indexOf('png')!=-1) {
					res.send('vaiax2');
				}else if (path.indexOf('jpg')!=-1) {
					res.send('vaiax3');
				}else if (path.indexOf('js')!=-1) {
					res.send('vaiax4');
				}else if(path.indexOf('ico')!=-1){
					res.send('vaiax5');
				}else{
					let route = path.replace('/','').toString();
					if (route==='modificaDatosUsuario') {
						client.query('SELECT * FROM usuario WHERE id_usu=$1',[id],(err, respuesta)=>{
							let name = respuesta.rows[0].nombre+' '+respuesta.rows[0].apellido;
							let jso = {
								rows: respuesta.rows[0]
							}
							res.render(route,jso);
						});
					}else if(route==='indexUsuario'){
						let jso = {rs:[]} ;
						client.query('SELECT * FROM publicacion LIMIT 5',(err,respuesta)=>{
							res.render(route,respuesta);
						});
					}else if (route==='visualizarContraUsuario'){
						let id = req.param('id').toString();
						if (id===req.session.id.toString()) {
							res.redirect('/perfilUsuario');
						}else{
							client.query('SELECT * FROM usuario WHERE id_usu=$1',[id],(err, respuesta)=>{
								let jso = {r:{}}
								jso.r = respuesta.rows[0];
								res.render(route,jso);
							});
						}
					}else if(route==='referenciasUsuario'){
						try{	
							let id = req.param('id').toString();
							client.query('SELECT * FROM usuario WHERE id_usu=$1',[id],(err,respuesta)=>{
								let resp = respuesta.rows[0];
								let jso ={
									nombre: resp.nombre,
									apellidos: resp.apellido,
									id: resp.id_usu,
									img: resp.img,
									calf: [],
								}
								client.query('SELECT * FROM calificacion WHERE id_usu=$1',[id],(err,resp)=>{
									jso.calf = resp.rows;
									res.render(route,jso);
								});
							});
						}catch(err){
							res.redirect('/perfilUsuario');
						}

					}else if(route==='perfilUsuario'||route==='publicitarUsuario'){
						client.query('SELECT * FROM usuario WHERE mail=$1',[mail],(err, respuesta)=>{
							let resp = respuesta.rows[0];
							let jso = {
								nombre: resp.nombre,
								apellidos: resp.apellido,
								mail: resp.mail,
								direccion: resp.direccion,
								noInt: resp.num_int,
								id:resp.id_usu,
								img: resp.img
							}
							res.render(route,jso);
						});
					}else if (route==='contratarTrabUsuario') {
						let ide = req.param('id').toString();
						let jso = {
							r:{},
							name:''
						};
						client.query('SELECT * FROM publicacion WHERE id_public=$1 LIMIT 5',[ide],(err,resp)=>{
							jso.r = resp.rows[0];
							client.query('SELECT nombre,apellido FROM usuario WHERE id_usu=$1',[resp.rows[0].id_usu],(err, r)=>{
								jso.name = r.rows[0].nombre + ' '+r.rows[0].apellido;
								res.render(route,jso);
							});
						});
					}else if (route==='calificarTrabajUsuario') {
						let ide = req.param('id').toString();
						let jso = {
							usu:{},
							calf:'',
							cuenta : '',
							idCalifica: req.session.id
						};
						let asd=0;
						client.query('SELECT * FROM usuario WHERE id_usu=$1',[ide],(err, resp)=>{
							jso.usu = resp.rows[0];
							client.query('SELECT * FROM calificacion WHERE id_usu=$1',[ide],(err,resp)=>{
								if (resp.rowCount!=0) {
									for (var i = resp.rowCount - 1; i >= 0; i--) {
										asd += parseInt(resp.rows[i].calif);
									}
									asd = (asd / resp.rowCount)*10;
									jso.calf = asd;
									jso.cuenta = resp.rowCount;
								}
								res.render(route,jso);
							});
						});
					}
					else{
						res.render(route);
					}
				}
			}
		});
	}else{
		res.redirect('/i_sesion.html');
	}
});
app.post('/buscaDato',function (req,res) {
	let busca = false;
	var mail = req.session.mail;
	var pass = req.session.pass;
	if (req.session&&mail&&!busca) {
		var q = 'SELECT mail, pass FROM usuario WHERE mail=$1 AND pass=$2';
		var values =[mail,pass];
		client.query(q, values,(err,respuesta)=>{
			var isUser;
			try{
				var resp = JSON.stringify(respuesta.rows[0]);
			}catch(er){
				console.log('Error: '+er);
			}
			if (resp.toString()==='undefined') {
				isUser = false;
			}else{
				try{
					var JSPAR = JSON.parse(resp);
					if (err) {
						isUser=false;
					}
					if (mail===JSPAR.mail&&pass===JSPAR.pass) {
						isUser=true;
					}else{
						isUser=false;
					}
				}catch(err){
					console.log('Error: '+err);
					isUser=false;
				}
			}
			if (!isUser) {
				setTimeout(res.redirect('../i_sesion'),3000);
			}else{
				var values = ['%'+req.body.datos+'%'];
				let q = "SELECT nombre FROM usuario WHERE nombre ILIKE $1";
				client.query(q,values,(err,respuesta)=>{
					try{
						var jn = {rs:[]};
						let resul = respuesta.rows[0].nombre;
						for (var i = respuesta.rowCount - 1; i >= 0; i--) {
							jn.rs[i]=respuesta.rows[i].nombre;	
						}
						res.send(jn);
					} catch(err){
						res.send ('Error');
					}
				});
			}
		});
	}else{
		res.redirect('/i_sesion.html');
	}
});
app.post('/busqueda',(req, res)=>{
	let busca = false;
	var mail = req.session.mail;
	var pass = req.session.pass;
	if (req.session&&mail&&!busca) {
		var q = 'SELECT mail, pass FROM usuario WHERE mail=$1 AND pass=$2';
		var values =[mail,pass];
		client.query(q, values,(err,respuesta)=>{
			var isUser;
			try{
				var resp = JSON.stringify(respuesta.rows[0]);
			}catch(er){
				console.log('Error: '+er);
			}
			if (resp.toString()==='undefined') {
				isUser = false;
			}else{
				try{
					var JSPAR = JSON.parse(resp);
					if (err) {
						isUser=false;
					}
					if (mail===JSPAR.mail&&pass===JSPAR.pass) {
						isUser=true;
					}else{
						isUser=false;
					}
				}catch(err){
					console.log('Error: '+err);
					isUser=false;
				}
			}
			if (!isUser) {
				setTimeout(res.redirect('../i_sesion'),3000);
			}else{
				let busq = ['%'+req.body.bus+'%'];
				let q = "SELECT * FROM publicacion WHERE trabajoarealizar ILIKE $1";
				client.query(q,busq,(err,respuesta)=>{
					try{
						var jn = {rs:[]};
						for (var i = respuesta.rowCount - 1; i >= 0; i--) {
							let resp = respuesta.rows[i];
							jn.rs[i]={ 
								pubType:resp.trabajoarealizar,
								desc:resp.despublic,
								fecha:resp.fecha,
								idPub: resp.id_public,
								id:resp.id_usu,
								img:resp.img
							}
						}
						res.render('busquedaTrabajadoresUsuario',jn);
					}catch(error){
						console.log('Error '+error);
					}
				});
			}
		});
	}else{
		res.redirect('/i_sesion.html');
	}
});
app.post('/guardaPublicacion',(req,res)=>{
	let busca = false;
	var mail = req.session.mail;
	var pass = req.session.pass;
	if (req.session&&mail&&!busca) {
		var q = 'SELECT mail, pass FROM usuario WHERE mail=$1 AND pass=$2';
		var values =[mail,pass];
		client.query(q, values,(err,respuesta)=>{
			var isUser;
			try{
				var resp = JSON.stringify(respuesta.rows[0]);
			}catch(er){
				console.log('Error: '+er);
			}
			if (resp.toString()==='undefined') {
				isUser = false;
			}else{
				try{
					var JSPAR = JSON.parse(resp);
					if (err) {
						isUser=false;
					}
					if (mail===JSPAR.mail&&pass===JSPAR.pass) {
						isUser=true;
					}else{
						isUser=false;
					}
				}catch(err){
					console.log('Error: '+err);
					isUser=false;
				}
			}
			if (!isUser) {
				setTimeout(res.redirect('../i_sesion'),3000);
			}else{
				var date = new Date();
				var year = date.getFullYear();
			    var month = date.getMonth() + 1;
			    month = (month < 10 ? "0" : "") + month;
			    var day  = date.getDate();
			    day = (day < 10 ? "0" : "") + day;
			    let fecha = day+' del '+month+' de '+year;
				let form = req.body;
				let formType = String(form.pubType).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
				let formDesc = String(form.desc).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
				let values = [formType,formDesc, fecha,req.session.id];
				client.query('INSERT INTO publicacion (trabajoarealizar,despublic,fecha,id_usu) VALUES ($1,$2,$3,$4)',values,(err, respuesta)=>{
					console.log(err);
					if (err) {
						res.send('Error');
					}else{
						res.send('Va');
					}
				});
			}
		});
	}else{
		res.redirect('/i_sesion.html');
	}
});
app.post('/actualizaDatos', function (req,res) {
	let busca = false;
	var mail = req.session.mail;
	var pass = req.session.pass;
	var id = req.session.id;
	if (req.session&&mail&&!busca) {
		var q = 'SELECT mail, pass FROM usuario WHERE mail=$1 AND pass=$2';
		var values =[mail,pass];
		client.query(q, values,(err,respuesta)=>{
			var isUser;
			try{
				var resp = JSON.stringify(respuesta.rows[0]);
			}catch(er){
				console.log('Error: '+er);
			}
			if (resp.toString()==='undefined') {
				isUser = false;
			}else{
				try{
					var JSPAR = JSON.parse(resp);
					if (err) {
						isUser=false;
					}
					if (mail===JSPAR.mail&&pass===JSPAR.pass) {
						isUser=true;
					}else{
						isUser=false;
					}
				}catch(err){
					console.log('Error: '+err);
					isUser=false;
				}
			}
			if (!isUser) {
				setTimeout(res.redirect('../i_sesion'),3000);
			}else{
				let d = req.body;
				let mai= String(d.mail).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
				let pas=d.pass.toString();
				let name=String(d.nombre).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
				let last=String(d.apellido).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
				let address=String(d.direccion).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
				let noInt=String(d.noInt).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
				let ma=false;
				let pa=false;
				let na=false;
				let la=false;
				let ad=false;
				let no=false;
				client.query('SELECT * FROM usuario WHERE id_usu=$1',[id],(err, resp)=>{
					if (mai!==resp.rows[0].mail&&mai!=''&&mai!=' ') {
						ma=true;
					}
					if (pas!=''&&pas!=' '&&!bcrypt.compareSync(pas,resp.rows[0].pass)) {
						pa=true;
					}
					if (name!==''&&name!==' '&&name!=resp.rows[0].nombre) {
						na=true;
					}
					if (last!==''&&last!==' '&&last!=resp.rows[0].apellido) {
						la=true;
					}
					if (address!==''&&address!==' '&&address!=resp.rows[0].direccion) {
						ad=true;
					}
					if (noInt!==''&&noInt!==' '&&noInt!=resp.rows[0].num_int) {
						no=true;
					}
					if (ma||pa||na||la||ad||no) {
						let num = 0;
						let values = [];
						let q = 'UPDATE usuario SET ';
						let q2 = 'WHERE id_usu='+id;
						if (ma) {
							num += 1;
							q += 'mail=$'+num+' ';
							values.push(mai);
						}
						if (pa) {
							if (num!=0) {
								q+=', ';
							}
							num +=1;
							q += 'pass=$'+num+' ';
							values.push(pas);
						}
						if (na) {
							if (num!=0) {
								q+=', ';
							}
							num +=1;
							q += 'nombre=$'+num+' ';
							values.push(name);
						}
						if (la) {
							if (num!=0) {
								q+=', ';
							}
							num+=1;
							q += 'apellido=$'+num+' ';
							values.push(last);
						}
						if (ad) {
							if (num!=0) {
								q+=', ';
							}
							num+=1;
							q+= 'direccion=$'+num+' ';
							values.push(address);
						}
						if (no) {
							if (num!=0) {
								q+=', ';
							}
							num+=1;
							q+= 'num_int=$'+num+' ';
							values.push(noInt);
						}
						q+=q2;
						client.query(q,values,(err,resp)=>{
							if (err!=null) {
								console.log(err);
								res.send('Ocurrió un error');
							}else{
								res.send('Datos guardados');
							}
						});
					}
				});
				/**/
			}
		});
	}else{
		res.redirect('/i_sesion.html');
	}
});
app.post('/calificaUsuario', (req,res)=>{
	let busca = false;
	var mail = req.session.mail;
	var pass = req.session.pass;
	var id = req.session.id;
	if (req.session&&mail&&!busca) {
		var q = 'SELECT mail, pass FROM usuario WHERE id_usu=$1 AND pass=$2';
		var values =[id,pass];
		client.query(q, values,(err,respuesta)=>{
			var isUser;
			try{
				var resp = JSON.stringify(respuesta.rows[0]);
			}catch(er){
				console.log('Error: '+er);
			}
			if (resp.toString()==='undefined') {
				isUser = false;
			}else{
				try{
					var JSPAR = JSON.parse(resp);
					if (err) {
						isUser=false;
					}
					if (mail===JSPAR.mail&&pass===JSPAR.pass) {
						isUser=true;
					}else{
						isUser=false;
					}
				}catch(err){
					console.log('Error: '+err);
					isUser=false;
				}
			}
			if (!isUser) {
				res.redirect('/i_sesion.html');
			}else{
				let r = req.body;
				let values = [
					r.calif,
					r.idUsu,
					String(r.idCalifica).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;'),
					String(r.coment).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;')
				];
				client.query('INSERT INTO calificacion (calif,id_usu,idcalifica,comentario) VALUES ($1,$2,$3,$4)',values,(err,resp)=>{
					if (err==null) {
						res.send('Calificacion enviada');
					}else{
						console.log(err);
						res.send('Ocurrió un error. Intente de nuevo más tarde');
					}
				});
			}
		});
	}else{
		res.redirect('/i_sesion.html');
	}
});
app.post('/subeFoto',multipartMiddleware,(req,res)=>{
	let busca = false;
	var mail = req.session.mail;
	var pass = req.session.pass;
	var id = req.session.id;
	if (req.session&&mail&&!busca) {
		var q = 'SELECT mail, pass FROM usuario WHERE id_usu=$1 AND pass=$2';
		var values =[id,pass];
		client.query(q, values,(err,respuesta)=>{
			var isUser;
			try{
				var resp = JSON.stringify(respuesta.rows[0]);
			}catch(er){
				console.log('Error: '+er);
			}
			if (resp.toString()==='undefined') {
				isUser = false;
			}else{
				try{
					var JSPAR = JSON.parse(resp);
					if (err) {
						isUser=false;
					}
					if (mail===JSPAR.mail&&pass===JSPAR.pass) {
						isUser=true;
					}else{
						isUser=false;
					}
				}catch(err){
					console.log('Error: '+err);
					isUser=false;
				}
			}
			if (!isUser) {
				res.redirect('/i_sesion.html');
			}else{
				fs.readFile(req.files.imagen.path,(err,data)=>{
					let nameImg = req.files.imagen.name;
					if (err) {
						console.log('Error: '+err);
					}else{
						console.log('Nombre de la imagen: '+nameImg);
						let newDir = __dirname + '/public/uploads/img/'+nameImg;
						fs.writeFile(newDir, data, (err)=>{
							if (err) {
								console.log('Error: '+err);
							}else{
								let urlImg = '../uploads/img/'+nameImg;
								console.log(urlImg);
								let values = [urlImg, id];
								client.query('UPDATE usuario SET img=$1 WHERE id_usu=$2',values,(err,resp)=>{
									if (err) {
										console.log('Error: '+err);
										res.redirect('/modificaDatosUsuario');
									}else{
										res.redirect('/modificaDatosUsuario');
									}
								});
							}
						});
					}
				});
			}
		});
	}else{
		res.redirect('/i_sesion.html');
	}
});
app.post('/agregaroferta',(req,res)=>{
	let nombre=String(req.body.titulo).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');;
	let mail= String(req.body.des).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');	
	let ap=String(req.body.contacto).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
	var text = 'INSERT INTO oferta(titulo,descripcion,num_contact) VALUES($1,$2,$3)';	
	client.query(text,values,(err,respuesta)=>{
		if (err) {
			console.log('ERROR: ',err);
			return;
		}
		return res.send('Oferta Agregada');
	});
});
