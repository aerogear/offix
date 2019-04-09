'use strict';
(function ($) {
	var menuIcon = $('#menu')
	var closeIcon = $('#close')
	var sidebar = $('#sidebar')

	menuIcon.on('click', function () {
		sidebar.addClass('opened')
		menuIcon.hide()
		closeIcon.show()
	})

	closeIcon.on('click', function () {
		sidebar.removeClass('opened')
		menuIcon.show()
		closeIcon.hide()
	})
})(Zepto)
