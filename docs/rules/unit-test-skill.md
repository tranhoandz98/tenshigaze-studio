---
name: unit-test
description: Viết unit test và tạo báo cáo kết quả kiểm thử (unit test report) theo chuẩn docs/rules/Quy-dinh-unit-test.md cho PHP (PHPUnit/Mockery), Java (JUnit 5/Mockito/JaCoCo), .NET Core (xUnit/Moq/Coverlet). Sử dụng khi người dùng yêu cầu viết unit test, sinh test case nghiệp vụ, đo diff-coverage hoặc xuất báo cáo unit test đính kèm MR/DoD.
---

# Quy trình Viết Unit Test & Lập Báo Cáo (Unit Test Standard)

> Căn cứ thực hiện: [docs/rules/Quy-dinh-unit-test.md](docs/rules/Quy-dinh-unit-test.md).
> Mọi test viết ra phải tuân thủ nghiêm ngặt chuẩn SSOT và triết lý truy vết 2 chiều.

---

## ⛔ IRON LAW (NGUYÊN TẮC BẤT KHẢ XÂM PHẠM)

1. **KHÔNG TỰ BỊA EXPECTED:** Giá trị mong đợi (`assertEquals`, `expectException`,...) phải truy ngược trực tiếp từ spec Approved (`expect.md` / Confluence) theo mã `AC#`, `R#`, `E##`. Nếu thiếu dữ kiện chặn (công thức, mã lỗi, giá trị ngưỡng) → **DỪNG LẠI VÀ HỎI DEV/BA**, tuyệt đối không tự giả định kết quả test.
2. **TRUY VẾT 100% MÃ LỖI (E##):** Mọi mã lỗi `E##` và validate đầu vào **bắt buộc** phải có ít nhất một ca test âm tính (negative test).
3. **CÔ LẬP HOÀN TOÀN (ISOLATION):** Unit test không được chạm Database thật, API bên ngoài, network, ổ đĩa hoặc thời gian hệ thống thật. Bắt buộc dùng Mock/Stub (Mockery cho PHP, Mockito cho Java, Moq cho .NET).
4. **ĐẠT CHUẨN MỚI ĐƯỢC KẾT LUẬN:** Báo cáo chỉ được đánh dấu PASS khi 100% unit test chạy qua (green) và diff-coverage nhánh trên phần code mới/sửa đạt **≥ 80%**.

---

## 📋 WORKFLOW CHECKLIST

```
Tiến trình Unit Test:
- [ ] Bước 1: Khảo sát & Lập ma trận truy vết (Traceability Matrix) ⚠️ BẮT BUỘC
- [ ] Bước 2: Thiết kế ca kiểm thử (AAA + EP/BVA + White-box)
- [ ] Bước 3: Viết mã nguồn Unit Test theo chuẩn từng ngôn ngữ
- [ ] Bước 4: Thực thi test & Thu thập dữ liệu Coverage ⚠️ BẮT BUỘC
- [ ] Bước 5: Lập Báo cáo Unit Test đính kèm MR (DoD DEV)
```

---

## BƯỚC 1: KHẢO SÁT & LẬP MA TRẬN TRUY VẾT ⚠️

1. Xác định file/class/method mục tiêu cần kiểm thử và dịch vụ tương ứng (`econApi`, `pdfserviceforcybersign`,...).
2. Đọc file spec liên quan (ví dụ: `docs/features/<TICKET>/expect.md` hoặc `docs/specs/<domain>.md`).
3. Lập danh sách các quy tắc nghiệp vụ:
   - Các điều kiện rẽ nhánh / tính toán (`R1, R2,...`)
   - Tiêu chí chấp nhận (`AC-1, AC-2,...`)
   - Toàn bộ mã lỗi đầu vào & ngoại lệ (`E01, E02,...`)
4. Xây dựng bảng ma trận ánh xạ sơ bộ:
   | Mã quy tắc | Mô tả yêu cầu / Kịch bản | Dữ liệu đầu vào | Kỳ vọng (Expected) | Mã lỗi / Ngoại lệ |
   |---|---|---|---|---|
   | R1 / AC-1 | Dữ liệu hợp lệ | Input chuẩn | Return True / Object | None |
   | R2 / E01 | Thiếu trường bắt buộc | Input rỗng | Throw Exception | E01 |

---

## BƯỚC 2: THIẾT KẾ CA KIỂM THỬ (TEST DESIGN)

Áp dụng các kỹ thuật theo mục 5 của Quy định:
1. **Phân vùng tương đương (EP) & Giá trị biên (BVA, ±1):** Phủ cận dưới, cận trên, giá trị hợp lệ ở giữa, và giá trị ngoài biên.
2. **Bảng quyết định (Decision Table):** Khi logic kết hợp nhiều điều kiện logic `if ($a && ($b || $c))`.
3. **Phủ nhánh trắng (White-box branch coverage):** Đảm bảo mọi nhánh `if/else`, `switch/case`, `catch` đều có test đi qua để đạt diff-coverage ≥ 80%.
4. **Cấu trúc mỗi test theo mẫu AAA:**
   - **Arrange:** Dựng mock object, khởi tạo dữ liệu đầu vào.
   - **Act:** Gọi method cần kiểm thử.
   - **Assert:** Kiểm tra kết quả trả về, xác nhận mock được gọi đúng số lần, hoặc bắt exception.

---

## BƯỚC 3: QUY ƯỚC CODE TEST THEO NGÔN NGỮ

### 3.1. PHP / Laravel (PHPUnit + Mockery)
- **Vị trí file:** `tests/Unit/<SubFolder>/<TargetClass>Test.php`
- **Quy ước tên method:** `test_<tenHam>_<dieuKien>_<ketQuaMongDoi>()` hoặc dùng annotation `@test`.
- **Gắn nhãn truy vết:** Dùng `@testdox("R#/AC#: mô tả kịch bản")` hoặc comment `// Covers: <TICKET> / R# / E##`.
- **Ví dụ mẫu:**
  ```php
  <?php

  namespace Tests\Unit\Services;

  use Tests\TestCase;
  use Mockery;
  use App\Services\OrderService;
  use App\Repositories\OrderRepository;
  use App\Exceptions\ValidationException;

  class OrderServiceTest extends TestCase
  {
      protected $orderRepoMock;
      protected $orderService;

      protected function setUp(): void
      {
          parent::setUp();
          $this->orderRepoMock = Mockery::mock(OrderRepository::class);
          $this->orderService = new OrderService($this->orderRepoMock);
      }

      protected function tearDown(): void
      {
          Mockery::close();
          parent::tearDown();
      }

      /**
       * @testdox R1/AC-1: Đơn hàng hợp lệ tính đúng tổng tiền
       */
      public function test_calculateTotal_validItems_returnsCorrectAmount()
      {
          // Arrange
          $items = [['price' => 100, 'qty' => 2]];

          // Act
          $result = $this->orderService->calculateTotal($items);

          // Assert
          $this->assertEquals(200, $result);
      }

      /**
       * @testdox R2/E01: Giỏ hàng rỗng ném ngoại lệ E01
       */
      public function test_createOrder_emptyCart_throwsE01()
      {
          // Arrange
          $emptyItems = [];

          // Assert & Act
          $this->expectException(ValidationException::class);
          $this->expectExceptionMessage('E01');

          $this->orderService->createOrder($emptyItems);
      }
  }
  ```

### 3.2. Java (JUnit 5 + Mockito)
- **Vị trí file:** `src/test/java/.../<TargetClass>Test.java`
- **Quy ước:** Tên method `tenHam_dieuKien_ketQuaMongDoi()`, kèm `@DisplayName("R#/AC#: mô tả")`.
- **Gắn nhãn truy vết:** `@DisplayName` hoặc comment `// Covers: R# / E##`.

### 3.3. .NET Core (xUnit + Moq)
- **Vị trí file:** `tests/.../<TargetClass>Tests.cs`
- **Quy ước:** Tên method `Method_Condition_ExpectedResult()`.
- **Gắn nhãn truy vết:** `[Trait("Covers", "R#;AC#")]`.

---

## BƯỚC 4: THỰC THI & THU THẬP ĐỘ PHỦ (COVERAGE) ⚠️

Chạy bộ lệnh tương ứng với stack công nghệ từ thư mục gốc của repo dịch vụ:

### PHP / Laravel (`econApi`):
```bash
# 1. Chạy Unit test suite và sinh report Clover XML & HTML (qua Composer script — tương tự Maven ở Java):
composer test:coverage

# Hoặc chạy trực tiếp bằng PHP CLI (hoạt động chuẩn trên cả Windows & Linux, tự bật xdebug coverage):
php -d xdebug.mode=coverage ./vendor/bin/phpunit --testsuite=Unit --coverage-clover=coverage.clover.xml --coverage-html=coverage-report

# (Nếu môi trường có cài PCOV):
php -d pcov.enabled=1 ./vendor/bin/phpunit --testsuite=Unit --coverage-clover=coverage.clover.xml --coverage-html=coverage-report

# 2. Chạy riêng file test vừa viết:
php -d xdebug.mode=coverage ./vendor/bin/phpunit tests/Unit/Path/To/YourTest.php --coverage-html=coverage-report

# 3. Đo diff-coverage nhánh trên phần thay đổi so với nhánh đích (fastca-dev / main — tùy chọn):
diff-cover coverage.clover.xml --compare-branch=origin/fastca-dev --fail-under=80
```

### Java (`pdfserviceforcybersign`):
```bash
mvn clean test jacoco:report
diff-cover target/site/jacoco/jacoco.xml --compare-branch=origin/fastca-dev --fail-under=80
```

### .NET Core:
```bash
dotnet test --collect:"XPlat Code Coverage"
diff-cover **/coverage.cobertura.xml --compare-branch=origin/fastca-dev --fail-under=80
```

---

## BƯỚC 5: TẠO BÁO CÁO UNIT TEST (MR & DoD READY)

Xuất kết quả kiểm thử ra file `docs/features/<TICKET>/unit-test-report.md` (hoặc dán trực tiếp vào mục "Unit test & coverage" của Merge Request) theo cấu trúc chuẩn sau:

```markdown
# Báo Cáo Kết Quả Unit Test

- **Story / Ticket:** <MÃ_TICKET>
- **Dịch vụ (Service):** <econApi / pdfserviceforcybersign / ...>
- **Class / File kiểm thử:** `<Path/To/SourceClass>`
- **File test tương ứng:** `<Path/To/TestClass>`
- **Ngày thực hiện:** YYYY-MM-DD
- **Người thực hiện:** DEV / AI Agent
- **Kết luận:** [x] ĐẠT (PASS) / [ ] CHƯA ĐẠT (FAIL)

---

## 1. Ma trận truy vết kiểm thử (Traceability Matrix)

| STT | Mã yêu cầu (R# / AC# / E##) | Tên ca kiểm thử (Method Name) | Loại test | Kết quả |
|---|---|---|---|---|
| 1 | R1 / AC-1 | `test_action_validInput_success` | Positive | PASS |
| 2 | R2 / E01 | `test_action_emptyField_throwsE01` | Negative | PASS |
| 3 | R3 / E02 | `test_action_invalidStatus_throwsE02` | Negative | PASS |

> *Xác nhận: 100% mã lỗi E## trong phạm vi đã có test âm tính.*

---

## 2. Bằng chứng thực thi lệnh test

- **Lệnh thực thi:**
  ```bash
  <Ghi rõ lệnh đã chạy, ví dụ: php -d pcov.enabled=1 ./vendor/bin/phpunit --filter OrderServiceTest>
  ```
- **Kết quả tóm tắt từ console:**
  ```text
  Tests: 12, Assertions: 28, Failures: 0, Errors: 0, Skipped: 0.
  OK (12 tests, 28 assertions)
  Time: 180 ms, Memory: 14.00 MB
  ```

---

## 3. Độ phủ mã nguồn (Code Coverage & Diff Coverage)

- **Ngưỡng quy định:** Diff-coverage nhánh ≥ 80% trên code mới/sửa.
- **Lệnh đo diff-coverage:**
  ```bash
  diff-cover coverage.clover.xml --compare-branch=origin/fastca-dev --fail-under=80
  ```
- **Kết quả đo lường thực tế:**
  - Tổng số dòng mới/sửa: `...`
  - Line Coverage trên diff: `...%`
  - **Branch Coverage trên diff: `...%`** (Yêu cầu: ≥ 80%)
  - Trạng thái ngưỡng: **[ĐẠT / CHƯA ĐẠT]**

---

## 4. Danh sách các Mock & Phụ thuộc ngoài đã cô lập

| Phụ thuộc ngoài | Phương thức / Interface | Kỹ thuật cô lập | Lý do mock |
|---|---|---|---|
| Database | `OrderRepository` | Mockery / Mockito | Tránh ghi dữ liệu DB thật |
| Payment Gateway | `PaymentClientInterface` | Mockery / Mockito | Tránh gọi HTTP request ngoại vi |
| Thời gian hệ thống | `Carbon::setTestNow()` / Clock | Freeze time | Bảo đảm deterministic |
```

---

## ⚠️ DANH SÁCH LỖI THƯỜNG GẶP (ANTI-PATTERNS CẦN TRÁNH)

1. **Test "cho có" (No assertion / Weak assertion):** Gọi hàm nhưng chỉ assertNotNull trong khi hàm có tính toán nghiệp vụ phức tạp.
2. **Chạm Database thật trong Unit Test:** Dùng `RefreshDatabase` chạy migration thật trên DB (đây là Integration Test, không phải Unit Test). Unit test phải chạy trong vài mili-giây.
3. **Quên test Negative cho E##:** Chỉ viết test happy-path, bỏ qua các nhánh ném exception mã lỗi `E##`.
4. **Gộp quá nhiều hành vi vào một test:** Test vừa kiểm tra validate vừa kiểm tra tính toán và lưu DB trong cùng 1 method, khiến khi test fail không rõ nguyên nhân.
5. **Dùng giờ hệ thống thật:** Gọi `now()` trực tiếp khiến test có thể bị fail ngẫu nhiên khi sang ngày mới hoặc chạy ở múi giờ khác nhau.
