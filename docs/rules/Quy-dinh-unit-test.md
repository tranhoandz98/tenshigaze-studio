# Quy định Unit Test cho DEV

> **Phạm vi áp dụng:** mọi DEV trong quy trình phát triển ứng dụng AI (human-in-the-loop).
> **Stack hỗ trợ:** **PHP** (PHPUnit + Mockery, phủ bằng PCOV / Xdebug), **Java** (JUnit 5 + Mockito, phủ bằng JaCoCo) và **.NET Core** (xUnit + Moq, phủ bằng Coverlet).
> **Tài liệu liên quan:** quy trình tổng `./Quy-trinh-phat-trien-ung-dung-AI.md` · DoD DEV `./templates/03-Checklist-DoR-DoD.md` (mục B) · template MR `./templates/02-Template-Merge-Request.md` · ví dụ MR `./examples/VD-02-Merge-Request.md` · ranh giới với test hộp đen (Tester) `./huong-dan-vai-tro/03-Tester-Huong-dan-thuc-hien.md` (mục 5) & `./templates/04-Template-Testcase-va-Bao-cao-Test.md` (B.0).
>
> Đây là **nguồn chuẩn (SSOT) về ngưỡng & quy tắc unit test**. DoD mục B và template MR chỉ trích yếu rồi dẫn về đây.

---

## 1. Mục đích

- Bảo đảm **logic nghiệp vụ** (Business Rules `R#`, validate, tính toán, mã lỗi `E##`) được kiểm chứng tự động, lặp lại được, **trước khi** mở Merge Request.
- Gắn chặt với **truy vết** của bộ tài liệu: mỗi test suy ra từ `AC#/R#/E##` của spec Approved — không kiểm "cho có".
- Làm cơ sở để reviewer duyệt MR và để Story đạt **DoD DEV**.

---

## 2. Nguyên tắc chung (bám triết lý toàn repo)

| Nguyên tắc | Ý nghĩa với unit test |
|---|---|
| **SSOT** | Kỳ vọng (Expected) của test suy từ **spec Approved trên Confluence** (theo Story key), **không** lấy file rời/chat làm nguồn. Chưa Approved → chưa có cơ sở viết test logic. |
| **Không bịa Expected** | Giá trị mong đợi phải truy ngược về `AC#/R#/E##` và có **số liệu cụ thể** (vd `tổng = 180.000`, `ném E04`). Thiếu dữ kiện chặn (ngưỡng/mã lỗi/công thức) → **DỪNG & hỏi BA**, không tự chế assertion. |
| **Truy vết 2 chiều** | Mỗi test gắn nhãn/tham chiếu `R#/AC#/E##`; mọi `R#` logic và mọi `E##` phải có test. |
| **Human-in-the-loop** | AI có thể **gợi ý** unit test, nhưng DEV đọc lại, chịu trách nhiệm, loại bỏ assertion không có căn cứ spec. |
| **Dữ liệu ẩn danh** | Fixture dùng dữ liệu mẫu (`C001`, `P001`, `SALE10`…), **không** PII/dữ liệu thật/secret. |

---

## 3. Khi nào BẮT BUỘC / được MIỄN viết unit test

**BẮT BUỘC** (thiếu là không đạt DoD):
- Hàm chứa **logic nghiệp vụ** gắn `R#`: tính toán, điều kiện rẽ nhánh, quy tắc hợp lệ.
- **Mọi validate đầu vào** và **mọi mã lỗi `E##`** → ≥1 test negative cho từng mã lỗi.
- Hàm biến đổi dữ liệu, mapping có điều kiện, xử lý biên (ngày, số lượng, hạn mức…).
- Sửa bug: thêm test **tái hiện bug** trước khi sửa (regression ở mức unit).

**Được MIỄN** (ghi rõ lý do nếu reviewer hỏi):
- Getter/setter thuần, DTO/POCO, hằng số, cấu hình.
- Code sinh tự động, code "keo" (wiring/DI) không có nhánh logic.
- UI thuần không chứa logic (đã phủ ở tầng test khác).

> Nguyên tắc: **không chạy theo con số phủ** mà bỏ sót `R#`/`E##`. Phủ đủ logic nghiệp vụ là mục tiêu số một; coverage % là chặn dưới, không phải đích.

---

## 4. Chuẩn độ phủ (coverage)

- **Ngưỡng bắt buộc: diff-coverage ≥ 80% _nhánh (branch)_ trên phần code MỚI/SỬA trong MR.**
- Đo **theo diff**, không ép toàn repo: tránh gánh nặng code cũ chưa có test, nhưng **mọi thay đổi mới phải được phủ**.
- Branch coverage (không chỉ line) vì mục tiêu là phủ **các nhánh điều kiện** của `R#`/`E##`.
- Coverage là **điều kiện cần, không đủ**: đạt 80% nhánh nhưng thiếu test cho một `E##` → vẫn **trượt** DoD.

### 4.1. Đo bằng công cụ (sinh report dạng Cobertura/JaCoCo XML)
Xem lệnh cụ thể ở **mục 8**. Report XML dùng cho:
- **(Khuyến nghị)** lọc phần diff bằng `diff-cover` (đọc XML + `git diff`) → ra đúng % nhánh của code mới/sửa.
- Hoặc mở report HTML, đối chiếu **các file/nhánh đã thay đổi**.

### 4.2. Cách kiểm khi CHƯA có CI (hiện trạng)
> Hiện team **chưa có pipeline CI tự động**. Gate là **DEV chạy local + đính bằng chứng vào MR + reviewer kiểm thủ công**.

- DEV chạy test + sinh report **ở máy local** (mục 8), rồi **đính vào MR** (mục 7): tóm tắt pass/fail + report nhánh của phần diff.
- **Reviewer** đối chiếu: (a) mọi `R#`/`E##` trong phạm vi có test; (b) phần code diff không còn nhánh hở; (c) diff-coverage nhánh ≥ 80%.
- Khi có CI về sau: chuyển các bước này thành job tự động chặn MR (mục 9) — ngưỡng & quy tắc giữ nguyên.

---

## 5. Thiết kế ca test

### 5.1. Kỹ thuật chọn ca (tái dùng kỹ thuật hộp đen + bổ sung white-box)
- **Phân vùng tương đương (EP)** & **biên (BVA, ±1):** giống Tester — vd `quantity` hợp lệ `[1..999]`; biên `0,1,999,1000`.
- **Bảng quyết định:** khi kết quả phụ thuộc tổ hợp nhiều điều kiện/`R#`.
- **Phủ nhánh/điều kiện (white-box):** mỗi nhánh `if/else/switch`, mỗi điều kiện ghép (`&&`/`||`) đều có ca đi qua.
- Xem thêm 4 kỹ thuật hộp đen ở `./huong-dan-vai-tro/03-Tester-Huong-dan-thuc-hien.md` mục 5 (nhất quán giữa DEV ↔ Tester).

### 5.2. Mẫu AAA (Arrange – Act – Assert)
Mỗi test một hành vi; **Arrange** dựng dữ liệu/mock → **Act** gọi hàm cần test → **Assert** kiểm kết quả/ngoại lệ. Tránh nhiều assert không liên quan trong một test.

### 5.3. Quy ước đặt tên & gắn truy vết
- **PHP (PHPUnit):** tên method `test_ten_dieuKien_ketQuaMongDoi` (hoặc method `ten_dieuKien_ketQuaMongDoi` kèm docblock `@test`), có thể kèm `@testdox("R3/AC-2: áp SALE10 → tổng 180.000")`. Lớp test `XxxTest`.
- **Java (JUnit 5):** tên method `ten_dieuKien_ketQuaMongDoi`, kèm `@DisplayName("R3/AC-2: áp SALE10 → tổng 180.000")`. Lớp test `XxxTest`.
- **.NET (xUnit):** tên method `Method_Condition_ExpectedResult`, kèm `[Trait("Covers", "R3;AC-2")]`. Lớp test `XxxTests`.
- Hoặc comment truy vết ngay tại test: `// Covers: PROJ-123 / R3 / AC-2 / E03`.

---

## 6. Cô lập & độ tin cậy

- **Mock/stub phụ thuộc ngoài** (DB, API, filesystem, thời gian, random): **Mockery** (PHP) / **Mockito** (Java) / **Moq** (.NET). Thời gian → tiêm `Clock`/abstraction, không gọi `now()` trực tiếp.
- Test **độc lập** (không phụ thuộc thứ tự chạy), **deterministic** (không phụ thuộc mạng/giờ hệ thống), **chạy nhanh** (mili-giây).
- **Không** đụng DB/dịch vụ thật trong unit test (việc đó thuộc integration/E2E của Tester).
- Fixture ẩn danh, không secret (mục 2).

---

## 7. Bằng chứng trong Merge Request (bắt buộc — vì chưa có CI)

MR phải có mục **"Unit test & coverage"** gồm:
1. **Danh sách test theo truy vết:** `R#`/`AC#`/`E##` → test tương ứng (mọi `E##` có ≥1 test negative).
2. **Lệnh đã chạy** (mục 8) + **tóm tắt kết quả** (số test, pass/fail — phải **toàn bộ PASS**).
3. **Diff-coverage nhánh** của code mới/sửa (**≥80%**): dán số liệu + report (ảnh HTML hoặc output `diff-cover`).
4. (Tùy team) Nếu lưu SSOT: đẩy báo cáo lên **Confluence** dưới trang spec, dán link vào MR.

**Reviewer** chỉ duyệt khi: test PASS, truy vết đủ `R#`/`E##`, diff-coverage nhánh ≥80%, phần diff không còn nhánh hở rõ ràng.

---

## 8. Lệnh tham chiếu nhanh

### 8.1. Java (JUnit 5 + Mockito + JaCoCo)
```bash
# Maven — chạy test + sinh report JaCoCo (target/site/jacoco/jacoco.xml + html)
mvn clean test
# (nếu report chưa gắn vào phase test)
mvn jacoco:report

# Gradle — test + report (build/reports/jacoco/test/jacocoTestReport.xml)
./gradlew test jacocoTestReport

# Chạy MỘT lớp / một test
mvn test -Dtest=OrderServiceTest
mvn test -Dtest=OrderServiceTest#create_gioHangRong_thiE01
./gradlew test --tests "com.example.OrderServiceTest.create_gioHangRong_thiE01"

# Diff-coverage nhánh trên code mới/sửa (cần pip install diff-cover)
diff-cover target/site/jacoco/jacoco.xml --compare-branch=origin/develop --fail-under=80
```

### 8.2. .NET Core (xUnit + Moq + Coverlet)
```bash
# Chạy test + thu coverage (Coverlet collector → **/coverage.cobertura.xml)
dotnet test --collect:"XPlat Code Coverage"

# Hoặc Coverlet MSBuild (sinh coverage.cobertura.xml tại thư mục test)
dotnet test /p:CollectCoverage=true /p:CoverletOutputFormat=cobertura

# Chạy MỘT test / nhóm theo filter
dotnet test --filter "FullyQualifiedName~OrderServiceTests.Create_GioHangRong_ThrowsE01"
dotnet test --filter "Covers=R3"        # nếu dùng [Trait("Covers","R3")]

# Report HTML (cần: dotnet tool install -g dotnet-reportgenerator-globaltool)
reportgenerator -reports:**/coverage.cobertura.xml -targetdir:coveragereport -reporttypes:Html

# Diff-coverage nhánh trên code mới/sửa
diff-cover **/coverage.cobertura.xml --compare-branch=origin/develop --fail-under=80
```

### 8.3. PHP (PHPUnit + Mockery + Xdebug / PCOV)
```bash
# 1. Chạy Unit test + sinh report HTML & Clover XML (qua Composer script — chuẩn gọn như `mvn test` ở 8.1)
composer test:coverage

# 2. Hoặc chạy trực tiếp bằng PHP CLI (chạy chuẩn trên cả Windows & Linux, tự bật xdebug coverage)
php -d xdebug.mode=coverage ./vendor/bin/phpunit --testsuite=Unit --coverage-html=coverage-report --coverage-clover=coverage.clover.xml

# (Nếu môi trường có cài extension PCOV):
php -d pcov.enabled=1 ./vendor/bin/phpunit --testsuite=Unit --coverage-html=coverage-report --coverage-clover=coverage.clover.xml

# 3. Chạy MỘT test / class cụ thể
php -d xdebug.mode=coverage ./vendor/bin/phpunit tests/Unit/LaborContractSignerStepLinkTest.php --coverage-html=coverage-report
./vendor/bin/phpunit --filter OrderServiceTest
./vendor/bin/phpunit --filter test_create_gioHangRong_thiE01

# 4. Diff-coverage nhánh/dòng trên code mới/sửa (diff-cover đọc file Clover XML — tùy chọn)
diff-cover coverage.clover.xml --compare-branch=origin/fastca-dev --fail-under=80
```

> ⚠️ **Trung thực về công cụ:** `diff-cover` là tiện ích ngoài (Python) đọc report Cobertura/JaCoCo/Clover — **tùy chọn**, chưa cài sẵn trong môi trường. Nếu chưa dùng, reviewer đối chiếu **thủ công** phần nhánh của code diff dựa trên report HTML. `--compare-branch` đặt theo nhánh đích thực tế (`develop`/`main`/`fastca-dev`).

---

## 9. Lộ trình tự động hóa CI (gợi ý — chưa bắt buộc)

Khi có GitLab CI, thêm job chạy test + đo coverage và **chặn MR** nếu không đạt; ngưỡng & quy tắc ở tài liệu này giữ nguyên, chỉ chuyển nơi kiểm từ "thủ công khi review" sang "pipeline". Lúc đó cập nhật lại DoD mục B và template MR cho khớp.

---

## 10. Liên kết trong bộ tài liệu
- DoD DEV (trích yếu + dẫn về đây): `./templates/03-Checklist-DoR-DoD.md` mục B
- Template Merge Request (mục "Unit test & coverage"): `./templates/02-Template-Merge-Request.md`
- **Template Báo cáo Unit Test theo task** (bản bằng chứng đầy đủ): `./templates/05-Bao-cao-Unit-Test.md`
- Ví dụ MR đã điền: `./examples/VD-02-Merge-Request-TaoDonHang.md`
- **Ví dụ Báo cáo Unit Test đã điền** (ORD-100): `./examples/VD-05-Bao-cao-Unit-Test-TaoDonHang.md`
- Kỹ thuật thiết kế ca (nhất quán với Tester): `./huong-dan-vai-tro/03-Tester-Huong-dan-thuc-hien.md` mục 5
- *(Sẽ bổ sung)* Hướng dẫn vai trò & skill DEV: `huong-dan-vai-tro/02-DEV-…`, `skills/02-DEV-…` — sẽ sinh/kiểm unit test theo đúng quy định này.
