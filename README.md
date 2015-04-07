De ce ?

* design modular
** ce poate fi usor adaptat la diferite functionalitati pentru mai multe cazuri
de utilizare (nu doar la noi in facultate)
* bine documentat
** usor de contribuit la proiect (bugfix-uri, module noi, etc.)
* internationalizabil
** suport pentru mai multe limbi

## TODO:
* investigate LDAP login
* add lang directory that stores strings in different languages
* move login page to theme directory
* better handling of logging

## BUGS
* login with a connected account returns another user (if you login with a
local account, connect your github account, logout, login with github, you
do not get the local account)

##QOTD
* move all qotd module files inside package
* find a way to insert game into app
* qotd new question form validation
* qotd play game