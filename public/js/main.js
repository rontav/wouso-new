$(document).foundation()

// Switch user role
var previous_role
$('.role-select').on('focus', function () {
    previous_role = this.value;

}).change(function() {
  select = $(this)
  new_role = this.value
  // Immediatelly revert to state before click
  select.val(previous_role)

  $.ajax({
    url: '/api/user/' + this.id + '?role=' + new_role,
    type: "GET",
    success: function(response) {
      if (response.success) {
        select.val(new_role)
      }
    }
  })
})

// Select login level
var previous_login_level
$('.login-level-select').on('focus', function () {
    previous_login_level = this.value;

}).change(function() {
  select = $(this)
  new_login_level = this.value
  update = select.attr('id') + '=' + new_login_level
  // Immediatelly revert to state before click
  select.val(previous_login_level)

  $.ajax({
    url: '/api/settings/set?' + update,
    type: "GET",
    success: function(response) {
      if (response.success) {
        // Update value if change was successful
        select.val(new_login_level)
      }
    }
  })
})

$('.setting').change(function() {
  checkb = $(this)
  state  = checkb.context.checked
  update = checkb.attr('id') + '=' + state

  // Count the number of activated login methods
  count = 0
  available_logins = ['login-local', 'login-fb', 'login-tw', 'login-gp', 'login-gh']
  available_logins.forEach(function(login) {
    if ($('#'+login)[0].checked) count++
  })

  // Immediatelly revert to state before click
  checkb.prop('checked', !state)

  // Update game setting only if at least one login method is enabled
  if (count != 0) {

    $.ajax({
      url: '/api/settings/set?' + update,
      type: "GET",
      success: function(response) {
        // If setting was updated, revert to the state after click
        if (response.success) {
          checkb.prop('checked', state)
        }
      }
    })

  // Alert user to make sure at least one login method is enabled
  } else {
    $('.login-message-nologin').show()
  }
})

// Alerts
var socket = io.connect('localhost:4000')

// Alerts style
$.noty.defaults['layout'] = 'bottomLeft'
$.noty.defaults['theme'] = 'relax'
$.noty.defaults['type'] = 'information'
$.noty.defaults['timeout'] = 5000

if (myuser)
  socket.on(myuser, function (msg) {
    noty({
      text: 'One new message!',
      callback: {
        onCloseClick: function() {document.location.href = '/messages'}
      }
    })
  })
