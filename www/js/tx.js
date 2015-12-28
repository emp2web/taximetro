/*
 cordova create taximetro com.e2w.taximetro Taximetro
 cordova platform add android

como saber la keystore ->
    keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android

clave api google maps e2wtaximetro -> 
    AIzaSyAu7nN72wwjKftZCA7Ckm2Wovv5QAOOj1Q

 cordova plugin add cordova-plugin-geolocation
 cordova plugin add cordova-plugin-network-information
 cordova plugin de añadir cordova-plugin-inappbrowser
 cordova plugin add cordova-plugin-dialogs
 cordova plugin add plugin.google.maps --variable API_KEY_FOR_ANDROID="AIzaSyAu7nN72wwjKftZCA7Ckm2Wovv5QAOOj1Q"

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
    eventos: function(){
        document.addEventListener('deviceready', this.carga, false);
        $("#btn_iniciar").click(function(event) {

            app.cordenada("app.cargaInicio();",false);
        });
        $("#exit_app").click(function(event) {
            app.exit();
        });

    },
    cordenada: function(f,d){
        navigator.geolocation.getCurrentPosition(function(p){
            if(d){
                dist = app.distancia(app.getLat(), app.getLon(), p.coords.latitude, p.coords.longitude, 'm');
                app.setDistancia(dist);
            }
            app.setLat(p.coords.latitude);
            app.setLon(p.coords.longitude);
            eval(f);
        },this.errcord,{maximumAge: 3000, timeout: 5000, enableHighAccuracy: true});
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
    },
    setLat: function(l){lat = l;},
    getLat: function(){return lat;},
    setLon: function(l){lon = l;},
    getLon: function(){return lon;},
    getDistancia: function(){return distm;},
    setUnidadesDist: function(){
        unidades_dist = (parseInt(this.getDistancia()/105)+25);
    },
    setUnidadesTime: function(){
        unidades_time = parseInt( this.getTime() / 35 );
    },
    getUnidadesTime: function(){return unidades_time;},
    getUnidadesDist: function(){ return unidades_dist; },
    getTime: function(){return tiempot;},
    exit: function(){
        navigator.notification.confirm("Esta seguro que desea cerrar el Taximetro", function(r){
            if (r==1) {
                navigator.app.exitApp();
            }
        }, "Taximetro", ["Aceptar","Cancelar"]);
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
    cargaInicio: function(){
        this.getMapa();
        $("#contando").fadeIn('slow');
        $("#no_se_pudo").hide('fast');
        $('#btn_inicio').hide('fast');
        /*setTimeout(this.newPos, 15000);*/
        setTimeout(this.newPos, 500);
        /*this.setUnidadesDist();
        this.update();*/
    },
    getMapa: function(){
        var latlong = new google.maps.LatLng(this.getLat(),this.getLon());
        var opt = {
            center: latlong,
            zoom: 12,
            mapTypeControl: true,
            
            mapTypeControlOptions: {
                style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
                position: google.maps.ControlPosition.TOP_RIGHT
            },

            zoomControl: true,
            zoomControlOptions: {
                position: google.maps.ControlPosition.LEFT_BOTTOM
            },
            scaleControl: true,
            
            streetViewControl: true,
            streetViewControlOptions: {
                position: google.maps.ControlPosition.LEFT_TOP
            },

            mapTypeId: google.maps.MapTypeId.ROADMAP
            
        };
        map = new google.maps.Map(document.getElementById("map_canvas"), opt);
        this.marcador('inicio');
    },
    newPos: function(){
        app.setUnidadesDist();
        app.setUnidadesTime();
        if(salir){
            return false;
        }else{
            app.cordenada('app.marcador("posicion");',true);
            if (!salir) {
                setTimeout("app.newPos()",500);
            }
            app.update();
        }
    },
    marcador: function(texto){
        if( (app.getDistancia()>0) || (app.getUnidadesDist()==0) ){
            var latlong = new google.maps.LatLng(this.getLat(),this.getLon());  
            new google.maps.Marker({
                position: latlong,
                map: map,
                title: texto,
            });
        }
    },
    errcord: function(){
        $("#contando").hide('fast');
        $("#btn_inicio").hide('fast');
        $("#no_se_pudo").show('slow');
    },
    inicio: function(){
        $("#contando").hide('fast');
        $("#no_se_pudo").hide('fast');
        $("#btn_inicio").show('slow');
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
    },
    adicionales: function(op){
        ejecutar = 'if (is_'+op+') {$("#'+op+'").removeClass("orange-text");is_'+op+' = false;} else{ $("#'+op+'").addClass("orange-text"); is_'+op+' = true; };';
        eval(ejecutar);
        this.update();
    },
    carga_url: function(url){
        cordova.InAppBrowser.open(url, '_blank', 'location=yes');
    },
    aobj: function(str){ return JSON.parse(str);},
    astring: function(obj){ return JSON.stringify(obj);},
    finalizar: function(){salir=true;},
};

app.ini();