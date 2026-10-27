<?php

namespace Database\Seeders;

use App\Models\Album;
use App\Models\AlbumPhoto;
use App\Models\AlbumSelectionItem;
use App\Models\AlbumSelectionList;
use App\Models\Booking;
use App\Models\BookingAssignment;
use App\Models\BookingItem;
use App\Models\BookingPayment;
use App\Models\BookingSession;
use App\Models\Branch;
use App\Models\Customer;
use App\Models\FinancialTransaction;
use App\Models\PayrollItem;
use App\Models\PayrollPeriod;
use App\Models\ServiceCatalog;
use App\Models\StudioSetting;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Branches
        $mainBranch = Branch::create([
            'name' => 'CN Chính - Tenshigaze Studio',
            'code' => 'CN-CHINH',
            'address' => '128 Nguyễn Huệ, Quận 1, TP.HCM',
            'phone' => '0909 123 456',
            'is_active' => true,
        ]);

        $branch2 = Branch::create([
            'name' => 'CN Phú Nhuận',
            'code' => 'CN-PN',
            'address' => '45 Hoa Lan, Phú Nhuận, TP.HCM',
            'phone' => '0909 654 321',
            'is_active' => true,
        ]);

        // 2. Staff & Crew (Dữ liệu mẫu: Huy, Linh, Tâm, Minh, Nghĩa, Vy)
        $owner = User::create([
            'branch_id' => $mainBranch->id,
            'name' => 'Admin Tenshigaze',
            'email' => 'admin@tenshigaze.studio',
            'phone' => '0901000001',
            'role' => 'owner',
            'is_freelancer' => false,
            'avatar_color' => '#4f46e5',
            'base_salary' => 0,
            'commission_rate' => 0,
            'default_task_rate' => 0,
            'google_calendar_email' => 'admin@tenshigaze.studio',
            'google_calendar_connected' => true,
            'api_token' => 'tenshigaze-owner-token-2026',
            'password' => Hash::make('123456'),
        ]);

        $huy = User::create([
            'branch_id' => $mainBranch->id,
            'name' => 'Huy',
            'email' => 'huy@tenshigaze.studio',
            'phone' => '0901000002',
            'role' => 'photographer',
            'is_freelancer' => false,
            'avatar_color' => '#2563eb',
            'base_salary' => 0,
            'commission_rate' => 0,
            'default_task_rate' => 1200000,
            'google_calendar_email' => 'huy.photo@gmail.com',
            'google_calendar_connected' => true,
            'api_token' => 'tenshigaze-huy-token',
            'password' => Hash::make('123456'),
        ]);

        $linh = User::create([
            'branch_id' => $mainBranch->id,
            'name' => 'Linh',
            'email' => 'linh@tenshigaze.studio',
            'phone' => '0901000003',
            'role' => 'makeup',
            'is_freelancer' => false,
            'avatar_color' => '#db2777',
            'base_salary' => 0,
            'commission_rate' => 0,
            'default_task_rate' => 600000,
            'google_calendar_email' => 'linh.makeup@gmail.com',
            'google_calendar_connected' => true,
            'api_token' => 'tenshigaze-linh-token',
            'password' => Hash::make('123456'),
        ]);

        $tam = User::create([
            'branch_id' => $mainBranch->id,
            'name' => 'Tâm',
            'email' => 'tam@tenshigaze.studio',
            'phone' => '0901000004',
            'role' => 'photographer',
            'is_freelancer' => true,
            'avatar_color' => '#d97706',
            'base_salary' => 0,
            'commission_rate' => 0,
            'default_task_rate' => 1000000,
            'google_calendar_email' => 'tam.freelance@gmail.com',
            'google_calendar_connected' => true,
            'api_token' => 'tenshigaze-tam-token',
            'password' => Hash::make('123456'),
        ]);

        $minh = User::create([
            'branch_id' => $mainBranch->id,
            'name' => 'Minh',
            'email' => 'minh@tenshigaze.studio',
            'phone' => '0901000005',
            'role' => 'photographer',
            'is_freelancer' => false,
            'avatar_color' => '#059669',
            'base_salary' => 0,
            'commission_rate' => 0,
            'default_task_rate' => 1200000,
            'google_calendar_email' => 'minh.photo@gmail.com',
            'google_calendar_connected' => true,
            'api_token' => 'tenshigaze-minh-token',
            'password' => Hash::make('123456'),
        ]);

        $nghia = User::create([
            'branch_id' => $mainBranch->id,
            'name' => 'Nghĩa',
            'email' => 'nghia@tenshigaze.studio',
            'phone' => '0901000006',
            'role' => 'retoucher',
            'is_freelancer' => true,
            'avatar_color' => '#7c3aed',
            'base_salary' => 0,
            'commission_rate' => 0,
            'default_task_rate' => 500000,
            'google_calendar_email' => 'nghia.retouch@gmail.com',
            'google_calendar_connected' => false,
            'api_token' => 'tenshigaze-nghia-token',
            'password' => Hash::make('123456'),
        ]);

        $vy = User::create([
            'branch_id' => $mainBranch->id,
            'name' => 'Vy',
            'email' => 'vy@tenshigaze.studio',
            'phone' => '0901000007',
            'role' => 'sale',
            'is_freelancer' => false,
            'avatar_color' => '#0891b2',
            'base_salary' => 6000000,
            'commission_rate' => 5.0,
            'default_task_rate' => 0,
            'google_calendar_email' => 'vy.sale@gmail.com',
            'google_calendar_connected' => true,
            'api_token' => 'tenshigaze-vy-token',
            'password' => Hash::make('123456'),
        ]);

        // 3. Service Catalogs
        $svcWeddingDoc = ServiceCatalog::create([
            'name' => 'Phóng sự cưới',
            'type' => 'package',
            'default_price' => 4500000,
            'default_duration_minutes' => 330,
            'default_photo_rate' => 1200000,
            'default_makeup_rate' => 600000,
            'description' => 'Gói chụp phóng sự cưới lễ gia tiên / nhà gái / nhà trai trọn buổi',
        ]);

        $svcPreWedding = ServiceCatalog::create([
            'name' => 'Pre-wedding Ngoại cảnh Sài Gòn',
            'type' => 'package',
            'default_price' => 8500000,
            'default_duration_minutes' => 360,
            'default_photo_rate' => 1500000,
            'default_makeup_rate' => 800000,
            'description' => 'Chụp ảnh cưới ngoại cảnh 2 trang phục + 1 concept studio',
        ]);

        $svcPortrait = ServiceCatalog::create([
            'name' => 'Lookbook & Profile Doanh nghiệp',
            'type' => 'package',
            'default_price' => 3500000,
            'default_duration_minutes' => 180,
            'default_photo_rate' => 800000,
            'default_makeup_rate' => 500000,
            'description' => 'Chụp profile cá nhân / doanh nghiệp tại studio',
        ]);

        $svcTravel = ServiceCatalog::create([
            'name' => 'Di chuyển',
            'type' => 'surcharge',
            'default_price' => 500000,
            'default_duration_minutes' => 0,
            'default_photo_rate' => 0,
            'default_makeup_rate' => 0,
            'description' => 'Phụ phí di chuyển ngoại tỉnh / xa trung tâm',
        ]);

        $svcExtraPhoto = ServiceCatalog::create([
            'name' => 'Thêm máy chụp (2nd Shooter)',
            'type' => 'surcharge',
            'default_price' => 1500000,
            'default_duration_minutes' => 0,
            'default_photo_rate' => 800000,
            'default_makeup_rate' => 0,
            'description' => 'Phụ phí thêm thợ chụp góc máy thứ 2',
        ]);

        // 4. Customers
        $custAnMinh = Customer::create([
            'branch_id' => $mainBranch->id,
            'name' => 'An & Minh',
            'phone' => '0988 151 126',
            'email' => 'anminh.wedding@gmail.com',
            'zalo' => '0988151126',
            'address' => '14 Gò Cà, Càng Long, Trà Vinh',
            'notes' => 'Khách đặt chụp phóng sự cưới nhà gái + lễ rước dâu ngày 15/11',
        ]);

        $custLanKhanh = Customer::create([
            'branch_id' => $mainBranch->id,
            'name' => 'Lan & Khánh',
            'phone' => '0912 334 556',
            'email' => 'lankhanh@gmail.com',
            'zalo' => '0912334556',
            'address' => 'Thảo Điền, TP. Thủ Đức',
            'notes' => 'Chụp Pre-wedding ngoại cảnh buổi sáng',
        ]);

        $custHoangDuong = Customer::create([
            'branch_id' => $mainBranch->id,
            'name' => 'Hoàng Dương & Thảo',
            'phone' => '0977 889 900',
            'email' => 'hoangduong@gmail.com',
            'zalo' => '0977889900',
            'address' => 'Quận 7, TP.HCM',
            'notes' => 'Gói phóng sự cưới tiệc tối GEM Center',
        ]);

        // 5. Booking 1: "Cưới An & Minh" (Dữ liệu mẫu)
        $bookingAnMinh = Booking::create([
            'code' => 'BK-202611-001',
            'branch_id' => $mainBranch->id,
            'customer_id' => $custAnMinh->id,
            'sale_user_id' => $vy->id,
            'title' => 'Cưới An & Minh',
            'status' => 'selecting_photos', // Bước 4: Đang chọn ảnh
            'total_amount' => 5000000,
            'deposit_amount' => 1000000,
            'paid_amount' => 1000000,
            'remaining_amount' => 4000000,
            'google_calendar_synced' => true,
            'notes' => 'Ê-kíp có mặt tại nhà gái lúc 04:45 sáng. Đã cập nhật Google Lịch.',
        ]);

        BookingItem::create([
            'booking_id' => $bookingAnMinh->id,
            'service_catalog_id' => $svcWeddingDoc->id,
            'name' => 'Phóng sự cưới',
            'item_type' => 'package',
            'quantity' => 1,
            'unit_price' => 4500000,
            'total_price' => 4500000,
        ]);

        BookingItem::create([
            'booking_id' => $bookingAnMinh->id,
            'service_catalog_id' => $svcTravel->id,
            'name' => 'Di chuyển',
            'item_type' => 'surcharge',
            'quantity' => 1,
            'unit_price' => 500000,
            'total_price' => 500000,
        ]);

        $sessionNhaGai = BookingSession::create([
            'booking_id' => $bookingAnMinh->id,
            'title' => 'Nhà gái',
            'shoot_date' => '2026-11-15',
            'start_time' => '05:00',
            'end_time' => '10:30',
            'location' => '14 Gò Cà, Càng Long',
            'google_event_id' => 'gcal_an_minh_nhagai_01',
            'notes' => 'Lễ gia tiên & rước dâu nhà gái (5h30)',
        ]);

        BookingAssignment::create([
            'booking_session_id' => $sessionNhaGai->id,
            'user_id' => $huy->id,
            'role' => 'photographer',
            'task_fee' => 1200000,
            'calendar_synced' => true,
            'note' => 'Máy chính phóng sự',
        ]);

        BookingAssignment::create([
            'booking_session_id' => $sessionNhaGai->id,
            'user_id' => $linh->id,
            'role' => 'makeup',
            'task_fee' => 600000,
            'calendar_synced' => true,
            'note' => 'Makeup cô dâu + mẹ cô dâu',
        ]);

        BookingAssignment::create([
            'booking_session_id' => $sessionNhaGai->id,
            'user_id' => $minh->id,
            'role' => 'photographer',
            'task_fee' => 1000000,
            'calendar_synced' => true,
            'note' => 'Góc máy truyền thống',
        ]);

        BookingAssignment::create([
            'booking_session_id' => $sessionNhaGai->id,
            'user_id' => $nghia->id,
            'role' => 'retoucher',
            'task_fee' => 500000,
            'calendar_synced' => true,
            'note' => 'Lọc & hậu kỳ màu phóng sự',
        ]);

        $paymentDeposit = BookingPayment::create([
            'booking_id' => $bookingAnMinh->id,
            'payment_type' => 'deposit',
            'method' => 'bank_transfer',
            'amount' => 1000000,
            'paid_at' => '2026-10-20 14:05:00',
            'recorded_by' => $vy->id,
            'note' => 'Đặt cọc giữ lịch chụp 15/11',
        ]);

        FinancialTransaction::create([
            'branch_id' => $mainBranch->id,
            'type' => 'income',
            'category' => 'customer_payment',
            'amount' => 1000000,
            'payment_method' => 'bank_transfer',
            'transaction_date' => '2026-10-20 14:05:00',
            'reference_type' => 'booking_payment',
            'reference_id' => $paymentDeposit->id,
            'title' => 'Tiền cọc · Cưới An & Minh',
            'description' => 'Đặt cọc chuyển khoản đã ghi nhận',
            'created_by' => $vy->id,
        ]);

        // 6. Booking 2: Overlapping schedule on 2026-11-15 for Tâm (Photographer) so conflict detection triggers!
        $bookingLanKhanh = Booking::create([
            'code' => 'BK-202611-002',
            'branch_id' => $mainBranch->id,
            'customer_id' => $custLanKhanh->id,
            'sale_user_id' => $vy->id,
            'title' => 'Pre-wedding Lan & Khánh',
            'status' => 'confirmed', // Bước 2: Đã xác nhận
            'total_amount' => 8500000,
            'deposit_amount' => 3000000,
            'paid_amount' => 3000000,
            'remaining_amount' => 5500000,
            'google_calendar_synced' => true,
            'notes' => 'Chụp ngoại cảnh Bảo tàng Mỹ Thuật & Bến Bạch Đằng',
        ]);

        BookingItem::create([
            'booking_id' => $bookingLanKhanh->id,
            'service_catalog_id' => $svcPreWedding->id,
            'name' => 'Pre-wedding Ngoại cảnh Sài Gòn',
            'item_type' => 'package',
            'quantity' => 1,
            'unit_price' => 8500000,
            'total_price' => 8500000,
        ]);

        $sessionLanKhanh = BookingSession::create([
            'booking_id' => $bookingLanKhanh->id,
            'title' => 'Ngoại cảnh sáng',
            'shoot_date' => '2026-11-15',
            'start_time' => '06:30',
            'end_time' => '09:00',
            'location' => 'Bến Bạch Đằng, Quận 1',
            'google_event_id' => 'gcal_lan_khanh_01',
            'notes' => 'Tâm phụ trách chụp chính khung 06:30 - 09:00',
        ]);

        BookingAssignment::create([
            'booking_session_id' => $sessionLanKhanh->id,
            'user_id' => $tam->id,
            'role' => 'photographer',
            'task_fee' => 1200000,
            'calendar_synced' => true,
            'note' => 'Phụ trách chính Pre-wedding Lan & Khánh',
        ]);

        $payLK = BookingPayment::create([
            'booking_id' => $bookingLanKhanh->id,
            'payment_type' => 'deposit',
            'method' => 'bank_transfer',
            'amount' => 3000000,
            'paid_at' => '2026-10-22 10:15:00',
            'recorded_by' => $vy->id,
            'note' => 'Cọc gói Pre-wedding',
        ]);

        FinancialTransaction::create([
            'branch_id' => $mainBranch->id,
            'type' => 'income',
            'category' => 'customer_payment',
            'amount' => 3000000,
            'payment_method' => 'bank_transfer',
            'transaction_date' => '2026-10-22 10:15:00',
            'reference_type' => 'booking_payment',
            'reference_id' => $payLK->id,
            'title' => 'Tiền cọc · Pre-wedding Lan & Khánh',
            'description' => 'Chuyển khoản cọc đợt 1',
            'created_by' => $vy->id,
        ]);

        // 7. Booking 3: Completed booking for Hoàng Dương & Thảo
        $bookingHD = Booking::create([
            'code' => 'BK-202611-003',
            'branch_id' => $mainBranch->id,
            'customer_id' => $custHoangDuong->id,
            'sale_user_id' => $vy->id,
            'title' => 'Tiệc Cưới Hoàng Dương & Thảo',
            'status' => 'completed', // Bước 8: Hoàn thành
            'total_amount' => 6500000,
            'deposit_amount' => 2000000,
            'paid_amount' => 6500000,
            'remaining_amount' => 0,
            'google_calendar_synced' => true,
            'notes' => 'Đã giao toàn bộ album hoàn thiện',
        ]);

        BookingItem::create([
            'booking_id' => $bookingHD->id,
            'service_catalog_id' => $svcWeddingDoc->id,
            'name' => 'Phóng sự cưới Tiệc tối',
            'item_type' => 'package',
            'quantity' => 1,
            'unit_price' => 5000000,
            'total_price' => 5000000,
        ]);

        BookingItem::create([
            'booking_id' => $bookingHD->id,
            'service_catalog_id' => $svcExtraPhoto->id,
            'name' => 'Thêm máy chụp (2nd Shooter)',
            'item_type' => 'surcharge',
            'quantity' => 1,
            'unit_price' => 1500000,
            'total_price' => 1500000,
        ]);

        $sessionHD = BookingSession::create([
            'booking_id' => $bookingHD->id,
            'title' => 'Tiệc tối GEM Center',
            'shoot_date' => '2026-11-08',
            'start_time' => '17:30',
            'end_time' => '21:30',
            'location' => 'GEM Center, 8 Nguyễn Bỉnh Khiêm, Quận 1',
            'google_event_id' => 'gcal_hd_01',
        ]);

        BookingAssignment::create([
            'booking_session_id' => $sessionHD->id,
            'user_id' => $huy->id,
            'role' => 'photographer',
            'task_fee' => 1200000,
            'calendar_synced' => true,
        ]);

        BookingAssignment::create([
            'booking_session_id' => $sessionHD->id,
            'user_id' => $linh->id,
            'role' => 'makeup',
            'task_fee' => 600000,
            'calendar_synced' => true,
        ]);

        $payHD = BookingPayment::create([
            'booking_id' => $bookingHD->id,
            'payment_type' => 'settlement',
            'method' => 'bank_transfer',
            'amount' => 6500000,
            'paid_at' => '2026-11-09 09:30:00',
            'recorded_by' => $vy->id,
            'note' => 'Tất toán hợp đồng',
        ]);

        FinancialTransaction::create([
            'branch_id' => $mainBranch->id,
            'type' => 'income',
            'category' => 'customer_payment',
            'amount' => 6500000,
            'payment_method' => 'bank_transfer',
            'transaction_date' => '2026-11-09 09:30:00',
            'reference_type' => 'booking_payment',
            'reference_id' => $payHD->id,
            'title' => 'Tất toán · Tiệc Cưới Hoàng Dương & Thảo',
            'description' => 'Thu đủ 100% giá trị hợp đồng',
            'created_by' => $vy->id,
        ]);

        // 8. Album: "Album Cưới An & Minh" (14 mã DSC và 3 danh sách chọn)
        $album = Album::create([
            'booking_id' => $bookingAnMinh->id,
            'branch_id' => $mainBranch->id,
            'title' => 'Album Cưới An & Minh',
            'slug' => 'cuoi-an-minh',
            'drive_folder_id' => '1TenshigazeDriveFolder_AnMinh2026',
            'drive_folder_url' => 'https://drive.google.com/drive/folders/1TenshigazeDriveFolder_AnMinh2026',
            'allow_download' => true,
            'watermark_enabled' => true,
            'watermark_text' => 'TENSHIGAZE STUDIO',
            'cover_photo_url' => 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=900&q=80',
            'photo_count' => 14,
            'status' => 'active',
            'last_synced_at' => now(),
        ]);

        $dscPhotos = [
            ['code' => 'DSC_7178856', 'url' => 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1000&q=80'],
            ['code' => 'DSC_7178857', 'url' => 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1000&q=80'],
            ['code' => 'DSC_7178858', 'url' => 'https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=1000&q=80'],
            ['code' => 'DSC_7178859', 'url' => 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=1000&q=80'],
            ['code' => 'DSC_7178860', 'url' => 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=1000&q=80'],
            ['code' => 'DSC_7178863', 'url' => 'https://images.unsplash.com/photo-1532712938310-34cb3982ef74?auto=format&fit=crop&w=1000&q=80'],
            ['code' => 'DSC_7178866', 'url' => 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=1000&q=80'],
            ['code' => 'DSC_7178871', 'url' => 'https://images.unsplash.com/photo-1591604466107-ec97de577aff?auto=format&fit=crop&w=1000&q=80'],
            ['code' => 'DSC_7178873', 'url' => 'https://images.unsplash.com/photo-1606800052052-a08af7148866?auto=format&fit=crop&w=1000&q=80'],
            ['code' => 'DSC_7178885', 'url' => 'https://images.unsplash.com/photo-1537633552985-df8429e8048b?auto=format&fit=crop&w=1000&q=80'],
            ['code' => 'DSC_7178886', 'url' => 'https://images.unsplash.com/photo-1544078751-58fee2d8a03b?auto=format&fit=crop&w=1000&q=80'],
            ['code' => 'DSC_7178890', 'url' => 'https://images.unsplash.com/photo-1529636798458-92182e662485?auto=format&fit=crop&w=1000&q=80'],
            ['code' => 'DSC_7178895', 'url' => 'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&w=1000&q=80'],
            ['code' => 'DSC_7178896', 'url' => 'https://images.unsplash.com/photo-1460978812857-470ed1c77af0?auto=format&fit=crop&w=1000&q=80'],
        ];

        $photoModels = [];
        foreach ($dscPhotos as $idx => $p) {
            $photoModels[$p['code']] = AlbumPhoto::create([
                'album_id' => $album->id,
                'drive_file_id' => 'gdrive_file_' . ($idx + 1) . '_' . $p['code'],
                'filename' => $p['code'] . '.ARW',
                'photo_code' => $p['code'],
                'thumbnail_url' => $p['url'],
                'preview_url' => $p['url'],
                'download_url' => $p['url'],
                'width' => 1600,
                'height' => 1067,
                'mime_type' => 'image/jpeg',
                'size_bytes' => 4520000,
            ]);
        }

        // 3 Selection lists: Nhà trai (3/6 Đã gửi), Nhà gái (4/6 Đang chọn), Dâu & rể (5/6 Đang chọn)
        $listNhaTrai = AlbumSelectionList::create([
            'album_id' => $album->id,
            'name' => 'Nhà trai',
            'quota_limit' => 6,
            'selected_count' => 3,
            'status' => 'submitted',
            'submitted_at' => '2026-10-25 19:20:00',
            'client_note' => 'Nhà trai chọn 3 tấm in cổng và bàn gallery',
        ]);

        foreach (['DSC_7178856', 'DSC_7178873', 'DSC_7178890'] as $code) {
            AlbumSelectionItem::create([
                'selection_list_id' => $listNhaTrai->id,
                'album_photo_id' => $photoModels[$code]->id,
                'comment' => 'Chỉnh sáng nhẹ khuôn mặt',
            ]);
        }

        $listNhaGai = AlbumSelectionList::create([
            'album_id' => $album->id,
            'name' => 'Nhà gái',
            'quota_limit' => 6,
            'selected_count' => 4,
            'status' => 'selecting',
            'client_note' => 'Đang chọn thêm 2 tấm gia đình',
        ]);

        foreach (['DSC_7178857', 'DSC_7178860', 'DSC_7178866', 'DSC_7178885'] as $code) {
            AlbumSelectionItem::create([
                'selection_list_id' => $listNhaGai->id,
                'album_photo_id' => $photoModels[$code]->id,
            ]);
        }

        $listDauRe = AlbumSelectionList::create([
            'album_id' => $album->id,
            'name' => 'Dâu & rể',
            'quota_limit' => 6,
            'selected_count' => 5,
            'status' => 'selecting',
            'client_note' => 'Ảnh phóng lớn 60x90',
        ]);

        foreach (['DSC_7178856', 'DSC_7178859', 'DSC_7178871', 'DSC_7178895', 'DSC_7178896'] as $code) {
            AlbumSelectionItem::create([
                'selection_list_id' => $listDauRe->id,
                'album_photo_id' => $photoModels[$code]->id,
            ]);
        }

        // 9. Payroll Period: Tháng 11/2026 (Dữ liệu lương mẫu)
        // Huy: Khoán 1.200.000 + Thưởng/ĐC +200.000 = 1.400.000 (Đã chi trả)
        // Linh: Khoán 600.000 = 600.000 (Chờ bấm Chi trả)
        // Vy: Lương cứng 6.000.000 + % Doanh thu/Doanh số 750.000 = 6.750.000 (Chờ bấm Chi trả)
        // Tổng kỳ · 3 người: 8.750.000 ₫
        $periodNov = PayrollPeriod::create([
            'branch_id' => $mainBranch->id,
            'month' => 11,
            'year' => 2026,
            'status' => 'approved',
            'total_amount' => 8750000,
            'paid_amount' => 1400000,
        ]);

        $payrollHuy = PayrollItem::create([
            'payroll_period_id' => $periodNov->id,
            'user_id' => $huy->id,
            'base_salary' => 0,
            'task_wage_total' => 1200000,
            'commission_total' => 0,
            'bonus_adjustment' => 200000,
            'adjustment_note' => 'Thưởng đi tỉnh sớm Càng Long',
            'net_total' => 1400000,
            'task_breakdown' => [
                ['booking_code' => 'BK-202611-001', 'title' => 'Cưới An & Minh · Nhà gái', 'date' => '2026-11-15', 'fee' => 1200000],
            ],
            'status' => 'paid',
            'paid_at' => '2026-11-25 16:00:00',
            'payment_method' => 'bank_transfer',
        ]);

        FinancialTransaction::create([
            'branch_id' => $mainBranch->id,
            'type' => 'expense',
            'category' => 'staff_payroll',
            'amount' => 1400000,
            'payment_method' => 'bank_transfer',
            'transaction_date' => '2026-11-25 16:00:00',
            'reference_type' => 'payroll_item',
            'reference_id' => $payrollHuy->id,
            'title' => 'Chi lương tháng 11/2026 · Huy (Photographer)',
            'description' => 'Khoán 1.200.000 ₫ + Thưởng 200.000 ₫',
            'created_by' => $owner->id,
        ]);

        PayrollItem::create([
            'payroll_period_id' => $periodNov->id,
            'user_id' => $linh->id,
            'base_salary' => 0,
            'task_wage_total' => 600000,
            'commission_total' => 0,
            'bonus_adjustment' => 0,
            'adjustment_note' => null,
            'net_total' => 600000,
            'task_breakdown' => [
                ['booking_code' => 'BK-202611-001', 'title' => 'Cưới An & Minh · Nhà gái', 'date' => '2026-11-15', 'fee' => 600000],
            ],
            'status' => 'approved',
            'payment_method' => 'bank_transfer',
        ]);

        PayrollItem::create([
            'payroll_period_id' => $periodNov->id,
            'user_id' => $vy->id,
            'base_salary' => 6000000,
            'task_wage_total' => 0,
            'commission_total' => 750000,
            'bonus_adjustment' => 0,
            'adjustment_note' => '5% doanh số hợp đồng tháng 11',
            'net_total' => 6750000,
            'task_breakdown' => [
                ['booking_code' => 'BK-202611-001', 'title' => 'Hoa hồng 5% Cưới An & Minh', 'date' => '2026-11-15', 'fee' => 250000],
                ['booking_code' => 'BK-202611-002', 'title' => 'Hoa hồng 5% Pre-wedding Lan & Khánh', 'date' => '2026-11-15', 'fee' => 500000],
            ],
            'status' => 'approved',
            'payment_method' => 'bank_transfer',
        ]);

        // 10. Studio Settings
        $defaultSettings = [
            'studio_name' => 'Tenshigaze Studio',
            'studio_tagline' => 'Through the Lens of Vietnamese Photographers',
            'studio_phone' => '0909 123 456',
            'studio_email' => 'contact@tenshigaze.studio',
            'google_drive_connected' => 'true',
            'google_drive_api_key' => '',
            'google_drive_root_folder' => 'https://drive.google.com/drive/folders/1TenshigazeStudioRoot',
            'google_calendar_auto_sync' => 'true',
            'watermark_default_text' => 'TENSHIGAZE STUDIO',
        ];

        foreach ($defaultSettings as $k => $v) {
            StudioSetting::create(['key' => $k, 'value' => $v]);
        }
    }
}
