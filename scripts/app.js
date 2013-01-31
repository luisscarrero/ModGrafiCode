/**************************
* Aplicacion
**************************/
$(document).ready(function(){
	
	enumerador= new Controlador.numeradorBloque(1);
	
	Vari = new Modelo.Variables;
	
	
	$("#basurero").droppable({
		accept: ".borrable",
		tolerance: "pointer",
		drop: function(ev, ui) {
			$(this).removeClass("eliminar");
			$(this).addClass("basurero");
			$(ui.draggable).remove();
			$(".higlight").remove();
			$("#info").append("<br>Se elimino un bloque.");
		},
		over: function(ev, ui) {
			$(this).removeClass("basurero");
			$(this).addClass("eliminar");
		},
		out: function(ev, ui) {
			$(this).addClass("basurero");
		}	
	});
		
		
	$( ".drag" ).draggable({
		connectToSortable: ".sortable",
		helper: "clone",
		revert: "invalid",
		opacity: 0.7,
		containment:"#contenido"
	});
		
	$( ".drag_op" ).draggable({
		helper: "clone",
		revert: "invalid",
		containment:"#contenido",
	});
	
	$( ".drag_opm" ).draggable({
		helper: "clone",
		revert: "invalid",
		containment:"#contenido",
	});
	
	Controlador.crearSortable($( "#area_trabajo" )),
		
				
	$( "ul, li" ).disableSelection();
				
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
		
		this.EsOperadorLogico = function (){
			if(this.tipoOperador == "suma" && this.tipoOperador == "resta" && this.tipoOperador == "multi" && this.tipoOperador == "divi"){
				return false;
			}else{
				return true;
			}
		}
	},
	
	
	Entrada: function (id,sig,hij,variable,valor){
		
		Modelo.Bloque.call(this,id,sig,hij);
		this.variable = variable;
		this.valor = valor;
	},
	
	
	Salida : function (id,sig,hij,variable){
		
		Modelo.Bloque.call(this,id,sig,hij);
		this.variable = variable
	},
	
	
	Sentencia : function (){
		
		this.tipo = tipo;
		
		
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
		
		function eliminarVariable(){
		}
	
	}

}
Modelo.Definicion.prototype = new Modelo.Bloque;
Modelo.Operador.prototype = new Modelo.Bloque;
Modelo.Entrada.prototype = new Modelo.Bloque;
Modelo.Salida.prototype = new Modelo.Bloque;

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
				$("#info").append("<br>Variable Aceptada.");
			}else{
				$("#info").append("<br>Ingrese una variable valida.");
				$(input).attr("value","");
			}
		}
	
		
		
	},

	incrementoSentencias:function(objeto){

		var totalHeight=0;
		

		for(i=1;i<$(objeto)[0].parentElement.childElementCount+1;i++){
			
			totalHeight+=parseInt($(objeto)[0].parentElement.childNodes[i].clientHeight);
			
		}
		
		a = $("#"+$($(objeto)[0].parentElement).attr("padre"));
		console.log($(objeto)[0].parentElement);
		if(a[0].className.indexOf("sentencia_general_if")==0){
			b=Vista.buscarDiv(a,".sen_med_if");
			c=Vista.buscarDiv(a,".sen_med2_if");
		}
		
		if(a[0].className.indexOf("sentencia_general_ph")==0){
			b=Vista.buscarDiv(a,".sen_med_ph");
			c=Vista.buscarDiv(a,".sen_med2_ph");
		}
		
		if(a[0].className.indexOf("sentencia_general_rh")==0){
			b=Vista.buscarDiv(a,".sen_med_rh");
			c=Vista.buscarDiv(a,".sen_med2_rh");
		}
		
		if(a[0].className.indexOf("sentencia_general_m")==0){
			b=Vista.buscarDiv(a,".sen_med_m");
			c=Vista.buscarDiv(a,".sen_med2_m");
		}
		
		
		
		a[0].style.height =(totalHeight+120);
		b[0].style.height =(totalHeight+60);
		c[0].style.height =(totalHeight+60);
		
		
		
		if($(objeto[0].parentElement).attr("nivel")>1){
			Vista.incrementoSentencias($("#"+$(objeto[0].parentElement).attr("padre")));
		}

	},


	entradaSoloNumeros: function(evt){
        var keyPressed = (evt.which) ? evt.which : event.keyCode
        return !(keyPressed > 31 && (keyPressed < 48 || keyPressed > 57));
     },
	 
	 agregarDiv: function(ob){
		 
		 parent1 = ob.target.parentElement.parentElement.parentElement;
		 parent2 = ob.target.parentElement.parentElement;
		 if(ob.target.selectedOptions[0].value!='--'){			 
			 parent1.style.height= parent1.clientHeight+28;
			 parent2.style.height=parent2.clientHeight+28;
			 drop=Vista.buscarDiv(parent2,".drop2");
			 $(drop).show();
			 	 
		 }else{
			 $(parent2.childNodes[3]).remove();
			 parent1.style.height= parent1.clientHeight-28;
			 parent2.style.height=parent2.clientHeight-28;
			 			 
		 }
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
}



/*************************
* Controlador
**************************/

Controlador = {
	
	
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
			
			/*update: function(event, ui) {
				console.log($(".sortable").length);
				var result = $(this).sortable('toArray');
				console.log(result);
			}*/				
		});
		
	},
	
	crearDroppable: function(bloque){
		$(bloque).droppable({
			accept: ".drag_op",
      		drop: function( event, ui ) {
				Vista.buscarDiv(this,".input_op").attr("style","display:none;");
				clon = $(ui.draggable).clone();
				Vista.buscarDiv(this,".fant").append(clon);
				Controlador.revisarBloqueNuevo(clon);
			},
			/*out: function( event, ui ) {
				Vista.buscarDiv(this,".input_op").attr("style","display:block;");
			}*/
    	});
	},
	
	crearDroppable2: function(bloque){		
		$(bloque).droppable({
			accept: ".drag_opm",
      		drop: function( event, ui ) {
				Vista.buscarDiv(this,".input_ph").attr("style","display:none;");
				clon = $(ui.draggable).clone();
				bloque.append(clon);
				Controlador.revisarBloqueNuevo(clon);
			},
			/*out: function( event, ui ) {
				Vista.buscarDiv(this,".input_op").attr("style","display:block;");
			}*/
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
				
			}
			
		}
	},
	
	revisarBloqueNuevo : function (bloque){
		
		var clases = bloque[0].className.split(" ");

		$(bloque[0]).addClass("borrable");
		if(bloque[0].parentElement.id!="area_trabajo" && (clases[0]!="operador_logico" && clases[0]!="operador_mate")){
			
			Vista.incrementoSentencias(bloque);

		}
		

		switch (clases[0]){
			
			case "definicion":
				$("#info").append("<br>Se agrego un bloque de definicion.");
				console.log("agrego bloque def.");
				inputDef = Vista.buscarDiv(bloque,":input");
				$(inputDef[0]).attr("name","def");
				inputDef[0].addEventListener("change",Vista.actualizarVariables,false);
				inputDef[0].addEventListener("keypress",Vista.validarLetras,false);
				break;
					
			case "asignacion":
				$("#info").append("<br>Se agrego un bloque de asignacion.");
				console.log("agrego bloque asig.");
				input = Vista.buscarDiv(bloque,":input");
				selectAsig = input[0];
				textAsig= input[1];
				$(selectAsig).attr("name","asig");
				Vista.cargarLista();
				textAsig.addEventListener("keypress",Vista.validarMixto,false);
				textAsig.addEventListener("change",Vista.compararVariables,false);
				Controlador.crearDroppable2(Vista.buscarDiv(bloque,".fantasma"));
				break;
				
				
			case "entrada":
				$("#info").append("<br>Se agrego un bloque de entrada.");
				console.log("agrego bloque entr.");
				selectEntr = Vista.buscarDiv(bloque,":input");
				$(selectEntr[0]).attr("name","asig");
				Vista.cargarLista();
				break;
				
			case "salida":
				$("#info").append("<br>Se agrego un bloque de salida.");
				console.log("agrego bloque sali.");
				selectSali =Vista.buscarDiv(bloque,":input");
				$(selectSali[0]).attr("name","asig");
				Vista.cargarLista();
				break;
				
				
			case "operador_logico":
				$("#info").append("<br>Se agrego un operador logico.");
				console.log("agrego bloque logico");
				
				input = Vista.buscarDiv(bloque,":input");
				
				
				for (i=0; i<input.length;i++){
					$(input[i]).attr("name","op");
					input[i].addEventListener("keypress",Vista.validarMixto,false);
					input[i].addEventListener("change",Vista.compararVariables,false);
				}
				
				$(bloque).draggable({
					revert: "invalid",
					containment:"#contenido",
				});
				
				break;
			case "operador_mate":
				$("#info").append("<br>Se agrego un operador matematico.");
				console.log("agrego un bloque matematico");
				
				input = Vista.buscarDiv(bloque,":input");
				
				for (i=0; i<input.length;i++){
					$(input[i]).attr("name","op");
					input[i].addEventListener("keypress",Vista.validarMixto,false);
					input[i].addEventListener("change",Vista.compararVariables,false);
				}
				break;	
			
			
			case "sentencia_general_if":
				$("#info").append("<br>Se agrego una sentencia SI.");
				console.log("agrego un bloque de sentencia");
				var lista= Vista.buscarDiv(bloque,":input");
				lista[0].addEventListener("change",Vista.agregarDiv,false);
				Controlador.crearDroppable(Vista.buscarDiv(bloque,".sen_sup_if_tri_gran"));
				Controlador.crearSortable(Vista.buscarDiv(bloque,".sen_med2_if"));
				Controlador.asignarNivel(bloque);
				break;
				
			case "sentencia_general_rh":
				console.log("Agrego una sentencia Repita-Hasta");
				var lista= Vista.buscarDiv(bloque,":input");
				lista[0].addEventListener("change",Vista.agregarDiv,false);
				Controlador.crearDroppable(Vista.buscarDiv(bloque,".sen_sup_rh_tri_gran"));
				Controlador.crearSortable(Vista.buscarDiv(bloque,".sen_med2_rh"));	
				Controlador.asignarNivel(bloque);
				break;
				
			case "sentencia_general_m":
				console.log("Agrego una sentencia Mientras");
				var lista= Vista.buscarDiv(bloque,":input");
				lista[0].addEventListener("change",Vista.agregarDiv,false);
				Controlador.crearDroppable(Vista.buscarDiv(bloque,".sen_sup_m_tri_gran"));
				Controlador.crearSortable(Vista.buscarDiv(bloque,".sen_med2_m"));
				Controlador.asignarNivel(bloque);			
				break;
				
				
			case "sentencia_general_ph":
				console.log("Agrego una sentencia Repita");
				Controlador.crearSortable(Vista.buscarDiv(bloque,".sen_med2_ph"));
				Controlador.crearDroppable2(Vista.buscarDiv(bloque,".fantasma"));
				va_num=Vista.buscarDiv(bloque,":input");
				va_num[0].addEventListener("keypress",Vista.validarNumero,false);
				Controlador.asignarNivel(bloque);
				break;

			default:
				console.log("bloque no identificado.");
				break;
				
			
		}
		
		
	}
	

	
}