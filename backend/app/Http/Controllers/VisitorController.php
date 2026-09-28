<?php

namespace App\Http\Controllers;

use App\Models\Visitor;
use Illuminate\Http\Request;
use Carbon\Carbon;

class VisitorController extends Controller
{
    // Record a visit and return count of unique visitors in last 14 days
    public function increment(Request $request)
    {
        $data = $request->validate([
            'visitor_id' => ['required', 'string', 'max:64'],
        ]);
        $visitorId = $data['visitor_id'];
        $twoWeeksAgo = Carbon::now()->subDays(14);

        // Check if this visitor already visited within the last 14 days
        $existing = Visitor::where('visitor_id', $visitorId)
            ->where('visited_at', '>=', $twoWeeksAgo)
            ->first();

        if (!$existing) {
            // New visit — record it
            Visitor::create([
                'visitor_id' => $visitorId,
                'visited_at' => Carbon::now(),
            ]);
        }

        // Clean up visits older than 14 days — this table is hit on every page view, so
        // running a DELETE every single time is wasted work. A ~1-in-50 chance keeps the
        // table bounded without adding a scheduled command.
        if (random_int(1, 50) === 1) {
            Visitor::where('visited_at', '<', $twoWeeksAgo)->delete();
        }

        // Return count of unique visitors in last 14 days
        $count = Visitor::where('visited_at', '>=', $twoWeeksAgo)
            ->distinct('visitor_id')
            ->count('visitor_id');

        return response()->json(['count' => $count]);
    }

    // Just get the current 14-day count without recording
    public function count()
    {
        $twoWeeksAgo = Carbon::now()->subDays(14);

        $count = Visitor::where('visited_at', '>=', $twoWeeksAgo)
            ->distinct('visitor_id')
            ->count('visitor_id');

        return response()->json(['count' => $count]);
    }
}
