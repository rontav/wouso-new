$(document).foundation()


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