(function (window, document) {
  'use strict';

  var form = document.getElementById('join-form');
  if (!form) return;

  var status = document.getElementById('form-status');
  var ageSelect = form.elements.age_group;
  var guardianField = document.getElementById('guardian-field');
  var guardianInput = form.elements.guardian;
  var memberTypeError = document.getElementById('member-type-error');
  var consentError = document.getElementById('consent-error');
  var recipient = 'kasaishi.youtube.official@gmail.com';
  var draftKey = 'kasai-member-form-draft-v2';

  function each(nodes, callback) {
    if (!nodes) return;
    for (var i = 0; i < nodes.length; i++) callback(nodes[i], i);
  }
  function hasClass(el, name) { return !!el && (' ' + el.className + ' ').indexOf(' ' + name + ' ') !== -1; }
  function addClass(el, name) { if (el && !hasClass(el, name)) el.className += (el.className ? ' ' : '') + name; }
  function removeClass(el, name) {
    if (!el) return;
    el.className = (' ' + el.className + ' ').replace(new RegExp('\\s' + name + '\\s', 'g'), ' ').replace(/^\s+|\s+$/g, '');
  }
  function clean(value) { return String(value || '').replace(/^\s+|\s+$/g, ''); }
  function setStatus(message, isError) {
    if (!status) return;
    status.textContent = message;
    status.style.color = isError ? '#9f1515' : '';
  }
  function toggleGuardian() {
    var isMinor = ageSelect && ageSelect.value === '18歳未満';
    if (guardianField) { if (isMinor) guardianField.removeAttribute('hidden'); else guardianField.setAttribute('hidden', 'hidden'); }
    if (guardianInput) {
      guardianInput.required = isMinor;
      if (!isMinor) {
        guardianInput.value = '';
        removeClass(guardianInput, 'is-invalid');
      }
    }
  }
  if (ageSelect) ageSelect.addEventListener('change', toggleGuardian, false);
  toggleGuardian();

  function getCheckedValues(name) {
    var values = [];
    var inputs = form.querySelectorAll('input[name="' + name + '"]:checked');
    each(inputs, function (item) { values.push(item.value); });
    return values;
  }
  function clearErrors() {
    each(form.querySelectorAll('.is-invalid'), function (el) { removeClass(el, 'is-invalid'); });
    each(form.querySelectorAll('.field-error'), function (el) { el.textContent = ''; });
  }
  function showFieldError(field, message) {
    addClass(field, 'is-invalid');
    var label = field.closest ? field.closest('label') : null;
    var error = label ? label.querySelector('.field-error') : null;
    if (error) error.textContent = message;
  }
  function isFieldValid(field) {
    if (typeof field.checkValidity === 'function') return field.checkValidity();
    if ((field.type === 'checkbox' || field.type === 'radio') && field.required && !field.checked) return false;
    if (field.required && !clean(field.value)) return false;
    if (field.type === 'email' && field.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value)) return false;
    if (field.minLength > 0 && field.value.length < field.minLength) return false;
    return true;
  }
  function validate() {
    clearErrors();
    var valid = true;
    var requiredFields = form.querySelectorAll('input[required]:not([type="checkbox"]), select[required], textarea[required]');
    each(requiredFields, function (field) {
      if (!isFieldValid(field)) {
        valid = false;
        var message = 'この項目を入力してください。';
        if ((field.validity && field.validity.typeMismatch) || (field.type === 'email' && field.value)) message = '正しい形式で入力してください。';
        if ((field.validity && field.validity.tooShort) || (field.minLength > 0 && field.value.length < field.minLength)) message = field.minLength + '文字以上で入力してください。';
        showFieldError(field, message);
      }
    });
    if (getCheckedValues('member_type').length === 0) {
      valid = false;
      if (memberTypeError) memberTypeError.textContent = '参加区分を1つ以上選択してください。';
    }
    var requiredConsents = form.querySelectorAll('input[type="checkbox"][required]');
    var consentOk = true;
    each(requiredConsents, function (box) { if (!box.checked) consentOk = false; });
    if (!consentOk) {
      valid = false;
      if (consentError) consentError.textContent = '3つの確認事項すべてに同意してください。';
    }
    if (!valid) {
      var firstInvalid = form.querySelector('.is-invalid') || form.querySelector('input[type="checkbox"][required]:not(:checked)');
      if (firstInvalid && firstInvalid.focus) firstInvalid.focus();
      setStatus('入力内容をご確認ください。', true);
    }
    return valid;
  }
  function buildApplication() {
    var d = form.elements;
    var types = getCheckedValues('member_type');
    var lines = [
      '葛西記念財団 メンバー加入申込',
      '================================',
      '',
      '【基本情報】',
      'お名前：' + clean(d.name.value),
      'ふりがな：' + clean(d.kana.value),
      'メールアドレス：' + clean(d.email.value),
      '年代：' + clean(d.age_group.value),
      'お住まいの地域：' + clean(d.region.value),
      'SNS・ウェブサイト：' + (clean(d.sns.value) || '未記入')
    ];
    if (d.age_group.value === '18歳未満') lines.push('保護者のお名前・連絡方法：' + clean(d.guardian.value));
    lines.push(
      '',
      '【参加希望】',
      '希望する参加区分：' + types.join('、'),
      '興味のある分野：\n' + clean(d.interests.value),
      '得意なこと・経験：\n' + (clean(d.skills.value) || '未記入'),
      '参加を希望する理由：\n' + clean(d.motivation.value),
      '参加しやすい曜日・時間：' + (clean(d.availability.value) || '未記入'),
      '参加方法：' + (clean(d.participation.value) || '未選択'),
      '',
      '【確認事項】',
      '・定款と活動ルールへの同意：同意済み',
      '・個人情報の取扱いへの同意：同意済み',
      '・行動規範・反社会的勢力排除への同意：同意済み',
      '',
      '作成日時：' + new Date().toLocaleString()
    );
    return lines.join('\n');
  }
  function copyText(text, successMessage) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      var promise = navigator.clipboard.writeText(text);
      if (promise && promise.then) {
        promise.then(function () { setStatus(successMessage, false); }, function () { legacyCopy(text, successMessage); });
        return;
      }
    }
    legacyCopy(text, successMessage);
  }
  function legacyCopy(text, successMessage) {
    var area = document.createElement('textarea');
    area.value = text;
    area.setAttribute('readonly', 'readonly');
    area.style.position = 'fixed';
    area.style.left = '-9999px';
    area.style.top = '0';
    document.body.appendChild(area);
    area.select();
    var copied = false;
    try { copied = document.execCommand('copy'); } catch (ignore) {}
    document.body.removeChild(area);
    setStatus(copied ? successMessage : 'コピーできませんでした。申込書を保存してメールに添付してください。', !copied);
  }
  function downloadText(text) {
    var safeName = clean(form.elements.name.value).replace(/[\\\/:*?"<>|]/g, '_') || '申込者';
    var filename = '葛西記念財団_メンバー加入申込_' + safeName + '.txt';
    if (!window.Blob) return false;
    var blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    if (navigator.msSaveOrOpenBlob) {
      navigator.msSaveOrOpenBlob(blob, filename);
      return true;
    }
    var URLObject = window.URL || window.webkitURL;
    if (!URLObject || !URLObject.createObjectURL) return false;
    var url = URLObject.createObjectURL(blob);
    var link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';
    document.body.appendChild(link);
    if ('download' in link && link.click) link.click(); else window.open(url, '_blank');
    document.body.removeChild(link);
    window.setTimeout(function () { URLObject.revokeObjectURL(url); }, 1000);
    return true;
  }

  form.addEventListener('submit', function (event) {
    event.preventDefault ? event.preventDefault() : (event.returnValue = false);
    if (!validate()) return false;
    var application = buildApplication();
    var subject = '【メンバー加入申込】' + clean(form.elements.name.value) + ' 様';
    setStatus('メール作成画面を開きます。内容をご確認のうえ送信してください。', false);
    window.location.href = 'mailto:' + recipient + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(application);
    return false;
  }, false);

  var copyButton = document.getElementById('copy-application');
  if (copyButton) copyButton.addEventListener('click', function () {
    if (!validate()) return;
    copyText(buildApplication(), '申込内容をクリップボードにコピーしました。');
  }, false);

  var downloadButton = document.getElementById('download-application');
  if (downloadButton) downloadButton.addEventListener('click', function () {
    if (!validate()) return;
    var ok = downloadText(buildApplication());
    setStatus(ok ? '申込書（TXT）を保存しました。公式メールへ添付してお送りください。' : 'このブラウザーでは自動保存できません。内容をコピーしてメールへ貼り付けてください。', !ok);
  }, false);

  form.addEventListener('input', function (event) {
    var target = event.target || event.srcElement;
    if (target && hasClass(target, 'is-invalid') && isFieldValid(target)) {
      removeClass(target, 'is-invalid');
      var label = target.closest ? target.closest('label') : null;
      var error = label ? label.querySelector('.field-error') : null;
      if (error) error.textContent = '';
    }
    scheduleDraftSave();
  }, false);
  form.addEventListener('change', function () { toggleGuardian(); saveDraft(); }, false);

  var saveTimer = null;
  function formDataObject() {
    var data = {};
    var elements = form.elements;
    for (var i = 0; i < elements.length; i++) {
      var field = elements[i];
      if (!field.name || field.disabled || field.type === 'submit' || field.type === 'button') continue;
      if ((field.type === 'checkbox' || field.type === 'radio') && !field.checked) continue;
      if (data[field.name] !== undefined) {
        if (!Array.isArray(data[field.name])) data[field.name] = [data[field.name]];
        data[field.name].push(field.value);
      } else data[field.name] = field.value;
    }
    return data;
  }
  function saveDraft() {
    try { window.localStorage.setItem(draftKey, JSON.stringify(formDataObject())); } catch (ignore) {}
  }
  function scheduleDraftSave() {
    window.clearTimeout(saveTimer);
    saveTimer = window.setTimeout(saveDraft, 300);
  }
  function restoreDraft() {
    var data = null;
    try { data = JSON.parse(window.localStorage.getItem(draftKey) || 'null'); } catch (ignore) {}
    if (!data || !window.confirm('前回入力途中の内容があります。復元しますか？')) return;
    for (var key in data) {
      if (!Object.prototype.hasOwnProperty.call(data, key)) continue;
      var values = Array.isArray(data[key]) ? data[key] : [data[key]];
      var fields = form.elements[key];
      if (!fields) continue;
      var list = fields.length !== undefined && !fields.tagName ? fields : [fields];
      for (var i = 0; i < list.length; i++) {
        var field = list[i];
        if (field.type === 'checkbox' || field.type === 'radio') field.checked = values.indexOf ? values.indexOf(field.value) !== -1 : false;
        else field.value = values[0];
      }
    }
    toggleGuardian();
  }
  restoreDraft();

  var actions = form.querySelector('.form-actions');
  if (actions) {
    var reset = document.createElement('button');
    reset.type = 'button';
    reset.className = 'text-button';
    reset.textContent = '入力内容をすべて消去';
    reset.addEventListener('click', function () {
      if (window.confirm('保存された下書きと入力内容を削除しますか？')) {
        form.reset();
        try { window.localStorage.removeItem(draftKey); } catch (ignore) {}
        toggleGuardian();
        setStatus('入力内容を消去しました。', false);
      }
    }, false);
    actions.appendChild(reset);
  }
})(window, document);
