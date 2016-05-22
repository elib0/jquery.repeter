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
			this.template = null;
			this.items = [];

			this.opt = $.extend(true, {}, defaults, options );
			// this._defaults = defaults;
			this._name = pluginName;
			this.init();
		}

		// Para evitar conflictos de metodos
		$.extend( Repeter.prototype, {
			init: function() {
				var $this = this;
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
		     * @param {[type]} $root [description]
		     */
			addItem: function(){
		    	var $root = this,	//Repeter Object
		    		template = this.template,
		    		mirrorTemplate = this._template,
		    		numElement = $(this.element).find('.'+this.opt.elements.class).length,
		    		$new=template.nodeName=='SCRIPT'?$(template).tmpl({'numElement':numElement}):$(template).clone().removeClass($root.opt.tplSelector);
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
		    				$newMirror.addClass($root.opt.elements.class+' r-ele-'+numElement).data('r-ele', numElement);
		    				//Clonamos elemento ya insertado
		    				$clone = $newMirror.removeClass($root.opt.elements.class);						  		  
		    			}else{
		    				//Clonamos elemento para insertar en espejo
		    				$clone = $new.clone().removeClass($root.opt.elements.class);
		    				//Quitamos boton de eliminar
		    				$clone.find('.remove')[0].remove();							
		    			}
		    		}
		    		$(insertIn).append($clone || $new);				//Insertamos elemento
		    		$root.items.push( $.tmplItem($clone || $new) ); //Insertamos elemento al repeter como tmplItem
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
		    		deleteItem(element,$root);
		    	}
		    }
		});

		//Metodos privadas
		function deleteItem(ele,$root){
			var rEleNum = $(ele).data('r-ele'),
				numElements = $('.'+$root.opt.elements.class, $root.element).length;

				//Foco en penultimo elemento de formulario
				if ($.fn.formValidation || $.fn.validator) 
					ele.prev().find('select,input,textarea,button').last().focus();

				$(ele).remove();														//Elimina elemento
				if($root.opt.elements.mirror.selector){
					$('.r-ele-'+rEleNum, $root.opt.elements.mirror.selector).remove();	//Elimina Clones
				}

				$root.items.splice(rEleNum, 1); //Remueve del plugin el tmplItem eliminado

				//Enumera elementos adyacentes
				for (var i = rEleNum+1; i < numElements; i++) {
					var item = $.tmplItem($('.r-ele-'+i, $root.element));
					item.data.numElement = i-1;
					item.update();
					$(item.nodes).data('r-ele', item.data.numElement)
						.addClass($root.opt.elements.class+' r-ele-'+item.data.numElement);

					if ($root.opt.elements.mirror.selector) {
						$('.r-ele-'+i, $root.opt.elements.mirror.selector)
							// .html('holas')
							.removeClass('r-ele-'+i)
							.addClass('r-ele-'+item.data.numElement);
					}
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
