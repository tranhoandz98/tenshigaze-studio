<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('customers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('branch_id')->nullable()->constrained('branches')->nullOnDelete();
            $table->string('name');
            $table->string('phone', 32)->nullable();
            $table->string('email')->nullable();
            $table->string('zalo', 64)->nullable();
            $table->string('address')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        Schema::create('service_catalogs', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('type', 32)->default('package'); // package (Gói), surcharge (Phụ phí)
            $table->decimal('default_price', 14, 0)->default(0);
            $table->integer('default_duration_minutes')->default(180);
            $table->decimal('default_photo_rate', 14, 0)->default(0);
            $table->decimal('default_makeup_rate', 14, 0)->default(0);
            $table->text('description')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('bookings', function (Blueprint $table) {
            $table->id();
            $table->string('code', 32)->unique();
            $table->foreignId('branch_id')->nullable()->constrained('branches')->nullOnDelete();
            $table->foreignId('customer_id')->nullable()->constrained('customers')->nullOnDelete();
            $table->foreignId('sale_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('title');
            /**
             * 8 bước tiến độ của studio:
             * 1. pending_confirmation (Chờ xác nhận)
             * 2. confirmed (Đã xác nhận)
             * 3. shooting (Đang chụp)
             * 4. selecting_photos (Đang chọn ảnh)
             * 5. photos_selected (Chọn ảnh xong)
             * 6. retouching (Đang retouch)
             * 7. retouched (Đã retouch)
             * 8. completed (Hoàn thành)
             * + cancelled (Đã hủy)
             */
            $table->string('status', 32)->default('pending_confirmation')->index();
            $table->decimal('total_amount', 14, 0)->default(0);
            $table->decimal('deposit_amount', 14, 0)->default(0);
            $table->decimal('paid_amount', 14, 0)->default(0);
            $table->decimal('remaining_amount', 14, 0)->default(0);
            $table->boolean('google_calendar_synced')->default(true);
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        Schema::create('booking_sessions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('booking_id')->constrained('bookings')->cascadeOnDelete();
            $table->string('title'); // VD: Nhà gái, Nhà trai, Tiệc cưới, Pre-wedding
            $table->date('shoot_date')->index();
            $table->string('start_time', 8); // HH:mm (VD: 05:00)
            $table->string('end_time', 8);   // HH:mm (VD: 10:30)
            $table->string('location')->nullable(); // VD: 14 Gò Cà, Càng Long
            $table->string('google_event_id')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        Schema::create('booking_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('booking_id')->constrained('bookings')->cascadeOnDelete();
            $table->foreignId('service_catalog_id')->nullable()->constrained('service_catalogs')->nullOnDelete();
            $table->string('name'); // VD: Phóng sự cưới, Di chuyển
            $table->string('item_type', 32)->default('package'); // package (Gói), surcharge (Phụ phí)
            $table->integer('quantity')->default(1);
            $table->decimal('unit_price', 14, 0)->default(0);
            $table->decimal('total_price', 14, 0)->default(0);
            $table->timestamps();
        });

        Schema::create('booking_assignments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('booking_session_id')->constrained('booking_sessions')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('role', 32)->default('photographer'); // photographer, makeup, assistant, retoucher
            $table->decimal('task_fee', 14, 0)->default(0); // Tiền khoán cho buổi chụp này
            $table->boolean('calendar_synced')->default(true);
            $table->string('note')->nullable();
            $table->timestamps();
        });

        Schema::create('booking_payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('booking_id')->constrained('bookings')->cascadeOnDelete();
            $table->string('payment_type', 32)->default('deposit'); // deposit (Đặt cọc), installment (Thanh toán đợt), settlement (Tất toán)
            $table->string('method', 32)->default('bank_transfer'); // bank_transfer (Chuyển khoản), cash (Tiền mặt)
            $table->decimal('amount', 14, 0)->default(0);
            $table->dateTime('paid_at');
            $table->string('receipt_url')->nullable();
            $table->foreignId('recorded_by')->nullable()->constrained('users')->nullOnDelete();
            $table->string('note')->nullable();
            $table->timestamps();
        });

        Schema::create('albums', function (Blueprint $table) {
            $table->id();
            $table->foreignId('booking_id')->nullable()->constrained('bookings')->nullOnDelete();
            $table->foreignId('branch_id')->nullable()->constrained('branches')->nullOnDelete();
            $table->string('title');
            $table->string('slug', 100)->unique();
            $table->string('drive_folder_id')->nullable();
            $table->string('drive_folder_url')->nullable();
            $table->boolean('allow_download')->default(true);
            $table->boolean('watermark_enabled')->default(true);
            $table->string('watermark_text')->default('TENSHIGAZE STUDIO');
            $table->string('cover_photo_url')->nullable();
            $table->integer('photo_count')->default(0);
            $table->string('status', 32)->default('active'); // active, archived
            $table->timestamp('last_synced_at')->nullable();
            $table->timestamps();
        });

        Schema::create('album_photos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('album_id')->constrained('albums')->cascadeOnDelete();
            $table->string('drive_file_id')->nullable();
            $table->string('filename'); // DSC_7178856.JPG
            $table->string('photo_code')->index(); // DSC_7178856
            $table->string('thumbnail_url');
            $table->string('preview_url');
            $table->string('download_url')->nullable();
            $table->integer('width')->default(1600);
            $table->integer('height')->default(1067);
            $table->string('mime_type', 64)->default('image/jpeg');
            $table->bigInteger('size_bytes')->default(0);
            $table->timestamps();
        });

        Schema::create('album_selection_lists', function (Blueprint $table) {
            $table->id();
            $table->foreignId('album_id')->constrained('albums')->cascadeOnDelete();
            $table->string('name'); // VD: Nhà trai, Nhà gái, Dâu & rể
            $table->integer('quota_limit')->default(6);
            $table->integer('selected_count')->default(0);
            $table->string('status', 32)->default('selecting'); // selecting (Đang chọn), submitted (Đã gửi)
            $table->timestamp('submitted_at')->nullable();
            $table->text('client_note')->nullable();
            $table->timestamps();
        });

        Schema::create('album_selection_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('selection_list_id')->constrained('album_selection_lists')->cascadeOnDelete();
            $table->foreignId('album_photo_id')->constrained('album_photos')->cascadeOnDelete();
            $table->text('comment')->nullable();
            $table->timestamps();
            $table->unique(['selection_list_id', 'album_photo_id'], 'uniq_list_photo');
        });

        Schema::create('payroll_periods', function (Blueprint $table) {
            $table->id();
            $table->foreignId('branch_id')->nullable()->constrained('branches')->nullOnDelete();
            $table->integer('month');
            $table->integer('year');
            $table->string('status', 32)->default('approved'); // draft, approved, closed
            $table->decimal('total_amount', 14, 0)->default(0);
            $table->decimal('paid_amount', 14, 0)->default(0);
            $table->timestamps();
            $table->unique(['branch_id', 'month', 'year'], 'uniq_branch_period');
        });

        Schema::create('payroll_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('payroll_period_id')->constrained('payroll_periods')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->decimal('base_salary', 14, 0)->default(0);
            $table->decimal('task_wage_total', 14, 0)->default(0);
            $table->decimal('commission_total', 14, 0)->default(0);
            $table->decimal('bonus_adjustment', 14, 0)->default(0);
            $table->string('adjustment_note')->nullable();
            $table->decimal('net_total', 14, 0)->default(0);
            $table->json('task_breakdown')->nullable(); // Chi tiết từng buổi chụp cấu thành lương khoán
            $table->string('status', 32)->default('approved'); // pending (Chờ duyệt), approved (Đã duyệt), paid (Đã chi trả)
            $table->timestamp('paid_at')->nullable();
            $table->string('payment_method', 32)->default('bank_transfer');
            $table->timestamps();
        });

        Schema::create('financial_transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('branch_id')->nullable()->constrained('branches')->nullOnDelete();
            $table->string('type', 16)->index(); // income (Thu), expense (Chi)
            $table->string('category', 64)->default('customer_payment'); // customer_payment, staff_payroll, operating_expense
            $table->decimal('amount', 14, 0)->default(0);
            $table->string('payment_method', 32)->default('bank_transfer'); // bank_transfer, cash
            $table->dateTime('transaction_date')->index();
            $table->string('reference_type', 64)->nullable(); // booking_payment, payroll_item, manual
            $table->unsignedBigInteger('reference_id')->nullable();
            $table->string('title');
            $table->text('description')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });

        Schema::create('studio_settings', function (Blueprint $table) {
            $table->id();
            $table->string('key', 100)->unique();
            $table->longText('value')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('studio_settings');
        Schema::dropIfExists('financial_transactions');
        Schema::dropIfExists('payroll_items');
        Schema::dropIfExists('payroll_periods');
        Schema::dropIfExists('album_selection_items');
        Schema::dropIfExists('album_selection_lists');
        Schema::dropIfExists('album_photos');
        Schema::dropIfExists('albums');
        Schema::dropIfExists('booking_payments');
        Schema::dropIfExists('booking_assignments');
        Schema::dropIfExists('booking_items');
        Schema::dropIfExists('booking_sessions');
        Schema::dropIfExists('bookings');
        Schema::dropIfExists('service_catalogs');
        Schema::dropIfExists('customers');
    }
};
