# Đặc tả tính năng: Hiển thị chi phí sử dụng theo ngày và tháng

**Nhánh tính năng**: `001-show-daily-monthly-cost`
**Ngày tạo**: Thứ Năm, 15/01/2026
**Trạng thái**: Bản nháp
**Đầu vào**: Mô tả của người dùng: "Show daily and monthly usage cost"

## Kịch bản người dùng & Kiểm thử *(bắt buộc)*

### Câu chuyện người dùng 1 - Xem chi phí sử dụng hàng ngày và hàng tháng (Độ ưu tiên: P1)

Là một người dùng, tôi muốn xem chi phí sử dụng của mình cho ngày hiện tại và tháng hiện tại ngay lập tức để tôi có thể theo dõi chi tiêu và thói quen sử dụng của mình một cách hiệu quả.

**Tại sao ưu tiên mức này**: Giá trị cao cho người dùng để giám sát chi phí sử dụng AI của họ trong thời gian thực và tránh bất ngờ về ngân sách.

**Kiểm thử độc lập**: Có thể được kiểm thử bằng cách thực hiện các tác vụ AI (trò chuyện, dịch thuật) và xác minh huy hiệu (badge) cập nhật cả bộ đếm hàng ngày và hàng tháng phù hợp với ngày.

**Kịch bản chấp nhận**:

1. **Cho** ứng dụng đã được tải, **Khi** tôi xem huy hiệu sử dụng trong giao diện người dùng, **Thì** tôi thấy hai giá trị chi phí được định dạng là `($Ngày | $Tháng)`.
2. **Cho** tôi chưa thực hiện tác vụ nào hôm nay, **Khi** tôi xem huy hiệu, **Thì** chi phí hàng ngày hiển thị `$0.0000`.
3. **Cho** tôi thực hiện một tác vụ AI mới, **Khi** tác vụ hoàn thành, **Thì** cả giá trị chi phí hàng ngày và hàng tháng đều tăng thêm chi phí của tác vụ đó.
4. **Cho** tôi di chuột qua huy hiệu sử dụng, **Khi** chú giải công cụ (tooltip) xuất hiện, **Thì** nó xác định rõ ràng các giá trị là chi phí "Hàng ngày" và "Hàng tháng".

### Các trường hợp biên

- Điều gì xảy ra khi thay đổi tháng (ví dụ: từ 31 tháng 1 sang 1 tháng 2)? Chi phí hàng tháng sẽ đặt lại về giá trị sử dụng của ngày 1 tháng 2, hoặc 0 nếu không có.
- Điều gì xảy ra khi thay đổi ngày (nửa đêm)? Chi phí hàng ngày sẽ đặt lại về 0.
- Hệ thống xử lý chênh lệch múi giờ như thế nào? Các tính toán phải nhất quán với giờ địa phương của người dùng (giờ trình duyệt).

## Yêu cầu *(bắt buộc)*

### Yêu cầu chức năng

- **FR-001**: Hệ thống PHẢI tính toán tổng chi phí sử dụng cho ngày hiện tại (được định nghĩa là mức sử dụng kể từ 00:00:00 giờ địa phương).
- **FR-002**: Hệ thống PHẢI tính toán tổng chi phí sử dụng cho tháng hiện tại (được định nghĩa là mức sử dụng kể từ 00:00:00 ngày mùng 1 của tháng hiện tại).
- **FR-003**: Component `UsageCostBadge` PHẢI hiển thị cả chi phí hàng ngày và hàng tháng theo định dạng tương tự `($0.0000 | $0.0000)`.
- **FR-004**: Chi phí PHẢI được định dạng với 4 chữ số thập phân để phản ánh chính xác chi phí sử dụng token nhỏ.
- **FR-005**: Component PHẢI hiển thị chỉ báo đang tải (ví dụ: `...`) trong khi chi phí đang được lấy hoặc tính toán.
- **FR-006**: Chú giải công cụ (tooltip) của huy hiệu PHẢI được cập nhật để giải thích màn hình hiển thị giá trị kép (ví dụ: "Chi phí hàng ngày | Chi phí hàng tháng").

### Các thực thể chính

- **UsageRecord**: Thực thể hiện có chứa dấu thời gian và chi phí, được sử dụng để tổng hợp tổng số hàng ngày và hàng tháng.
- **UsageAnalytics**: Có thể cần mở rộng hoặc các hàm hỗ trợ để cung cấp các tổng hợp theo giai đoạn cụ thể.

## Tiêu chí thành công *(bắt buộc)*

### Kết quả đo lường được

- **SC-001**: Người dùng nhìn thấy chi phí hàng ngày và hàng tháng được cập nhật trong vòng 1 giây sau khi hoàn thành tác vụ.
- **SC-002**: Chi phí hàng ngày hiển thị đặt lại về $0.0000 khi bắt đầu ngày mới.
- **SC-003**: Chi phí hàng tháng hiển thị đặt lại về $0.0000 khi bắt đầu tháng mới.
