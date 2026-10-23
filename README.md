# Tú Lệ Smart Breakfast

Website giới thiệu sản phẩm bột ngũ cốc Tú Lệ Smart Breakfast và hệ thống truy
xuất nguồn gốc của dự án.

HTML, CSS, JavaScript thuần. Không framework, không build step. Chạy trên
Cloudflare Workers với static assets.

**Đang chạy tại:** https://smartbreakfast.store

## Chạy ở local

```bash
cd <thư mục dự án>
npx wrangler dev
```

Mở đường dẫn wrangler in ra, thường là `http://localhost:8787`. Lệnh này mô
phỏng đúng môi trường production: URL không đuôi `.html`, trang 404, và các
header trong `_headers`.

Nếu chỉ cần xem nhanh giao diện, không cần đúng URL:

```bash
cd <thư mục dự án>/public
python3 -m http.server 4321
```

Cách này phải gõ kèm `.html`, ví dụ `http://localhost:4321/san-pham.html`.

## Deploy

```bash
cd <thư mục dự án>
python3 scripts/stamp.py     # bắt buộc khi có sửa CSS hoặc JS
npx wrangler deploy
```

`stamp.py` tính mã băm nội dung của `style.css` và `main.js` rồi gắn vào đường
dẫn trong cả 7 trang dưới dạng `?v=<8 ký tự>`. **Bỏ bước này khi đã sửa CSS là
lỗi nặng**: assets đặt cache 7 ngày mà tên tệp không đổi, nên người đã từng vào
site sẽ giữ bản CSS cũ tới một tuần. Đã có lần sơ đồ kiến trúc hiện đen sì đúng
vì lý do đó, CSS cũ thiếu class `.pane` nên SVG mặc định tô đen.

Chạy lại `stamp.py` khi nội dung không đổi thì mã băm không đổi, không ảnh
hưởng gì. HTML luôn có hiệu lực ngay vì đặt `max-age=0, must-revalidate`.

## Cấu trúc

```
wrangler.jsonc         Cấu hình Worker, assets và hai custom domain
src/index.js           Worker nhỏ: gộp http -> https và www -> tên miền gốc
public/                Toàn bộ nội dung site
  index.html           Trang chủ: chúng tôi là ai, câu chuyện, sản phẩm,
                       nguyên liệu, quy trình rút gọn, công nghệ, thành viên
  san-pham.html        Ảnh, giá, thành phần, dinh dưỡng, hướng dẫn pha,
                       form đặt hàng, FAQ
  quy-trinh.html       Sơ đồ cây bốn nhánh dựng bằng HTML, sơ đồ ảnh đầy đủ,
                       dòng thời gian sáu bước, sơ đồ hai độ chín của chuối, video
  cong-nghe.html       Ảnh giới thiệu, tính mới kèm bảng so sánh, ba bước,
                       ảnh màn hình, mục blockchain, tính năng
  thanh-tuu.html       Khảo sát 1.315 người, kiểm nghiệm NIFC, giấy xác nhận,
                       liên kết báo chí về vùng nguyên liệu
  lien-he.html         Liên hệ, form đặt hàng, chuỗi cung ứng
  404.html             Trang không tìm thấy
  _headers             Cache và security header
  robots.txt
  sitemap.xml
  assets/css/style.css
  assets/js/main.js
  assets/img/          Ảnh đã nén từ thư mục Google Drive của dự án
```

## Đường dẫn

Production dùng URL không đuôi: `/san-pham`, `/quy-trinh`, `/cong-nghe`,
`/lien-he`. Đường dẫn cũ kèm `.html` vẫn vào được, Cloudflare tự chuyển hướng
307 sang bản không đuôi. Đây là các URL nên in kèm mã QR trên bao bì.

## Sửa thông tin liên hệ, giá, endpoint

Mọi giá trị dùng chung nằm trong `CONFIG` ở đầu `public/assets/js/main.js`:

```js
var CONFIG = {
  phone: '0981841109',
  email: 'trinhnhi1010yb@gmail.com',
  zalo:  'https://zalo.me/0981841109',
  price: 375000,
  endpoint: ''      // để rỗng: form chạy chế độ gửi tay
};
```

Giá `375.000đ` còn xuất hiện dạng chữ trong `index.html`, `san-pham.html` và
`lien-he.html`. Đổi giá thì sửa cả `CONFIG.price` và các chỗ đó.

## Form đặt hàng

`CONFIG.endpoint` đang để rỗng, nên form kiểm tra dữ liệu, tính tạm tính theo
số hộp, rồi sinh nội dung đơn kèm bốn nút gửi tay: sao chép, mở Zalo, gửi
email, gọi điện. Không có dữ liệu nào được gửi đi tự động.

Khi cần nhận đơn tự động, viết một Worker riêng hoặc thêm route vào
`src/index.js`, rồi điền URL vào `CONFIG.endpoint`. Form sẽ `POST` JSON dạng
`{hoten, sdt, diachi, soluong, ghichu}`.

## Màu và chữ

Bảng màu lấy từ chính bao bì hộp 600g. Màu đo được là `#0096A0`, tách thành ba
biến trong `:root` để mọi cặp màu đạt chuẩn tương phản WCAG AA:

| Biến | Giá trị | Dùng cho |
|---|---|---|
| `--teal` | `#007E88` | nền dải và nút, chữ trắng đạt 4.84:1 |
| `--teal-bright` | `#0096A0` | mảng phẳng, viền, chấm đầu dòng |
| `--teal-ink` | `#00666E` | chữ màu teal trên nền sáng, đạt 6.72:1 |

Bốn màu định danh nhánh nguyên liệu (`--n-com`, `--n-lac`, `--n-khoai`,
`--n-chuoi`) chỉ dùng ở sơ đồ quy trình, nơi màu mang thông tin chứ không
trang trí.

Chữ dùng Be Vietnam Pro cho nội dung và JetBrains Mono cho số liệu, nhãn, mã.

## Biểu đồ khảo sát

Hai biểu đồ ở `thanh-tuu.html` được dựng bằng HTML và CSS, không nhúng ảnh chụp
Google Forms, để chữ vẫn đọc được ở mọi cỡ màn hình và máy đọc màn hình lấy
được số liệu.

Thang đo là thứ tự từ rất tích cực tới tiêu cực nên dùng ramp một tông teal
sáng dần, cộng một màu trung tính cho nhóm tiêu cực:
`#00565D`, `#008C97`, `#63C4CE`, `#7E8A88`. Bộ này đã chạy qua validator của
skill dataviz: cặp kề sát nhau nhất tách ΔE 16,3 ở mắt thường và 14,4 ở mù màu
deutan. Giá trị phần trăm đặt ở legend chứ không nhồi vào trong dải, vì chữ
trên `#008C97` chỉ đạt 4,04:1 với màu trắng và 4,14:1 với màu mực, không đủ cho
chữ nhỏ. Mỗi biểu đồ có kèm bảng số liệu trong thẻ `details`.

Nhóm "còn lại" gộp hai lựa chọn tiêu cực của mỗi câu hỏi, vì bản khảo sát gốc
không cho biết tỉ lệ riêng của từng lựa chọn đó.

## Nội dung báo chí ở trang Thành tựu

Sáu thẻ bài báo trong mục "Báo chí nói gì về vùng nguyên liệu" được viết theo
cách này, cố ý:

- **Phần tóm lược do mình viết lại** từ dữ kiện trong bài. Dữ kiện và con số
  không thuộc phạm vi bản quyền, cách diễn đạt thì có, nên không sao chép câu.
- **Một câu trích ngắn** mỗi bài, ghi rõ nguồn và ngày.
- **Không đăng lại ảnh của các báo.** Ảnh trong bài báo thuộc bản quyền của cơ
  quan báo chí. Trang này là trang thương mại nên đăng lại ảnh của họ là rủi ro
  thật. Ảnh minh hoạ trong mục nguyên liệu được cắt từ chính ảnh khay nguyên
  liệu do nhóm tự chụp, xem `assets/img/nguyen-lieu/`.

Nếu sau này xin được phép của các báo thì mới bổ sung ảnh của họ.

Toàn bộ URL bài báo được rút từ hyperlink trong `Dự án Tú Lệ.docx`, vì bản
chuyển sang text làm mất liên kết.

## Thông số blockchain

Mục blockchain ở `cong-nghe.html` và `thanh-tuu.html` dùng hai nguồn:

- **Cơ chế của hệ thống Tú Lệ** lấy từ bộ slide `Tu-Le-Trace-Slides - manual.pptx`:
  chuẩn hoá JSON, băm SHA-256, neo lên chuỗi, chu kỳ quét lại 10 phút, 29.273 gas
  mỗi lần neo, hợp đồng chỉ phát sự kiện chứ không lưu nội dung hồ sơ.
- **Thông số mạng VNID Chain** lấy từ tài liệu công bố của VBSN tại vbsn.vn:
  Layer-1 phát triển trên mã nguồn Ethereum, đồng thuận lai PoS và PoSA, tương
  thích EVM, khoảng 5.000 TPS trung bình và đỉnh 20.000 TPS, độ trễ 1 đến 2 giây.

Các mã băm trong hai sơ đồ minh hoạ là giá trị bịa để giải thích cơ chế, và
trang có ghi rõ điều đó ngay dưới hình.

## Ảnh giấy tờ minh chứng

`assets/img/thanh-tuu/kiem-nghiem-1.jpg` đã **che tên và địa chỉ người gửi
mẫu**, vì đó là địa chỉ nhà của một học sinh và trang này công khai. Nhãn
trường vẫn để nguyên để thấy rõ đây là phần bị che, toàn bộ kết quả kiểm nghiệm
không thay đổi. Bản gốc chưa che nằm trong Drive dự án.

`assets/img/trace-nguyen-lieu.jpg` đã **cắt bỏ 200px dưới** so với ảnh gốc
trong Drive, để loại một thông báo chụp màn hình của macOS và một dòng lỗi
debug của bản đồ lẫn trong ảnh.

## Cần bổ sung

- **Ảnh riêng cho từng nguyên liệu.** Bốn ảnh trong thư mục Drive độ phân giải
  thấp và trông như lấy từ báo hoặc trang bán hàng, nên chưa đưa vào site.
- **Logo bản nền trong suốt.** File hiện tại là PNG nền trắng đục, nên chỉ dùng
  được trên nền sáng. Mark trong header là phần hình tròn cắt từ logo đó.

## Subdomain truy xuất nguồn gốc

`trace.smartbreakfast.store` phục vụ hệ thống truy xuất, chạy trên **một tài
khoản Cloudflare khác** của bên triển khai. Website này chỉ trỏ link sang đó,
không sở hữu và không kiểm soát nội dung tại subdomain.

- Bản ghi trong zone: `CNAME trace` trỏ tới `tule-trace.pages.dev`.
- Kiểm tra nhanh: `curl -s https://trace.smartbreakfast.store/api/health` phải
  trả về JSON có `"ok":true`.
- Website trỏ tới subdomain này ở 9 chỗ trên 5 trang. Đổi địa chỉ thì tìm chuỗi
  `trace.smartbreakfast.store` trong `public/*.html`.
- Muốn ngắt subdomain: xoá bản ghi CNAME, nội dung tắt ngay. Nhớ sửa cả 9 link
  kia, nếu không website sẽ trỏ vào chỗ chết.

Trạng thái proxy hiện tại là **Proxied**, mây vàng, không phải DNS only như tài
liệu bên triển khai đề nghị. Thực tế vẫn chạy vì họ đã đăng ký hostname ở phía
Pages của họ, và Cloudflare dùng chứng chỉ wildcard của zone này. Xem phần ghi
chú bên dưới về đánh đổi.

## Ghi chú vận hành

- Zone `smartbreakfast.store` id `131ec9598593f461319da240a311cc03`.
- Hai custom domain do wrangler tạo và tự sinh bản ghi DNS: `smartbreakfast.store`
  và `www.smartbreakfast.store`.
- `_headers` chỉ đặt `Cache-Control` ở đúng một quy tắc. Cloudflare cộng dồn
  header trùng tên giữa các quy tắc chứ không ghi đè, nên đặt ở hai nơi sẽ tạo
  ra chuỗi hai giá trị mâu thuẫn và trình duyệt lấy giá trị đầu.
- Không dùng mẫu `/*.html` trong `_headers`. Production chạy URL không đuôi nên
  mẫu đó không bao giờ khớp.
- Quy tắc màu link của dải màu phải loại nút ra: `.band.teal a:not(.btn)`. Quy
  tắc này đứng sau `.btn.light` và cùng độ cụ thể, nên nếu viết `.band.teal a`
  thì mọi nút trắng trong dải teal sẽ thành chữ trắng trên nền trắng.
- Ô số liệu mang giá trị dạng chữ, ví dụ `SHA-256` hay `KPH`, phải thêm class
  `txt` để không bị vỡ dòng giữa từ ở cỡ chữ của số.
- Chuyển hướng `http` sang `https` và `www` về tên miền gốc do worker xử lý,
  không dùng Redirect Rule ở tầng zone. Nếu sau này bật Redirect Rule thì nhớ
  bỏ phần tương ứng trong `src/index.js` để tránh chuyển hướng hai lần.
