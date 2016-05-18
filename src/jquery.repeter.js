/* Jquery.Repeter by Eli J.Chavez S. */
/* Project Page:https://elib0.github.io/jquery.repeter/ */
(function ( $ ) {
	$.fn.repeter = function(options) {
		var $this = this,
            defaultOptions = {
	            addBtnSelector:'.add',
	            remBtnSelector:'.remove',
	            tplSelector: '.template',
	            formSelector: 'form',
	            elements: {
	            	class: 'element',
	            	insertIn: null,
	            	mirror:{
	            		selector: null,
	            		tplSelector: null
	            	}
	            }
	        };

        // Opciones por defecto.
		var opt = $.extend(true, {}, defaultOptions, options);
		var elementClass = opt.elements.class || defaultOptions.elements.class;

		//Eventos agregar y eliminar item
	   	$this.on('click', opt.addBtnSelector, function(){
	   		var $root = $(this).closest( '.'+$this.attr('class').split(' ').join('.') );
	   		add($root);
	    }).on('click', '.'+(elementClass)+' '+opt.remBtnSelector, function(){
	    	remove(this);
	    });

	    var add = function($root){
	    	var template = $($root).find(opt.tplSelector)[0],
	    		numElement = $($root).find('.'+elementClass).length,
	    		mirrorTemplate = $($root).find(opt.elements.mirror.tplSelector)[0];
	    		$new=template.nodeName=='SCRIPT'?$(template).tmpl({'numElement':numElement}):$(template).clone().removeClass(opt.tplSelector);

	    	$new.addClass(elementClass+' r-ele-'+numElement).data('r-ele', numElement); //Agregamos clase de elemento
	    	var insertIn = opt.elements.insertIn || opt.elements.mirror.selector;
	    	//Inserta template de acuerdo a opciones
	    	if (insertIn) {
	    		var $clone = null;
	    		if (opt.elements.mirror.selector){
	    			if (mirrorTemplate) {//Si existe otro template para el espejo
	    				var $newMirror=mirrorTemplate.nodeName=='SCRIPT'?$(mirrorTemplate).tmpl({'numElement':numElement}):$(mirrorTemplate).clone().removeClass(opt.tplSelector);
	    				$newMirror.addClass(elementClass+' r-ele-'+numElement).data('r-ele', numElement); //Agregamos clase de elemento
	    				$clone = $newMirror.removeClass(elementClass);							  		  //Clonamos elemento ya insertado
	    			}else{
	    				$clone = $new.clone().removeClass(elementClass);	//Clonamos elemento para insertar en espejo
	    				$clone.find('.remove')[0].remove();					//Quitamos boton de eliminar
	    			}
	    		}
	    		$(insertIn).append($clone || $new);	//Insertamos elemento
	    	}
	    	if (!opt.elements.insertIn || opt.elements.mirror.selector) $new.insertBefore(template);

	    	// Si usa "Bootstrap Validator" http://1000hz.github.io/bootstrap-validator/
	    	if ($.fn.formValidation || $.fn.validator) {
	    		var $form = $($root).closest(opt.formSelector);
	    		$new.find('[disabled]').prop('disabled',false);
	    		if($.fn.validator&&$form.data('bs.validator')) $form.validator('reloadFields');
	    		if($.fn.formValidation&&$form.data('formValidation')){
	    			$new.find('input,textarea,select').filter(':visible').each(function(){
	    				$form.formValidation('addField',this.name);
	    			});
	    		}
	    	}
	    	//Respuesta al agregar elemento
	    	return {parent:$root,addedElement:$new,removedElement:null};
	    }

	    var remove = function(ele){
	    	var $root = $(ele).closest( '.'+$this.attr('class').split(' ').join('.') );
	    	ele = ( (typeof ele) == 'number' )?$('button.remove','r-ele-'+ele): $(ele,$root);
	    	ele.closest('.element').fadeOut(250,function(){
	    		var rEleNum = $(this).data('r-ele'),
	    			numElements = $('.'+elementClass,$root).length;

	    		//Foco en penultimo elemento de formulario
				if ($.fn.formValidation || $.fn.validator) ele.prev().find('select,input,textarea,button').last().focus();

				if(opt.elements.mirror.selector) $('.r-ele-'+rEleNum, opt.elements.mirror.selector).remove();	//Elimina Clones
				$(this).remove();																				//Elimina elemento

				//Enumera elementos adyacentes nuevamente
				for (var i = rEleNum+1; i <= numElements; i++) {
					$('.r-ele-'+i, $root).data('r-ele', i-1).removeClass('r-ele-'+i).addClass('r-ele-'+(i-1));
				}
				//Respuesta al borrar elemento
		   		return {parent: $root,addedElement:null,removedElement:ele};
			});
	    }

	    return $this;
	};
}( jQuery ));
