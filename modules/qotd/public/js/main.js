// QotD datepicker
$('#datepicker').datepicker({
  inline: true,
  todayHighlight: true
}).on('changeDate', function(e) {
  $('#qotd-date').val(e.format('dd/mm/yyyy'))
})

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
    $('[name="add-qotd-answer"]').click(addQotdOption)

    // Add default number of options for new QotD
    if (typeof noOfOptions != 'undefined') {
        for (var i=0; i<noOfOptions; i++)
            addQotdOption()
    }

    function addQotdOption() {
        $('.qotd-answer-template').first().clone()
                         .addClass('qotd-answer row')
                         .removeClass('qotd-answer-template')
                         .appendTo('.qotd-answer-list')
                         .css('display', 'block')
    }

    // Get today's question and display it
    $.ajax({
      url: '/api/qotd/play',
      type: 'GET',
      success: function(response) {
        if (response) {
          $('.qotd-play-question').text(response.question)
          $('.qotd-play-question')
            .append('<input name="question_id" type="hidden" value="' + response._id + '" hidden>')

          response.answers.forEach(function(ans) {
            $('.qotd-play-answers')
              .append('<div class="qotd-play-answer"><input type="radio" \
                name="ans" value="' + ans + '">' + ans + '</div>')
          })

          if (response.answer) {
            $('.qotd-play-answers').append('<p>Answer: ' + response.answer + '</p>')
          } else {
            $('.qotd-form').append('<input class="button small" type="submit" value="Check">')
          }
        }
      }
    })
})