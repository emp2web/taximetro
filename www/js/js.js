$(document).on('ready',function(){
   
    var lat, lon, is_mapa=true, vr_unidad = 78, unidades_tot, tiempot = 0, salir = false, pos_json=1, distm = dist_a = 0, unidades_dist = unidades_time = 0, map = document.getElementById("mapa");
    var pap = 700, nf = 1900, terminal = 500, aeropuerto = 3900;
    var is_pap = false, is_nf = false, is_terminal = false, is_aeropuerto = false;
    $('.slider').slider({
        indicators: false,
        height: 80,
        transition: 300,
        interval: 2000
    });
    $(".slider").show();

    inicio = function(){
        $("#contando").hide('fast');
        $("#no_se_pudo").hide('fast');
        $('#btn_inicio').fadeIn('slow');
        isStorage();
    }

    isStorage = function(){
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
        
    }

    /*con la formula de Haversine*/
    distancia = function (lat1, lon1, lat2, lon2, med){
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
    }

    setUnidadesDist = function(){
        unidades_dist = (parseInt(getDistancia()/100)+25);
    }

    getUnidadesDist = function(){ return unidades_dist; }

    setUnidadesTime = function(){
        unidades_time = parseInt( getTime() / 30 );
    }

    getUnidadesTime = function(){return unidades_time;}

    aobj = function(str){ return JSON.parse(str);}

    astring = function(obj){ return JSON.stringify(obj);}

    setDistancia = function(d){
        if (d == 0) {
            tiempot += 15;
        } else{
            totd = distm - dist_a;
            if (totd > 300){
                dist_a = distm;
                is_mapa = true;
            }
            distm += d;
        };
    }

    getDistancia = function(){return distm;}

    getTime = function(){return tiempot;}

    setLat = function(l){lat = l;}

    getLat = function(){return lat;}

    setLon = function(l){lon = l;}

    getLon = function(){return lon;}

    cordenada = function(f,d){
        navigator.geolocation.getCurrentPosition(function(p){
            if(d){
                dist = distancia(getLat(), getLon(), p.coords.latitude, p.coords.longitude, 'm');
                setDistancia(dist);
            }
            setLat(p.coords.latitude);
            setLon(p.coords.longitude);
            eval(f);
        },function(){
            $("#contando").hide('fast');
            $("#btn_inicio").hide('fast');
            $("#no_se_pudo").show('slow');
        });
    }

    cargaInicio = function(){
        /*dato =  '"'+pos_json+'": {"lat":'+getLat()+',"lon":'+getLon()+',"dis": '+getDistancia()+'}';
        storage.setItem("taximetro",dato);*/
        getMapa();
        $("#contando").fadeIn('slow');
        $("#no_se_pudo").hide('fast');
        $('#btn_inicio').hide('fast');
        setTimeout(newPos, 1000);
        setUnidadesDist();
        update();
    }

    newPos = function(){
        if(salir){
            return false;
        }else{
            cordenada('cargaNew();',true);
            /*setTimeout("newPos()",15000);*/
            setTimeout("newPos()",1000);
        }
    }

    cargaNew = function(){
        /*pos_json ++;*/
        setUnidadesDist();
        setUnidadesTime();
    }

    getMapa = function(){
        if (is_mapa) {
            dat_act = storage.getItem('taximetro');
            dato =  '"'+pos_json+'": {"lat":'+getLat()+',"lon":'+getLon()+',"dis": '+getDistancia()+'}';
            
            if (dat_act=="") {
                new_dato = dato;
            }else{
                new_dato = dat_act +", "+ dato;    
            }
            
            storage.setItem("taximetro",new_dato);
            
            datos = aobj("{"+storage.getItem('taximetro')+"}");
            marcadores = '';

            if (pos_json==1) {
                marcadores += "&markers=color:green|" + datos[pos_json].lat + "," + datos[pos_json].lon;
            }else{
                for (var i = 1; i < pos_json; i++) {
                    if (i == 1) {
                        marcadores += "&markers=color:green|" + datos[i].lat + "," + datos[i].lon;
                    } else{
                        marcadores += "&markers=color:yellow|" + datos[i].lat + "," + datos[i].lon;
                    };
                }
            }

            pos_json == 1 ? centro = 1 : centro = parseInt(pos_json/2) ;
            centro = datos[centro].lat+","+datos[centro].lon;
            map.src = "http://maps.google.com/maps/api/staticmap?zoom=15&size=600x400&center="+centro+marcadores+"&key=AIzaSyAcZI5nuZ2dAhKw7VV0e16nrlw4F5XL_-c"; 
            if(!salir){
                setTimeout(getMapa,10000)
            }
            pos_json ++;
            is_mapa=false;
        }
    }

    update = function(){
        unidades_tot = getUnidadesTime() + getUnidadesDist();
        valor = unidades_tot * vr_unidad;

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


        $("#dt_cont_unidades_vr").html(getUnidadesDist() + getUnidadesTime());
        $("#dt_vr_total").html("$ "+ valor);
        setTimeout(update,1000);
    }

    adicionales = function(op){
        ejecutar = 'if (is_'+op+') {$("#'+op+'").removeClass("orange-text");is_'+op+' = false;} else{ $("#'+op+'").addClass("orange-text"); is_'+op+' = true; };';
        eval(ejecutar);
        unidades_tot = getUnidadesTime() + getUnidadesDist();
        valor = unidades_tot * vr_unidad;
        ejecutar = 'if(is_'+op+'){valor += '+op+'; } $("#dt_vr_total").html("$ "+ valor);';
        eval(ejecutar);
    }




    inicio();

    $("#btn_iniciar").click(function(event) {
        cordenada("cargaInicio();",false);
    });

});