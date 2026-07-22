(() => {
  const form = document.querySelector('#join-form');
  if (!form) return;

  const status = document.querySelector('#form-status');
  const ageSelect = form.elements.age_group;
  const guardianField = document.querySelector('#guardian-field');
  const guardianInput = form.elements.guardian;
  const memberTypeError = document.querySelector('#member-type-error');
  const consentError = document.querySelector('#consent-error');
  const recipient = 'kasaishi.youtube.official@gmail.com';

  const setStatus = (message, isError = false) => {
    if (!status) return;
    status.textContent = message;
    status.style.color = isError ? '#9f1515' : '';
  };

  const toggleGuardian = () => {
    const isMinor = ageSelect?.value === '18歳未満';
    if (guardianField) guardianField.hidden = !isMinor;
    if (guardianInput) {
      guardianInput.required = isMinor;
      if (!isMinor) {
        guardianInput.value = '';
        guardianInput.classList.remove('is-invalid');
      }
    }
  };
  ageSelect?.addEventListener('change', toggleGuardian);
  toggleGuardian();

  const getCheckedValues = (name) => [...form.querySelectorAll(`input[name="${name}"]:checked`)].map((item) => item.value);

  const clearErrors = () => {
    form.querySelectorAll('.is-invalid').forEach((el) => el.classList.remove('is-invalid'));
    form.querySelectorAll('.field-error').forEach((el) => { el.textContent = ''; });
  };

  const showFieldError = (field, message) => {
    field.classList.add('is-invalid');
    const label = field.closest('label');
    const error = label?.querySelector('.field-error');
    if (error) error.textContent = message;
  };

  const validate = () => {
    clearErrors();
    let valid = true;
    const requiredFields = [...form.querySelectorAll('input[required]:not([type="checkbox"]), select[required], textarea[required]')];

    for (const field of requiredFields) {
      if (!field.checkValidity()) {
        valid = false;
        let message = 'この項目を入力してください。';
        if (field.validity.typeMismatch) message = '正しい形式で入力してください。';
        if (field.validity.tooShort) message = `${field.minLength}文字以上で入力してください。`;
        showFieldError(field, message);
      }
    }

    if (getCheckedValues('member_type').length === 0) {
      valid = false;
      if (memberTypeError) memberTypeError.textContent = '参加区分を1つ以上選択してください。';
    }

    const requiredConsents = [...form.querySelectorAll('input[type="checkbox"][required]')];
    if (requiredConsents.some((box) => !box.checked)) {
      valid = false;
      if (consentError) consentError.textContent = '3つの確認事項すべてに同意してください。';
    }

    if (!valid) {
      const firstInvalid = form.querySelector('.is-invalid') || form.querySelector('input[type="checkbox"][required]:not(:checked)');
      firstInvalid?.focus();
      setStatus('入力内容をご確認ください。', true);
    }
    return valid;
  };

  const clean = (value) => String(value || '').trim();

  const buildApplication = () => {
    const d = form.elements;
    const types = getCheckedValues('member_type');
    const lines = [
      '葛西記念財団 メンバー加入申込',
      '================================',
      '',
      '【基本情報】',
      `お名前：${clean(d.name.value)}`,
      `ふりがな：${clean(d.kana.value)}`,
      `メールアドレス：${clean(d.email.value)}`,
      `年代：${clean(d.age_group.value)}`,
      `お住まいの地域：${clean(d.region.value)}`,
      `SNS・ウェブサイト：${clean(d.sns.value) || '未記入'}`,
    ];
    if (d.age_group.value === '18歳未満') lines.push(`保護者のお名前・連絡方法：${clean(d.guardian.value)}`);
    lines.push(
      '',
      '【参加希望】',
      `希望する参加区分：${types.join('、')}`,
      `興味のある分野：\n${clean(d.interests.value)}`,
      `得意なこと・経験：\n${clean(d.skills.value) || '未記入'}`,
      `参加を希望する理由：\n${clean(d.motivation.value)}`,
      `参加しやすい曜日・時間：${clean(d.availability.value) || '未記入'}`,
      `参加方法：${clean(d.participation.value) || '未選択'}`,
      '',
      '【確認事項】',
      '・定款と活動ルールへの同意：同意済み',
      '・個人情報の取扱いへの同意：同意済み',
      '・行動規範・反社会的勢力排除への同意：同意済み',
      '',
      `作成日時：${new Date().toLocaleString('ja-JP')}`
    );
    return lines.join('\n');
  };

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!validate()) return;
    const application = buildApplication();
    const subject = `【メンバー加入申込】${clean(form.elements.name.value)} 様`;
    const mailto = `mailto:${recipient}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(application)}`;
    setStatus('メール作成画面を開きます。内容をご確認のうえ送信してください。');
    window.location.href = mailto;
  });

  document.querySelector('#copy-application')?.addEventListener('click', async () => {
    if (!validate()) return;
    const application = buildApplication();
    try {
      await navigator.clipboard.writeText(application);
      setStatus('申込内容をクリップボードにコピーしました。');
    } catch {
      const area = document.createElement('textarea');
      area.value = application;
      area.style.position = 'fixed';
      area.style.opacity = '0';
      document.body.appendChild(area);
      area.select();
      const copied = document.execCommand('copy');
      area.remove();
      setStatus(copied ? '申込内容をコピーしました。' : 'コピーできませんでした。申込書を保存してメールに添付してください。', !copied);
    }
  });

  document.querySelector('#download-application')?.addEventListener('click', () => {
    if (!validate()) return;
    const application = buildApplication();
    const blob = new Blob([application], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const safeName = clean(form.elements.name.value).replace(/[\\/:*?"<>|]/g, '_') || '申込者';
    link.href = url;
    link.download = `葛西記念財団_メンバー加入申込_${safeName}.txt`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    setStatus('申込書（TXT）を保存しました。公式メールへ添付してお送りください。');
  });

  form.addEventListener('input', (event) => {
    const target = event.target;
    if (target.classList?.contains('is-invalid') && target.checkValidity()) {
      target.classList.remove('is-invalid');
      const error = target.closest('label')?.querySelector('.field-error');
      if (error) error.textContent = '';
    }
  });
})();

;(() => {
 const form=document.querySelector('#join-form');if(!form)return;const key='kasai-member-form-draft-v1';
 const save=()=>{const data={};new FormData(form).forEach((v,k)=>{if(data[k])data[k]=[].concat(data[k],v);else data[k]=v});localStorage.setItem(key,JSON.stringify(data));};
 let timer;form.addEventListener('input',()=>{clearTimeout(timer);timer=setTimeout(save,250)});form.addEventListener('change',save);
 try{const d=JSON.parse(localStorage.getItem(key)||'null');if(d&&confirm('前回入力途中の内容があります。復元しますか？')){Object.entries(d).forEach(([k,v])=>{const fields=form.querySelectorAll(`[name="${CSS.escape(k)}"]`);fields.forEach(f=>{if(f.type==='checkbox'||f.type==='radio')f.checked=[].concat(v).includes(f.value);else f.value=Array.isArray(v)?v[0]:v});});form.dispatchEvent(new Event('change',{bubbles:true}));}}
 catch{}
 const reset=document.createElement('button');reset.type='button';reset.className='text-button';reset.textContent='入力内容をすべて消去';reset.addEventListener('click',()=>{if(confirm('保存された下書きと入力内容を削除しますか？')){form.reset();localStorage.removeItem(key);location.reload();}});form.querySelector('.form-actions')?.appendChild(reset);
})();