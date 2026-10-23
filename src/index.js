/**
 * Worker đứng trước static assets, làm hai việc chuyển hướng rồi trả phần còn
 * lại cho assets. Đặt ở đây thay vì dùng Redirect Rule và bật Always Use HTTPS
 * ở tầng zone, để toàn bộ cấu hình nằm trong repo và deploy bằng một lệnh.
 */

const APEX = 'smartbreakfast.store';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const target = new URL(url);

    // Gộp http -> https và www -> tên miền gốc vào một lần chuyển hướng,
    // để http://www không phải đi hai chặng.
    if (target.protocol === 'http:') target.protocol = 'https:';
    if (target.hostname === `www.${APEX}`) target.hostname = APEX;

    if (target.toString() !== url.toString()) {
      return Response.redirect(target.toString(), 301);
    }

    return env.ASSETS.fetch(request);
  },
};
