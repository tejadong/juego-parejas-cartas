document.addEventListener("DOMContentLoaded", pantallaPrincipal);

function pantallaPrincipal() {
    var start = document.getElementById("start");
    start.addEventListener("click", function() {
        var n = document.getElementById("numParejas").value;
        if (n >= 5 && n <= 20) {
            this.classList.add("ocultar");
            document.getElementById("juego").classList.remove("ocultar");
            document.getElementById("inicio").classList.add("ocultar");
            iniciarJuego();
        } else
            alert("El número de parejas debe ser como mínimo 5 y como máximo 20.");
    });
}

function iniciarJuego() {

    // FUNCIONES
        function HHtoSS(h) {
            var a = h.split(':');
            var miliSegundos = ((+a[0]) * 60 * 60 + (+a[1]) * 60 + (+a[2]));
            return miliSegundos;
        }

        // Función que añade ceros, para el reloj
        function LeadingZero(Time) {
            return (Time < 10) ? "0" + Time : + Time;
        }

        // Aleatoriza un array según el algoritmo de Fisher-Yates
        function fisher_yates(array){
            var i=array.length;
            while(i--){
                var j=Math.floor( Math.random() * (i+1) );
                var tmp=array[i];
                array[i]=array[j];
                array[j]=tmp;
            }
        }

        function aleatorio(inferior, superior) {
            return parseInt(inferior) + Math.round(Math.random() * (superior - inferior));
        }

        function generarPareja(numParejas) {
            var nuevaLista = new Array(numParejas*2);
            var i = 0;
            var numAleatorio = 0;

            do {
                numAleatorio = aleatorio(1, 40);
                if(nuevaLista.indexOf(numAleatorio) != -1){
                    continue;
                } else {
                    nuevaLista[i] = numAleatorio;
                    i++;
                    nuevaLista[i] = numAleatorio;
                }
                i++;
            } while(i < nuevaLista.length);

            fisher_yates(nuevaLista);
            return nuevaLista;
        }

        function cargarRanking() {
            if (localStorage.length > 0) {
                var l = [];
                var i = 0;
                var j = 0;

                // Lo hacemos así para evitar que añada un nulo cuando encuentre una entrada en el LS
                // que no empiece por game-
                do {
                    if (localStorage.key(i).substr(0, 5) == "game-") {
                        l[j] = JSON.parse(localStorage.getItem(localStorage.key(i)));
                        //l[j].nick = l[j].nick.substr(5, l[j].nick.length);
                        j++;
                    }
                    i++;
                } while(i<localStorage.length);

                if (l.length > 0) {
                    return l.sort(function(a, b) {
                        var resultado = b.parejas - a.parejas;
                        if ( resultado !== 0 ) { return resultado; }
                        resultado = a.intentos_fallidos - b.intentos_fallidos;
                        if ( resultado !== 0 ) { return resultado; }
                        resultado = a.tiempo - b.tiempo;
                        if ( resultado !== 0 ) { return resultado; }
                        return resultado;
                    });
                }
            }
            return null;
        }

        function guardarRanking(r) {
            localStorage.clear();
            for (var i=0, fin=r.length; i<fin; i++) {
                var item = JSON.parse(r[i]);
                localStorage.setItem("game-"+item.nick, r[i]);
            }
        }

        function comprobarDatosPartida() {
            var nombreActual;
            var usuarioActual = {
                "nick" : "vacio",
                "tiempo": HHtoSS(document.getElementById("reloj").innerHTML),
                "intentos_fallidos": parseInt(document.getElementById("intentos_fallidos").innerHTML),
                "intentos_correctos": parseInt(document.getElementById("intentos_correctos").innerHTML),
                "parejas": parseInt(cartas.length/2)
            };
            var listadoRanking = cargarRanking();

            if (listadoRanking !== null || listadoRanking.length < 5) {
                do {
                    nombreActual = prompt("Por favor, introduzca sus iniciales:", "***");
                } while (!/^[A-Za-z]{3}$/.test(nombreActual));
                usuarioActual.nick = nombreActual.toLocaleUpperCase();
                localStorage.setItem("game-"+nombreActual, JSON.stringify(usuarioActual));
            } else {
                var listadoNuevo = new Array(5);
                var sw = false;

                for (var i=0, fin=listadoRanking.length; i<fin; i++) {
                    var usuarioGuardado = listadoRanking[i];
                    if (!sw) {
                        if ((usuarioActual.tiempo < usuarioGuardado.tiempo &&
                            usuarioActual.intentos_fallidos < usuarioGuardado.intentos_fallidos &&
                            usuarioActual.parejas == usuarioGuardado.parejas) ||
                            (usuarioActual.parejas > usuarioGuardado.parejas)) {
                                sw = true;
                        }
                    }
                    listadoNuevo[i] = JSON.stringify(usuarioGuardado);
                }

                if (!sw)
                    document.getElementById("estado_juego").innerHTML += "<p>Lo sentimos, no has mejorado ninguna posicion del top 5.</p>";
                else {
                    do {
                        nombreActual = prompt("Por favor, introduzca sus iniciales: ", "***");
                    } while (!/^[A-Za-z]{3}$/.test(nombreActual));
                    usuarioActual.nick = nombreActual.toUpperCase();
                    listadoNuevo[listadoNuevo.length-1] = JSON.stringify(usuarioActual);
                     document.getElementById("estado_juego").innerHTML += "<p>Enorabuena, has mejorado el ranking.</p>";
                }
                guardarRanking(listadoNuevo);
            }
            dibujarTablaRanking();
        }

        function dibujarTablaRanking() {
            var panelRanking = document.getElementById("ranking");
            panelRanking.innerHTML = "";
            var r = cargarRanking();
            if (r !== null) {
                var tabla = "";
                tabla = '<table id="tablaRanking"><thead><tr><th class="text-left">Puesto</th><th class="text-left">Nick</th><th class="text-left">Tiempo</th><th class="text-left">Fallos</th><th>Parejas</th></tr></thead><tbody class="table-hover">';
                for (var i=0; i<r.length; i++) {
                    tabla += '<td class="text-left">'+(i+1)+'</td><td class="text-left">' + r[i].nick + '</td><td class="text-left">' + (new Date(r[i].tiempo*1000)).toUTCString().match(/(\d\d:\d\d:\d\d)/)[0] + '</td><td class="text-left">' + r[i].intentos_fallidos + '</td><td class="text-left">' + r[i].parejas + '</tr>';
                }
                tabla += '</tbody></table>';
                panelRanking.innerHTML += tabla;
            } else
                panelRanking.innerHTML = "<h1>Sin datos todavía</h1>";
        }

        function finalizaJuego(estado) {
            clearInterval(reloj);
            clearInterval(ccrono);
            document.getElementById("estado_juego").innerHTML = ("<p>Juego  terminado.</p><p>Comprobando ranking, espere por favor ...</p>");
            if (estado)
                gana.play();
            setTimeout(comprobarDatosPartida, 15000);
        }
    // FIN DE FUNCIONES

    // VARIABLES GLOBALES
        var cartas = generarPareja(document.getElementById("numParejas").value);
        var contenedor_cartas = document.getElementById("contenedor_cartas");
        var btnReiniciar = document.getElementById("btnReiniciar");
        var idCarta1 = null, idCarta2 = null;
        var intentos_fallidos = 0;
        var intentos_correctos = 0;
        var finJuego = false;
        // obteneos la fecha actual
        var inicio = new Date().getTime();
        var reloj = setInterval(function(){
            var actual = new Date().getTime();
            // obtenemos la diferencia entre la fecha actual y la de inicio
            var diff=new Date(actual-inicio);
            document.getElementById("reloj").innerHTML = LeadingZero(diff.getUTCHours())+":"+LeadingZero(diff.getUTCMinutes())+":"+LeadingZero(diff.getUTCSeconds());
        }, 1000);
        var punto = new Audio("sonidos/punto.mp3");
        var fallo = new Audio("sonidos/fallo.mp3");
        var start = new Audio("sonidos/start.mp3");
        var crono = new Audio("sonidos/crono.mp3");
        var gana = new Audio("sonidos/gana.mp3");
        punto.volume = 0.2;
        fallo.volume = 0.2;
        start.volume = 0.2;
        crono.volume = 0.2;
        gana.volume = 0.2;
        start.play();
        var ccrono = setInterval(function(){
            crono.play();
        }, 60000);

    // FIN DE VARIABLES GLOBALES

    btnReiniciar.addEventListener("click", function(){
       if (confirm("¿Está seguro que desea reiniciar el juego?"))
           location.reload();
    });

    dibujarTablaRanking();

    for (var i=0, fin=cartas.length; i<fin; i++) {
        var contenedorCarta = document.createElement("div");
        contenedorCarta.setAttribute("id", "contenedorCarta_"+cartas[i]+"_"+i);
        contenedorCarta.classList.add("efecto1");
        var carta = document.createElement("img");
        carta.setAttribute("id", "carta_"+cartas[i]+"_"+i);
        carta.src = "img/"+cartas[i]+".jpg";
        carta.classList.add("ocultar");
        contenedorCarta.appendChild(carta);
        contenedor_cartas.appendChild(contenedorCarta);

        carta.onclick = null;

        contenedorCarta.onclick = function() {
            var idCarta = "#"+this.id+" img";
            document.querySelector(idCarta).classList.add("mostrar");
            document.querySelector(idCarta).classList.remove("ocultar");
            this.classList.remove("efecto3");
            this.classList.add("efecto2");

            if (idCarta1 === null) {
                idCarta1 = document.querySelector(idCarta).id;
                numCarta1 = idCarta1.split("_")[1];
            } else if (idCarta2 === null ) {
                idCarta2 = document.querySelector(idCarta).id;
                // comprueba que no se haga click dos veces sobre la misma carta
                if (idCarta2 == idCarta1) {
                    numCarta2 = null;
                    idCarta2 = null;
                } else
                    numCarta2 = idCarta2.split("_")[1];
            }

            if (numCarta1 !== null && numCarta2 !== null) {
                document.getElementById("contenedor_cartas").classList.add("desactivar");
                if (numCarta1 == numCarta2) {
                    punto.play();
                    function bien(carta1, carta2) {
                        return function() {
                            document.getElementById(carta1).parentNode.onclick = null;
                            document.getElementById(carta2).parentNode.onclick = null;
                            document.getElementById("contenedor_cartas").classList.remove("desactivar");
                        };
                    }
                    document.getElementById(idCarta1).classList.add("correcto");
                    document.getElementById(idCarta2).classList.add("correcto");
                    setTimeout(bien(idCarta1,idCarta2), 1200);
                    intentos_correctos++;
                } else {
                    fallo.play();
                    function error(carta1, carta2) {
                        return function() {
                            document.getElementById(carta1).classList.remove("mostrar");
                            document.getElementById(carta1).classList.add("ocultar");
                            document.getElementById(carta2).classList.remove("mostrar");
                            document.getElementById(carta2).classList.add("ocultar");
                            document.getElementById("contenedor_cartas").classList.remove("desactivar");
                        };
                    }
                    setTimeout(error(idCarta1,idCarta2), 1200);
                    intentos_fallidos++;
                }

                function quitarEfecto(carta1, carta2) {
                    return function() {
                        document.getElementById(carta1).parentNode.classList.remove("efecto2");
                        document.getElementById(carta1).parentNode.classList.add("efecto3");
                        document.getElementById(carta2).parentNode.classList.remove("efecto2");
                        document.getElementById(carta2).parentNode.classList.add("efecto3");
                    };
                }
                setTimeout(quitarEfecto(idCarta1, idCarta2), 1200);

                idCarta1 = null;
                idCarta2 = null;
                numCarta1 = null;
                numCarta2 = null;
                document.getElementById("intentos_fallidos").innerHTML = intentos_fallidos;
                document.getElementById("intentos_correctos").innerHTML = intentos_correctos;

                var totalCartasCorrectas = document.getElementsByClassName("correcto");
                if (totalCartasCorrectas.length == fin) {
                    finalizaJuego(true);
                }
            }
        };
    }

}
