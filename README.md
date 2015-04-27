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
* when developing test cases, reffer to the zombie [docs](http://zombie.js.org/#assertions)
* when developing themes, you can overwrite the core CSS or any view, by creating
a .jade file with the name of the file that you would like to overwrite, in the
themes directory; you can also have a style.css file to add more styling
* a module can see all instaled modules, by checking

	app.get('modules')


# TODO:

## Core
* investigate LDAP login
* add lang directory that stores strings in different languages
* better handling of logging
* timezone option
* merge login and connect endpoints
* edit user profile
	* select used email
	* select name
* add groups
* add score collection
* game simulator
* stats page
* user messages
* push notifications
	* notify users when a new qotd get's published
	* notifications for new messages in inbox


## QOTD
* qotd new question form validation
	* make sure we don't have the same answer twice
* batch edit for questions
* search questions
	* filter by tag
* add option for number of questions per page in list
* show question options on click
* add question tags
* add timer option
	* option for custom time
	* option for auto for submission (mark as wrong?)
* flag question after answer is shown
* accept questions proposed by users
* optimise day mark in datepicker for single month
* use separate locales for qotd module
* hide questions instead of delete
	* when a question's text or options get edited, create a new question and
	hide the old one, to hold proof for the user's score
* import/export questions to json file
