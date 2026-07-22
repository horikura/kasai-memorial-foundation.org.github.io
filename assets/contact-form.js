(function (window, document) {
  'use strict';
  var form = document.getElementById('contact-form');
  if (!form) return;
  var status = form.querySelector('.form-status');
  var recipient = 'kasaishi.youtube.official@gmail.com';

  function each(nodes, callback) { for (var i = 0; nodes && i < nodes.length; i++) callback(nodes[i], i); }
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
    if (isError) addClass(status, 'is-error'); else removeClass(status, 'is-error');
  }
  function isValid(field) {
    if (typeof field.checkValidity === 'function') return field.checkValidity();
    if ((field.type === 'checkbox' || field.type === 'radio') && field.required && !field.checked) return false;
    if (field.required && !clean(field.value)) return false;
    if (field.type === 'email' && field.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value)) return false;
    if (field.minLength > 0 && field.value.length < field.minLength) return false;
    return true;
  }
  function validate() {
    var ok = true;
    each(form.querySelectorAll('.field-error'), function (el) { el.textContent = ''; });
    each(form.querySelectorAll('[required]'), function (field) {
      if (!isValid(field)) {
        ok = false;
        var label = field.closest ? field.closest('label') : null;
        var error = label ? label.querySelector('.field-error') : null;
        var message = 'この項目を確認してください。';
        if ((field.validity && field.validity.typeMismatch) || field.type === 'email') message = '正しい形式で入力してください。';
        if ((field.validity && field.validity.tooShort) || (field.minLength > 0 && field.value.length < field.minLength)) message = field.minLength + '文字以上で入力してください。';
        if (error) error.textContent = message;
        addClass(field, 'is-invalid');
      } else removeClass(field, 'is-invalid');
    });
    if (!ok) {
      var first = form.querySelector('.is-invalid');
      if (first && first.focus) first.focus();
      setStatus('入力内容をご確認ください。', true);
    }
    return ok;
  }
  function text() {
    var d = form.elements;
    return [
      '葛西記念財団 お問い合わせ',
      '================================',
      '',
      'お問い合わせ種別：' + d.category.value,
      'お名前：' + clean(d.name.value),
      '団体名・所属：' + (clean(d.organization.value) || '未記入'),
      'メールアドレス：' + clean(d.email.value),
      '件名：' + clean(d.subject.value),
      '',
      '【お問い合わせ内容】',
      clean(d.message.value),
      '',
      '作成日時：' + new Date().toLocaleString()
    ].join('\n');
  }
  function legacyCopy(value) {
    var area = document.createElement('textarea');
    area.value = value;
    area.style.position = 'fixed';
    area.style.left = '-9999px';
    document.body.appendChild(area);
    area.select();
    var ok = false;
    try { ok = document.execCommand('copy'); } catch (ignore) {}
    document.body.removeChild(area);
    setStatus(ok ? 'お問い合わせ内容をコピーしました。' : 'コピーできませんでした。メールアプリをご利用ください。', !ok);
  }

  form.addEventListener('submit', function (event) {
    event.preventDefault ? event.preventDefault() : (event.returnValue = false);
    if (!validate()) return false;
    var d = form.elements;
    window.location.href = 'mailto:' + recipient + '?subject=' + encodeURIComponent('【' + d.category.value + '】' + clean(d.subject.value)) + '&body=' + encodeURIComponent(text());
    setStatus('メール作成画面を開きます。内容をご確認の上、送信してください。', false);
    return false;
  }, false);

  var copyButton = form.querySelector('[data-contact-copy]');
  if (copyButton) copyButton.addEventListener('click', function () {
    if (!validate()) return;
    var value = text();
    if (navigator.clipboard && navigator.clipboard.writeText) {
      var promise = navigator.clipboard.writeText(value);
      if (promise && promise.then) {
        promise.then(function () { setStatus('お問い合わせ内容をコピーしました。', false); }, function () { legacyCopy(value); });
        return;
      }
    }
    legacyCopy(value);
  }, false);
})(window, document);
