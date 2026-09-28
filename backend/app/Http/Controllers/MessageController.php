<?php

namespace App\Http\Controllers;

use App\Models\Message;
use Illuminate\Http\Request;

/**
 * MessageController — the public contact form and the admin inbox.
 *
 * Spam handling, in order of cost:
 *  1. a honeypot field ("website") that only bots fill in — accepted, then dropped
 *  2. rate limiting on the route (see routes/api.php)
 *  3. validation
 * No email is sent; messages are read in the admin (keeps setup simple and free).
 */
class MessageController extends Controller
{
    // POST /api/messages  (public)
    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'email' => ['required', 'email', 'max:255'],
            'subject' => ['nullable', 'string', 'max:150'],
            'body' => ['required', 'string', 'min:10', 'max:5000'],
            'website' => ['nullable', 'string', 'max:255'], // honeypot: must stay empty
        ]);

        // A filled honeypot means a bot: answer normally so it doesn't retry, but save nothing.
        if (! empty($data['website'])) {
            return response()->json(['message' => 'Thanks — your message was sent.'], 201);
        }

        Message::create([
            ...collect($data)->only(['name', 'email', 'subject', 'body'])->all(),
            'meta' => [
                'ip' => $request->ip(),
                'user_agent' => substr((string) $request->userAgent(), 0, 255),
            ],
        ]);

        return response()->json(['message' => 'Thanks — your message was sent.'], 201);
    }

    // GET /api/messages  (admin)
    public function index()
    {
        return response()->json([
            'data' => Message::latest()->limit(200)->get(),
            'unread' => Message::unread()->count(),
        ]);
    }

    // PUT /api/messages/{id}  { read: true|false }  (admin)
    public function update(Request $request, $id)
    {
        $data = $request->validate(['read' => ['required', 'boolean']]);

        $message = Message::findOrFail($id);
        $message->update(['read_at' => $data['read'] ? ($message->read_at ?? now()) : null]);

        return response()->json($message->fresh());
    }

    // DELETE /api/messages/{id}  (admin)
    public function destroy($id)
    {
        Message::findOrFail($id)->delete();

        return response()->json(['message' => 'Deleted successfully']);
    }
}
