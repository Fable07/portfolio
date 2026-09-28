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
        $visitorId = $request->input('visitor_id');
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

        // Clean up visits older than 14 days
        Visitor::where('visited_at', '<', $twoWeeksAgo)->delete();

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
