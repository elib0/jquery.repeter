(function ( $ ) {
	$.fn.repeter = function(options) {
		var $this = this,
			elementOptions = {
            	class: 'element',
            	mirrorIn:null,
            	insertIn: null
            };

        // Opciones por defecto.
		var opt = $.extend({
	            addBtnClass:'.add',
	            remBtnClass:'.remove',
	            tplClass: '.template',
	            formValidation: false,
	            formSelector: 'form',
	            elements: elementOptions
	        }, options ),
			elementClass = opt.elements.class || elementOptions.class;

	   	$this.on('click', opt.addBtnClass, function(){
	   		var template = $this.find(opt.tplClass)[0],
	   			numElement = $this.find(opt.tplClass).length,
	   			$new=template.nodeName=='SCRIPT'?$(template).tmpl({'numElements':numElement}):$(template).clone().removeClass(opt.tplClass);

	   		$new.addClass((elementClass)); //Agregamos clase de elemento

	   		//Inserta template de acuerdo a opciones
	   		var clone = null,
	   			insertIn = opt.elements.insertIn || opt.elements.mirrorIn;

	   		if (insertIn) {
	   			if (opt.elements.mirrorIn){
	   				var $clone = $new.clone();			//Clonamos elemento ya insertado
	   				$clone.find('.remove')[0].remove();	//Quitamos boton de elminar si es espejo
	   			}
	   			$(insertIn).prepend($clone || $new);	//Insertamos elemento
	   		}
	   		if (!opt.elements.insertIn || opt.elements.mirrorIn) $new.insertBefore(template);

	   		// Si usa "Bootstrap Validator" http://1000hz.github.io/bootstrap-validator/
	   		if (opt.formValidation) {
	   			var $form = $this.closest(opt.formSelector);
	   			$new.find('[disabled]').prop('disabled',false);
	   			if($.fn.validator&&$form.data('bs.validator')) $form.validator('reloadFields');
	   			if($.fn.formValidation&&$form.data('formValidation')){
	   				$new.find('input,textarea,select').filter(':visible').each(function(){
	   					$form.formValidation('addField',this.name);
	   				});
	   			}
	   		}
	   		//Respuesta al agregar elemento
	   		return {parent: $this,addedElement:$new,removedElement:null};
	    }).on('click', '.'+(elementClass)+' '+opt.remBtnClass, function(){
	    	$(this).closest('.element').fadeOut(250,function(){
				if (opt.formValidation) $(this).prev().find('select,input,textarea,button').last().focus();
				$(this).remove();
				//Respuesta al borrar elemento
		   		return {parent: $this,addedElement:null,removedElement:$(this)};
			});
	    });

	    return $this;
	};
}( jQuery ));