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
    valid_field = $(this).parent().parent().children('#qotd-valid')
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


// Get list of questions
var curPage = 1
var perPage = 10
listQotdQuestions(perPage, curPage)

// Keeps list of selected tag IDs
var selectedTags = []


$(document).ready(function() {
    // Hide question template
    $('.qotd-answer-template').css('display', 'none')

    // Add another answer entry to a qotd, by cloning the template
    $('[name="add-qotd-answer"]').click(addQotdOption)

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
              if (response.answer && response.answer.indexOf(ans) > -1) {
                // Highlight correct answer
                $('.qotd-play-answers').append('<div class="qotd-play-answer">\
                  <input type="checkbox" name="ans" disabled><span\
                  class="qotd-right-answer">' + ans + '</div>')
              } else if (response.answer) {
                $('.qotd-play-answers').append('<div class="qotd-play-answer">\
                  <input type="checkbox" name="ans" disabled><span>' + ans + '</div>')
              } else {
                // Add question options
                $('.qotd-play-answers').append('<div class="qotd-play-answer">\
                  <input type="checkbox" name="ans" value="' + ans + '">' + ans + '</div>')
              }
            })
          }

          // Display message if there is no answer or question
          if (!response.answer && !response.question) {
            $('.qotd-play-question').append('<p>' + response + '</p>')

          // Display submit button, if there is no answer, and start timer
          } else if (!response.answer) {
            $('.qotd-form').append('<input class="button small" type="submit" value="Check">')
            $('#progress-bar').anim_progressbar()
          }
        }
      }
    })
})

// Reveal modal to edit qotd
function editQotd(id) {
  // Clear data and set default text
  $('#qotd-question').val('')
  $('#qotd-tags').val('')
  $('#qotd-date').val('')
  $('.qotd-answer-list').empty()
  $('#qotd-addForm').text('Add question')
  $('#qotd-submit').val('Save')

  // Reveal modal
  $('#addQotdModal').foundation('reveal', 'open')

  // Get data if needed
  if (typeof id !== 'undefined') {
    $.ajax({
      url: '/api/qotd/list/1/1?id=' + id,
      type: 'GET',
      success: function(response) {
        if (response) { populateQotd(response) }
      }
    })

  } else {
    // Add default number of options
    if (typeof noOfOptions != 'undefined') {
      for (var i=0; i<noOfOptions; i++)
        addQotdOption()
    }
  }

  function populateQotd(data) {
    q = data.questions[0]
    $('#qotd-id').val(q._id)
    $('#qotd-question').val(q.question)
    if (q.date) $('#qotd-date').val(shortenDate(q.date))
    // Update title and submit button  for edit mode
    $('#qotd-addForm').text('Edit question')
    $('#qotd-submit').val('Update')
    // Add options
    for (var i=0; i<q.choices.length; i++)
      addQotdOption()
    // Populate options
    $('.qotd-answer :input[type="text"]').each(function(i) {
      $(this).val(q.choices[i].text)
    })
    // Mark right answer
    $('.qotd-check:gt(0)').each(function(i) {
      if (q.choices[i].val == true) {
        $(this).addClass('success')
        $(this).text('True')
        $(this).parent().parent().children('#qotd-valid').val('true')
      }
    })
    // Add tags
    tags = ''
    for (var i=0; i<q.tags.length; i++)
      tags += q.tags[i] + ' '
    $('#qotd-tags').val(tags)
  }
}

function selectTag(id) {
  selectedTags.push(id)
  // Refresh qotd list
  listQotdQuestions(perPage, curPage, selectedTags)
}

// Print answer option
function addQotdOption() {
  $('.qotd-answer-template')
    .first().clone()
    .addClass('qotd-answer row')
    .removeClass('qotd-answer-template')
    .appendTo('.qotd-answer-list')
    .css('display', 'block')
}

// Transform string data from std format to DD/MM/YY
function shortenDate(date) {
  qdate = new Date(date)
  shortDate = ('0' + qdate.getDate()).slice(-2) + '/'
  shortDate += ('0' + (qdate.getMonth()+1)).slice(-2) + '/'
  shortDate += qdate.getFullYear()
  return shortDate
}

// Request and print QotD questions in list
function listQotdQuestions(perPage, currentPage, sTags) {
  // Use current tags if none provided
  if (typeof selectedTags === 'undefined' || selectedTags.length == 0) sTags = ''
  if (typeof selectedTags === 'object') sTags = selectedTags.join()

  $.ajax({
    url: '/api/qotd/list/' + perPage + '/' + currentPage + '?tags=' + sTags,
    type: 'GET',
    success: function(response) {
      if (response) { printQotd(response) }
    }
  })

  function printQotd(response) {
    // Empty current page
    $('.qotd-question-list').empty()
    $('.qotd-question-pages').empty()

    // Handle 0 questions response
    if (response.count == 0)
      $('.qotd-question-list').text('No questions at this moment.')

    // Print each question
    response.questions.forEach(function(q) {
      shortDate = '--/--/--'
      if (q.date) shortDate = shortenDate(q.date)

      $('.qotd-question-list').append('<div class="large-9 columns">' + q.question +
        '</div><div class="large-1 columns"><a href="#" onclick="editQotd(\'' + q._id + '\')">Edit</a></div>' +
        '<div class="large-2 columns text-center">' + shortDate + '</div>')
    })

    // Add page links
    for (var i=1; i<=response.count/perPage+1; i++) {
      if (i == currentPage) {
        $('.qotd-question-pages').append('<b>' + i + ' </b>')
      } else {
        $('.qotd-question-pages').append('<a href="#" onclick="listQotdQuestions(perPage, ' + i + ')">' + i + ' </a>')
      }
    }
  }
}

// Register function for end of timer
function do_on_timeout() {
  $('#qotd').submit()
}
