(function ( $ ) {
	$.fn.repeter = function(options) {
		var $this = this;
		var response = {parent: $this,addedElement:null,removedElement:null};

        // Opciones por defecto.
		var opt = $.extend({
        	elementClass:'element',
            addBtnClass:'.add',
            remBtnClass:'.remove',
            tplToRepeat: '.template'
        }, options );

	   	$this.on('click', opt.addBtnClass, function(){
	   		var template = $this.find(opt.tpl)[0],
	   			$new=template.nodeName=='SCRIPT'?$(template).tmpl():$(template).clone().removeClass(opt.tpl);
	   			$new.addClass('.'+elementClass).insertBefore(template);
	   		//Agregamos nuevo el nuevo elemento al retorno
	   		response.addedElement = $new;
	    }).on('click', '.'+elementClass+' '+opt.remBtnClass, function(){

	    });

	    return response;
	};
}( jQuery ));