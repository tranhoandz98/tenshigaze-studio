<?php

namespace App\Services;

use App\Models\BookingAssignment;
use App\Models\BookingSession;
use App\Models\User;

class ConflictDetectionService
{
    /**
     * Kiểm tra xung đột lịch chụp của các nhân sự trong cùng ngày shoot_date và khung giờ [start_time, end_time].
     * Trả về danh sách nhân sự kèm cảnh báo "Bận lịch khác" và gợi ý giờ trống tiếp theo (VD: "Thử dời sang 09:00").
     */
    public function checkCrewAvailability(
        string $shootDate,
        string $startTime,
        string $endTime,
        ?int $excludeSessionId = null
    ): array {
        $staffList = User::where('is_active', true)
            ->whereIn('role', ['photographer', 'makeup', 'retoucher', 'sale'])
            ->get();

        $startMin = $this->timeToMinutes($startTime);
        $endMin = $this->timeToMinutes($endTime);
        $duration = max(60, $endMin - $startMin);

        $assignmentsOnDate = BookingAssignment::with(['session.booking'])
            ->whereHas('session', function ($q) use ($shootDate, $excludeSessionId) {
                $q->whereDate('shoot_date', $shootDate);
                if ($excludeSessionId) {
                    $q->where('id', '!=', $excludeSessionId);
                }
            })
            ->get()
            ->groupBy('user_id');

        $result = [];

        foreach ($staffList as $user) {
            $userAssignments = $assignmentsOnDate->get($user->id, collect());
            $conflicts = [];

            foreach ($userAssignments as $assignment) {
                $session = $assignment->session;
                if (!$session) {
                    continue;
                }
                $sStart = $this->timeToMinutes($session->start_time);
                $sEnd = $this->timeToMinutes($session->end_time);

                // Overlap condition: startA < endB && endA > startB
                if ($startMin < $sEnd && $endMin > $sStart) {
                    $conflicts[] = [
                        'session_id' => $session->id,
                        'booking_id' => $session->booking_id,
                        'booking_title' => $session->booking?->title ?? $session->title,
                        'session_title' => $session->title,
                        'start_time' => $session->start_time,
                        'end_time' => $session->end_time,
                    ];
                }
            }

            $suggestedTime = null;
            if (!empty($conflicts)) {
                $latestConflictEnd = max(array_map(fn ($c) => $this->timeToMinutes($c['end_time']), $conflicts));
                $suggestedTime = [
                    'start_time' => $this->minutesToTime($latestConflictEnd),
                    'end_time' => $this->minutesToTime(min(23 * 60 + 30, $latestConflictEnd + $duration)),
                ];
            }

            $result[] = [
                'user_id' => $user->id,
                'name' => $user->name,
                'role' => $user->role,
                'avatar_color' => $user->avatar_color,
                'default_task_rate' => $user->default_task_rate,
                'has_conflict' => !empty($conflicts),
                'conflicts' => $conflicts,
                'suggested_slot' => $suggestedTime,
            ];
        }

        return $result;
    }

    private function timeToMinutes(string $time): int
    {
        $parts = explode(':', trim($time));
        $h = (int) ($parts[0] ?? 0);
        $m = (int) ($parts[1] ?? 0);
        return $h * 60 + $m;
    }

    private function minutesToTime(int $minutes): string
    {
        $h = intdiv($minutes, 60);
        $m = $minutes % 60;
        return sprintf('%02d:%02d', $h, $m);
    }
}
