'use strict';

(function ($, lunr, database) {
	var resultsContainer = $('#search-results')
	var navigationContainer = $('#navigation')
	var nothingFound = $('<li>Nothing found.</li>')
	var searchQuery = $('#search-input')
	database = database || {}

	function createSearchStore(data) {
		var searchStore = lunr(function () {
			var self = this

			self.field('id');
			self.field('title', { boost: 10 });
			self.field('category');
			self.field('content');

			Object.keys(data).forEach(function (key) {
				self.add({
					id: key,
					title: data[key].title,
					category: data[key].category,
					content: data[key].content
				});
			})

		});

		return searchStore
	}

	function resultEntry(result) {
		var searchEntry = $('<li />')
		var searchLink = $('<a />')

		var categoryPath = result.url.split('/')
		categoryPath.shift()
		categoryPath.pop()

		searchEntry
			.append(searchLink)

		searchLink.attr('href', result.href)

		searchLink.text(result.title)

		return searchEntry
	}

	function displayResults(results) {
		resultsContainer.empty()

		if (results.length > 0) {
			results.map(function(entry) {
				resultsContainer.append(resultEntry(entry))
			})
		} else {
			resultsContainer.append(nothingFound)
		}

		navigationContainer.hide()
		resultsContainer.show()
	}

	function hideResults() {
		resultsContainer.hide()
		navigationContainer.show()
	}

	function searchStore(store, data) {
		return function (term) {
			var results = store.search(term)

			return results.map(function (result) {
				return data[result.ref]
			})
		}
	}

	function queryChange(display, hide, search) {
		return function (event) {
			var value = event.srcElement.value

			if (value.length === 0) {
				hide()
			}

			if (value.length > 2) {
				display(search(value))
			}
		}
	}

	function keyboardControls(hide) {
		return function (event) {
			switch (event.keyCode) {
				case 27:
					hide()
				break
			}
		}
	}

	function getQueryVariable(variable) {
		var query = window.location.search.substring(1);
		var vars = query.split('&')

		for (var i = 0; i < vars.length; i++) {
			var pair = vars[i].split('=')

			if (pair[0] === variable) {
				return decodeURIComponent(pair[1].replace(/\+/g, '%20'))
			}
		}
	}

	var search = searchStore(createSearchStore(database), database)
	var searchTerm = getQueryVariable('query')

	if (searchTerm) {
		displayResults(search(searchTerm))
		searchQuery.attr('value', searchTerm)
	}

	searchQuery.on('input', queryChange(displayResults, hideResults, search))
	$(document).on('keyup', keyboardControls(hideResults))

})(Zepto, lunr, window.database)
