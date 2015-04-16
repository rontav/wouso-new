$(document).foundation()

// Switch user role
var previous_role
$('.role-select').on('focus', function () {
    previous_role = this.value;

}).change(function() {
  $.ajax({
    url: '/api/user/' + this.id + '?role=' + this.value,
    type: "GET",
    success: function(response) {
      if (response.success) {
        $(this).val(this.value)
      } else {
        $(this).val(previous_role)
      }
    }
  })
})

$('.setting').change(function() {
  checkb = $(this)
  state  = checkb.context.checked
  update = checkb.attr('id') + '=' + state
  // Immediatelly revert to state before click
  checkb.prop('checked', !state)

  // If setting was updated, revert to the state after click
  $.ajax({
    url: '/api/settings/set?' + update,
    type: "GET",
    success: function(response) {
      if (response.success) {
        checkb.prop('checked', state)
      } else {
        checkb.prop('checked', !state)
      }
    }
  })
})