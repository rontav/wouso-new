// General
$("#nav-ul").append('<li><a href="/qotd">Qotd</a></li>')

// Specific

// Mark selected answers
// This is done because we need a default behavior for checkboxes
$('body').on('change', '[name="check"]',function() {
    if ($(this).is(":checked")) {
      $(this).siblings('[name="valid"]').val("true")
    } else {
      $(this).siblings('[name="valid"]').val("false")
    }
})

$(document).ready(function() {


    // Hide question template
    $('.qotd-answer-template').css('display', 'none')

    // Add another answer entry to a qotd, by cloning the template
    $('[name="add-qotd-answer"]').click(function() {
        $('.qotd-answer-template').first().clone()
                         .addClass('qotd-answer')
                         .removeClass('qotd-answer-template')
                         .appendTo('.qotd-answer-list')
                         .css('display', 'block')
    })
})