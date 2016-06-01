;( function( $, window, document, undefined ) {
	"use strict";
		var pluginName = "repeter",
			defaults = {
				addBtnSelector:'.add',
				remBtnSelector:'.remove',
				tmplSelector: '.template',
				formSelector: 'form',
				elements: {
					class: 'element',
					appendTo: null,
					animation: null,
					mirror:{
						selector: null,
						tmplSelector: null,
						animation: null
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
				var self = this;
				//Propiedades publicas
				this.template = $(this.element).find(this.opt.tmplSelector)[0];  //Template Inicial
				this._template = $(this.element).find(this.opt.elements.mirror.tmplSelector)[0]; //Template Secundario

				//Eventos agregar y eliminar item
				$(this.element).on('click', this.opt.addBtnSelector, function(){
					self.addItem();
				}).on('click', this.opt.remBtnSelector, function(){
					self.removeItem(this);
				});
				return this;
			},
			/**
			 * [addItem Agrega Item al Repeter]
			 * @return {[Objeto]}     [Devuelve el padre y el elemento agregado]
			 */
			addItem: function(){
				var template = this.template,
					mirrorTemplate = this._template,
					numElement = $(this.element).find('.'+this.opt.elements.class).length,
					//tmplData: datos que se pasaran a la template (jquery-tmpl) https://github.com/BorisMoore/jquery-tmpl
					tmplData = $.extend({'numElement':numElement},(this.opt.tmplData instanceof Function)?this.opt.tmplData.call(this.element):this.opt.tmplData||{}),
					$new=(template.nodeName=='SCRIPT')?$(template).tmpl(tmplData):$(template).clone().removeClass(this.opt.tmplSelector);
					console.log(this.opt.tmplData,tmplData);

				//Insertamos elemento al repeter como tmplItem
				this.items['item'+numElement] = $.tmplItem($new);

				//Agregamos clase de elemento
				$new.addClass(this.opt.elements.class+' r-ele-'+numElement).data('r-ele', numElement);

				//Buscamos la opcion de insercion(Otro contedor o espejo)
				var appendTo = this.opt.elements.appendTo || this.opt.elements.insertIn || this.opt.elements.mirror.selector;
				//conservado insertIn por soporte
				//Inserta template de acuerdo a opciones
				if (appendTo) {
					var $clone = null;
					if (this.opt.elements.mirror.selector){
						if (mirrorTemplate) {//Si existe otro template para el espejo
							var $newMirror=(mirrorTemplate.nodeName=='SCRIPT')?$(mirrorTemplate).tmpl(tmplData):$(mirrorTemplate).clone().removeClass(this.opt.tmplSelector);
							//Agregamos clase de elemento
							$clone = $newMirror.addClass('r-ele-'+numElement).data('r-ele', numElement);
						}else{
							//Clonamos elemento para insertar en espejo
							$clone = $new.clone().removeClass(this.opt.elements.class);
							//Quitamos boton de eliminar
							$clone.find('.remove')[0].remove();
						}
					}
					//Insertamos elemento
					$(appendTo).append($clone || $new);
				}
				if (!this.opt.elements.appendTo || this.opt.elements.mirror.selector) $new.insertBefore(template);

				// Si se utiliza "Bootstrap Validator" http://1000hz.github.io/bootstrap-validator/
				// O "formValidation" http://formvalidation.io/
				if ($.fn.formValidation || $.fn.validator) {
					var $form = $(this.element).closest(this.opt.formSelector);
					$new.find('[disabled]').prop('disabled',false);
					if($form.data('formValidation')){
						$new.find('input,textarea,select').filter(':visible').each(function(){
							$form.formValidation('addField',this.name);
						});
					}
				}
				//Respuesta al agregar elemento
				return {parent:this.element,addedElement:$new,removedElement:null};
			},
			/**
			 * [removeItem Elimina un Item del Repeter]
			 * @param  {DomElement o Number} ele [Elemento que se va a eliminar o numero del elemento a eliminar]
			 * @return {[Objeto]}     [Devuelve el padre y el elemento eliminado]
			 */
			removeItem: function(ele){
				var ele = ( (typeof ele) == 'number' )?$('r-ele-'+ele, this.element): ele,
					element = $(ele).closest('.'+this.opt.elements.class, this.element),
					rEleNum = $(element).data('r-ele'),
					numElements = $(this.element).find('.'+this.opt.elements.class).length,
					mirror = $(this.opt.elements.mirror.selector).find('.r-ele-'+rEleNum);

				//Foco en penultimo elemento de formulario
				if ($.fn.formValidation || $.fn.validator)
					$(ele).prev().find(':input:last-child').focus();

				//Eliminamos item
				deleteItem(element,this,this.opt.elements.animation);

				//Eliminamos item de espejo si existe
				if(mirror) deleteItem(mirror,this,this.opt.elements.mirror.animation);

				//Enumera elementos adyacentes
				for (var i = rEleNum; i < numElements-1; i++) {
					this.items['item'+i] = this.items['item'+(i+1)];
					this.items['item'+i].data.numElement = (i);
					this.items['item'+i].update();

					$(this.items['item'+i].nodes).data('r-ele', (i))
						.addClass(this.opt.elements.class+' r-ele-'+(i));

				}
				if (mirror) {
					for (var i = rEleNum; i < numElements; i++) {
						$('.r-ele-'+i, this.opt.elements.mirror.selector)
							// .html('holas')
							.removeClass('r-ele-'+i)
							.addClass('r-ele-'+(i-1));
					}
				}
				delete this.items['item'+(numElements-1)];
				//Respuesta al borrar elemento
				return {parent: this,addedElement:null,removedElement:element};
			}
		});

		//Metodos privadas
		function deleteItem(ele,$root,removeclass){
			console.log(ele,$root,removeclass);
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
