# AI QUICK

[English](README.md)

AI QUICK là bộ công cụ AI dành cho cộng đồng, hỗ trợ dịch ngôn ngữ, chuyển đổi mã nguồn, cải thiện prompt, sinh dữ liệu mẫu và chat với PDF. Ứng dụng giúp người học, lập trình viên và nhóm làm việc đa ngôn ngữ sử dụng khóa API của chính mình.

## Dùng thử

Mở bản demo: [AI QUICK](https://help-aiquick.vercel.app/translate/languages).

Để bắt đầu, hãy mở **Cài đặt** ở thanh bên, thêm khóa OpenAI hoặc Google Gemini API, lưu lại và chọn mô hình khả dụng. Chi phí sử dụng API được tính theo nhà cung cấp khóa của bạn.

Bạn có thể tạo khóa tại [OpenAI Dashboard](https://platform.openai.com/api-keys) hoặc [Google AI Studio](https://aistudio.google.com/app/apikey).

> Không chia sẻ khóa API, đưa khóa vào mã nguồn, hay hiển thị khóa trong ảnh chụp màn hình công khai.

## Quyền riêng tư và kiến trúc phía client

### Cam kết của chúng tôi

AI QUICK không có backend ứng dụng hoặc cơ sở dữ liệu phía máy chủ để lưu nội dung của bạn. Toàn bộ việc xử lý dữ liệu cho các tính năng diễn ra trong trình duyệt:

- Khóa API và tùy chọn mô hình được lưu trong local storage của trình duyệt.
- Lịch sử dịch, tệp PDF, lịch sử chat, embedding và dữ liệu chi phí cục bộ được lưu trong bộ nhớ trình duyệt (local storage hoặc IndexedDB).
- AI QUICK không gửi văn bản, prompt, tệp PDF, nội dung chat, embedding hay khóa API của bạn đến máy chủ ứng dụng AI QUICK, và cũng không lưu chúng ở đó.

Xóa dữ liệu trang web trong trình duyệt có thể xóa vĩnh viễn các dữ liệu được lưu cục bộ này.

### Yêu cầu trực tiếp đến nhà cung cấp AI

Khi bạn sử dụng tính năng AI, dữ liệu cần thiết được gửi trực tiếp từ trình duyệt đến nhà cung cấp AI đã chọn, như OpenAI hoặc Google Gemini. Điều khoản, chính sách quyền riêng tư, thiết lập lưu giữ dữ liệu và chi phí của nhà cung cấp đó sẽ áp dụng cho yêu cầu. Không gửi dữ liệu nhạy cảm nếu bạn chưa chấp nhận các chính sách này.

Nếu một bản triển khai bật Google Analytics, thông tin kỹ thuật về sử dụng hoặc hiệu năng có thể được gửi đến Google. Google Analytics không nhận nội dung bạn nhập vào các tính năng của AI QUICK.

## Tính năng

| Công cụ | Chức năng |
| --- | --- |
| **Dịch ngôn ngữ** | Dịch văn bản giữa tiếng Việt, tiếng Anh và tiếng Nhật; có thể dán hoặc tải ảnh PNG, JPG, WebP để dịch nội dung trong ảnh. |
| **Dịch mã nguồn** | Chuyển hướng dẫn ngôn ngữ tự nhiên thành mã, giải thích mã bằng ngôn ngữ tự nhiên hoặc dịch giữa các ngôn ngữ lập trình. |
| **Cải thiện prompt** | Biến yêu cầu ngắn thành prompt rõ ràng, có cấu trúc hơn; có thể dịch prompt đã cải thiện sang tiếng Anh. |
| **Sinh dữ liệu** | Tạo dữ liệu mẫu từ cấu trúc bảng, câu SQL hoặc mô tả dữ liệu để kiểm thử và phát triển. |
| **Chat với PDF** | Tải và xử lý tệp PDF để đặt câu hỏi về nội dung tài liệu. |

## Hướng dẫn sử dụng AI QUICK

### 1. Dịch ngôn ngữ

1. Vào **Dịch ngôn ngữ** từ thanh bên.
2. Chọn ngôn ngữ đầu vào, hoặc **Phát hiện ngôn ngữ**, rồi chọn ngôn ngữ đầu ra.
3. Nhập/dán văn bản hoặc chọn ảnh. Ảnh hỗ trợ PNG, JPG và WebP.
4. Nhấn **Dịch** và chờ kết quả hiển thị theo thời gian thực.
5. Sao chép kết quả dưới dạng văn bản thường hoặc Markdown; mở lịch sử để xem lại các bản dịch gần đây.

Khi đầu ra là tiếng Nhật hoặc tiếng Anh, hãy bật **Học tập**, bôi đen một đoạn ngắn và chọn **Học đoạn này** để nhận hỗ trợ về phát âm, nghĩa, ngữ pháp và từ vựng.

### 2. Dịch mã nguồn

1. Vào **Dịch mã nguồn**.
2. Chọn ngôn ngữ đầu vào hoặc **Natural Language**, sau đó chọn ngôn ngữ đầu ra mong muốn.
3. Nhập mô tả hoặc dán mã nguồn, rồi nhấn **Dịch**.
4. Rà soát kết quả trước khi dùng trong dự án và nhấn **Sao chép đầu ra** khi cần.

### 3. Cải thiện prompt

1. Vào **Cải thiện prompt**.
2. Nhập yêu cầu ban đầu, ví dụ: `Viết email thân thiện xác nhận thời gian họp`.
3. Nhấn **Cải thiện** để tạo prompt chi tiết hơn.
4. Tùy nhu cầu, chọn **Dịch sang tiếng Anh** hoặc sao chép kết quả.

### 4. Sinh dữ liệu mẫu

1. Vào **Sinh dữ liệu**.
2. Dán câu lệnh SQL, cấu trúc bảng hoặc mô tả các trường dữ liệu cần tạo.
3. Nhấn **Sinh dữ liệu**, sau đó kiểm tra và sao chép dữ liệu mẫu để dùng cho kiểm thử.

Không dùng dữ liệu sinh bởi AI trong môi trường sản xuất nếu chưa kiểm tra tính đúng đắn, các tác động về quyền riêng tư và ràng buộc nghiệp vụ.

### 5. Chat với PDF

1. Vào **Chat với PDF** và chọn **Bắt đầu chat**.
2. Tải một hoặc nhiều tệp PDF, sau đó nhấn **Xử lý PDF**.
3. Khi xử lý hoàn tất, nhập câu hỏi về tài liệu và nhấn **Gửi**.
4. Quay lại cuộc trò chuyện từ lịch sử ở thanh bên.

## Chạy dự án trên máy

### Yêu cầu

- Node.js phiên bản LTS hiện hành
- npm
- Khóa OpenAI API hoặc Google Gemini API để sử dụng tính năng AI

### Cài đặt

```bash
git clone <repository-url>
cd ai-code-translator
npm install
npm run dev
```

Mở [http://localhost:3000](http://localhost:3000), sau đó thêm khóa API trong **Cài đặt**. Giao diện không yêu cầu khai báo khóa API AI trong tệp `.env`.

## Đóng góp

Mọi đóng góp giúp AI QUICK hữu ích hơn cho cộng đồng đều được chào đón. Hãy giữ mỗi thay đổi tập trung, mô tả vấn đề người dùng mà thay đổi đó giải quyết và chạy các kiểm tra có sẵn trong môi trường của bạn trước khi gửi pull request.

---

Nếu AI QUICK hữu ích, hãy chia sẻ [bản demo](https://help-aiquick.vercel.app/translate/languages) với cộng đồng.
