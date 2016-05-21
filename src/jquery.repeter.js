;( function( $, window, document, undefined ) {

	"use strict";

		// Opciones por defecto
		var pluginName = "repeter",
			defaults = {
	            addBtnSelector:'.add',
	            remBtnSelector:'.remove',
	            tplSelector: '.template',
	            formSelector: 'form',
	            elements: {
	            	class: 'element',
	            	insertIn: null,
	            	removeClasses: null,
	            	mirror:{
	            		selector: null,
	            		tplSelector: null,
	            	}
	            }
	        };

		// Constructor
		function Repeter ( element, options ) {
			this.element = element;

			// jQuery has an extend method which merges the contents of two or
			// more objects, storing the result in the first object. The first object
			// is generally empty as we don't want to alter the default options for
			// future instances of the plugin
			this.opt = $.extend(true, {}, defaults, options );
			this._defaults = defaults;
			this._name = pluginName;
			this.init();
		}

		// Para evitar conflictos de metodos
		$.extend( Repeter.prototype, {
			init: function() {
				var $this = this;
				// console.log(this);

				//Eventos agregar y eliminar item
			   	$($this.element).on('click', $this.opt.addBtnSelector, function(){
			   		$this.addItem();
			    }).on('click', '.'+($this.opt.elements.class)+' '+$this.opt.remBtnSelector, function(){
			    	$this.removeItem(this);
			    });

				return this;
			},
			/**
		     * [addItem Agrega Item al Repeter]
		     * @param {[type]} $root [description]
		     */
			addItem: function(){
		    	var $root = this,	//Repeter Object
		    		template = $($root.element).find($root.opt.tplSelector)[0],
		    		numElement = $($root.element).find('.'+$root.opt.elements.class).length,
		    		mirrorTemplate = $($root.element).find($root.opt.elements.mirror.tplSelector)[0],
		    		$new=template.nodeName=='SCRIPT'?$(template).tmpl({'numElement':numElement}):$(template).clone().removeClass($root.opt.tplSelector);

		    	$new.addClass($root.opt.elements.class+' r-ele-'+numElement).data('r-ele', numElement); //Agregamos clase de elemento
		    	var insertIn = $root.opt.elements.insertIn || $root.opt.elements.mirror.selector;
		    	//Inserta template de acuerdo a opciones
		    	if (insertIn) {
		    		var $clone = null;
		    		if ($root.opt.elements.mirror.selector){
		    			if (mirrorTemplate) {//Si existe otro template para el espejo
		    				var $newMirror=mirrorTemplate.nodeName=='SCRIPT'?$(mirrorTemplate).tmpl({'numElement':numElement}):$(mirrorTemplate).clone().removeClass($root.opt.tplSelector);
		    				$newMirror.addClass($root.opt.elements.class+' r-ele-'+numElement).data('r-ele', numElement); //Agregamos clase de elemento
		    				$clone = $newMirror.removeClass($root.opt.elements.class);							  		  //Clonamos elemento ya insertado
		    			}else{
		    				$clone = $new.clone().removeClass($root.opt.elements.class);	//Clonamos elemento para insertar en espejo
		    				$clone.find('.remove')[0].remove();					//Quitamos boton de eliminar
		    			}
		    		}
		    		$(insertIn).append($clone || $new);	//Insertamos elemento
		    	}
		    	if (!$root.opt.elements.insertIn || $root.opt.elements.mirror.selector) $new.insertBefore(template);

		    	// Si usa "Bootstrap Validator" http://1000hz.github.io/bootstrap-validator/
		    	if ($.fn.formValidation || $.fn.validator) {
		    		var $form = $($root.element).closest($root.opt.formSelector);
		    		$new.find('[disabled]').prop('disabled',false);
		    		if($.fn.validator&&$form.data('bs.validator')) $form.validator('reloadFields');
		    		if($.fn.formValidation&&$form.data('formValidation')){
		    			$new.find('input,textarea,select').filter(':visible').each(function(){
		    				$form.formValidation('addField',this.name);
		    			});
		    		}
		    	}
		    	//Respuesta al agregar elemento
		    	return {parent:$root.element,addedElement:$new,removedElement:null};
		    },
		    /**
		     * [removeItem Elimina un Item del Repeter]
		     * @param  {DomElement o Number} ele [Elemento que se va a eliminar o numero del elemento a eliminar]
		     * @return {[Objeto]}     [Devuelve el padre y el elemento eliminado]
		     */
		    removeItem: function(ele){
		    	var $root = this,
		    		ele = ( (typeof ele) == 'number' )?$('r-ele-'+ele, $root.element): ele;

		    	//Buscamos elemento mas cercano
		    	var element = $(ele).closest('.'+$root.opt.elements.class);

		    	if ($root.opt.elements.removeClasses) {
		    		var prefix = 'webkitAnimationEnd oanimationend msAnimationEnd animationend';
		    		element.addClass($root.opt.elements.removeClasses).one(prefix,function(e) {
		    			deleteItem(element,$root);
						element.removeClass($root.opt.elements.removeClasses);
						//Respuesta al borrar elemento
						return {parent: $root,addedElement:null,removedElement:ele};
					});
		    	}else{
		    		element.fadeOut(250,function(){
		    			deleteItem(element,$root);
					});
		    	}
		    }
		});

		//Metodos privadas
		function deleteItem(ele,container){
			var rEleNum = $(ele).data('r-ele'),
				numElements = $('.'+container.opt.elements.class, container.element).length;
				if ($.fn.formValidation || $.fn.validator) 
					ele.prev().find('select,input,textarea,button').last().focus();//Foco en penultimo elemento de formulario

				$(ele).remove();														//Elimina elemento
				if(container.opt.elements.mirror.selector) 
					$('.r-ele-'+rEleNum, container.opt.elements.mirror.selector).remove();	//Elimina Clones

				//Enumera elementos adyacentes
				for (var i = rEleNum+1; i <= numElements; i++) {
					$('.r-ele-'+i, container.element)
						.data('r-ele', i-1)
						.removeClass('r-ele-'+i)
						.addClass('r-ele-'+(i-1));
				}
		}

		$.fn[ pluginName ] = function( options ) {
			return this.each( function() {
				if ( !$.data( this, "plugin_" + pluginName ) ) {
					$.data( this, "plugin_" +
						pluginName, new Repeter( this, options ) );
				}
			} );
		};

} )( jQuery, window, document );
