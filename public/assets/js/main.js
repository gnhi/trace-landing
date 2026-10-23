/* ==========================================================================
   TÚ LỆ SMART BREAKFAST
   Không thư viện ngoài. Ba việc: mở menu mobile, đánh dấu trang hiện tại,
   xử lý form đặt hàng.
   ========================================================================== */

(function () {
  'use strict';

  /* --------------------------------------------------------------------
     Cấu hình. Đổi ở đây là đổi toàn site.
     -------------------------------------------------------------------- */
  var CONFIG = {
    phone: '0981841109',
    phoneDisplay: '0981 841 109',
    email: 'trinhnhi1010yb@gmail.com',
    zalo: 'https://zalo.me/0981841109',
    price: 375000,
    unit: 'hộp 600g (20 gói x 30g)',
    // Khi có backend thật, điền URL vào đây. Để rỗng thì form chạy chế độ
    // local: sinh nội dung đơn để gửi qua Zalo hoặc email.
    endpoint: ''
  };

  /* --------------------------------------------------------------------
     Menu mobile
     -------------------------------------------------------------------- */
  var toggle = document.querySelector('.nav-toggle');
  var mobileNav = document.getElementById('mobile-nav');
  if (toggle && mobileNav) {
    mobileNav.hidden = true;
    toggle.setAttribute('aria-expanded', 'false');
    toggle.addEventListener('click', function () {
      var open = mobileNav.hidden;
      mobileNav.hidden = !open;
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      toggle.querySelector('.lbl').textContent = open ? 'Đóng' : 'Menu';
    });
  }

  /* --------------------------------------------------------------------
     Đánh dấu trang hiện tại trên menu.
     Chuẩn hoá cả hai bên về dạng không đuôi, không dấu gạch cuối, để khớp
     dù mở bằng /san-pham, /san-pham.html hay /san-pham/.
     -------------------------------------------------------------------- */
  function norm(path) {
    if (!path) return '/';
    path = path.split('#')[0].split('?')[0];
    path = path.replace(/index\.html$/, '').replace(/\.html$/, '');
    if (path.length > 1) path = path.replace(/\/+$/, '');
    return path.charAt(0) === '/' ? (path || '/') : '/' + path;
  }

  var here = norm(location.pathname);
  Array.prototype.forEach.call(
    document.querySelectorAll('.site-nav a, .mobile-nav a'),
    function (a) {
      if (norm(a.getAttribute('href')) === here) {
        a.setAttribute('aria-current', 'page');
      }
    }
  );

  /* --------------------------------------------------------------------
     Định dạng số tiền
     -------------------------------------------------------------------- */
  function money(n) {
    return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.') + 'đ';
  }

  /* --------------------------------------------------------------------
     Form đặt hàng
     -------------------------------------------------------------------- */
  var form = document.getElementById('order-form');
  if (!form) return;

  var qtyInput = form.querySelector('[name="soluong"]');
  var totalOut = document.getElementById('order-total');

  function updateTotal() {
    var q = parseInt(qtyInput && qtyInput.value, 10);
    if (!q || q < 1) q = 1;
    if (totalOut) totalOut.textContent = money(CONFIG.price * q);
  }
  if (qtyInput) {
    qtyInput.addEventListener('input', updateTotal);
    updateTotal();
  }

  function setInvalid(field, on) {
    if (!field) return;
    field.classList.toggle('invalid', !!on);
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    var data = {
      hoten: form.hoten.value.trim(),
      sdt: form.sdt.value.trim(),
      diachi: form.diachi.value.trim(),
      soluong: parseInt(form.soluong.value, 10) || 1,
      ghichu: form.ghichu.value.trim()
    };

    /* kiểm tra đầu vào, thông báo nói rõ cần sửa gì */
    var ok = true;
    var phoneOk = /^0\d{9}$/.test(data.sdt.replace(/[\s.]/g, ''));

    setInvalid(form.hoten.closest('.field'), !data.hoten);
    setInvalid(form.sdt.closest('.field'), !phoneOk);
    setInvalid(form.diachi.closest('.field'), !data.diachi);
    if (!data.hoten || !phoneOk || !data.diachi) ok = false;

    if (!ok) {
      var firstBad = form.querySelector('.field.invalid input, .field.invalid textarea');
      if (firstBad) firstBad.focus();
      return;
    }

    var total = CONFIG.price * data.soluong;
    var lines = [
      'ĐẶT HÀNG TÚ LỆ SMART BREAKFAST',
      'Họ tên: ' + data.hoten,
      'Điện thoại: ' + data.sdt,
      'Địa chỉ: ' + data.diachi,
      'Số lượng: ' + data.soluong + ' ' + CONFIG.unit,
      'Tạm tính: ' + money(total)
    ];
    if (data.ghichu) lines.push('Ghi chú: ' + data.ghichu);
    var message = lines.join('\n');

    /* Có backend thì gửi thật. Chưa có thì sinh nội dung để gửi tay. */
    if (CONFIG.endpoint) {
      fetch(CONFIG.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
        .then(function (r) {
          if (!r.ok) throw new Error('HTTP ' + r.status);
          showResult(message, true);
        })
        .catch(function () {
          showResult(message, false);
        });
      return;
    }

    showResult(message, false);
  });

  function showResult(message, sent) {
    var box = document.getElementById('order-result');
    if (!box) return;

    var mailHref =
      'mailto:' + CONFIG.email +
      '?subject=' + encodeURIComponent('Đặt hàng Tú Lệ Smart Breakfast') +
      '&body=' + encodeURIComponent(message);

    box.innerHTML = '';

    var h = document.createElement('h4');
    h.textContent = sent ? 'Đã gửi đơn' : 'Đơn của bạn đã sẵn sàng để gửi';
    box.appendChild(h);

    var p = document.createElement('p');
    p.className = 'note';
    p.textContent = sent
      ? 'Nhóm dự án sẽ gọi lại theo số bạn để lại để xác nhận.'
      : 'Trang đang chạy bản xem trước nên chưa gửi tự động. Bạn chọn một trong ba cách dưới đây, nội dung đơn đã điền sẵn.';
    box.appendChild(p);

    var pre = document.createElement('pre');
    pre.textContent = message;
    box.appendChild(pre);

    var acts = document.createElement('div');
    acts.className = 'acts';

    var copy = document.createElement('button');
    copy.type = 'button';
    copy.className = 'btn sm';
    copy.textContent = 'Sao chép nội dung đơn';
    copy.addEventListener('click', function () {
      var done = function () {
        copy.textContent = 'Đã sao chép';
        setTimeout(function () { copy.textContent = 'Sao chép nội dung đơn'; }, 2000);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(message).then(done, fallback);
      } else {
        fallback();
      }
      function fallback() {
        var ta = document.createElement('textarea');
        ta.value = message;
        ta.style.position = 'fixed';
        ta.style.left = '-9999px';
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand('copy'); done(); } catch (err) {
          copy.textContent = 'Hãy chọn và sao chép thủ công';
        }
        document.body.removeChild(ta);
      }
    });
    acts.appendChild(copy);

    var zalo = document.createElement('a');
    zalo.className = 'btn sm ghost';
    zalo.href = CONFIG.zalo;
    zalo.target = '_blank';
    zalo.rel = 'noopener';
    zalo.textContent = 'Mở Zalo rồi dán đơn';
    acts.appendChild(zalo);

    var mail = document.createElement('a');
    mail.className = 'btn sm ghost';
    mail.href = mailHref;
    mail.textContent = 'Gửi bằng email';
    acts.appendChild(mail);

    var call = document.createElement('a');
    call.className = 'btn sm ghost';
    call.href = 'tel:' + CONFIG.phone;
    call.textContent = 'Gọi ' + CONFIG.phoneDisplay;
    acts.appendChild(call);

    box.appendChild(acts);
    box.hidden = false;
    box.scrollIntoView({ behavior: 'smooth', block: 'center' });
    h.setAttribute('tabindex', '-1');
    h.focus();
  }
})();
