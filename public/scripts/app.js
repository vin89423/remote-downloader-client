document.addEventListener('DOMContentLoaded', function() {

  $('#login-form').on('submit', function(e) {
    var $form = $(this),
      $userInput = $('input[name="username"]', $form),
      $passInput = $('input[name="password"]', $form);

    $('.is-invalid', $form).removeClass('is-invalid');
    if ($userInput.val().trim().length === 0) $userInput.addClass('is-invalid');
    if ($passInput.val().trim().length === 0) $passInput.addClass('is-invalid');
    if ($('.is-invalid', $form).length > 0) {
      e.preventDefault();
      return false
    }

    return true;
  });

  $('#mission-list')
    .on('refresh', function(e) {
      var $missionList = $('#mission-list'),
        $noMission = $('#no-mission');

      $.ajax({
        url: window.baseUrl + 'relay/mission/list',
        method: 'get',
        dataType: 'json',
        error: function(jqXHR, textStatus, errorThrown) {
          location.href = window.baseUrl;
        },
        success: function(json, textStatus, jqXHR) {
          if (json.cnt === 0) {
            $missionList.removeClass('d-block').empty();
            $noMission.removeClass('d-none');
            return;
          }

          $noMission.addClass('d-none');
          $missionList.addClass('d-block');
          for (var i = 0; i < json.list.length; i++) {
            var { fileId, filename, filesize, progress, message, status, type, url } = json.list[i],
              $card = $('#file-'+ fileId, $missionList);

            if ($card.length == 0) {
              var card = `
                <div id="file-${fileId}" class="card download-card" data-file-id="${fileId}">
                  <div class="card-body">
                    <div class="icon">
                      <img src="${window.baseUrl}icons/${type}" />
                    </div>
                    <div class="detail">
                      <label>${filename}</label>
                      <a href="${url}" target="_blank">${url}</a>
                      <div class="progress ${ (!['error', 'finished'].includes(status) ? '' : 'd-none') }">
                        <div class="progress-bar progress-bar-striped progress-bar-animated"></div>
                      </div>
                      <div class="ctrl-finished ${ (status === 'finished' ? 'd-block' : '') }">
                        <a href="${window.baseUrl}relay/mission/download/${fileId}" class="btn btn-primary me-3" target="_blank">
                          <i class="fas fa-download"></i> Download
                        </a>
                        <a href="#" class="card-link text-danger" data-event="delete-mission">
                          <i class="fas fa-trash"></i> Delete
                        </a>
                      </div>
                      <div class="ctrl-error ${ (status === 'error' ? 'd-block' : '') }">
                        <a href="#" class="card-link" data-event="delete-mission">
                          <i class="fas fa-trash"></i> Delete
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              `;
              $missionList.prepend(card);
            } else {
              var {status, filesize, progress} = json.list[i];
              if (['error', 'finished'].includes(status)) {
                $('.progress', $card).addClass('d-none');
                $('.ctrl-'+ status, $card).addClass('d-block');
              } else {
                precentage = (progress / filesize) * 100;
                $('.progress-bar', $card).css('width', precentage + '%');
              }
            }
          }
        }
      });
    })
    .on('click', '.download-card [data-event=delete-mission]', function(e) {
      e.preventDefault();
      var $btn = $(this),
        $card = $btn.parents('.download-card'),
        fileId = $card.attr('data-file-id'),
        confirmed = $btn.attr('data-confirmed');

      if (!fileId) return;
      if (!confirmed) {
        return $btn.attr('data-confirmed', true).html('<i class="fas fa-trash"></i> Confirm Delete ?');
      }

      $.ajax({
        url: window.baseUrl + 'relay/mission/remove/'+ fileId,
        type: 'post'
      });

      $card.remove();
      if ($('#mission-list .download-card').length == 0) {
        $('#mission-list').removeClass('d-block');
        $('#no-mission').removeClass('d-none');
      }
    });

  $('#mission-list').trigger('refresh');
  // if ($('#mission-list').length == 1) {
  //   setInterval(function() {
  //     $('#mission-list').trigger('refresh');
  //   }, 5000);
  // }

  $('#add-mission-modal')
    .on('submit', 'form', function(e) {
      e.preventDefault();
      var $form = $(this),
        $urlInput = $('[name=url]', $form),
        $filenameInput = $('[name=filename]', $form);

      $('.is-invalid', $form).removeClass('is-invalid');
      if ($urlInput.val().trim().length === 0) $urlInput.addClass('is-invalid');
      if ($('.is-invalid', $form).length > 0) {
        return false
      }

      $('#add-mission-modal').modal('hide');
      $.ajax({
        url: $form.attr('action'),
        type: $form.attr('method'),
        data: $form.serialize(),
        error: function(jqXHR, textStatus, errorThrown) {
          var $alert = $('#alert-modal');
          $('.modal-body', $alert).html('<p>'+ jqXHR.text +'</p>');
          $alert.modal('show');
        },
        success: function(json, textStatus, jqXHR) {
          $('#mission-list').trigger('refresh');
          $urlInput.val('');
          $filenameInput.val('');
        }
      });

      return false
    });

  $('#remove-all-modal')
    .on('submit', 'form', function(e) {
      e.preventDefault();
      var $form = $(this);
      $('#remove-all-modal').modal('hide');
      $.ajax({
        url: $form.attr('action'),
        type: $form.attr('method'),
        success: function(json, textStatus, jqXHR) {
          $('#mission-list').removeClass('d-block').empty();
          $('#no-mission').removeClass('d-none');
        }
      });
    });






});