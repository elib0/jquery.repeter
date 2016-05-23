;( function( $, window, document, undefined ) {

	"use strict";
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
	            		removeClasses: null
	            	}
	            }
	        };

		// Constructor
		function Repeter ( element, options ) {
			this.element = element;
			this.template = null;
			this.items = {};

			this.opt = $.extend(true, {}, defaults, options );
			// this._defaults = defaults;
			this._name = pluginName;
			this.init();
		}

		$.extend( Repeter.prototype, {
			init: function() {
				var $this = this;
				//Propiedades publicas
				this.template = $(this.element).find(this.opt.tplSelector)[0];  //Template Inicial
				this._template = $(this.element).find(this.opt.elements.mirror.tplSelector)[0]; //Template Secundario

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
		     * @return {[Objeto]}     [Devuelve el padre y el elemento agregado]
		     */
			addItem: function(){
		    	var $root = this,	//Repeter Object
		    		template = this.template,
		    		mirrorTemplate = this._template,
		    		numElement = $(this.element).find('.'+this.opt.elements.class).length,
		    		$new=template.nodeName=='SCRIPT'?$(template).tmpl({'numElement':numElement}):$(template).clone().removeClass($root.opt.tplSelector);

		    	//Insertamos elemento al repeter como tmplItem
		    	$root.items['item'+numElement] = $.tmplItem($new);
		    	//Agregamos clase de elemento
		    	$new.addClass($root.opt.elements.class+' r-ele-'+numElement).data('r-ele', numElement); 

		    	//Buscamos la opcion de insercion(Otro contedor o espejo)
		    	var insertIn = $root.opt.elements.insertIn || $root.opt.elements.mirror.selector;
		    	//Inserta template de acuerdo a opciones
		    	if (insertIn) {
		    		var $clone = null;
		    		if ($root.opt.elements.mirror.selector){
		    			if (mirrorTemplate) {//Si existe otro template para el espejo
		    				var $newMirror=mirrorTemplate.nodeName=='SCRIPT'?$(mirrorTemplate).tmpl({'numElement':numElement}):$(mirrorTemplate).clone().removeClass($root.opt.tplSelector);
		    				//Agregamos clase de elemento
		    				$clone = $newMirror.addClass('r-ele-'+numElement).data('r-ele', numElement);
		    			}else{
		    				//Clonamos elemento para insertar en espejo
		    				$clone = $new.clone().removeClass($root.opt.elements.class);
		    				//Quitamos boton de eliminar
		    				$clone.find('.remove')[0].remove();							
		    			}
		    		}
		    		$(insertIn).append($clone || $new);				//Insertamos elemento
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
		    		ele = ( (typeof ele) == 'number' )?$('r-ele-'+ele, $root.element): ele,
		    		element = $(ele).closest('.'+$root.opt.elements.class, $root.element),
		    		rEleNum = $(element).data('r-ele'),
		    		numElements = $(this.element).find('.'+this.opt.elements.class).length,
					mirror = $($root.opt.elements.mirror.selector).find('.r-ele-'+rEleNum);

		    	//Foco en penultimo elemento de formulario
				if ($.fn.formValidation || $.fn.validator) 
					$(ele).prev().find('select,input,textarea,button').last().focus();

				//Eliminamos item
		    	deleteItem(element,$root,$root.opt.elements.removeClasses);

				//Eliminamos item de espejo si existe
		    	if(mirror) deleteItem(mirror,$root,$root.opt.elements.mirror.removeClasses);

				//Enumera elementos adyacentes
		    	for (var i = rEleNum; i < numElements-1; i++) {
		    		$root.items['item'+i] = $root.items['item'+(i+1)];
					$root.items['item'+i].data.numElement = (i);
		    		$root.items['item'+i].update();

		    		$($root.items['item'+i].nodes).data('r-ele', (i))
						.addClass($root.opt.elements.class+' r-ele-'+(i));

		    	}
    			if (mirror) {
    				for (var i = rEleNum; i < numElements; i++) {
						$('.r-ele-'+i, $root.opt.elements.mirror.selector)
							// .html('holas')
							.removeClass('r-ele-'+i)
							.addClass('r-ele-'+(i-1));
    				}
				}
				delete $root.items['item'+(numElements-1)];
				//Respuesta al borrar elemento
				return {parent: $root,addedElement:null,removedElement:element};
		    }
		});

		//Metodos privadas
		function deleteItem(ele,$root,removeclass){
			if (removeclass) {
	    		ele.addClass(removeclass).one('webkitAnimationEnd oanimationend msAnimationEnd animationend',
	    			function(e) {
						$(ele).remove();
					}
				);
	    	}else{
				$(ele,$root.element).remove();
	    	}
		}

		//Registrando el plugin
		$.fn[pluginName] = function ( options ) {
	        var args = arguments;
	        if (options === undefined || typeof options === 'object') {
	            return this.each(function () {
	                if (!$.data(this, 'plugin_' + pluginName)) {
	                    $.data(this, 'plugin_' + pluginName, new Repeter( this, options ));
	                }
	            });

	       	//Ahora si se ya hay una instancia del plugin se puede pasar una cadena con el nombre de la funcion
	        } else if (typeof options === 'string' && options[0] !== '_' && options !== 'init') {
	            var returns;
	            this.each(function () {
	                var instance = $.data(this, 'plugin_' + pluginName);

	                if (instance instanceof Repeter && typeof instance[options] === 'function') {
	                    returns = instance[options].apply( instance, Array.prototype.slice.call( args, 1 ) );
	                }

	                if (options === 'destroy') {
	                  $.data(this, 'plugin_' + pluginName, null);
	                }
	            });
	            return returns !== undefined ? returns : this;
	        }
	    };

} )( jQuery, window, document );
