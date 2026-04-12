<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Auth;
use App\Models\Product;
use App\Models\Transaction;

class ChatController extends Controller
{
    public function chat(Request $request)
    {
        $request->validate([
            'message' => 'required|string|max:500'
        ]);

        $userMessage = $request->input('message');
        $apiKey = config('services.gemini.key');

        \Illuminate\Support\Facades\Log::info("SRDI Chatbot Hit - Message: " . $userMessage);

        if (!$apiKey) {
            \Illuminate\Support\Facades\Log::error("SRDI Chatbot Error: API Key missing in config/services.php");
            return response()->json(['error' => 'AI Configuration missing.'], 500);
        }

        // 1. Gather Context: Products
        $products = Product::with('category')->get()->map(function($p) {
            return "- {$p->product} (Category: {$p->category?->category}, Price: ₱{$p->price}, Stock: {$p->stock_count})";
        })->implode("\n");

        // 2. Gather Context: User Orders
        $orderContext = "";
        if (Auth::check()) {
            $recentOrders = Transaction::where('user_id', Auth::id())
                ->with('order_items.product')
                ->latest()
                ->take(5)
                ->get();
            
            if ($recentOrders->count() > 0) {
                $orderContext = "User's Recent Orders:\n";
                foreach ($recentOrders as $tx) {
                    $items = $tx->order_items->map(fn($oi) => $oi->product?->product)->implode(', ');
                    $orderContext .= "- Ref: {$tx->reference_no}, Status: {$tx->status}, Total: ₱{$tx->total_amount}, Items: [{$items}]\n";
                }
            }
        }

        // 3. Construct System Prompt
        $systemPrompt = "You are the 'SRDI Assistant', a professional concierge for SRDI.
        RULES: Provide detailed and helpful responses based on the provided context. Be formal and professional.
        Context - Products:\n{$products}\n{$orderContext}\nUser Query: {$userMessage}";

        // 4. Call Gemini API
        try {
            // Using the verified 'gemini-flash-latest' model alias
            $response = Http::post("https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key={$apiKey}", [
                'contents' => [['parts' => [['text' => $systemPrompt]]]],
                'generationConfig' => ['maxOutputTokens' => 1024, 'temperature' => 0.7]
            ]);

            if ($response->successful()) {
                $data = $response->json();
                $aiResponse = $data['candidates'][0]['content']['parts'][0]['text'] ?? "I'm having trouble processing that right now.";
                return response()->json(['reply' => trim($aiResponse)]);
            }

            \Illuminate\Support\Facades\Log::error("Gemini API Failure: Status " . $response->status() . " - Body: " . $response->body());
            
            if ($response->status() === 429) {
                return response()->json(['error' => 'The SRDI Assistant is currently at peak capacity. Please try again in 30 seconds.'], 429);
            }

            return response()->json(['error' => 'Assistant is temporarily unavailable.'], 500);

        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error("Gemini API Exception: " . $e->getMessage());
            return response()->json(['error' => 'Network error connecting to SRDI Assistant.'], 500);
        }
    }
}
