
/*********************************
 *
 * = ROWS =
 *
 * - dslc_row_add ( Add New )
 * - dslc_row_delete ( Delete )
 * - dslc_row_edit ( Edit )
 * - dslc_row_edit_colorpicker_init ( Edit - Initiate Colorpicker )
 * - dslc_row_edit_slider_init ( Edit - Initiate Slider )
 * - dslc_row_edit_scrollbar_init ( Edit - Initiate Scrollbar )
 * - dslc_row_edit_cancel ( Edit - Cancel Changes )
 * - dslc_row_edit_confirm ( Edit - Confirm Changes )
 * - dslc_row_copy ( Copy )
 * - dslc_row_import ( Import )
 *
 ***********************************/


;jQuery(document).on('editorFrameLoaded', function(){

	var $ = jQuery;

	$(".dslc-modules-section", DSLC.Editor.frame).each(function(){

		new DSLC.Editor.CRow(this);
	});

	/**
	 * Hook - Delete Row
	 */
	DSLC.Editor.frame.on( 'click', '.dslca-delete-modules-section-hook', function(e){

		e.preventDefault();
		var self = this;

		if ( ! $(this).hasClass('dslca-action-disabled') ) {

			DSLC.Editor.CModalWindow({
				title: DSLCString.str_del_row_title,
				content: DSLCString.str_del_row_descr,
				confirm: function() {

					dslc_row_delete( $(self).closest('.dslc-modules-section') );
				}
			})

		/*	dslc_js_confirm( 'delete_modules_section', '<span class="dslca-prompt-modal-title">' + DSLCString.str_del_row_title +
				'</span><span class="dslca-prompt-modal-descr">' + DSLCString.str_del_row_descr + '</span>', $(this) );*/
		}
	});

	/**
	 * Hook - Import Row
	 */
	DSLC.Editor.frame.on( 'click', '.dslca-import-modules-section-hook', function(e) {

		e.preventDefault();

		if ( ! $(this).hasClass('dslca-action-disabled') ) {

			DSLC.Editor.CModalWindow({
				title: DSLCString.str_import_row_title,
				content: DSLCString.str_import_row_descr + '<br><br><textarea></textarea>',
				confirm: function(){

					dslc_row_import( $('.dslca-prompt-modal textarea').val() );
					$('.dslca-prompt-modal-confirm-hook span').css({ opacity : 0 });
					$('.dslca-prompt-modal-confirm-hook .dslca-loading').show();
				},
				confirm_title: DSLCString.str_import
			});

			/*$('.dslca-prompt-modal-confirm-hook').html('<span class="dslc-icon dslc-icon-ok"></span><span>' + DSLCString.str_import +
				'</span><div class="dslca-loading followingBallsGWrap"><div class="followingBallsG_1 followingBallsG"></div>'+
				'<div class="followingBallsG_2 followingBallsG"></div><div class="followingBallsG_3 followingBallsG"></div><div class="followingBallsG_4 followingBallsG"></div></div>');

			dslc_js_confirm( 'import_modules_section', '<span class="dslca-prompt-modal-title">' + DSLCString.str_import_row_title +
				'</span><span class="dslca-prompt-modal-descr">' + DSLCString.str_import_row_descr + ' <br><br><textarea></textarea></span>', $(this) );*/
		}
	});

	/**
	 * Hook - Export Row
	 */
	DSLC.Editor.frame.on( 'click', '.dslca-export-modules-section-hook', function(e) {

		e.preventDefault();

		if ( ! $(this).hasClass('dslca-action-disabled') ) {

			$('.dslca-prompt-modal-cancel-hook').hide();
			$('.dslca-prompt-modal-confirm-hook').html('<span class="dslc-icon dslc-icon-ok"></span>' + DSLCString.str_ok);

			dslc_js_confirm( 'export_modules_section', '<span class="dslca-prompt-modal-title">' + DSLCString.str_export_row_title +
				'</span><span class="dslca-prompt-modal-descr">' + DSLCString.str_export_row_descr + ' <br><br><textarea></textarea></span>', $(this) );
			$('.dslca-prompt-modal textarea').val( dslc_generate_section_code( $(this).closest('.dslc-modules-section') ) );
		}
	});

	/**
	 * Hook - Copy Row
	 */
	DSLC.Editor.frame.on( 'click', '.dslca-copy-modules-section-hook', function() {

		if ( ! $(this).hasClass('dslca-action-disabled') ) {

			dslc_row_copy( $(this).closest('.dslc-modules-section') );
		}
	});

	/**
	 * Hook - Add Row
	 */
	DSLC.Editor.frame.on( 'click', '.dslca-add-modules-section-hook', function(){

		var button = $(this);

		if ( ! $(this).hasClass('dslca-action-disabled') ) {

			// Add a loading animation
			button.find('.dslca-icon').removeClass('dslc-icon-align-justify').addClass('dslc-icon-spinner dslc-icon-spin');

			// Add a row
			dslc_row_add( function(){
				button.find('.dslca-icon').removeClass('dslc-icon-spinner dslc-icon-spin').addClass('dslc-icon-align-justify');
			});
		}
	});

	/**
	 * Hook - Edit Row
	 */
	DSLC.Editor.frame.on( 'click', '.dslca-edit-modules-section-hook', function(){

		var self = this;

		var module_edited = jQuery('.dslca-module-being-edited', DSLC.Editor.frame).length;
		var row_edited = jQuery('.dslca-modules-section-being-edited', DSLC.Editor.frame).length;

		/// If settings panel opened - finish func
		if ( $('body').hasClass( 'dslca-composer-hidden' ) || module_edited > 0 || row_edited > 0 ) return false;

		// If not disabled ( disabling used for tutorial )
		if ( ! $(this).hasClass('dslca-action-disabled') ) {

			// Trigger the function to edit
			dslc_row_edit( $(this).closest('.dslc-modules-section') );
		}
	});
});

/**
 * Row - Add New
 */
function dslc_row_add( callback ) {

	if ( dslcDebug ) console.log( 'dslc_row_add' );

	callback = typeof callback !== 'undefined' ? callback : false;

	var defer = jQuery.Deferred();

	// AJAX Request
	jQuery.post(

		DSLCAjax.ajaxurl,
		{
			action : 'dslc-ajax-add-modules-section',
			dslc : 'active'
		},
		function( response ) {

			var newRow = jQuery(response.output);

			// Append new row
			newRow.appendTo(DSLC.Editor.frame.find("#dslc-main"));

			// Call other functions
			dslc_drag_and_drop();
			dslc_generate_code();
			dslc_show_publish_button();

			new DSLC.Editor.CRow(newRow);
			new DSLC.Editor.CModuleArea(newRow.find('.dslc-modules-area').eq(0)[0]);

			if ( callback ) { callback(); }

			newRow.find('.dslc-modules-area').addClass('dslc-modules-area-empty dslc-last-col');

			defer.resolve(newRow[0]);
		}
	);

	return defer;
}

/**
 * Row - Delete
 */
function dslc_row_delete( row ) {

	if ( dslcDebug ) console.log( 'dslc_row_delete' );

	// If the row is being edited
	if ( row.find('.dslca-module-being-edited') ) {

		// Hide the filter hooks
		jQuery('.dslca-header .dslca-options-filter-hook').hide();

		// Hide the save/cancel actions
		jQuery('.dslca-module-edit-actions').hide();

		// Show the section hooks
		jQuery('.dslca-header .dslca-go-to-section-hook').show();

		dslc_show_section('.dslca-modules');

	}

	// Remove row
	row.trigger('mouseleave').remove();

	// Call other functions
	dslc_generate_code();
	dslc_show_publish_button();
}

/**
 * Row - Edit
 */
function dslc_row_edit( row ) {

	if ( dslcDebug ) console.log( 'dslc_row_edit' );

	// Vars we will use
	var dslcModulesSectionOpts, dslcVal;

	// Set editing class
	jQuery('.dslca-module-being-edited', DSLC.Editor.frame).removeClass('dslca-module-being-edited');
	jQuery('.dslca-modules-section-being-edited', DSLC.Editor.frame).removeClass('dslca-modules-section-being-edited').removeClass('dslca-modules-section-change-made');
	row.addClass('dslca-modules-section-being-edited');

	// Hide the section hooks
	jQuery('.dslca-header .dslca-go-to-section-hook').hide();

	// Show the styling/responsive tabs
	jQuery('.dslca-row-options-filter-hook[data-section="styling"], .dslca-row-options-filter-hook[data-section="responsive"]').show();
	jQuery('.dslca-row-options-filter-hook[data-section="styling"]').trigger('click');

	// Hide the filter hooks
	jQuery('.dslca-header .dslca-options-filter-hook').hide();

	// Hide the save/cancel actions
	jQuery('.dslca-module-edit-actions').hide();

	// Show the save/cancel actions
	jQuery('.dslca-row-edit-actions').show();

	// Set current values
	jQuery('.dslca-modules-section-edit-field').each(function(){


		/**
		 * Temporary migration from 'wrapped' value to 'wrapper' in ROW type selector
		 * TODO: delete this block in a few versions as problem do not exists on new installs
		 *
		 * @since ver 1.1
		 */
		if ( 'type' === jQuery(this).data('id') ) {

			if ( '' === jQuery('.dslca-modules-section-being-edited .dslca-modules-section-settings input[data-id="type"]', DSLC.Editor.frame).val() ||
				  'wrapped' === jQuery('.dslca-modules-section-being-edited .dslca-modules-section-settings input[data-id="type"]', DSLC.Editor.frame).val() ) {
				jQuery('select[data-id="type"]').val('wrapper').change();
			}
		}

		if ( jQuery(this).data('id') == 'border-top' ) {

			if ( jQuery('.dslca-modules-section-being-edited .dslca-modules-section-settings input[data-id="border"]', DSLC.Editor.frame).val().indexOf('top') >= 0 ) {
				jQuery(this).prop('checked', true);
				jQuery(this).siblings('.dslca-modules-section-edit-option-checkbox-hook').find('.dslca-icon').removeClass('dslc-icon-check-empty').addClass('dslc-icon-check');
			} else {
				jQuery(this).prop('checked', false);
				jQuery(this).siblings('.dslca-modules-section-edit-option-checkbox-hook').find('.dslca-icon').removeClass('dslc-icon-check').addClass('dslc-icon-check-empty');
			}

		} else if ( jQuery(this).data('id') == 'border-right' ) {

			if ( jQuery('.dslca-modules-section-being-edited .dslca-modules-section-settings input[data-id="border"]', DSLC.Editor.frame).val().indexOf('right') >= 0 ) {
				jQuery(this).prop('checked', true);
				jQuery(this).siblings('.dslca-modules-section-edit-option-checkbox-hook').find('.dslca-icon').removeClass('dslc-icon-check-empty').addClass('dslc-icon-check');
			} else {
				jQuery(this).prop('checked', false);
				jQuery(this).siblings('.dslca-modules-section-edit-option-checkbox-hook').find('.dslca-icon').removeClass('dslc-icon-check').addClass('dslc-icon-check-empty');
			}

		} else if ( jQuery(this).data('id') == 'border-bottom' ) {

			if ( jQuery('.dslca-modules-section-being-edited .dslca-modules-section-settings input[data-id="border"]', DSLC.Editor.frame).val().indexOf('bottom') >= 0 ) {
				jQuery(this).prop('checked', true);
				jQuery(this).siblings('.dslca-modules-section-edit-option-checkbox-hook').find('.dslca-icon').removeClass('dslc-icon-check-empty').addClass('dslc-icon-check');
			} else {
				jQuery(this).prop('checked', false);
				jQuery(this).siblings('.dslca-modules-section-edit-option-checkbox-hook').find('.dslca-icon').removeClass('dslc-icon-check').addClass('dslc-icon-check-empty');
			}

		} else if ( jQuery(this).data('id') == 'border-left' ) {

			if ( jQuery('.dslca-modules-section-being-edited .dslca-modules-section-settings input[data-id="border"]', DSLC.Editor.frame).val().indexOf('left') >= 0 ) {
				jQuery(this).prop('checked', true);
				jQuery(this).siblings('.dslca-modules-section-edit-option-checkbox-hook').find('.dslca-icon').removeClass('dslc-icon-check-empty').addClass('dslc-icon-check');
			} else {
				jQuery(this).prop('checked', false);
				jQuery(this).siblings('.dslca-modules-section-edit-option-checkbox-hook').find('.dslca-icon').removeClass('dslc-icon-check').addClass('dslc-icon-check-empty');
			}
		} else if ( jQuery(this).hasClass('dslca-modules-section-edit-field-checkbox') ) {

			if ( jQuery('.dslca-modules-section-being-edited .dslca-modules-section-settings input[data-id="' + jQuery(this).data('id') + '"]', DSLC.Editor.frame).val().indexOf( jQuery(this).data('val') ) >= 0 ) {
				jQuery( this ).prop('checked', true);
				jQuery( this ).siblings('.dslca-modules-section-edit-option-checkbox-hook').find('.dslca-icon').removeClass('dslc-icon-check-empty').addClass('dslc-icon-check');
			} else {
				jQuery( this ).prop('checked', false);
				jQuery( this ).siblings('.dslca-modules-section-edit-option-checkbox-hook').find('.dslca-icon').removeClass('dslc-icon-check').addClass('dslc-icon-check-empty');
			}
		} else {

			jQuery(this).val( jQuery('.dslca-modules-section-being-edited .dslca-modules-section-settings input[data-id="' + jQuery(this).data('id') + '"]', DSLC.Editor.frame ).val() );

			if ( jQuery( this ).hasClass( 'dslca-modules-section-edit-field-colorpicker' ) ) {

				var _this = jQuery( this );
				jQuery( this ).closest( '.dslca-modules-section-edit-option' )
						.find( '.sp-preview-inner' )
						.removeClass('sp-clear-display')
						.css({ 'background-color' : _this.val() });

				jQuery( this ).css({ 'background-color' : _this.val() });
			}
		}
	});

	jQuery('.dslca-modules-section-edit-field-upload').each(function(){

		var dslcParent = jQuery(this).closest('.dslca-modules-section-edit-option');

		if ( jQuery(this).val() && jQuery(this).val() !== 'disabled' ) {

			jQuery('.dslca-modules-section-edit-field-image-add-hook', dslcParent ).hide();
			jQuery('.dslca-modules-section-edit-field-image-remove-hook', dslcParent ).show();
		} else {

			jQuery('.dslca-modules-section-edit-field-image-remove-hook', dslcParent ).hide();
			jQuery('.dslca-modules-section-edit-field-image-add-hook', dslcParent ).show();
		}
	});

	// Initiate numeric option sliders
	// dslc_row_edit_slider_init();

	// Show options management
	dslc_show_section('.dslca-modules-section-edit');

	// Hide the publish button
	jQuery('.dslca-save-composer-hook').css({ 'visibility' : 'hidden' });
	jQuery('.dslca-save-draft-composer-hook').css({ 'visibility' : 'hidden' });
}


/**
 * Row - Edit - Initiate Slider
 */
function dslc_row_edit_slider_init() {

	if ( dslcDebug ) console.log( 'dslc_row_edit_slider_init' );

	jQuery('.dslca-modules-section-edit-field-slider').each(function(){

		var dslcSlider, dslcSliderField, dslcSliderInput, dslcSliderVal, dslcAffectOnChangeRule, dslcAffectOnChangeEl,
		dslcSliderTooltip, dslcSliderTooltipOffset, dslcSliderHandle, dslcSliderTooltipPos, dslcSection, dslcOptionID, dslcSliderExt = '',
		dslcAffectOnChangeRules, dslcSliderMin = 0, dslcSliderMax = 300, dslcSliderIncr = 1;

		dslcSlider = jQuery(this);
		dslcSliderInput = dslcSlider.siblings('.dslca-modules-section-edit-field');
		dslcSliderTooltip = dslcSlider.siblings('.dslca-modules-section-edit-field-slider-tooltip');

		if ( dslcSlider.data('min') ) {

			dslcSliderMin = dslcSlider.data('min');
		}

		if ( dslcSlider.data('max') ) {

			dslcSliderMax = dslcSlider.data('max');
		}

		if ( dslcSlider.data('incr') ) {

			dslcSliderIncr = dslcSlider.data('incr');
		}

		if ( dslcSlider.data('ext') ) {

			dslcSliderExt = dslcSlider.data('ext');
		}

		dslcSlider.slider({
			min : dslcSliderMin,
			max : dslcSliderMax,
			step: dslcSliderIncr,
			value: dslcSliderInput.val(),
			slide: function(event, ui) {

				dslcSliderVal = ui.value + dslcSliderExt;
				dslcSliderInput.val( dslcSliderVal );

				// Live change
				dslcAffectOnChangeEl = jQuery('.dslca-modules-section-being-edited', DSLC.Editor.frame);

				if ( dslcSliderInput.data('css-element') ) {

					dslcAffectOnChangeEl = jQuery( dslcSliderInput.data('css-element'), dslcAffectOnChangeEl );
				}

				dslcAffectOnChangeRule = dslcSliderInput.data('css-rule').replace(/ /g,'');
				dslcAffectOnChangeRules = dslcAffectOnChangeRule.split( ',' );

				// Loop through rules (useful when there are multiple rules)
				for ( var i = 0; i < dslcAffectOnChangeRules.length; i++ ) {

					jQuery( dslcAffectOnChangeEl ).css( dslcAffectOnChangeRules[i] , dslcSliderVal );
				}

				// Update option
				dslcSection = jQuery('.dslca-modules-section-being-edited', DSLC.Editor.frame);
				dslcOptionID = dslcSliderInput.data('id');
				jQuery('.dslca-modules-section-settings input[data-id="' + dslcOptionID + '"]', dslcSection).val( ui.value );

				dslcSection.addClass('dslca-modules-section-change-made');

				// Tooltip
				dslcSliderTooltip.text( dslcSliderVal );
				dslcSliderHandle = dslcSlider.find('.ui-slider-handle');
				dslcSliderTooltipOffset = dslcSliderHandle[0].style.left;
				dslcSliderTooltip.css({ left : dslcSliderTooltipOffset });
			},
			stop: function( event, ui ) {

				dslcSliderTooltip.hide();

				var scrollOffset = jQuery( window ).scrollTop();
				dslc_masonry();
				jQuery( window ).scrollTop( scrollOffset );
			},
			start: function( event, ui ) {

				dslcSliderVal = ui.value;

				dslcSliderTooltip.show();

				// Tooltip
				dslcSliderTooltip.text( dslcSliderVal );
				dslcSliderHandle = dslcSlider.find('.ui-slider-handle');
				dslcSliderTooltipOffset = dslcSliderHandle[0].style.left;
				dslcSliderTooltip.css({ left : dslcSliderTooltipOffset });
			}
		});
	});
}

/**
 * Row - Edit - Initiate Scrollbar
 */
function dslc_row_edit_scrollbar_init() {

	if ( dslcDebug ) console.log( 'dslc_row_edit_scrollbar_init' );

	var dslcWidth = 0;

	jQuery('.dslca-modules-section-edit-option').each(function(){

		dslcWidth += jQuery(this).outerWidth(true) + 1;
	});

	if ( dslcWidth > jQuery( '.dslca-modules-section-edit-options' ).width() ) {

		jQuery('.dslca-modules-section-edit-options-wrapper').width( dslcWidth );
	} else {

		jQuery('.dslca-modules-section-edit-options-wrapper').width( 'auto' );
	}
}

/**
 * Row - Edit - Cancel Changes
 */
function dslc_row_edit_cancel( callback ) {

	if ( dslcDebug ) console.log( 'dslc_row_cancel_changes' );

	callback = typeof callback !== 'undefined' ? callback : false;

	// Time to generate code optimized {HACK}
	DSLC.Editor.flags.generate_code_after_row_changed = false;

	// Recover original data from data-def attribute for each control
	jQuery('.dslca-modules-section-being-edited .dslca-modules-section-settings input', DSLC.Editor.frame).each(function(){

		jQuery(this).val( jQuery(this).data('def') );

		// Fire change for every ROW control, so it redraw linked CSS properties
		jQuery('.dslca-modules-section-edit-field[data-id="' + jQuery(this).data('id') + '"]').val( jQuery(this).data('def') ).trigger('change');
	});

	DSLC.Editor.flags.generate_code_after_row_changed = true;
	dslc_generate_code();
	dslc_show_publish_button();

	dslc_show_section('.dslca-modules');

	// Hide the save/cancel actions
	jQuery('.dslca-row-edit-actions').hide();

	// Hide the styling/responsive tabs
	jQuery('.dslca-row-options-filter-hook').hide();

	// Show the section hooks
	jQuery('.dslca-header .dslca-go-to-section-hook').show();

	// Show the publish button
	jQuery('.dslca-save-composer-hook').css({ 'visibility' : 'visible' });
	jQuery('.dslca-save-draft-composer-hook').css({ 'visibility' : 'visible' });

	// Remove being edited class
	jQuery('.dslca-modules-section-being-edited', DSLC.Editor.frame).removeClass('dslca-modules-section-being-edited dslca-modules-section-change-made');

	if ( callback ) { callback(); }

	// Show the publish button
	jQuery('.dslca-save-composer-hook').css({ 'visibility' : 'visible' });
	jQuery('.dslca-save-draft-composer-hook').css({ 'visibility' : 'visible' });
}

/**
 * Row - Edit - Confirm Changes
 */
function dslc_row_edit_confirm( callback ) {

	if ( dslcDebug ) console.log( 'dslc_confirm_row_changes' );

	callback = typeof callback !== 'undefined' ? callback : false;

	jQuery('.dslca-modules-section-being-edited .dslca-modules-section-settings input', DSLC.Editor.frame).each(function(){

		jQuery(this).data( 'def', jQuery(this).val() );
	});

	dslc_show_section('.dslca-modules');

	// Hide the save/cancel actions
	jQuery('.dslca-row-edit-actions').hide();

	// Hide the styling/responsive tabs
	jQuery('.dslca-row-options-filter-hook').hide();

	// Show the section hooks
	jQuery('.dslca-header .dslca-go-to-section-hook').show();

	// Show the publish button
	jQuery('.dslca-save-composer-hook').css({ 'visibility' : 'visible' });
	jQuery('.dslca-save-draft-composer-hook').css({ 'visibility' : 'visible' });

	// Remove being edited class
	jQuery('.dslca-modules-section-being-edited', DSLC.Editor.frame).removeClass('dslca-modules-section-being-edited dslca-modules-section-change-made');

	dslc_generate_code();
	dslc_show_publish_button();

	if ( callback ) { callback(); }

	// Show the publish button
	jQuery('.dslca-save-composer-hook').css({ 'visibility' : 'visible' });
	jQuery('.dslca-save-draft-composer-hook').css({ 'visibility' : 'visible' });
}

/**
 * Row - Copy
 */
function dslc_row_copy( row ) {

	if ( dslcDebug ) console.log( 'dslc_row_copy' );

	// Vars that will be used
	var dslcModuleID,
	dslcModulesSectionCloned,
	dslcModule;

	// Clone the row
	dslcModulesSectionCloned = row.clone().appendTo('#dslc-main');

	// Go through each area of the new row and apply correct data-size
	dslcModulesSectionCloned.find('.dslc-modules-area').each(function(){
		var dslcIndex = jQuery(this).index();
		jQuery(this).data('size', row.find('.dslc-modules-area:eq( ' + dslcIndex + ' )').data('size') );
	});

	// Remove animations and temporary hide modules
	dslcModulesSectionCloned.find('.dslc-module-front').css({
		'-webkit-animation-name' : 'none',
		'-moz-animation-name' : 'none',
		'animation-name' : 'none',
		'animation-duration' : '0',
		'-webkit-animation-duration' : '0',
		opacity : 0

	// Go through each module
	}).each(function(){

		// Current module
		dslcModule = jQuery(this);

		// Reguest new ID
		jQuery.ajax({
			type: 'POST',
			method: 'POST',
			url: DSLCAjax.ajaxurl,
			data: { action : 'dslc-ajax-get-new-module-id' },
			async: false
		}).done(function( response ) {

			// Remove "being-edited" class
			jQuery('.dslca-module-being-edited', DSLC.Editor.frame).removeClass('dslca-module-being-edited');

			// Get new ID
			dslcModuleID = response.output;

			// Apply new ID and append "being-edited" class
			dslcModule.data( 'module-id', dslcModuleID ).attr( 'id', 'dslc-module-' + dslcModuleID ).addClass('dslca-module-being-edited');

			// Reload the module, remove "being-edited" class and show module
			dslc_module_output_altered( function(){
				jQuery('.dslca-module-being-edited', DSLC.Editor.frame).removeClass('dslca-module-being-edited').animate({
					opacity : 1
				}, 300);
			});

		});

	});

	// Call additional functions
	dslc_drag_and_drop();
	dslc_generate_code();
	dslc_show_publish_button();
}

/**
 * Row - Import
 */
function dslc_row_import( rowCode ) {

	if ( dslcDebug ) console.log( 'dslc_row_import' );

	// AJAX Call
	jQuery.post(

		DSLCAjax.ajaxurl,
		{
			action : 'dslc-ajax-import-modules-section',
			dslc : 'active',
			dslc_modules_section_code : rowCode
		},
		function( response ) {

			// Close the import popup/modal
			dslc_js_confirm_close();

			// Add the new section
			jQuery('#dslc-main').append( response.output );

			// Call other functions
			dslc_bg_video();
			dslc_carousel();
			dslc_masonry( jQuery('#dslc-main').find('.dslc-modules-section:last-child') );
			dslc_drag_and_drop();
			dslc_show_publish_button();
			dslc_generate_code();
		}
	);
}

/**
 * Deprecated Functions and Fallbacks
 */

function dslc_add_modules_section() { dslc_row_add(); }
function dslc_delete_modules_section( row  ) { dslc_row_delete( row ); }
function dslc_edit_modules_section( row ) { dslc_row_edit( row ); }
function dslc_edit_modules_section_colorpicker() { dslc_row_edit_colorpicker_init(); }
function dslc_edit_modules_section_slider() { dslc_row_edit_slider_init(); }
function dslc_edit_modules_section_scroller() { dslc_row_edit_scrollbar_init(); }
function dslc_copy_modules_section( row ) { dslc_row_copy( row ); }
function dslc_import_modules_section( rowCode ) { dslc_row_import( rowCode ); }

/**
 * Row - Document Ready Actions
 */

jQuery(document).ready(function($){

	/**
	 * Initialize
	 */

	/*dslc_row_edit_colorpicker_init();
	dslc_row_edit_slider_init();*/


	/**
	 * Hook - Confirm Row Changes
	 */
	$(document).on( 'click', '.dslca-row-edit-save', function(){

		dslc_row_edit_confirm();
		$(".dslca-currently-editing").removeAttr('style');
		$('.dslca-row-options-filter-hook.dslca-active').removeClass('dslca-active');
		dslc_responsive_classes( true );
	});

	/**
	 * Hook - Cancel Row Changes
	 */
	$(document).on( 'click', '.dslca-row-edit-cancel', function(){

		dslc_row_edit_cancel();
		$(".dslca-currently-editing").removeAttr('style');
		$('.dslca-row-options-filter-hook.dslca-active').removeClass('dslca-active');
		dslc_responsive_classes( true );
	});
});