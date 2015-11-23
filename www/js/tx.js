/*
 cordova create taximetro com.e2w.taximetro Taximetro
 cordova platform add android
 cordova plugin add cordova-plugin-geolocation
 cordova plugin add cordova-plugin-network-information
 cordova plugin de añadir cordova-plugin-inappbrowser
 cordova plugin add cordova-plugin-dialogs

*/

var lat= 0, lon= 0, is_mapa= true, vr_unidad= 78, unidades_tot= 0, tiempot= 0, salir= false, pos_json= 1; 
var distm= 0, dist_a= 0, unidades_dist= 0, unidades_time= 0, map= document.getElementById("mapa"); 
var pap= 700, nf= 1900, terminal= 500, aeropuerto= 3900;
var is_pap= false, is_nf= false, is_terminal= false, is_aeropuerto= false;
var storage;

var app = {
	
	ini: function(){
		this.isStorage();
		this.eventos();
	},
	eventos: function(){
		document.addEventListener('deviceready', this.carga, false);
		$("#btn_iniciar").click(function(event) {
	        app.cordenada("app.cargaInicio();",false);
	    });
        $("#exit_app").click(function(event) {
            app.exit();
        });

	},
	carga: function(){
        /*app.conexion();*/
		/*$('.slider').slider({
		    indicators: false,
		    height: 50,
		    transition: 300,
		    interval: 2000
		});
		$(".slider").show();*/
	},
	isStorage: function(){
        try {
            if (localStorage.getItem) {
                storage = localStorage;
            }
        } catch(e) {
            storage = {};
        }
        /*storage.removeItem('taximetro');*/
        storage.setItem('taximetro_time',0);
        storage.setItem('taximetro_marcadores',"");
        storage.setItem('taximetro',"");
        
    },
    /*con la formula de Haversine*/
    distancia: function (lat1, lon1, lat2, lon2, med){
        rad = function(x) {return x*Math.PI/180;}
        var R     = 6378.137;                     //Radio de la tierra en km
        var dLat  = rad( lat2 - lat1 );
        var dLong = rad( lon2 - lon1 );
        var a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(dLong/2) * Math.sin(dLong/2);
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        var d = R * c;
        med == 'm' ? reto = d * 1000 : reto = d;
        //return reto.toFixed(2);                      //Retorna tres decimales
        return reto;                      //Retorna tres decimales
    },
    setDistancia: function(d){
        /*console.log("setDistancia");*/
        /*console.log(tiempot+" .. "+dat_act+" .. "+distm+" .. "+d);*/
        if (d == 0) {
            tiempot += 5;
        } else{
            totd = distm - dist_a;
            if (totd > 400){
                dist_a = distm;
                is_mapa = true;
            }
            distm += d;
        };
        /*console.log(tiempot+" .. "+dat_act+" .. "+distm+" .. "+d);*/
    },
    errcord: function(){
    	$("#contando").hide('fast');
        $("#btn_inicio").hide('fast');
        $("#no_se_pudo").show('slow');
    },
    setUnidadesDist: function(){
        unidades_dist = (parseInt(this.getDistancia()/105)+25);
    },
    setUnidadesTime: function(){
        unidades_time = parseInt( this.getTime() / 35 );
    },
    getUnidadesTime: function(){return unidades_time;},
    getUnidadesDist: function(){ return unidades_dist; },
    getTime: function(){return tiempot;},
    setLat: function(l){lat = l;},
    getLat: function(){return lat;},
    setLon: function(l){lon = l;},
    getLon: function(){return lon;},
    getDistancia: function(){return distm;},
    aobj: function(str){ return JSON.parse(str);},
    astring: function(obj){ return JSON.stringify(obj);},
    finalizar: function(){salir=true;},
    cordenada: function(f,d){
    	navigator.geolocation.getCurrentPosition(function(p){
    		if(d){
                dist = app.distancia(app.getLat(), app.getLon(), p.coords.latitude, p.coords.longitude, 'm');
                app.setDistancia(dist);
            }
            app.setLat(p.coords.latitude);
            app.setLon(p.coords.longitude);
            eval(f);
    	},this.errcord,{enableHighAccuracy: true});
    	/*{ maximumAge: 3000, timeout: 5000, enableHighAccuracy: true };*/
    },
    cargaInicio: function(){
        this.getMapa();
        $("#contando").fadeIn('slow');
        $("#no_se_pudo").hide('fast');
        $('#btn_inicio').hide('fast');
        /*setTimeout(this.newPos, 15000);*/
        setTimeout(this.newPos, 5000);
        this.setUnidadesDist();
        this.update();
    },
    newPos: function(){
        if(salir){
            return false;
        }else{
            app.cordenada('app.cargaNew();',true);
            /*setTimeout("newPos()",15000);*/
            /*setTimeout("this.newPos()",15000);*/
            if (!salir) {
            	setTimeout("app.newPos()",5000);
            }
        }
    },
    cargaNew: function(){
        /*pos_json ++;*/
        this.setUnidadesDist();
        this.setUnidadesTime();
        this.update();
        this.getMapa();
    },
    getMapa: function(){
        if (is_mapa) {
            dat_act = storage.getItem('taximetro');
            dato =  '"'+pos_json+'": {"lat":'+this.getLat()+',"lon":'+this.getLon()+',"dis": '+this.getDistancia()+'}';
            
            if (dat_act=="") {
                new_dato = dato;
            }else{
                new_dato = dat_act +", "+ dato;    
            }

            storage.setItem("taximetro",new_dato);
            
            datos = this.aobj("{"+storage.getItem('taximetro')+"}");
            marcadores = '';

            if (pos_json==1) {
                marcadores += "&markers=color:green|" + datos[pos_json].lat + "," + datos[pos_json].lon;
            }else{
                for (var i = 1; i <= pos_json; i++) {
                    if (i == 1) {
                        marcadores += "&markers=color:green|" + datos[i].lat + "," + datos[i].lon;
                    } else{
                        marcadores += "&markers=color:yellow|" + datos[i].lat + "," + datos[i].lon;
                    };
                }
            }            

            pos_json == 1 ? c_ = 1 : c_ = parseInt(pos_json/2) ;

            centro = datos[c_].lat+","+datos[c_].lon;

            d = app.distancia(datos[c_].lat,datos[c_].lon,this.getLat(),this.getLon(),'m');
            
            zoom = 10;

            if (140 > d) {
                zoom = 18;
            }else if(295 > d){
                zoom = 17;
            }else if(600 > d){
                zoom = 16;
            }else if(1150 > d){
                zoom = 15;
            }else if(2350 > d){
                zoom = 14;
            }else if(4700 > d){
                zoom = 13;
            }else if(9400 > d){
                zoom = 12;
            }else if(18800 > d){
                zoom = 11;
            }

            map.src = "http://maps.google.com/maps/api/staticmap?zoom="+zoom+"&size=600x400&center="+centro+marcadores+"&key=AIzaSyAcZI5nuZ2dAhKw7VV0e16nrlw4F5XL_-c"; 
            pos_json ++;
            is_mapa=false;
        }
    },
    update: function(){
        unidades_tot = app.getUnidadesTime() + app.getUnidadesDist();

        if (unidades_tot<50) {
            valor = 50 * vr_unidad;
        }else{
            valor = unidades_tot * vr_unidad;
        }

        if (is_aeropuerto) {
            valor += aeropuerto;
        }

        if (is_terminal) {
            valor += terminal;
        }

        if (is_nf) {
            valor += nf;
        }

        if (is_pap) {
            valor += pap;
        }


        $("#dt_cont_unidades_vr").html(unidades_tot);
        $("#dt_vr_total").html("$ "+ valor);
        /*setTimeout(this.update,15000);*/
        /*setTimeout(app.update,1000);*/
    },
    adicionales: function(op){
        ejecutar = 'if (is_'+op+') {$("#'+op+'").removeClass("orange-text");is_'+op+' = false;} else{ $("#'+op+'").addClass("orange-text"); is_'+op+' = true; };';
        eval(ejecutar);
        this.update();
    },
    carga_url: function(url){
        cordova.InAppBrowser.open(url, '_blank', 'location=yes');
    },
    exit: function(){
        navigator.notification.confirm("Esta seguro que desea cerrar el Taximetro", function(r){
            if (r==1) {
                navigator.app.exitApp();
            }
        }, "Taximetro", ["Aceptar","Cancelar"]);
    },







    conexion: function() {
        var networkState = navigator.connection.type;

        var states = {};
        states[Connection.UNKNOWN]  = 'Unknown connection';
        states[Connection.ETHERNET] = 'Ethernet connection';
        states[Connection.WIFI]     = 'WiFi connection';
        states[Connection.CELL_2G]  = 'Cell 2G connection';
        states[Connection.CELL_3G]  = 'Cell 3G connection';
        states[Connection.CELL_4G]  = 'Cell 4G connection';
        states[Connection.CELL]     = 'Cell generic connection';
        states[Connection.NONE]     = 'No network connection';

        alert('Connection type: ' + states[networkState]);
    }

};

app.ini();
