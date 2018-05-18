function soloLetras(e){
                key = e.keyCode || e.which;
                tecla = String.fromCharCode(key).toLowerCase();
                letras = " áéíóúabcdefghijklmnñopqrstuvwxyz";
                especiales = [8];

                tecla_especial = false
                for(var i in especiales){
                    if(key == especiales[i]){
                        tecla_especial = true;
                        break;
                    } 
                }

                if(letras.indexOf(tecla)==-1 && !tecla_especial)
                return false;
            }
          function valida(e){
                        tecla = (document.all) ? e.keyCode : e.which;

                        //Tecla de retroceso para borrar, siempre la permite
                        if (tecla==8){
                            return true;
                        }
                        
                    // Patron de entrada, en este caso solo acepta numeros
                        patron =/[0-9]/;
                        tecla_final = String.fromCharCode(tecla);
                        return patron.test(tecla_final);
                    } 
                        function soloLetras(e){
                key = e.keyCode || e.which;
                tecla = String.fromCharCode(key).toLowerCase();
                letras = " áéíóúabcdefghijklmnñopqrstuvwxyz";
                especiales = [8];

                tecla_especial = false
                for(var i in especiales){
                    if(key == especiales[i]){
                        tecla_especial = true;
                        break;
                    } 
                }

                if(letras.indexOf(tecla)==-1 && !tecla_especial)
                return false;
            }
            function Todos(e){
                key = e.keyCode || e.which;
                tecla = String.fromCharCode(key).toLowerCase();
                letras = " áéíóúabcdefghijklmnñopqrstuvwxyz1234567890,.;$<>\n";
                especiales = [8];

                tecla_especial = false
                for(var i in especiales){
                    if(key == especiales[i]){
                        tecla_especial = true;
                        break;
                    } 
                }

                if(letras.indexOf(tecla)==-1 && !tecla_especial)
                return false;
            }
function validaPlaca(e) {
key = e.keyCode || e.which; 
tecla = String.fromCharCode(key).toString();
 //Se define todo lo que se quiere que se muestre
caracter = "abcdefghijklmnñopqrstuvwxyz0123456789$.@-_;";
especiales = [8, 37, 39, 46, 6]; 

tecla_especial = false; 
for (var i in especiales) {
      if(key == especiales[i]) { 
    tecla_especial = true; 
     break; 
      }
} 
if(caracter.indexOf (tecla) == -1 && !tecla_especial){ 
    alert('Tecla no aceptada'); 
    return false; 
}
}