/**************************
* Aplicacion
**************************/
$(document).ready(function(){
	enumerador= new Controlador.numeradorBloque(1);
	
	Vari = new Modelo.Variables;
	Tabla = new Modelo.tablaSimbolos;
	Arbol = new Modelo.arbol;
	Simulador = new Modelo.simulacion;
	
	Controlador.crearSortable($( "#area_trabajo" )),
	Controlador.crearDraggable(),
	Controlador.crearBasurero(),
					
	$( "#menu" ).tabs();
		
	console.log("aplicacion iniciada");
});
/**************************
* Modelos
**************************/
Modelo = {
	
	Bloque:function  (id,sig,hij){

		this.idBloque = id;
		this.nodoSig = sig;
		this.nodoHijo = hij;
		
		this.infoBloque = function(){
			return "Id: "+this.idBloque;
		}
	},

	Definicion:function  (id,sig,hij,variable){
		
		Modelo.Bloque.call(this,id,sig,hij);
		this.variable = variable;
		
		this.tamVariable= function(){
			this.variable.length;
		}
	},
	
	
	Asignacion : function (id,sig,hij,variable,valor){
		
		Modelo.Bloque.call(this,id,sig,hij);
		this.variable = variable;
		this.valor = valor;
	},
	
	
	Operador:function  (id,sig,hij,tipoOperador,operIzquierdo,operDerecho){
		
		Modelo.Bloque.call(this,id,sig,hij);
		this.tipoOperador = tipoOperador;
		this.operIzquierdo = operIzquierdo;
		this.operDerecho = operDerecho;
		this.op = {
			"suma": "+",
			"resta": "-",
			"multi": "*",
			"division": "/",
			"mayor": ">",
			"menor": "<",
			"mayor_igual": "#",
			"menor_igual": "$",
			"igual": "=",
			"diferente":"!"
		};
		this.op2 = {
			"suma": "+",
			"resta": "-",
			"multi": "*",
			"division": "/",
			"mayor": ">",
			"menor": "<",
			"mayor_igual": ">=",
			"menor_igual": "<=",
			"igual": "==",
			"diferente":"!="
		};
		
		this.op3 = {
			"suma": "+",
			"resta": "-",
			"multi": "*",
			"division": "/",
			"mayor": ">",
			"menor": "<",
			"mayor_igual": ">=",
			"menor_igual": "<=",
			"igual": "=",
			"diferente":"<>"
		};
		
		this.esOperadorLogico = function (){
			if(this.tipoOperador == "suma" && this.tipoOperador == "resta" && this.tipoOperador == "multi" && this.tipoOperador == "division"){
				return false;
			}else{
				return true;
			}
		},
		
		this.getValIzquierdo = function(){
			if(Controlador.IsNumeric(this.operIzquierdo)){
				return this.operIzquierdo
			}else{
				return Tabla.obtenerValor(this.operIzquierdo);
			}
		},
		
		this.getValDerecho = function(){
			if(Controlador.IsNumeric(this.operDerecho)){
				return this.operDerecho
			}else{
				return Tabla.obtenerValor(this.operDerecho);
			}
		},
		
		this.resultado = function(){
			
			var result=null;
			var evalu = new Parser();
			result=evalu.evaluate(this.operIzquierdo+this.op[this.tipoOperador]+this.operDerecho,Tabla.getVectorVariables());
			
			return result;
		},
		
		this.operacion=function(){
			return this.operIzquierdo+this.op2[this.tipoOperador]+this.operDerecho;
		}
		
		this.operacionN=function(){
			return this.operIzquierdo+this.op3[this.tipoOperador]+this.operDerecho;
		}
		
		
	},
	
	Entrada: function (id,sig,hij,variable,valor){
		Modelo.Bloque.call(this,id,sig,hij);
		this.variable = variable;
		this.valor = valor;
	},
	
	Salida : function (id,sig,hij,variable,texto){
		this.variable = variable;
		this.texto = texto;
		Modelo.Bloque.call(this,id,sig,hij);
		
		this.obtenerSalida = function(){
			if(this.texto!=null && this.variable==null){
				return this.texto+"\n";
			}else if(this.texto!=null && this.variable!=null){
				return this.texto+Tabla.obtenerValor(this.variable)+"\n";
			}else if(this.texto==null && this.variable!=null){
				return Tabla.obtenerValor(this.variable)+"\n";
			}
		}
		
		
		this.salida = function(){
			if(this.texto!=null && this.variable==null){
				return '"'+this.texto+'"';
			}else if(this.texto!=null && this.variable!=null){
				return '"'+this.texto+'", '+this.variable;
			}else if(this.texto==null && this.variable!=null){
				return this.variable;
			}
		},
		
		this.salidaCpp = function(){
			if(this.texto!=null && this.variable==null){
				return '"'+this.texto+'"';
			}else if(this.texto!=null && this.variable!=null){
				return '"'+this.texto+'" &lt;&lt; '+this.variable;
			}else if(this.texto==null && this.variable!=null){
				return this.variable;
			}
		}
		
	},
	
	Sentencia : function (id,sig,hij,tipo,condicion1,condicion2,puerta,hij2){
		
		Modelo.Bloque.call(this,id,sig,hij);
		this.tipo = tipo;
		this.condicion1 = condicion1;
		this.condicion2 = condicion2;
		this.puerta = puerta;
		this.hij2 = hij2;
		
		this.evaluarCondicion = function(){
			if(tipo!="ph"){
				if(this.condicion1==null && this.condicion2==null){
					return null;
				}else if(puerta=="--"&& this.condicion1!=null){
					return this.condicion1.resultado();
				}
			
				if(puerta=="AND"&& this.condicion1!=null && this.condicion2!=null){
					return  this.condicion1.resultado() && this.condicion2.resultado();
				}
			
				if(puerta=="OR"&& this.condicion1!=null && this.condicion2!=null){
					return  this.condicion1.resultado() || this.condicion2.resultado();
				}
			}else{
				if(this.condicion1 instanceof Modelo.Operador){
					return this.condicion1.resultado();
				}else{
					var evalua = new Parser();
					return evalua.evaluate(this.condicion1);
				}
			}
		},
		
		this.condicion = function(){
			if(tipo!="ph"){
				if(this.condicion1==null && this.condicion2==null){
					return null;
				}else if(puerta=="--"&& this.condicion1!=null){
					return this.condicion1.operacion();
				}
			
				if(puerta=="AND"&& this.condicion1!=null && this.condicion2!=null){
					return  this.condicion1.operacion() +" && "+ this.condicion2.operacion();
				}
			
				if(puerta=="OR"&& this.condicion1!=null && this.condicion2!=null){
					return  this.condicion1.operacion() +" || "+ this.condicion2.operacion();
				}
			}else{
				
				return this.puerta+"="+this.condicion1+" Hasta "+this.puerta+"<="+this.condicion2;
				
			}
		},
		
		this.condicionpse = function(){
			if(tipo!="ph"){
				if(this.condicion1==null && this.condicion2==null){
					return null;
				}else if(puerta=="--"&& this.condicion1!=null){
					return this.condicion1.operacion();
				}
			
				if(puerta=="AND"&& this.condicion1!=null && this.condicion2!=null){
					return  this.condicion1.operacion() +" Y "+ this.condicion2.operacion();
				}
			
				if(puerta=="OR"&& this.condicion1!=null && this.condicion2!=null){
					return  this.condicion1.operacion() +" O "+ this.condicion2.operacion();
				}
			}else{
				
				return this.puerta+"="+this.condicion1+" Hasta "+this.puerta+"<="+this.condicion2;
				
			}
		},
		
		this.condicionN = function(){
			if(tipo!="ph"){
				if(this.condicion1==null && this.condicion2==null){
					return null;
				}else if(puerta=="--"&& this.condicion1!=null){
					return this.condicion1.operacionN();
				}
			
				if(puerta=="AND"&& this.condicion1!=null && this.condicion2!=null){
					return  this.condicion1.operacionN() +" Y "+ this.condicion2.operacionN();
				}
			
				if(puerta=="OR"&& this.condicion1!=null && this.condicion2!=null){
					return  this.condicion1.operacionN() +" O "+ this.condicion2.operacionN();
				}
			}else{
				
				return this.puerta+"="+this.condicion1+" Hasta "+this.puerta+"<="+this.condicion2;
				
			}
		}

	},
	
	
	Variables : function (){
		
		this.variable = new Array();
		this.cant = 0;
		
		 this.agregarVariable =function(nomVariable){
			if(this.variable.indexOf(nomVariable) == -1 && nomVariable !=""){
				this.variable.push(nomVariable);
				this.cant++;
				return true;
			}else{
				return false;
			}
		}
	
	},
	
	
	simbolo: function(nombre, valor){
		
		this.nombre=nombre;
		this.valor= valor;
		
	},
	
	
	tablaSimbolos: function(){
		
		this.simbolos = new Array();
		this.cantidad =0;
		
		this.crearTablaSimbolos= function(){
		
				
		$(".definicion.borrable").each(function(index) {
			
			if($(this).find(":text")[0].value!=""){
				Tabla.agregarSimbolo(new Modelo.simbolo($(this).find(":text")[0].value,0));
			}
  			
		});
	
	},
		
		this.agregarSimbolo = function(sim){
			
			if(this.buscarSimbolo(sim)==-1){
				this.simbolos.push(sim);
				this.cantidad = this.simbolos.length;
			}
		},
		
		
		this.buscarSimbolo = function(sim){
			
			for(i=0; i<this.simbolos.length; i++){
				if(this.simbolos[i]["nombre"]==sim["nombre"])
				return i;
			}
			return -1;
		},
		
		this.obtenerValor= function(sim){
			
			for(i=0; i<this.simbolos.length; i++){
				if(this.simbolos[i]["nombre"]==sim)
				return this.simbolos[i]["valor"];
			}
			
		},
		
		this.getVectorVariables=function(){
			
			var vec = new Array;
			
			for(i=0; i<this.simbolos.length; i++){
				vec[this.simbolos[i]["nombre"]]=this.simbolos[i]["valor"];
			}
			
			return vec;
			
		},
		
		this.setValor=function(nom,val){
			
			for(i=0; i<this.simbolos.length; i++){
				if(this.simbolos[i]["nombre"]==nom){
					this.simbolos[i]["valor"]=val;
				}
			}
			
		}
		
	},
	
	arbol :function(){
		
		this.raiz = new Array;
		this.cant_nodos =0;
		this.incio = null;
		
		this.crearArbol = function(){
			
			var vecId = null;
			var vecClass = null;
			var sortables = $(".sortable");
			
			for(i=0;i<sortables.length;i++){
				vecId = $(sortables[i]).sortable('toArray', { attribute : "id" });
				vecClass= $(sortables[i]).sortable('toArray', { attribute : "class" });
				
				if(vecId.length>0){
				
					var inicial = this.obtenerNodo(vecId[0],vecClass[0].split(" "));
					var otro = inicial;
					for(j=1;j<vecId.length;j++){
						otro.nodoSig = this.obtenerNodo(vecId[j],vecClass[j].split(" "));
						otro = otro.nodoSig;
					}
				
					this.raiz.push(inicial);
				}
				
			}
			
			
			
			for(i=1;i<this.raiz.length;i++){
				var excp= true;
				var blo=$("#"+this.raiz[i].idBloque);
				
				var pad =$(blo[0].parentElement).attr("padre");
				
				if($(blo[0].parentElement)[0].className.split(" ")[0]=="sen_medos_if_else"){
					excp=false;
				}
				
				for(j=0;j<this.raiz.length;j++){
					var nodoAux = this.raiz[j];
					while(nodoAux!=null){
						if(nodoAux.idBloque==pad){
							if(excp)
								nodoAux.nodoHijo = this.raiz[i];
							else
								nodoAux.hij2 = this.raiz[i];
							nodoAux = null;
						}else{
							nodoAux = nodoAux.nodoSig;
						}
					}
					
				}
			}
			
			this.inicio = this.raiz[0];
			

				
		}
		
		
		this.obtenerNodo = function(id,clases){
			
			var nodo=null;
			var aux = $("#"+id);
			var result=null;
			var nd=null;
			var nd2=null;
			var valor=null;
			
			switch (clases[0]){

				case "definicion":
					valor = Vista.buscarDiv(aux,":input");
					nodo = new Modelo.Definicion(aux[0].id,null,null,valor[0].value);
					break;
					
				case "asignacion":
					valor = Vista.buscarDiv(aux,":input");
					result = null;
					if(Vista.buscarDiv(aux,".operador_mate")==false){
						result = valor[1].value;
						
					}else{
						nd = Vista.buscarDiv(aux,".operador_mate");
						result = this.obtenerNodo(nd[0].id,nd[0].className.split(" "));
					}
					
					nodo = new Modelo.Asignacion(aux[0].id,null,null,valor[0].value,result);
					break;
					
				case "operador_logico":
					valor = Vista.buscarDiv(aux,":input");
					nodo = new Modelo.Operador(aux[0].id,null,null,clases[1],valor[0].value,valor[1].value);
					break;
					
				case "operador_mate":
					valor = Vista.buscarDiv(aux,":input");
					nodo = new Modelo.Operador(aux[0].id,null,null,clases[1],valor[0].value,valor[1].value);
					break;
					
				case "salida":
					valor = Vista.buscarDiv(aux,":input");
					nodo = new Modelo.Salida(aux[0].id,null,null,valor[0].value,null);
					break;
					
				case "escribir":
					valor = Vista.buscarDiv(aux,":input");
					nodo = new Modelo.Salida(aux[0].id,null,null,null,valor[0].value);
					break;
					
				case "escribir_salida":
					valor = Vista.buscarDiv(aux,":input");
					nodo = new Modelo.Salida(aux[0].id,null,null,valor[1].value,valor[0].value);
					break;
					
				case "escribir_salida":
					valor = Vista.buscarDiv(aux,":input");
					nodo = new Modelo.Salida(aux[0].id,null,null,valor[1].value,valor[0].value);
					break;
					
				case "entrada":
					variable = Vista.buscarDiv(aux,":selected");
					texto = Vista.buscarDiv(aux,":input");
					nodo = new Modelo.Entrada(aux[0].id,null,null,variable[0].value,texto[0].value);
					break;
					
					
				case "sentencia_general_if":
					valor = Vista.buscarDiv(aux,":selected");
					result = Vista.buscarDiv(aux,".operador_logico."+id);
					if(result.length==1){
						
						nd = this.obtenerNodo(result[0].id,result[0].className.split(" "));
					}
					
					if(result.length==2){
						nd = this.obtenerNodo(result[0].id,result[0].className.split(" "));
						nd2 = this.obtenerNodo(result[1].id,result[1].className.split(" "));
					}
					
					nodo = new Modelo.Sentencia(aux[0].id,null,null,"si",nd,nd2,valor[0].value,null);
					
					break;
					
				case "sentencia_general_rh":
					valor = Vista.buscarDiv(aux,":selected");
					result = Vista.buscarDiv(aux,".operador_logico."+id);
					if(result.length==1){
						
						nd = this.obtenerNodo(result[0].id,result[0].className.split(" "));
					}
					
					if(result.length==2){
						nd = this.obtenerNodo(result[0].id,result[0].className.split(" "));
						nd2 = this.obtenerNodo(result[1].id,result[1].className.split(" "));
					}
					
					nodo = new Modelo.Sentencia(aux[0].id,null,null,"rh",nd,nd2,valor[((valor.length)-1)].value,null);
					
					break;
					
				case "sentencia_general_m":
					valor = Vista.buscarDiv(aux,":selected");
					result = Vista.buscarDiv(aux,".operador_logico."+id);
					if(result.length==1){
						
						nd = this.obtenerNodo(result[0].id,result[0].className.split(" "));
					}
					
					if(result.length==2){
						nd = this.obtenerNodo(result[0].id,result[0].className.split(" "));
						nd2 = this.obtenerNodo(result[1].id,result[1].className.split(" "));
					}
				
					nodo = new Modelo.Sentencia(aux[0].id,null,null,"m",nd,nd2,valor[0].value,null);
					
					break;
					
				case "sentencia_general_ph":
					result = null;
					valor = Vista.buscarDiv(aux,":input");
					if(Vista.buscarDiv(aux,".operador_mate")==false){
						result = valor[0].value;
					}else{
						nd = Vista.buscarDiv(aux,".operador_mate");
						result = this.obtenerNodo(nd[0].id,nd[0].className.split(" "));
					}

					nodo = new Modelo.Sentencia(aux[0].id,null,null,"ph",valor[1].value,valor[2].value,valor[0].value,null);
					
					break;
					
				case "sentencia_general_1if_else":
					valor = Vista.buscarDiv(aux,":selected");
					result = Vista.buscarDiv(aux,".operador_logico."+id);
					if(result.length==1){
						
						nd = this.obtenerNodo(result[0].id,result[0].className.split(" "));
					}
					
					if(result.length==2){
						nd = this.obtenerNodo(result[0].id,result[0].className.split(" "));
						nd2 = this.obtenerNodo(result[1].id,result[1].className.split(" "));
					}
					
					nodo = new Modelo.Sentencia(aux[0].id,null,null,"si-no",nd,nd2,valor[0].value,null);
					
					break;
					
				default:
					console.log("nodo no reconocido");
					break;
				
			};
			
			return nodo;
			
		}
		
	},
	
	simulacion: function(){
		
		var evaluador = new Parser();
		this.tiempoIni= new Date();
		this.tiempoLimite=200000;
	
		
		this.simular = function(bloque){
			
			/*var fin = new Date();
			if(fin-this.tiempoIni>this.tiempoLimite){
				console.log("reboto");
				return false;
			}*/

			
			if(bloque instanceof Modelo.Definicion){
				if(bloque.nodoSig!=null){
					this.simular(bloque.nodoSig)
				}
				return null;
			}
			
			if(bloque instanceof Modelo.Asignacion){
				var result=null;
				if(bloque.valor instanceof Modelo.Operador){
					result = this.simular(bloque.valor);
				}else{
					result = evaluador.evaluate(bloque.valor,Tabla.getVectorVariables());
				}
				
				if(result!=null){
					Tabla.setValor(bloque.variable,result);
				}
				if(bloque.nodoSig!=null){
					this.simular(bloque.nodoSig)
				}
				return null;
			}
			
			if(bloque instanceof Modelo.Operador){
				return bloque.resultado();
			}
			
			if(bloque instanceof Modelo.Salida){
				$("#area_salida").attr("value",$("#area_salida").attr("value")+bloque.obtenerSalida());
				if(bloque.nodoSig!=null){
					this.simular(bloque.nodoSig);
				}
				return null;
			}
			
			if(bloque instanceof Modelo.Entrada){
				var result;
				
				do{
				result = prompt(bloque.valor);
				}while(!Controlador.IsNumeric(result));
				
				Tabla.setValor(bloque.variable,result);
				if(bloque.nodoSig!=null){
					this.simular(bloque.nodoSig)
				}
				
				return null;
			}
			
			if(bloque instanceof Modelo.Sentencia){
				
				if(bloque.tipo=="si"){
					if(bloque.evaluarCondicion() && bloque.nodoHijo!=null){
						this.simular(bloque.nodoHijo);
					}
				}
				else if(bloque.tipo=="m"){
					
					while(bloque.evaluarCondicion() && bloque.nodoHijo!=null){
						
						if(this.simular(bloque.nodoHijo)==false)
						break;
						
					}
				}
				else if(bloque.tipo=="rh"){
					do{
						if(this.simular(bloque.nodoHijo)==false)
						break;
						
					}while(bloque.evaluarCondicion() && bloque.nodoHijo!=null)
				}
				else if(bloque.tipo=="si-no"){
					
					if(bloque.evaluarCondicion()  && bloque.nodoHijo!=null){
						this.simular(bloque.nodoHijo);
					}else if(bloque.hij2!=null){
						this.simular(bloque.hij2);
					}
				}
				else if(bloque.tipo=="ph"){
					
					
					if(bloque.nodoHijo!=null)					
					for(var k=parseInt(bloque.condicion1);k<=parseInt(bloque.condicion2);k++){
						Tabla.setValor(bloque.puerta,k);
						if(this.simular(bloque.nodoHijo)==false)
						break;
					}
				}
				
				if(bloque.nodoSig!=null){
					this.simular(bloque.nodoSig);
				}
				
				return null;
			}
		},
		
		
		
		this.generarPseudocodigo = function(bloque){
			
			if(bloque instanceof Modelo.Definicion){
				$("#codigo_salida").attr("href",$("#codigo_salida").attr("href")+"Entero = "+bloque.variable+";<br>");
				if(bloque.nodoSig!=null){
					this.generarPseudocodigo(bloque.nodoSig)
				}
				return null;
			}
			
			if(bloque instanceof Modelo.Asignacion){
				if(bloque.valor instanceof Modelo.Operador){
					$("#codigo_salida").attr("href",$("#codigo_salida").attr("href")+bloque.variable+" = "+bloque.valor.operacion()+";<br>");
				}else{
					$("#codigo_salida").attr("href",$("#codigo_salida").attr("href")+bloque.variable+" = "+bloque.valor+";<br>");
				}
				
				if(bloque.nodoSig!=null){
					this.generarPseudocodigo(bloque.nodoSig)
				}
				return null;
			}
			
			
			if(bloque instanceof Modelo.Salida){
				$("#codigo_salida").attr("href",$("#codigo_salida").attr("href")+"ESCRIBIR "+bloque.salida()+";<br>");
				if(bloque.nodoSig!=null){
					this.generarPseudocodigo(bloque.nodoSig);
				}
				return null;
			}
			
			if(bloque instanceof Modelo.Entrada){
				
				if(bloque.valor!=null){
					$("#codigo_salida").attr("href",$("#codigo_salida").attr("href")+'ESCRIBIR "'+bloque.valor+'";<br>');
				}
				$("#codigo_salida").attr("href",$("#codigo_salida").attr("href")+"LEER "+bloque.variable+";<br>");
			
				if(bloque.nodoSig!=null){
					this.generarPseudocodigo(bloque.nodoSig)
				}
				
				return null;
			}
			
			if(bloque instanceof Modelo.Sentencia){
				
				if(bloque.tipo=="si"){
					$("#codigo_salida").attr("href",$("#codigo_salida").attr("href")+"<strong> SI</strong> "+bloque.condicionpse()+";<br>");
					$("#codigo_salida").attr("href",$("#codigo_salida").attr("href")+"<div style='margin-left: "+$(Vista.buscarDiv($("#"+bloque.idBloque),".sen_med2_if")).attr("nivel")+"em'>");
					if(bloque.nodoHijo!=null){
						
						this.generarPseudocodigo(bloque.nodoHijo);
						
					}
					$("#codigo_salida").attr("href",$("#codigo_salida").attr("href")+"</div>");
					$("#codigo_salida").attr("href",$("#codigo_salida").attr("href")+"<strong>FIN SI;</strong><br>");
					
				}
				else if(bloque.tipo=="m"){
					$("#codigo_salida").attr("href",$("#codigo_salida").attr("href")+"<strong>MIENTRAS</strong> "+bloque.condicionpse()+";<br>");
					$("#codigo_salida").attr("href",$("#codigo_salida").attr("href")+"<div style='margin-left: "+$(Vista.buscarDiv($("#"+bloque.idBloque),".sen_med2_m")).attr("nivel")+"em'>");
					
					if( bloque.nodoHijo!=null){
						
						this.generarPseudocodigo(bloque.nodoHijo);
					}
					$("#codigo_salida").attr("href",$("#codigo_salida").attr("href")+"</div>");
					$("#codigo_salida").attr("href",$("#codigo_salida").attr("href")+"<strong>FIN MIENTRAS</strong>;<br>");
				}
				else if(bloque.tipo=="rh"){
					$("#codigo_salida").attr("href",$("#codigo_salida").attr("href")+"<strong>HAGA</strong><br>");
					$("#codigo_salida").attr("href",$("#codigo_salida").attr("href")+"<div style='margin-left: "+$(Vista.buscarDiv($("#"+bloque.idBloque),".sen_med2_rh")).attr("nivel")+"em'>");
					
					if(bloque.nodoHijo!=null){
						this.generarPseudocodigo(bloque.nodoHijo)
						
					}
					$("#codigo_salida").attr("href",$("#codigo_salida").attr("href")+"</div>");
					$("#codigo_salida").attr("href",$("#codigo_salida").attr("href")+"<strong>MIENTRAS</strong> "+bloque.condicionpse()+";<br>");
				}
				else if(bloque.tipo=="si-no"){
					$("#codigo_salida").attr("href",$("#codigo_salida").attr("href")+"<strong>SI</strong> "+bloque.condicionpse()+";<br>");
					$("#codigo_salida").attr("href",$("#codigo_salida").attr("href")+"<div style='margin-left: "+$(Vista.buscarDiv($("#"+bloque.idBloque),".sen_med2_if_else")).attr("nivel")+"em'>");
					
					if(bloque.nodoHijo!=null){
						this.generarPseudocodigo(bloque.nodoHijo);
					}
					$("#codigo_salida").attr("href",$("#codigo_salida").attr("href")+"</div>");
					$("#codigo_salida").attr("href",$("#codigo_salida").attr("href")+"<strong>NO</strong><br>");
					$("#codigo_salida").attr("href",$("#codigo_salida").attr("href")+"<div style='margin-left: "+$(Vista.buscarDiv($("#"+bloque.idBloque),".sen_med2_if_else")).attr("nivel")+"em'>");
					if(bloque.hij2!=null){
						this.generarPseudocodigo(bloque.hij2);
					}
					$("#codigo_salida").attr("href",$("#codigo_salida").attr("href")+"</div>");
					$("#codigo_salida").attr("href",$("#codigo_salida").attr("href")+"<strong>FIN SI-NO;</strong><br>");
				}
				else if(bloque.tipo=="ph"){
					
					$("#codigo_salida").attr("href",$("#codigo_salida").attr("href")+"<strong>PARA</strong> "+bloque.condicion()+";<br>");
					$("#codigo_salida").attr("href",$("#codigo_salida").attr("href")+"<div style='margin-left: "+$(Vista.buscarDiv($("#"+bloque.idBloque),".sen_med2_ph")).attr("nivel")+"em'>");
					
					if(bloque.nodoHijo!=null)					
						this.generarPseudocodigo(bloque.nodoHijo);
					
					$("#codigo_salida").attr("href",$("#codigo_salida").attr("href")+"</div>");
					$("#codigo_salida").attr("href",$("#codigo_salida").attr("href")+"<strong>FIN PARA-HASTA;</strong><br>");
						
					
				}
				
				if(bloque.nodoSig!=null){
					this.generarPseudocodigo(bloque.nodoSig);
				}
				
				
				return null;
			}
		},
		
		
		this.generarCpp = function(bloque){
			
			if(bloque instanceof Modelo.Definicion){
				$("#codigo_salida").attr("href",$("#codigo_salida").attr("href")+"int "+bloque.variable+";<br>");
				if(bloque.nodoSig!=null){
					this.generarCpp(bloque.nodoSig)
				}
				return null;
			}
			
			if(bloque instanceof Modelo.Asignacion){
				if(bloque.valor instanceof Modelo.Operador){
					$("#codigo_salida").attr("href",$("#codigo_salida").attr("href")+bloque.variable+" = "+bloque.valor.operacion()+";<br>");
				}else{
					$("#codigo_salida").attr("href",$("#codigo_salida").attr("href")+bloque.variable+" = "+bloque.valor+";<br>");
				}
				
				if(bloque.nodoSig!=null){
					this.generarCpp(bloque.nodoSig)
				}
				return null;
			}
			
			
			if(bloque instanceof Modelo.Salida){
				$("#codigo_salida").attr("href",$("#codigo_salida").attr("href")+"cout  &lt;&lt;"+bloque.salidaCpp()+";<br>");
				if(bloque.nodoSig!=null){
					this.generarCpp(bloque.nodoSig);
				}
				return null;
			}
			
			if(bloque instanceof Modelo.Entrada){
				
				if(bloque.valor!=null){
					$("#codigo_salida").attr("href",$("#codigo_salida").attr("href")+"cout  &lt;&lt;\""+bloque.valor+"\";<br>");
				}
				
				$("#codigo_salida").attr("href",$("#codigo_salida").attr("href")+"cin &gt;&gt;"+bloque.variable+";<br>");
			
				if(bloque.nodoSig!=null){
					this.generarCpp(bloque.nodoSig)
				}
				
				return null;
			}
			
			if(bloque instanceof Modelo.Sentencia){
				
				if(bloque.tipo=="si"){
					$("#codigo_salida").attr("href",$("#codigo_salida").attr("href")+"if ("+bloque.condicion()+"){<br>");
					$("#codigo_salida").attr("href",$("#codigo_salida").attr("href")+"<div style='margin-left: "+$(Vista.buscarDiv($("#"+bloque.idBloque),".sen_med2_if")).attr("nivel")+"em'>");
					if(bloque.nodoHijo!=null){
						
						this.generarCpp(bloque.nodoHijo);
						
					}
					$("#codigo_salida").attr("href",$("#codigo_salida").attr("href")+"</div>");
					$("#codigo_salida").attr("href",$("#codigo_salida").attr("href")+"}<br>");
					
				}
				else if(bloque.tipo=="m"){
					$("#codigo_salida").attr("href",$("#codigo_salida").attr("href")+"while ("+bloque.condicion()+")<br>");
					$("#codigo_salida").attr("href",$("#codigo_salida").attr("href")+"<div style='margin-left: "+$(Vista.buscarDiv($("#"+bloque.idBloque),".sen_med2_m")).attr("nivel")+"em'>");
					
					if( bloque.nodoHijo!=null){
						
						this.generarCpp(bloque.nodoHijo);
					}
					$("#codigo_salida").attr("href",$("#codigo_salida").attr("href")+"</div>");
					$("#codigo_salida").attr("href",$("#codigo_salida").attr("href")+"}<br>");
				}
				else if(bloque.tipo=="rh"){
					$("#codigo_salida").attr("href",$("#codigo_salida").attr("href")+"do{<br>");
					$("#codigo_salida").attr("href",$("#codigo_salida").attr("href")+"<div style='margin-left: "+$(Vista.buscarDiv($("#"+bloque.idBloque),".sen_med2_rh")).attr("nivel")+"em'>");
					
					if(bloque.nodoHijo!=null){
						this.generarCpp(bloque.nodoHijo)
						
					}
					$("#codigo_salida").attr("href",$("#codigo_salida").attr("href")+"</div>");
					$("#codigo_salida").attr("href",$("#codigo_salida").attr("href")+"}while ("+bloque.condicion()+");<br>");
				}
				else if(bloque.tipo=="si-no"){
					$("#codigo_salida").attr("href",$("#codigo_salida").attr("href")+"if ("+bloque.condicion()+")<br>");
					$("#codigo_salida").attr("href",$("#codigo_salida").attr("href")+"<div style='margin-left: "+$(Vista.buscarDiv($("#"+bloque.idBloque),".sen_med2_if_else")).attr("nivel")+"em'>");
					
					if(bloque.nodoHijo!=null){
						this.generarCpp(bloque.nodoHijo);
					}
					$("#codigo_salida").attr("href",$("#codigo_salida").attr("href")+"</div>");
					$("#codigo_salida").attr("href",$("#codigo_salida").attr("href")+"}else{<br>");
					$("#codigo_salida").attr("href",$("#codigo_salida").attr("href")+"<div style='margin-left: "+$(Vista.buscarDiv($("#"+bloque.idBloque),".sen_med2_if_else")).attr("nivel")+"em'>");
					if(bloque.hij2!=null){
						this.generarCpp(bloque.hij2);
					}
					$("#codigo_salida").attr("href",$("#codigo_salida").attr("href")+"</div>");
					$("#codigo_salida").attr("href",$("#codigo_salida").attr("href")+"}<br>");
				}
				else if(bloque.tipo=="ph"){
					
					$("#codigo_salida").attr("href",$("#codigo_salida").attr("href")+"for("+bloque.puerta+"="+bloque.condicion1+";"+bloque.puerta+"<="+bloque.condicion2+";"+bloque.puerta+"++){<br>");
					$("#codigo_salida").attr("href",$("#codigo_salida").attr("href")+"<div style='margin-left: "+$(Vista.buscarDiv($("#"+bloque.idBloque),".sen_med2_ph")).attr("nivel")+"em'>");
					
					if(bloque.nodoHijo!=null)					
						this.generarCpp(bloque.nodoHijo);
					
					$("#codigo_salida").attr("href",$("#codigo_salida").attr("href")+"</div>");
					$("#codigo_salida").attr("href",$("#codigo_salida").attr("href")+"}<br>");
						
					
				}
				
				if(bloque.nodoSig!=null){
					this.generarCpp(bloque.nodoSig);
				}
				
				
				return null;
			}
		},
		
		this.generarN = function(bloque){
			
			if(bloque instanceof Modelo.Definicion){
				$("#codigo_salida").attr("href",$("#codigo_salida").attr("href")+"VAR <br>");
				$("#codigo_salida").attr("href",$("#codigo_salida").attr("href")+"ENTERO "+bloque.variable+"<br>");
				if(bloque.nodoSig!=null){
					this.generarN(bloque.nodoSig)
				}
				return null;
			}
			
			if(bloque instanceof Modelo.Asignacion){
				if(bloque.valor instanceof Modelo.Operador){
					$("#codigo_salida").attr("href",$("#codigo_salida").attr("href")+bloque.variable+" := "+bloque.valor.operacion()+"<br>");
				}else{
					$("#codigo_salida").attr("href",$("#codigo_salida").attr("href")+bloque.variable+" := "+bloque.valor+"<br>");
				}
				
				if(bloque.nodoSig!=null){
					this.generarN(bloque.nodoSig)
				}
				return null;
			}
			
			
			if(bloque instanceof Modelo.Salida){
				$("#codigo_salida").attr("href",$("#codigo_salida").attr("href")+"escribirnl "+bloque.salida()+"<br>");
				if(bloque.nodoSig!=null){
					this.generarN(bloque.nodoSig);
				}
				return null;
			}
			
			if(bloque instanceof Modelo.Entrada){
				
				if(bloque.valor!=null){
					$("#codigo_salida").attr("href",$("#codigo_salida").attr("href")+"escribirnl \""+bloque.valor+"\"<br>");
				}
				
				$("#codigo_salida").attr("href",$("#codigo_salida").attr("href")+"leer "+bloque.variable+"<br>");
			
				if(bloque.nodoSig!=null){
					this.generarN(bloque.nodoSig)
				}
				
				return null;
			}
			
			if(bloque instanceof Modelo.Sentencia){
				
				if(bloque.tipo=="si"){
					$("#codigo_salida").attr("href",$("#codigo_salida").attr("href")+"si ("+bloque.condicionN()+") entonces<br>");
					$("#codigo_salida").attr("href",$("#codigo_salida").attr("href")+"<div style='margin-left: "+$(Vista.buscarDiv($("#"+bloque.idBloque),".sen_med2_if")).attr("nivel")+"em'>");
					if(bloque.nodoHijo!=null){
						
						this.generarN(bloque.nodoHijo);
						
					}
					$("#codigo_salida").attr("href",$("#codigo_salida").attr("href")+"</div>");
					$("#codigo_salida").attr("href",$("#codigo_salida").attr("href")+"fin si<br>");
					
				}
				else if(bloque.tipo=="m"){
					$("#codigo_salida").attr("href",$("#codigo_salida").attr("href")+"mientras ("+bloque.condicionN()+") hacer<br>");
					$("#codigo_salida").attr("href",$("#codigo_salida").attr("href")+"<div style='margin-left: "+$(Vista.buscarDiv($("#"+bloque.idBloque),".sen_med2_m")).attr("nivel")+"em'>");
					
					if( bloque.nodoHijo!=null){
						
						this.generarN(bloque.nodoHijo);
					}
					$("#codigo_salida").attr("href",$("#codigo_salida").attr("href")+"</div>");
					$("#codigo_salida").attr("href",$("#codigo_salida").attr("href")+"fin mientras<br>");
				}
				else if(bloque.tipo=="rh"){
					$("#codigo_salida").attr("href",$("#codigo_salida").attr("href")+"repita<br>");
					$("#codigo_salida").attr("href",$("#codigo_salida").attr("href")+"<div style='margin-left: "+$(Vista.buscarDiv($("#"+bloque.idBloque),".sen_med2_rh")).attr("nivel")+"em'>");
					
					if(bloque.nodoHijo!=null){
						this.generarN(bloque.nodoHijo)
						
					}
					$("#codigo_salida").attr("href",$("#codigo_salida").attr("href")+"</div>");
					$("#codigo_salida").attr("href",$("#codigo_salida").attr("href")+"hasta ("+bloque.condicionN()+")<br>");
				}
				else if(bloque.tipo=="si-no"){
					$("#codigo_salida").attr("href",$("#codigo_salida").attr("href")+"si ("+bloque.condicionN()+")<br>");
					$("#codigo_salida").attr("href",$("#codigo_salida").attr("href")+"<div style='margin-left: "+$(Vista.buscarDiv($("#"+bloque.idBloque),".sen_med2_if_else")).attr("nivel")+"em'>");
					
					if(bloque.nodoHijo!=null){
						this.generarN(bloque.nodoHijo);
					}
					$("#codigo_salida").attr("href",$("#codigo_salida").attr("href")+"</div>");
					$("#codigo_salida").attr("href",$("#codigo_salida").attr("href")+"sino<br>");
					$("#codigo_salida").attr("href",$("#codigo_salida").attr("href")+"<div style='margin-left: "+$(Vista.buscarDiv($("#"+bloque.idBloque),".sen_med2_if_else")).attr("nivel")+"em'>");
					if(bloque.hij2!=null){
						this.generarN(bloque.hij2);
					}
					$("#codigo_salida").attr("href",$("#codigo_salida").attr("href")+"</div>");
					$("#codigo_salida").attr("href",$("#codigo_salida").attr("href")+"fin si<br>");
				}
				else if(bloque.tipo=="ph"){
					
					$("#codigo_salida").attr("href",$("#codigo_salida").attr("href")+"para "+bloque.puerta+" desde "+bloque.condicion1+" hasta "+bloque.condicion2+" hacer<br>");
					$("#codigo_salida").attr("href",$("#codigo_salida").attr("href")+"<div style='margin-left: "+$(Vista.buscarDiv($("#"+bloque.idBloque),".sen_med2_ph")).attr("nivel")+"em'>");
					
					if(bloque.nodoHijo!=null)					
						this.generarN(bloque.nodoHijo);
					
					$("#codigo_salida").attr("href",$("#codigo_salida").attr("href")+"</div>");
					$("#codigo_salida").attr("href",$("#codigo_salida").attr("href")+"fin para<br>");
						
					
				}
				
				if(bloque.nodoSig!=null){
					this.generarN(bloque.nodoSig);
				}
				
				
				return null;
			}
		}
		
	}

}
Modelo.Definicion.prototype = new Modelo.Bloque;
Modelo.Operador.prototype = new Modelo.Bloque;
Modelo.Entrada.prototype = new Modelo.Bloque;
Modelo.Salida.prototype = new Modelo.Bloque;
Modelo.Sentencia.prototype = new Modelo.Bloque;

/*************************
* Vistas
**************************/

Vista = {
	
	
	actualizarVariables:function (e){
		if(e.target.value==""){
			alert("Debe agregar una variable");
		}else{
			divDef = document.getElementsByName("def");
			Vari.variable = new Array();
			Vari.cant =0;
			for (i=0;i<divDef.length;i++){
				Vari.agregarVariable(divDef[i].value);
			}
		}
			
		Vista.cargarLista();
	} ,
	
	
	
	cargarLista:function (){
		
		divList = document.getElementsByName("asig");
		if(divList.length!=0){

			for(i=0; i<divList.length;i++){
				seleccionado=$(divList[i]).find('selected').prevObject[0].value;
				var opciones = $.map( $(divList).find('option').prevObject[0].options,function(option) {return option.value;}).join(',');
				
				$(divList[i]).find('option').remove();
				listSelected = false;
				for(j=0; j<Vari.variable.length;j++){
					if(Vari.variable[j]==seleccionado){
						$(divList[i]).append('<option selected>'+Vari.variable[j]+'</option>');
						listSelected = true;
					}else{
						$(divList[i]).append('<option>'+Vari.variable[j]+'</option>');
					}
				}
				
				if(listSelected == false){
					
					for(j=0;j<Vari.variable.length;j++){
						var opc = opciones.split(",");
						entro = false;
						for(k=0;k<opc.length;k++){
							if(opc[k]==Vari.variable[j]){
								entro = true;
								
							}
						}
						
						if(entro == false){
							divList[i].selectedIndex =j;
						}
	
					}
					
					
				}
			
			}
		}
	},
	validarLetras:function(ob){
		
		key =ob.which;
		keye = ob.keyCode;
        tecla = String.fromCharCode(key).toLowerCase();
        letras = "qwertyuioplkjhgfdsazxcvbnm";
        especiales = [8,37,39,46];
		
	   tecla_especial = false;
       for(var i in especiales){
            if(key == especiales[i]){
                tecla_especial = true;
                break;
            }
        }
		if(letras.indexOf(tecla)==-1 && keye!=9&& (key==37 || keye!=37)&& (keye!=39 || key==39) && keye!=8 && (keye!=46 || key==46) || key==161){
			ob.preventDefault();
			return false;
        }
		
	},
	validarNumero:function(ob){
		
		key =ob.which;
		keye = ob.keyCode;
        tecla = String.fromCharCode(key).toLowerCase();
        letras = "1234567890";
        especiales = [8,37,39,46];
		
	   tecla_especial = false;
       for(var i in especiales){
            if(key == especiales[i]){
                tecla_especial = true;
                break;
            }
        }
		if(letras.indexOf(tecla)==-1 && keye!=9&& (key==37 || keye!=37)&& (keye!=39 || key==39) && keye!=8 && (keye!=46 || key==46) || key==161){
			ob.preventDefault();
			return false;
        }
		
	},
	validarMixto:function(ob){
		
		key =ob.which;
		keye = ob.keyCode;
        tecla = String.fromCharCode(key).toLowerCase();
        letras = "qwertyuioplkjhgfdsazxcvbnm1234567890";
        especiales = [8,37,39,46];
		
	   tecla_especial = false;
       for(var i in especiales){
            if(key == especiales[i]){
                tecla_especial = true;
                break;
            }
        }
		if(letras.indexOf(tecla)==-1 && keye!=9&& (key==37 || keye!=37)&& (keye!=39 || key==39) && keye!=8 && (keye!=46 || key==46) || key==161){
			ob.preventDefault();
			return false;
        }
		
				
	},
	validarExpr:function(ob){
		
		key =ob.which;
		keye = ob.keyCode;
        tecla = String.fromCharCode(key).toLowerCase();
        letras = "qwertyuioplkjhgfdsazxcvbnm1234567890+-*/";
        especiales = [8,37,39,46];
		
	   tecla_especial = false;
       for(var i in especiales){
            if(key == especiales[i]){
                tecla_especial = true;
                break;
            }
        }
		if(letras.indexOf(tecla)==-1 && keye!=9&& (key==37 || keye!=37)&& (keye!=39 || key==39) && keye!=8 && (keye!=46 || key==46) || key==161){
			ob.preventDefault();
			return false;
        }
		
				
	},
	compararVariables:function(objeto){
		
		ban = false;
		input=objeto.target;
		ivalue=input.value;
		
		if(Vari.variable.length==0){
			if(/^([0-9])*$/.test(ivalue)){
				
			}else{
				$(input).attr("value","");
			}
		}else{
		 
			for(j=0; j<Vari.variable.length;j++){
				if(Vari.variable[j]==ivalue || /^([0-9])*$/.test(ivalue)){
					ban = true;
					break;
				}
			}
			
			if(ban==true){
				$("#info_salida").attr("value",$("#info_salida").attr("value")+"Variable Aceptada.\n");
			}else{
				$("#info_salida").attr("value",$("#info_salida").attr("value")+"Ingrese una variable valida.\n");
				$(input).attr("value","");
			}
		}
	
		
		
	},
	
	compararExpr:function(objeto){
		
		var ban = false;
		var aux;
		var input=objeto.target;
		var ivalue=input.value;
		var expr=/^([\-\+]?(\d+|([a-zA-Z]+)))(([\-\+\/\*])(\d+|([a-zA-Z]+)))*$/;
		var digito=/^(\+|\-)?\d+$/;
		var variable=/^(\+|\-)?[a-zA-Z]+$/;
	
		
		if(!digito.test(ivalue.toString())){
			if(expr.test(ivalue.toString())){
				aux = ivalue.replace(/[\-\+\/\*]/g," ");
				aux = aux.replace(/^\s*|\s*$/g,"");
				aux = aux.split(" ");
				
				for(i=0;i<aux.length;i++){
					if(variable.test(aux[i])){
						ban = false;
						for(j=0;j<Vari.variable.length;j++){
							if(Vari.variable[j]==aux[i]){
								ban = true;
								break;
							}
						}
						if(!ban){
							$("#info_salida").attr("value",$("#info_salida").attr("value")+aux[i]+" no es variable valida.\n");
							$(input).attr("value","");
						}
					}
				}

			}else{
				$("#info_salida").attr("value",$("#info_salida").attr("value")+"Ingresa una expresión valida.\n");
				$(input).attr("value","");
			}
			
		}else{
			ban = true;
		}
	},

	incrementoSentencias:function(objeto){

		var totalHeight=0;
		if($(objeto)[0].parentElement.id!="area_trabajo"){

		for(i=1;i<$(objeto)[0].parentElement.childElementCount+1;i++){
			
			totalHeight+=parseInt($(objeto)[0].parentElement.childNodes[i].clientHeight);
			
		}
		
		a = $("#"+$($(objeto)[0].parentElement).attr("padre"));
		console.log(a);
		
		if(a[0].className.indexOf("sentencia_general_if")==0){
			b=Vista.buscarDiv(a,".sen_med_if");
			c=Vista.buscarDiv(a,".sen_med2_if");
			d=Vista.buscarDiv(a,".sen_sup_if_gen");
			acum=d[0].clientHeight;
		}
		
		if(a[0].className.indexOf("sentencia_general_ph")==0){
			
			b=Vista.buscarDiv(a,".sen_med_ph");
			c=Vista.buscarDiv(a,".sen_med2_ph");
			d=Vista.buscarDiv(a,".sen_sup_ph");
			acum=d[0].clientHeight;
		}
		
		if(a[0].className.indexOf("sentencia_general_rh")==0){
			b=Vista.buscarDiv(a,".sen_med_rh");
			c=Vista.buscarDiv(a,".sen_med2_rh");
			d=Vista.buscarDiv(a,".sen_inf_rh");
			acum=d[0].clientHeight;
		}
		
		if(a[0].className.indexOf("sentencia_general_m")==0){
			b=Vista.buscarDiv(a,".sen_med_m");
			c=Vista.buscarDiv(a,".sen_med2_m");
			d=Vista.buscarDiv(a,".sen_sup_m");
			acum=d[0].clientHeight;
		}
		
		if(a[0].className.indexOf("sentencia_general_1if_else")==0){
			if($(objeto)[0].parentElement.className=='sen_med2_if_else sortable ui-sortable'){
				b=Vista.buscarDiv(a,".sen_med_if_else");
			    c=Vista.buscarDiv(a,".sen_med2_if_else");
				d=Vista.buscarDiv(a,".sen_sup_if_else_gen");
				e=Vista.buscarDiv(a,".sen_medio_if_else");
				f=Vista.buscarDiv(a,".sen_med2p_if_else");
				acum=d[0].clientHeight+e[0].clientHeight+f[f.length-1].clientHeight;
			}else{
				b=Vista.buscarDiv(a,".sen_med2p_if_else [padre='"+a[0].id+"']");console.log(b);
			   	// c=Vista.buscarDiv(a,".sen_medos_if_else");
				c=$(b[0].parentElement);
				d=Vista.buscarDiv(a,".sen_sup_if_else_gen");
				e=Vista.buscarDiv(a,".sen_medio_if_else");
				f=Vista.buscarDiv(a,".sen_med_if_else");
				acum=d[0].clientHeight+e[0].clientHeight+f[0].clientHeight;
			}
			
		}
		
		a[0].style.height =(totalHeight+acum+108);
		b[0].style.height =(totalHeight+80);
		c[0].style.height =(totalHeight+80);

		if($($(objeto)[0].parentElement).attr("nivel")>1){
			Vista.incrementoSentencias($("#"+$($(objeto)[0].parentElement).attr("padre")));
		}
		}

	},


	entradaSoloNumeros: function(evt){
        var keyPressed = (evt.which) ? evt.which : event.keyCode
        return !(keyPressed > 31 && (keyPressed < 48 || keyPressed > 57));
     },
	 
	 agregarDiv: function(ob){
		 
		a = ob.target.parentElement.parentElement.parentElement;
		acum=0;
		var clases = $(a)[0].className.split(" ");
		 
		switch (clases[0]){
			
			case "sentencia_general_if":
				b=Vista.buscarDiv(a,".sen_sup_if_gen");
				c=Vista.buscarDiv(a,".sen_med_if");
				d=Vista.buscarDiv(a,".sen_inf_if");
				x=Vista.buscarDiv(a,"");
				acum=c[0].clientHeight + d[0].clientHeight;
				break;
				
			case "sentencia_general_rh":
				b=Vista.buscarDiv(a,".sen_inf_rh");
				c=Vista.buscarDiv(a,".sen_med_rh");
				d=Vista.buscarDiv(a,".sen_sup_rh");
				acum=c[0].clientHeight + d[0].clientHeight;				
				break;
				
			case "sentencia_general_m":
				b=Vista.buscarDiv(a,".sen_sup_m");
				c=Vista.buscarDiv(a,".sen_med_m");
				d=Vista.buscarDiv(a,".sen_inf_m");
				acum=c[0].clientHeight + d[0].clientHeight;				
				break;
				
			case "sentencia_general_1if_else":
				b=Vista.buscarDiv(a,".sen_sup_if_else_gen");
				c=Vista.buscarDiv(a,".sen_med_if_else");
				d=Vista.buscarDiv(a,".sen_medio_if_else");
				e=Vista.buscarDiv(a,".sen_med2p_if_else");
				f=Vista.buscarDiv(a,".sen_inf_if_else");
				acum=c[0].clientHeight + d[0].clientHeight+e[0].clientHeight+f[0].clientHeight;				
				
				break;
			
		}
		
		
		if(ob.target.selectedOptions[0].value!='--'){
			
				$(b)[0].style.height=60;
				$(a)[0].style.height=b[0].clientHeight +acum;
				aux=Vista.buscarDiv(b,".drop2");
				$(aux[0]).attr("style","display:block;");
				aux2=Vista.buscarDiv(aux,".input_op");
				$(aux2[0]).attr("style","display:block;");
			
		}else{
			$(b)[0].style.height=32;
			$(a)[0].style.height=b[0].clientHeight +acum;
			aux = Vista.buscarDiv(b,".drop2");
			aux2=Vista.buscarDiv(aux,".operador_logico");
			if(aux2!=false){
				$(aux2[0]).remove();
			}
			$(aux[0]).attr("style","display:none;");
		}
		
		
		Vista.incrementoSentencias(a);
		 

	 },
	 
	buscarDiv: function(bloque,clases){
		
		busqueda = $(bloque).find(clases);
		
		if(busqueda.length==0){
			console.log("No se encontro: "+clases);
			return false;
		}else{
			return busqueda;
		}
		
	},
	eliminarOp:function(event){
		
		var op=event.srcElement.parentElement.parentElement;
		var fant=event.srcElement.parentElement.parentElement.parentElement;
		var input=Vista.buscarDiv(fant,".input_op");
		
		$(op).remove();
		$(input[0]).attr("style","display:block");
		$("#info_salida").attr("value",$("#info_salida").attr("value")+"Se eliminó operador lógico.\n");
		
	},
	eliminarOpM:function(event){
		
		var op=event.srcElement.parentElement;
		var fant=event.srcElement.parentElement.parentElement;
		var input=Vista.buscarDiv(fant,".input_ph");
		$(op).remove();
		$(input[0]).attr("style","display:block");
		$("#info_salida").attr("value",$("#info_salida").attr("value")+"Se eliminó operador matemático.\n");
		
	}
}



/*************************
* Controlador
**************************/

Controlador = {
	
	
	IsNumeric:function (input){
    	var RE = /^-{0,1}\d*\.{0,1}\d+$/;
    	return (RE.test(input));
	},
	
	validarCodigo: function(){
		
		var tot=$("#area_trabajo").find(".definicion").length;
		var error=false;
		
		console.log($("#area_trabajo input[type='text']"));
		
		$("#area_trabajo input[type='text']").each(
		function(){
			if(this.value=="")
				$(this).addClass("errores");
		}
		);
		
		for(i=0;i<tot;i++){
			if($($($("#area_trabajo").find(".definicion")[i]).find(":text")[0])[0].value==""){
				//$($($("#area_trabajo").find(".definicion")[i]).find(":text")[0]).addClass("errores");
				$("#info_salida").attr("value",$("#info_salida").attr("value")+"Error: campo en bloque definición obligatorio.\n");
				error = true;
				break;
			}
		}
		
		tot=$("#area_trabajo").find(".asignacion").length;
		for(i=0;i<tot;i++){
			if($($("#area_trabajo").find(".asignacion")[i]).find(".operador_mate").length==0){
				if($($($("#area_trabajo").find(".asignacion")[i]).find(":text")[0])[0].value==""){
					$("#info_salida").attr("value",$("#info_salida").attr("value")+"Error: campo en bloque asignación obligatorio.\n");
					error = true;
					break;
				}
			}
		}
		
		tot=$("#area_trabajo").find(".operador_logico").length;
		for(i=0;i<tot;i++){
			if($($($("#area_trabajo").find(".operador_logico")[i]).find(":text")[0])[0].value=="" || $($($("#area_trabajo").find(".operador_logico")[i]).find(":text")[1])[0].value==""){
				$("#info_salida").attr("value",$("#info_salida").attr("value")+"Error: campo en bloque operador obligatorio.\n");
				error = true;
				break;
			}
		}
		
		tot=$("#area_trabajo").find(".operador_mate").length;
		for(i=0;i<tot;i++){
			if($($($("#area_trabajo").find(".operador_mate")[i]).find(":text")[0])[0].value=="" || $($($("#area_trabajo").find(".operador_mate")[i]).find(":text")[1])[0].value==""){
				$("#info_salida").attr("value",$("#info_salida").attr("value")+"Error: campo en bloque operador obligatorio.\n");
				error = true;
				break;
			}
		}
		
		tot=$("#area_trabajo").find(".sentencia").length;
		for(i=0;i<tot;i++){
			
			if($($($("#area_trabajo").find(".sentencia")[i]).find(":selected")[0])[0].value=="--"){
				if($($($("#area_trabajo").find(".sentencia")[i]).find(".fant")[0]).find(".operador_logico").length==0){
					$("#info_salida").attr("value",$("#info_salida").attr("value")+"Error: campo en sentencia operador obligatorio.\n");
					error = true;
					break;
				}
			}else{
				
				if($($($("#area_trabajo").find(".sentencia")[i]).find(".fant")[0]).find(".operador_logico").length==0){
					$("#info_salida").attr("value",$("#info_salida").attr("value")+"Error: campo en sentencia operador obligatorio.\n");
					error = true;
					break;
				}
				
				if($($($("#area_trabajo").find(".sentencia")[i]).find(".fant")[1]).find(".operador_logico").length==0){
					$("#info_salida").attr("value",$("#info_salida").attr("value")+"Error: campo en sentencia operador obligatorio.\n");
					error = true;
					break;
				}
			}
		}
		
		tot=$("#area_trabajo").find(".sentencia_general_rh").length;
		for(i=0;i<tot;i++){
			
			var tam =$($("#area_trabajo").find(".sentencia_general_rh")[i]).find(".sen_inf_rh").length;
			tam--;
			var divAux = $($("#area_trabajo").find(".sentencia_general_rh")[i]).find(".sen_inf_rh")[tam];
			console.log(divAux);
			if($($(divAux).find(":selected")[0])[0].value=="--"){
				if($($(divAux).find(".fant")[0]).find(".operador_logico").length==0){
					$("#info_salida").attr("value",$("#info_salida").attr("value")+"Error: campo en sentencia operador obligatorio.\n");
					error = true;
					break;
				}
			}else{
				if($($(divAux).find(".fant")[0]).find(".operador_logico").length==0){
					$("#info_salida").attr("value",$("#info_salida").attr("value")+"Error: campo en sentencia operador obligatorio.\n");
					error = true;
					break;
				}
				if($($(divAux).find(".fant")[1]).find(".operador_logico").length==0){
					$("#info_salida").attr("value",$("#info_salida").attr("value")+"Error: campo en sentencia operador obligatorio.\n");
					error = true;
					break;
				}
			}
			
		}
		
		tot=$("#area_trabajo").find(".sentencia_general_ph").length;
		for(i=0;i<tot;i++){
			
				if($($($("#area_trabajo").find(".sentencia_general_ph")[i]).find(":text")[0])[0].value=="" || $($($("#area_trabajo").find(".sentencia_general_ph")[i]).find(":text")[1])[0].value==""){
					$("#info_salida").attr("value",$("#info_salida").attr("value")+"Error: campo en sentencia obligatorio.\n");
					
					
					error = true;
					break;
				}
			
		}
		
		setTimeout(function(){$(".errores").removeClass("errores")},10000);
		return error;
	},
	
	iniciarCodigo: function(){
		Tabla = null;
		Tabla = new Modelo.tablaSimbolos;
		
		Arbol = null;
		Arbol = new Modelo.arbol;
		
		Simulador = null;
		Simulador = new Modelo.simulacion;
		
		Tabla.crearTablaSimbolos();
		console.log(Tabla);
		Arbol.crearArbol();
		console.log(Arbol.inicio);
		
		
		if(!this.validarCodigo()){
			$("#area_salida").attr("value","");
			$("#area_salida").attr("value",$("#area_salida").attr("value")+"Inicio de la ejecución.\n");
			Simulador.simular(Arbol.inicio);
			$("#area_salida").attr("value",$("#area_salida").attr("value")+"Fin de la ejecución.\n");
		}
		
		
	
	},
	
	iniciarCodigodos: function(){
		Tabla = null;
		Tabla = new Modelo.tablaSimbolos;
		
		Arbol = null;
		Arbol = new Modelo.arbol;
		
		Simulador = null;
		Simulador = new Modelo.simulacion;
		
		Tabla.crearTablaSimbolos();
		console.log(Tabla);
		Arbol.crearArbol();
		console.log(Arbol.inicio);
		
		
		if(!this.validarCodigo()){
			$("#codigo_salida").attr("href","data:text/html,");
			
			$("#codigo_salida").attr("href",$("#codigo_salida").attr("href")+"Inicio del codigo del algoritmo en pseudocodigo:<br>");
			$("#codigo_salida").attr("href",$("#codigo_salida").attr("href")+"<div style='background-color:#cacaca'>");
			Simulador.generarPseudocodigo(Arbol.inicio);
			$("#codigo_salida").attr("href",$("#codigo_salida").attr("href")+"</div>");
			$("#codigo_salida").attr("href",$("#codigo_salida").attr("href")+"Fin del codigo del algoritmo.<br>");
			
			
			$("#codigo_salida").attr("href",$("#codigo_salida").attr("href")+"Inicio del codigo del algoritmo en C++:<br>");
			$("#codigo_salida").attr("href",$("#codigo_salida").attr("href")+"<div style='background-color:#cacaca'>");
			$("#codigo_salida").attr("href",$("#codigo_salida").attr("href")+"#include &lt;iostream.h\&gt;<br>");
			$("#codigo_salida").attr("href",$("#codigo_salida").attr("href")+"int main(){<br>");
			Simulador.generarCpp(Arbol.inicio);
			$("#codigo_salida").attr("href",$("#codigo_salida").attr("href")+"}<br>");
			$("#codigo_salida").attr("href",$("#codigo_salida").attr("href")+"</div>");
			$("#codigo_salida").attr("href",$("#codigo_salida").attr("href")+"Fin del codigo del algoritmo.<br>");
			
			
			
			
			
			$("#codigo_salida").attr("href",$("#codigo_salida").attr("href")+"Inicio del codigo del algoritmo en Ñ#	:<br>");
			$("#codigo_salida").attr("href",$("#codigo_salida").attr("href")+"<div style='background-color:#cacaca'>");
			$("#codigo_salida").attr("href",$("#codigo_salida").attr("href")+"ALGORITMO ModGrafiCode<br>");
			
			var inicioAux = Arbol.inicio;
			
			if(inicioAux instanceof Modelo.Definicion){
				$("#codigo_salida").attr("href",$("#codigo_salida").attr("href")+"VAR<br>");
				
				do{
					$("#codigo_salida").attr("href",$("#codigo_salida").attr("href")+"ENTERO "+inicioAux.variable+"<br>");
					
					inicioAux = inicioAux.nodoSig;

				}while(inicioAux instanceof Modelo.Definicion);
				
			}
			
			$("#codigo_salida").attr("href",$("#codigo_salida").attr("href")+"INICIO<br>");
			Simulador.generarN(inicioAux);
			$("#codigo_salida").attr("href",$("#codigo_salida").attr("href")+"FIN<br>");
			$("#codigo_salida").attr("href",$("#codigo_salida").attr("href")+"</div>");
			$("#codigo_salida").attr("href",$("#codigo_salida").attr("href")+"Fin del codigo del algoritmo.<br>");
			
		}else{
			$("#codigo_salida").attr("href","data:text/html,Mientras halla errores en los bloques no se puede generar codigo");
		}
		
		
	
	},
	 
	 
	crearSortable: function(bloque){
		
		$(bloque).removeClass("sortable"),
		
		$(bloque).addClass("sortable"),
		
		$(bloque).sortable({
			revert: true,
			placeholder:'higlight',
			connectWith: [".sortable"],
		 	forcePlaceholderSize:true,
  			receive: function(event,ui) {
				
				if($(newItem).attr("id")===undefined){
					$(newItem).attr("id",enumerador.id);
					Controlador.revisarBloqueNuevo($(newItem));
					enumerador.agregarBloque();
				}else{
					Controlador.asignarNivel(newItem);
					if(newItem[0].parentElement.id!="area_trabajo"){
			
						Vista.incrementoSentencias(newItem);

					}
				}
				
			},
				
			beforeStop: function (event, ui) { 
				newItem = ui.item;
			},
			
			remove: function (event, ui) { 
				
				if(event.target.id!="area_trabajo"){
					Vista.incrementoSentencias(event.target.firstChild);
				}
				
			},
			stop : function (event, ui) { 
				
				
				
			},			
		});
		
	},
	
	crearDroppable: function(bloque){
		$(bloque).droppable({
			accept: ".drag_op",
			hoverClass: "higlight",
      		drop: function( event, ui ) {
				if(Vista.buscarDiv(this,".operador_logico")!=false)
				Vista.buscarDiv(this,".operador_logico").remove();
				Vista.buscarDiv(this,".input_op").attr("style","display:none;");
				clon = $(ui.draggable).clone();
				$(this).append(clon);
				clon.attr("id",enumerador.id);
				enumerador.agregarBloque();
				Controlador.revisarBloqueNuevo(clon);
			}
    	});
	},
	
	crearDroppable2: function(bloque){		
		$(bloque).droppable({
			accept: ".drag_opm",
			hoverClass: "higlight",
      		drop: function( event, ui ) {
				if(Vista.buscarDiv(this,".operador_mate")!=false)
				Vista.buscarDiv(this,".operador_mate").remove();
				Vista.buscarDiv(this,".input_ph").attr("style","display:none;");
				clon = $(ui.draggable).clone();
				clon.attr("id",enumerador.id);
				enumerador.agregarBloque();
				bloque.append(clon);
				Controlador.revisarBloqueNuevo(clon);
			}
    	});	
	},
	
	crearDraggable: function(){
		
		$( ".drag" ).draggable({
			connectToSortable: ".sortable",
			helper: "clone",
			revert: "invalid",
			opacity: 0.5,
			containment:"#contenido"
		});
		
		$( ".drag_op" ).draggable({
			helper: "clone",
			opacity: 0.4,
			revert: "invalid",
			containment:"#contenido"
		});
	
		$( ".drag_opm" ).draggable({
			helper: "clone",
			opacity: 0.4,
			revert: "invalid",
			containment:"#contenido"
		});		
			
	},
	
	crearBasurero: function (){
		$("#basurero").droppable({
			accept: ".borrable",
			tolerance: "pointer",
			drop: function(ev, ui) {
				$(this).removeClass("eliminar");
				$(this).addClass("basurero");
				$(ui.draggable).remove();
				//$(".higlight").remove();
				$("#info_salida").attr("value",$("#info_salida").attr("value")+"Se eliminó un bloque.\n");
			},
			over: function(ev, ui) {
				$(this).removeClass("basurero");
				$(this).addClass("eliminar");
			},
			out: function(ev, ui) {
				$(this).addClass("basurero");
			}	
		});
	},
	
	
	numeradorBloque: function(inicio){
		this.id=inicio;
		
		this.agregarBloque=function(){this.id++;}
	},
	
	asignarNivel: function(bloque){
		var clases = bloque[0].className.split(" ");
		if(bloque[0].parentElement.id=="area_trabajo"){

			switch (clases[0]){
				case "sentencia_general_if":
					nivel=Vista.buscarDiv(bloque,".sen_med2_if");
					nivel.attr("nivel","1");
					nivel.attr("padre",bloque[0].id);
					break;
					
				case "sentencia_general_rh":
					nivel=Vista.buscarDiv(bloque,".sen_med2_rh");
					nivel.attr("nivel","1");
					nivel.attr("padre",bloque[0].id);
					break;
				
				case "sentencia_general_ph":
					nivel=Vista.buscarDiv(bloque,".sen_med2_ph");
					nivel.attr("nivel","1");
					nivel.attr("padre",bloque[0].id);
					break;
					
				case "sentencia_general_m":
					nivel=Vista.buscarDiv(bloque,".sen_med2_m");
					nivel.attr("nivel","1");
					nivel.attr("padre",bloque[0].id);
					break;
				case "sentencia_general_1if_else":
					nivel=Vista.buscarDiv(bloque,".sen_med2_if_else");
					nivel.attr("nivel","1");
					nivel.attr("padre",bloque[0].id);
					nivel=Vista.buscarDiv(bloque,".sen_medos_if_else");
					nivel.attr("nivel","1");
					nivel.attr("padre",bloque[0].id);
					break;
				
			}
			
		}else{
			
			switch (clases[0]){
				case "sentencia_general_if":
					nivel=Vista.buscarDiv(bloque,".sen_med2_if");
					nivel.attr("nivel",(parseInt($(bloque[0].parentElement).attr("nivel"))+1));
					nivel.attr("padre",bloque[0].id);
					break;
					
				case "sentencia_general_rh":
					nivel=Vista.buscarDiv(bloque,".sen_med2_rh");
					nivel.attr("nivel",(parseInt($(bloque[0].parentElement).attr("nivel"))+1));
					nivel.attr("padre",bloque[0].id);
					break;
					
				case "sentencia_general_ph":
					nivel=Vista.buscarDiv(bloque,".sen_med2_ph");
					nivel.attr("nivel",(parseInt($(bloque[0].parentElement).attr("nivel"))+1));
					nivel.attr("padre",bloque[0].id);
					break;
					
				case "sentencia_general_m":
					nivel=Vista.buscarDiv(bloque,".sen_med2_m");
					nivel.attr("nivel",(parseInt($(bloque[0].parentElement).attr("nivel"))+1));
					nivel.attr("padre",bloque[0].id);
					break;
					
				case "sentencia_general_1if_else":
					nivel=Vista.buscarDiv(bloque,".sen_med2_if_else");
					nivel.attr("nivel",(parseInt($(bloque[0].parentElement).attr("nivel"))+1));
					nivel.attr("padre",bloque[0].id);
					nivel=Vista.buscarDiv(bloque,".sen_medos_if_else");
					nivel.attr("nivel",(parseInt($(bloque[0].parentElement).attr("nivel"))+1));
					nivel.attr("padre",bloque[0].id);
					break;
				
			}
			
		}
	},
	
	revisarBloqueNuevo : function (bloque){
		
		var clases = bloque[0].className.split(" ");

		$(bloque[0]).addClass("borrable");
		
		

		switch (clases[0]){
			
			case "definicion":
				$("#info_salida").attr("value",$("#info_salida").attr("value")+"Se agregó un bloque Definición.\n");
				inputDef = Vista.buscarDiv(bloque,":input");
				$(inputDef[0]).attr("name","def");
				inputDef[0].addEventListener("change",Vista.actualizarVariables,false);
				inputDef[0].addEventListener("keypress",Vista.validarLetras,false);
				break;
					
			case "asignacion":
				$("#info_salida").attr("value",$("#info_salida").attr("value")+"Se agregó un bloque Asignación.\n");
				input = Vista.buscarDiv(bloque,":input");
				selectAsig = input[0];
				textAsig= input[1];
				$(selectAsig).attr("name","asig");
				Vista.cargarLista();
				textAsig.addEventListener("keypress",Vista.validarExpr,false);
				textAsig.addEventListener("change",Vista.compararExpr,false);
				Controlador.crearDroppable2(Vista.buscarDiv(bloque,".fantasma"));
				break;
				
				
			case "entrada":
				$("#info_salida").attr("value",$("#info_salida").attr("value")+"Se agregó un bloque Entrada.\n");
				selectEntr = Vista.buscarDiv(bloque,":input");
				$(selectEntr[1]).attr("name","asig");
				Vista.cargarLista();
				break;
				
			case "salida":
				$("#info_salida").attr("value",$("#info_salida").attr("value")+"Se agregó un bloque Salida.\n");
				selectSali =Vista.buscarDiv(bloque,":input");
				$(selectSali[0]).attr("name","asig");
				Vista.cargarLista();
				break;
				
				
			case "operador_logico":
				$("#info_salida").attr("value",$("#info_salida").attr("value")+"Se agregó un Operador Lógico.\n");
				$(bloque[0]).addClass($(bloque)[0].parentElement.className.split(" ")[1]);
				x=Vista.buscarDiv(bloque,".borrar");
				$(x).attr("style","display:block");
				$(x)[0].addEventListener("click",Vista.eliminarOp,false);
				
				input = Vista.buscarDiv(bloque,":input");
				
				
				for (i=0; i<input.length;i++){
					$(input[i]).attr("name","op");
					input[i].addEventListener("keypress",Vista.validarMixto,false);
					input[i].addEventListener("change",Vista.compararVariables,false);
				}
				
				break;
				
			case "operador_mate":
				$("#info_salida").attr("value",$("#info_salida").attr("value")+"Se agregó un Operador Matemático.\n");
				x=Vista.buscarDiv(bloque,".borrar");
				$(x).attr("style","display:block");
				$(x)[0].addEventListener("click",Vista.eliminarOpM,false);
				
				input = Vista.buscarDiv(bloque,":input");
				
				for (i=0; i<input.length;i++){
					$(input[i]).attr("name","op");
					input[i].addEventListener("keypress",Vista.validarMixto,false);
					input[i].addEventListener("change",Vista.compararVariables,false);
				}
				break;	
			
			
			case "sentencia_general_if":
				$("#info_salida").attr("value",$("#info_salida").attr("value")+"Se agregó una condición Si.\n");
				$(bloque).css("height",140);
				$(Vista.buscarDiv(bloque,".sen_med2_if")).css("height",80);
				$(Vista.buscarDiv(bloque,".sen_med_if")).css("height",80);
				var fant=$(Vista.buscarDiv(bloque,".fant"));
				for(i=0;i<fant.length;i++){
					$(fant[i]).addClass($(bloque)[0].id);
				}
				
				var lista= Vista.buscarDiv(bloque,":input");
				lista[0].addEventListener("change",Vista.agregarDiv,false);
				Controlador.crearDroppable(Vista.buscarDiv(bloque,".fant"));
				Controlador.crearSortable(Vista.buscarDiv(bloque,".sen_med2_if"));
				Controlador.asignarNivel(bloque);
				break;
				
			case "sentencia_general_rh":
				$("#info_salida").attr("value",$("#info_salida").attr("value")+"Se agregó un ciclo Haga-Mientras.\n");
				$(bloque).css("height",140);
				$(Vista.buscarDiv(bloque,".sen_med2_rh")).css("height",80);
				$(Vista.buscarDiv(bloque,".sen_med_rh")).css("height",80);
				var fant=$(Vista.buscarDiv(bloque,".fant"));
				for(i=0;i<fant.length;i++){
					$(fant[i]).addClass($(bloque)[0].id);
				}
				var lista= Vista.buscarDiv(bloque,":input");
				lista[0].addEventListener("change",Vista.agregarDiv,false);
				Controlador.crearDroppable(Vista.buscarDiv(bloque,".fant"));
				Controlador.crearSortable(Vista.buscarDiv(bloque,".sen_med2_rh"));	
				Controlador.asignarNivel(bloque);
				break;
				
			case "sentencia_general_m":
				$("#info_salida").attr("value",$("#info_salida").attr("value")+"Se agregó un ciclo Mientras.\n");
				$(bloque).css("height",140);
				$(Vista.buscarDiv(bloque,".sen_med2_m")).css("height",80);
				$(Vista.buscarDiv(bloque,".sen_med_m")).css("height",80);
				var fant=$(Vista.buscarDiv(bloque,".fant"));
				for(i=0;i<fant.length;i++){
					$(fant[i]).addClass($(bloque)[0].id);
				}
				var lista= Vista.buscarDiv(bloque,":input");
				lista[0].addEventListener("change",Vista.agregarDiv,false);
				Controlador.crearDroppable(Vista.buscarDiv(bloque,".fant"));
				Controlador.crearSortable(Vista.buscarDiv(bloque,".sen_med2_m"));
				Controlador.asignarNivel(bloque);			
				break;
				
				
			case "sentencia_general_ph":
				$("#info_salida").attr("value",$("#info_salida").attr("value")+"Se agregó un ciclo Para-Hasta.\n");
				$(bloque).css("height",140);
				$(Vista.buscarDiv(bloque,".sen_med2_ph")).css("height",80);
				$(Vista.buscarDiv(bloque,".sen_med_ph")).css("height",80);
				Controlador.crearSortable(Vista.buscarDiv(bloque,".sen_med2_ph"));
				
				var inputs = Vista.buscarDiv(bloque,":input");
				$(inputs[0]).attr("name","asig");
				Vista.cargarLista();
				
				inputs[1].addEventListener("keypress",Vista.validarNumero,false);
				inputs[2].addEventListener("keypress",Vista.validarNumero,false);
				Controlador.asignarNivel(bloque);
				
				break;
				
			case "sentencia_general_1if_else":
				$("#info_salida").attr("value",$("#info_salida").attr("value")+"Se agregó una condición Si-No.\n");
				$(bloque).css("height",253);
				$(Vista.buscarDiv(bloque,".sen_med_if_else")).css("height",80);
				$(Vista.buscarDiv(bloque,".sen_med2p_if_else")).css("height",80);
				$(Vista.buscarDiv(bloque,".sen_med2_if_else")).css("height",80);
				$(Vista.buscarDiv(bloque,".sen_medos_if_else")).css("height",80);
				var fant=$(Vista.buscarDiv(bloque,".fant"));
				for(i=0;i<fant.length;i++){
					$(fant[i]).addClass($(bloque)[0].id);
				}
				Controlador.crearDroppable(Vista.buscarDiv(bloque,".fant"));
				var lista= Vista.buscarDiv(bloque,":input");
				lista[0].addEventListener("change",Vista.agregarDiv,false);
				Controlador.crearSortable(Vista.buscarDiv(bloque,".sen_med2_if_else"));
				Controlador.crearSortable(Vista.buscarDiv(bloque,".sen_medos_if_else"));
				Controlador.asignarNivel(bloque);
				break;			
				
			case "escribir":
				$("#info_salida").attr("value",$("#info_salida").attr("value")+"Se agregó un bloque Salida.\n");
				break;
				
			case "escribir_salida":
				$("#info_salida").attr("value",$("#info_salida").attr("value")+"Se agregó un bloque Salida.\n");
				selectSali =Vista.buscarDiv(bloque,":input");
				$(selectSali[1]).attr("name","asig");
				Vista.cargarLista();
				break;

			default:
				console.log("bloque no identificado.");
				break;
				
			
		}
		
		if(bloque[0].parentElement.id!="area_trabajo" && (clases[0]!="operador_logico" && clases[0]!="operador_mate")){
			
			Vista.incrementoSentencias(bloque);

		}
		
		
	}
	
	
}