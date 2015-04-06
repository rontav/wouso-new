// General
$("#nav-ul").append('<li><a href="/qotd">Qotd</a></li>')

// Specific

// Mark selected answers
// This is done because we need a default behavior for checkboxes
$('body').on('click', '[name="check"]',function() {
    valid_field = $(this).parent().parent().children('#valid')
    if (valid_field.val() == 'false') {
        valid_field.val(true)
        $(this).text('True')
        $(this).addClass('success')
    } else {
        valid_field.val(false)
        $(this).text('False')
        $(this).removeClass('success')
    }
})


$(document).ready(function() {
    // Hide question template
    $('.qotd-answer-template').css('display', 'none')

    // Add another answer entry to a qotd, by cloning the template
    $('[name="add-qotd-answer"]').click(function() {
        $('.qotd-answer-template').first().clone()
                         .addClass('qotd-answer row')
                         .removeClass('qotd-answer-template')
                         .appendTo('.qotd-answer-list')
                         .css('display', 'block')
    })
})