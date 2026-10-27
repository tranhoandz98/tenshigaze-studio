<?php

namespace Tests\Feature;

use Tests\TestCase;

class StudioWorkflowTest extends TestCase
{
    public function test_dashboard_and_featured_booking_are_loaded(): void
    {
        $response = $this->getJson('/api/dashboard');
        $response->assertStatus(200)
            ->assertJsonPath('featured_booking.code', 'BK-202611-001')
            ->assertJsonPath('featured_booking.title', 'Cưới An & Minh')
            ->assertJsonPath('featured_booking.total_amount', 5000000)
            ->assertJsonPath('featured_booking.remaining_amount', 4000000);
    }

    public function test_crew_conflict_detection_flags_busy_photographer(): void
    {
        // Tâm is assigned to Pre-wedding Lan & Khánh on 2026-11-15 06:30 - 09:00
        $response = $this->postJson('/api/bookings/check-conflicts', [
            'shoot_date' => '2026-11-15',
            'start_time' => '07:30',
            'end_time' => '11:30',
        ]);

        $response->assertStatus(200);
        $availability = collect($response->json('availability'));
        $tam = $availability->firstWhere('name', 'Tâm');

        $this->assertNotNull($tam);
        $this->assertTrue($tam['has_conflict']);
        $this->assertEquals('09:00', $tam['suggested_slot']['start_time']);
    }

    public function test_public_album_photo_selection_and_payroll_payout(): void
    {
        $albumRes = $this->getJson('/api/public/albums/cuoi-an-minh');
        $albumRes->assertStatus(200)
            ->assertJsonPath('album.title', 'Album Cưới An & Minh')
            ->assertJsonPath('album.photo_count', 14);

        // Export bookings report CSV
        $exportRes = $this->get('/api/reports/export/bookings');
        $exportRes->assertStatus(200);
    }
}
