// Highlight days that have scheduled qotds in datepicker
qotd_dates = []
$.ajax({
  url: '/api/qotd/list/dates',
  type: 'GET',
  success: function(qotd_dates) {

    // QotD datepicker
    $('#datepicker').datepicker({
      inline: true,
      beforeShowDay: function(date) {
        formated_date = new Date(Date.parse(date)).toISOString()
        if (qotd_dates.indexOf(formated_date) > -1)
          return { classes: 'activeClass' }
      }
    }).on('changeDate', function(e) {
      $('#qotd-date').val(e.format('dd/mm/yyyy'))
    })
  }
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

    // Get list of questions
    curPage = 1
    perPage = 10
    listQotdQuestions(perPage, curPage)

    // Get today's question and display it
    $.ajax({
      url: '/api/qotd/play',
      type: 'GET',
      success: function(response) {
        if (response) {
          // Display question and store question id
          $('.qotd-play-question').text(response.question)
          $('.qotd-play-question')
            .append('<input name="question_id" type="hidden" value="' + response._id + '" hidden>')

          // Display answer options
          if (response.answers) {
            response.answers.forEach(function(ans) {
              // Highlight right response
              if (response.answer == ans) {
                $('.qotd-play-answers').append('<div class="qotd-play-answer">\
                  <input type="radio" name="ans" value="' + ans + '"><span\
                  class="qotd-right-answer">' + ans + '</div>')
              } else {
                $('.qotd-play-answers').append('<div class="qotd-play-answer">\
                  <input type="radio" name="ans" value="' + ans + '">' + ans + '</div>')
              }
            })
          }

          // Display submit button, if there is no answer
          if (!response.answer) {
            $('.qotd-form').append('<input class="button small" type="submit" value="Check">')

          // Display message if ther is no answer or question
          } else if (!response.answer && !response.question) {
            $('.qotd-play-question').append('<p>' + response + '</p>')
          }
        }
      }
    })
})


// Print answer option
function addQotdOption() {
  $('.qotd-answer-template')
    .first().clone()
    .addClass('qotd-answer row')
    .removeClass('qotd-answer-template')
    .appendTo('.qotd-answer-list')
    .css('display', 'block')
}

// Request and print QotD questions in list
function listQotdQuestions(perPage, currentPage) {
  nextPage = currentPage + 1

  $.ajax({
    url: '/api/qotd/list/' + perPage + '/' + currentPage,
    type: 'GET',
    success: function(response) {
      if (response) { printQotd(response) }
    }
  })

  function printQotd(response) {
    // Empty current page
    $('.qotd-question-list').empty()
    $('.qotd-question-pages').empty()

    // Add each questions
    response.questions.forEach(function(q) {
      qdate = new Date(q.date)
      fullDate = ('0' + qdate.getDate()).slice(-2) + '/'
      fullDate += ('0' + (qdate.getMonth()+1)).slice(-2) + '/'
      fullDate += qdate.getFullYear()
      $('.qotd-question-list').append('<div class="large-11 columns">' + q.question + '</div>\
        <div class="large-1 columns text-right">' + fullDate + '</div>')
    })

    // Add page links
    for (var i=1; i<=response.count/perPage+1; i++) {
      if (i == currentPage) {
        $('.qotd-question-pages').append('<b>' + i + ' </b>')
      } else {
        $('.qotd-question-pages').append('<a href="#" onclick="listQotdQuestions(perPage, nextPage)">' + i + ' </a>')
      }
    }
  }
}
