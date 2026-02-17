<?php

namespace App\Http\Controllers\Staff;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;

class OrderManagementController extends Controller
{
    public function index() 
    {
        $orders = Transaction::with(['order_items.product', 'user'])
                    ->latest()
                    ->paginate(10);
                    
        return Inertia::render('Staff/OrderManage', [
            'orders' => $orders
        ]);
    }

public function updateStatus(Request $request, Transaction $transaction)
{
    $request->validate([
        'status' => 'required|in:In Process,Ready to Pickup,Product Received,Cancelled'
    ]);

    $transaction->update(['status' => $request->status]);

    // Kung Axios ang tumawag, JSON ang ibabalik
    if ($request->wantsJson()) {
        return response()->json(['message' => 'Order status updated!']);
    }

    return back()->with('success', 'Status updated.');
}

    /**
     * Helper function para malinis ang email logic
     */
    private function sendPickupEmail(Transaction $transaction)
    {
        $user = $transaction->user;
        if ($user && $user->email) {
            $refNo = $transaction->reference_no;
            $name = $user->first_name ?? 'Valued Customer';

            Mail::send([], [], function ($message) use ($user, $refNo, $name) {
                $message->to($user->email)
                    ->subject('Ready for Onsite Pickup: Order #' . $refNo)
                    ->html("
                        <div style='font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;'>
                            <div style='background-color: #4f46e5; padding: 20px; text-align: center;'>
                                <h1 style='color: white; margin: 0; font-size: 20px;'>SRDI Sericulture Institute</h1>
                            </div>
                            <div style='padding: 30px; color: #334155;'>
                                <p>Mabuhay, <strong>{$name}</strong>!</p>
                                <p>Magandang araw! Ang iyong order na may reference number <span style='color: #4f46e5; font-weight: bold;'>#{$refNo}</span> ay handa na para sa <strong>onsite pickup</strong>.</p>
                                <p>Maaari niyo pong ipakita ang email na ito o ang inyong reference number sa aming staff pagdating sa institute.</p>
                                <br>
                                <p style='margin-bottom: 0;'>Salamat at mag-ingat,</p>
                                <p style='margin-top: 5px; font-weight: bold; color: #1e293b;'>SRDI Team</p>
                            </div>
                            <div style='background-color: #f8fafc; padding: 15px; text-align: center; font-size: 11px; color: #94a3b8;'>
                                This is an automated notification from the SRDI ERP System.
                            </div>
                        </div>
                    ");
            });
        }
    }
}