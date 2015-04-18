## De ce ?
* design modular
** ce poate fi usor adaptat la diferite functionalitati pentru mai multe cazuri
de utilizare (nu doar la noi in facultate)
* bine documentat
** usor de contribuit la proiect (bugfix-uri, module noi, etc.)
* internationalizabil
** suport pentru mai multe limbi

## Development
* for locales development please reffer to the [documentation](https://github.com/jeresig/i18n-node-2)
* when developing modules, create a sym link to the module in /modules, so changes
are reflected directly, without installing the module
* a module can see all instaled modules, by checking

	app.get('modules')


## TODO:
* investigate LDAP login
* add lang directory that stores strings in different languages
* better handling of logging
* merge login and connect endpoints

## QOTD
* find a way to insert game into nav
* qotd new question form validation
	* make sure we don't have the same answer twice
* possibility to override module view and style
* batch edit for questions
* paginate qotd list
* timezone option
* add timer option
* flag question after answer is shown
* optimise day mark in datepicker for single month
* use separate locales for qotd module
