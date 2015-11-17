document.addEventListener('deviceready', function(){
    console.log('entro');
    ini = function(){
        console.log('ini');
        $('#btn_inicio').fadeIn('slow');   
        isStorage(); 
    }

    isStorage = function(){
        console.log('storage');
        try {
            if (localStorage.getItem) {
                storage = localStorage;
            }
        } catch(e) {
            storage = {};
        }
        console.log(storage);
        storage.removeItem('taximetro');
        storage.clear();
    }

    cordenada = function(){
        navigator.geolocation.getCurrentPosition (function(pos){
            alert('a');
            console.log('a');
            $('#lat').val('ok');
        },function(e){
            alert('b');
            console.log('b');
            $('#lat').val('bb');
        });
    }

    $("#btn_iniciar").click(function(event) {
        console.log('boton');
        cordenada();
    });

    
    ini();
    console.log('fin');
});