(function ( $ ) {
	$.fn.repeter = function(options) {
		var $this = this;
		var response = {parent: $this,addedElement:null,removedElement:null};

        // Opciones por defecto.
		var opt = $.extend({
        	elementClass:'element',
            addBtnClass:'.add',
            remBtnClass:'.remove',
            tplToRepeat: '.template',
            formValidation: true
        }, options );

	   	$this.on('click', opt.addBtnClass, function(){
	   		var template = $this.find(opt.tpl)[0],
	   			$new=template.nodeName=='SCRIPT'?$(template).tmpl():$(template).clone().removeClass(opt.tpl);
	   			$new.addClass('.'+elementClass).insertBefore(template);

	   		if (opt.formValidation) { //Si usa form validate
	   			var $form = $(this).closest('form');
	   			$new.find('[disabled]').prop('disabled',false);
	   			if($.fn.validator&&$form.data('bs.validator')) $form.validator('reloadFields');
	   			if($.fn.formValidation&&$form.data('formValidation')){
	   				$new.find('input,textarea,select').filter(':visible').each(function(){
	   					$form.formValidation('addField',this.name);
	   				});
	   			}
	   		}
	   		//Agregamos nuevo el nuevo elemento al retorno
	   		response.addedElement = $new;
	    }).on('click', '.'+elementClass+' '+opt.remBtnClass, function(){

	    });

	    return response;
	};
}( jQuery ));